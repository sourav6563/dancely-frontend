'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useAddComment } from '@/lib/hooks/useVideoWatch';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { CommentWithStats } from '@/types';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentsProps {
  videoId: string;
  comments: CommentWithStats[];
  isLoading: boolean;
}

/**
 * Comments Section Component
 * Displays comments and allows adding new ones
 */
export function Comments({ videoId, comments, isLoading }: CommentsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const addComment = useAddComment(videoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync(newComment);
      setNewComment('');
      setIsOpen(true); // Keep open after adding first comment
    } catch {
      // Error is handled by the mutation hook (toast), 
      // and text remains in the input since we rely on local state.
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div 
        onClick={() => comments.length > 0 && setIsOpen(!isOpen)} 
        className={`flex items-center justify-between p-2 -mx-2 rounded-lg transition-colors group select-none ${
          comments.length > 0 ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'
        }`}
      >
        <h3 className="text-xl font-semibold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        {comments.length > 0 && (
          isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )
        )}
      </div>

      {(isOpen || comments.length === 0) && (
        <div className="space-y-6 animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  className="flex-1 min-w-0 resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-h-32 overflow-y-auto transition-all"
                  rows={isInputFocused || newComment ? 3 : 1}
                />
              </div>
              {(isInputFocused || newComment) && (
                <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setNewComment('');
                      setIsInputFocused(false);
                    }}
                    className="h-8 text-xs sm:h-9 sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || addComment.isPending}
                    className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-8 text-xs sm:h-9 sm:text-sm"
                  >
                    {addComment.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Comment'
                    )}
                  </Button>
                </div>
              )}
            </form>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment._id} 
                  comment={comment} 
                  user={user} 
                  videoId={videoId} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
