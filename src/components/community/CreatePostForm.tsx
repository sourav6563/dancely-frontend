import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { communityApi } from '@/lib/api/community';
import { postSchema, type PostValues } from '@/lib/validators/community';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { AxiosError } from 'axios';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
    },
  });

  const content = useWatch({
    control: form.control,
    name: 'content',
  });

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: (content: string) => communityApi.create(content),
    onSuccess: () => {
      form.reset();
      setIsExpanded(false);
      toast.success('Post created successfully!');
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['community-posts', user?._id] });
      onPostCreated?.();
    },
    onError: (error: unknown) => {
      const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Failed to create post';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (values: PostValues) => {
    createPost(values.content);
  };

  if (!user) return null;

  return (
    <Card className="w-full mb-6 bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 border border-gray-100 hidden sm:block">
            <AvatarImage src={user.profileImage} alt={user.username} />
            <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts..."
                          className="min-h-12 max-h-28 resize-none overflow-y-auto bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 dark:text-white dark:placeholder-gray-500 text-sm transition-all duration-200"
                          onFocus={() => setIsExpanded(true)}
                          disabled={isPending}
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isExpanded && (
                  <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-muted-foreground">
                      {content.length}/500
                    </p>
                    <div className="flex gap-2">
                       <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setIsExpanded(false);
                          form.reset();
                        }}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm"
                        className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        disabled={isPending || !form.formState.isValid}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-3 w-3" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
