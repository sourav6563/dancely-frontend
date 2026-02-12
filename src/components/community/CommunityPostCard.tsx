'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CommunityPostWithStats } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, Heart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { useAuth } from '@/context/AuthContext';
import { useDeletePost } from '@/lib/hooks/useCommunity';
import { usePostComments } from '@/lib/hooks/usePostComments';
import { PostCommentTrigger, PostCommentsList } from './PostComments';

interface CommunityPostCardProps {
  post: CommunityPostWithStats;
  onLike: (postId: string) => void;
}

export function CommunityPostCard({ post, onLike }: CommunityPostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const deletePost = useDeletePost();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const { data: comments = [] } = usePostComments(post._id);
  
  const isOwner = user?._id === post.owner._id;

  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.owner.username}`);
  };

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post._id);
  };

  /* 
     Using CSS line-clamp for consistent visual height.
     Limit to 4 lines initially. 
  */
  const [isExpanded, setIsExpanded] = React.useState(false);
  const contentRef = React.useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = React.useState(false);

  React.useEffect(() => {
    if (contentRef.current) {
      setIsClamped(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [post.content]);

  React.useEffect(() => {
    const handleResize = () => {
       if (contentRef.current) {
         setIsClamped(contentRef.current.scrollHeight > contentRef.current.clientHeight);
       }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card 
      className={cn(
        "w-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-800",
        deletePost.isPending && "opacity-50 pointer-events-none"
      )}
    >
      <CardHeader className="flex flex-row items-start space-y-0 px-3 py-1.5">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={navigateToProfile}
        >
          <Avatar className="h-7 w-7 border border-gray-100 dark:border-gray-700">
            <AvatarImage src={post.owner.profileImage} alt={post.owner.username} />
            <AvatarFallback>{post.owner.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm hover:underline">{post.owner.name}</span>
            <span className="text-xs text-muted-foreground">@{post.owner.username} • {formattedDate}</span>
          </div>
        </div>
        
        {isOwner && (
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-3 py-2">
        <div className="relative group">
          <p 
            ref={contentRef}
            className={cn(
              "text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed transition-all duration-300 ease-in-out w-full",
              !isExpanded 
                ? "line-clamp-3 max-h-18 overflow-hidden" 
                : "max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1"
            )}
          >
            {post.content}
          </p>
          {(isClamped || (isExpanded && post.content.length > 150)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline mt-1.5 focus:outline-none transition-colors flex items-center gap-1"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch p-0">
        <div className="flex items-center justify-between w-full px-3 py-1">
          <div className="flex items-start gap-3 w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex items-center gap-1.5 px-2 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/20",
                post.isLiked && "text-pink-600 bg-pink-50/50 dark:bg-pink-900/20"
              )}
              onClick={handleLike}
              disabled={false}
            >
              <Heart 
                className={cn("h-4 w-4", post.isLiked && "fill-current")} 
              />
              <span className="text-xs font-medium">{post.likesCount}</span>
            </Button>
            
            <PostCommentTrigger 
              onClick={() => setShowComments(!showComments)}
              isOpen={showComments}
              count={comments.length}
            />
          </div>
        </div>
        
        {showComments && (
          <div className="w-full px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800/50 mt-1">
            <PostCommentsList postId={post._id} />
          </div>
        )}
      </CardFooter>
      
      <DeleteAlertDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        onDelete={() => {
          toast.promise(deletePost.mutateAsync(post._id), {
            loading: 'Deleting post...',
            success: 'Post deleted successfully',
            error: 'Failed to delete post'
          });
          setShowDeleteDialog(false);
        }}
        isDeleting={deletePost.isPending}
      />
    </Card>
  );
}
