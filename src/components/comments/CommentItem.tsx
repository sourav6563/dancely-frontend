'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDeleteComment, useToggleCommentLike } from '@/lib/hooks/useVideoWatch';
import type { CommentWithStats, User } from '@/types';
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";

import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentWithStats;
  user: User | null;
  videoId: string;
}

export const CommentItem = memo(function CommentItem({ comment, user, videoId }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const deleteComment = useDeleteComment(videoId);
  const toggleCommentLike = useToggleCommentLike(videoId);
  
  const MAX_LENGTH = 150;
  const MAX_LINES = 4;
  const lineCount = (comment.content.match(/\n/g) || []).length + 1;
  const shouldTruncate = comment.content.length > MAX_LENGTH || lineCount > MAX_LINES;
  
  // Fixed height implementation
  // We use the full content always, but wrap it in a fixed height scrollable container
  // toggled by isExpanded state (which now enables scrolling vs truncation)


  return (
    <>
      <Card className={`p-2 sm:p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-200 ${deleteComment.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex gap-2 sm:gap-3">
          <Link href={`/profile/${comment.owner.username}`} className="shrink-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 hover:brightness-90 transition-all">
              <AvatarImage src={comment.owner.profileImage} alt={comment.owner.name} />
              <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white">
                {comment.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/profile/${comment.owner.username}`} className="font-medium text-sm text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {comment.owner.name}
              </Link>
              <Link href={`/profile/${comment.owner.username}`} className="text-xs text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                @{comment.owner.username}
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {/* Fixed Height Content Area */}
            <div 
              className={`text-sm text-foreground whitespace-pre-wrap break-all mb-0.5 transition-all w-full ${
                !isExpanded 
                  ? 'line-clamp-3 max-h-18 overflow-hidden' 
                  : 'max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1'
              }`}
            >
              <p>{comment.content}</p>
            </div>
            
            {shouldTruncate && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 mb-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline flex items-center gap-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}

            <div className={`flex items-center gap-4 ${shouldTruncate ? '' : 'mt-2'}`}>
              {/* Like Button */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCommentLike.mutate(comment._id)}
                  disabled={!user}
                  className={`h-7 px-1.5 sm:h-8 sm:px-2 ${
                    comment.isLiked
                      ? 'text-red-500 hover:text-red-600 hover:bg-destructive/10'
                      : 'text-muted-foreground hover:text-red-500 hover:bg-accent'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${
                      comment.isLiked ? 'fill-current' : ''
                    }`}
                  />
                  <span className="text-xs">{comment.likesCount}</span>
                </Button>
              </div>

              {/* Delete button for own comments */}
              {user && user._id === comment.owner._id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentToDelete(comment._id)}
                  className="h-7 px-1.5 text-red-600 hover:text-red-700 hover:bg-destructive/10"
                  disabled={deleteComment.isPending}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="text-xs">Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <DeleteAlertDialog 
        open={!!commentToDelete}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        onDelete={() => {
           if (commentToDelete) {
            const promise = deleteComment.mutateAsync(commentToDelete);
            
            toast.promise(promise, {
              loading: 'Deleting comment...',
              success: 'Comment deleted successfully',
              error: (err) => err?.response?.data?.message || 'Failed to delete comment',
            });
            
            setCommentToDelete(null); 
          }
        }}
        isDeleting={deleteComment.isPending}
      />
    </>
  );
});
