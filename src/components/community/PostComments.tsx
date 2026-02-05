'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useAddPostComment, usePostComments } from '@/lib/hooks/usePostComments';
import { Loader2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { PostCommentItem } from './PostCommentItem';
import { Skeleton } from '@/components/ui/skeleton';



interface PostCommentsProps {
  postId: string;
}

interface PostCommentTriggerProps {
  onClick: () => void;
  isOpen: boolean;
  count?: number;
  isLoading?: boolean;
}

export function PostCommentTrigger({ onClick, isOpen, count = 0, isLoading }: PostCommentTriggerProps) {
  return (
    <Button
      variant="ghost" 
      size="sm"
      onClick={onClick} 
      className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
    >
      <MessageCircle className="h-4 w-4" />
      <span>
        {isLoading ? (
          <Skeleton className="h-3 w-4 inline-block ml-1" />
        ) : (
          `${count} ${count === 1 ? 'Comment' : 'Comments'}`
        )}
      </span>
      {isOpen ? (
        <ChevronUp className="h-4 w-4 ml-auto" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-auto" />
      )}
    </Button>
  );
}

export function PostCommentsList({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: comments = [], isLoading } = usePostComments(postId);
  const addComment = useAddPostComment(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment.mutate(newComment, {
      onSuccess: () => {
        setNewComment('');
        setIsFocused(false);
      }
    });
  };

  const handleCancel = () => {
    setNewComment('');
    setIsFocused(false);
  };

  const showActions = isFocused || newComment.length > 0;

  return (
    <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-200 relative w-full">
      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white text-xs">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full resize-none bg-background text-sm min-h-10 text-gray-900 dark:text-gray-100 py-2"
                rows={isFocused || newComment.length > 0 ? 3 : 1}
              />
              
              {showActions && (
                <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={addComment.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || addComment.isPending}
                    className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {addComment.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Comment'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Comments List - Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1"
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-4 text-center bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
            <p className="text-xs text-muted-foreground">No comments yet. Be the first to comment!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {[...comments].reverse().map((comment) => (
              <PostCommentItem 
                key={comment._id} 
                comment={comment} 
                user={user} 
                postId={postId} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Comments Section Component for Community Posts
 * Displays comments and allows adding new ones
 */
export function PostComments({ postId }: PostCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: comments = [], isLoading } = usePostComments(postId);

  return (
    <div className="flex-1 block">
      <PostCommentTrigger 
        onClick={() => setIsOpen(!isOpen)} 
        isOpen={isOpen} 
        count={comments.length}
        isLoading={isLoading}
      />

      {isOpen && (
        <div className="mt-2">
           <PostCommentsList postId={postId} />
        </div>
      )}
    </div>
  );
}
