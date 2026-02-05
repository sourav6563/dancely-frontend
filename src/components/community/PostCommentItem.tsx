'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Trash2, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDeletePostComment, useTogglePostCommentLike } from '@/lib/hooks/usePostComments';
import type { CommentWithStats, User } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PostCommentItemProps {
  comment: CommentWithStats;
  user: User | null;
  postId: string;
}

export const PostCommentItem = memo(function PostCommentItem({ comment, user, postId }: PostCommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const deleteComment = useDeletePostComment(postId);
  const toggleCommentLike = useTogglePostCommentLike(postId);
  
  const MAX_LENGTH = 150; 
  const shouldTruncate = comment.content.length > MAX_LENGTH;
  
  const displayContent = isExpanded 
    ? comment.content 
    : shouldTruncate 
      ? comment.content.slice(0, MAX_LENGTH) + '...'
      : comment.content;

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (commentToDelete) {
      const promise = deleteComment.mutateAsync(commentToDelete);
      
      toast.promise(promise, {
        loading: 'Deleting comment...',
        success: 'Comment deleted successfully',
        error: (err) => err?.response?.data?.message || 'Failed to delete comment',
      });
      
      setCommentToDelete(null); 
    }
  };

  return (
    <>
      <Card className={`p-3 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 transition-all duration-200 ${deleteComment.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex gap-3">
          <Link href={`/profile/${comment.owner.username}`} className="shrink-0">
            <Avatar className="h-8 w-8 hover:brightness-90 transition-all">
              <AvatarImage src={comment.owner.profileImage} alt={comment.owner.name} />
              <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white text-xs">
                {comment.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Link href={`/profile/${comment.owner.username}`} className="font-medium text-xs text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {comment.owner.name}
              </Link>
              <Link href={`/profile/${comment.owner.username}`} className="text-[10px] text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                @{comment.owner.username}
              </Link>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-xs text-foreground whitespace-pre-wrap wrap-break-word mb-1">
              {displayContent}
            </p>
            
            {shouldTruncate && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 mb-2 text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}

            <div className="flex items-center gap-3 ${shouldTruncate ? '' : 'mt-1'}">
              {/* Like Button */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCommentLike.mutate(comment._id)}
                  disabled={!user}
                  className={`h-6 px-1.5 ${
                    comment.isLiked
                      ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                      : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                  }`}
                >
                  <Heart
                    className={`h-3 w-3 mr-0.5 ${
                      comment.isLiked ? 'fill-current' : ''
                    }`}
                  />
                  <span className="text-[10px]">{comment.likesCount}</span>
                </Button>
              </div>

              {/* Delete button for own comments */}
              {user && user._id === comment.owner._id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentToDelete(comment._id)}
                  className="h-6 px-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={deleteComment.isPending}
                >
                  <Trash2 className="h-3 w-3 mr-0.5" />
                  <span className="text-[10px]">Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteComment.isPending} onClick={() => setCommentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              onClick={confirmDelete}
              disabled={deleteComment.isPending}
            >
              {deleteComment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
