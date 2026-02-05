'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUpdatePlaylist } from '@/lib/hooks/usePlaylists';
import { useEffect } from 'react';
import { Playlist } from '@/types';
import { Globe, Lock, Loader2 } from 'lucide-react';

const editPlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  isPublished: z.boolean(),
});

type EditPlaylistValues = z.infer<typeof editPlaylistSchema>;

interface EditPlaylistModalProps {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlaylistModal({ playlist, open, onOpenChange }: EditPlaylistModalProps) {
  const updatePlaylist = useUpdatePlaylist(playlist._id);

  const form = useForm<EditPlaylistValues>({
    resolver: zodResolver(editPlaylistSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open && playlist) {
      form.reset({
        name: playlist.name,
        description: playlist.description || '',
        // Ensure strictly boolean
        isPublished: playlist.isPublished === undefined ? true : playlist.isPublished,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const onSubmit = async (values: EditPlaylistValues) => {
    try {
      await updatePlaylist.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 bg-white dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>Edit Playlist</DialogTitle>
          <DialogDescription>
            Update your playlist details and visibility.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Name</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/100
                      </span>
                    </div>
                    <FormControl>
                      <Input placeholder="Enter playlist name" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description (Optional)</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </span>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a description..." 
                        className="resize-none" 
                        rows={4}
                        maxLength={500}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visibility Section - Matching Video Edit Design */}
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                       <FormLabel className="text-base font-medium mb-0">Visibility</FormLabel>
                       {field.value ? (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                            <Globe className="h-3 w-3" /> Public
                          </span>
                       ) : (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Lock className="h-3 w-3" /> Private
                          </span>
                       )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {field.value
                        ? "Your playlist is visible to everyone."
                        : "Only you can see this playlist."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={field.value ? "outline" : "default"}
                    size="sm"
                    onClick={() => field.onChange(!field.value)}
                  >
                    {field.value ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlaylist.isPending} className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                {updatePlaylist.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updatePlaylist.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
