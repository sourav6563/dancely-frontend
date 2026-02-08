import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMyPlaylists, useAddVideoToPlaylist, useRemoveVideoFromPlaylist, useCreatePlaylist } from '@/lib/hooks/usePlaylists';
import { Loader2, Plus, Check, Globe, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AddToPlaylistModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToPlaylistModal({ videoId, open, onOpenChange }: AddToPlaylistModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  
  const [loadingOperations, setLoadingOperations] = useState<Record<string, boolean>>({});

  const { data: playlistsData, isLoading } = useMyPlaylists({ limit: 100 });
  const addVideo = useAddVideoToPlaylist();
  const removeVideo = useRemoveVideoFromPlaylist();
  const createPlaylist = useCreatePlaylist();

  // Helper to check if video is in playlist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVideoInPlaylist = (playlist: any) => {
    if (!playlist.videos) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return playlist.videos.some((v: any) => {
      if (typeof v === 'string') return v === videoId;
      return v._id === videoId;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const togglePlaylist = (playlist: any) => {
    const isIn = isVideoInPlaylist(playlist);
    setLoadingOperations(prev => ({ ...prev, [playlist._id]: true }));
    
    const callbacks = {
      onSuccess: () => {
        const action = isIn ? "Removed from" : "Added to";
        toast.success(`${action} playlist`);
      },
      onError: () => {
        const action = isIn ? "remove from" : "add to";
        toast.error(`Failed to ${action} playlist`);
      },
      onSettled: () => {
         setLoadingOperations(prev => ({ ...prev, [playlist._id]: false }));
      }
    };

    if (isIn) {
      removeVideo.mutate({ playlistId: playlist._id, videoId }, callbacks);
    } else {
      addVideo.mutate({ playlistId: playlist._id, videoId }, callbacks);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    createPlaylist.mutate(
      { name: newPlaylistName, description: '', isPublished },
      {
        onSuccess: () => {
          setIsCreating(false);
          setNewPlaylistName('');
          setIsPublished(true);
          // Toast is handled in the hook for createPlaylist (we didn't remove it from that one, let's verify)
          // checked: useCreatePlaylist HAS toast.success. Consistent enough for "Create" vs "Toggle".
        },
      }
    );
  };

  const isPending = addVideo.isPending || removeVideo.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setIsCreating(false);
        setIsPublished(true);
      }
    }}>
      <DialogContent className="sm:max-w-106.25 bg-white dark:bg-gray-900 dark:border-gray-800">
        {/* ... Header and List ... */}
        <DialogHeader>
          <DialogTitle>Save to...</DialogTitle>
          <DialogDescription>
            Add this video to one of your playlists.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : playlistsData?.docs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No playlists yet. Create one below!
            </div>
          ) : (
            <ScrollArea className="h-75 pr-4">
              <div className="space-y-2">
                 {playlistsData?.docs.map((playlist) => {
                   const isIn = isVideoInPlaylist(playlist);
                   return (
                     <Card
                       key={playlist._id}
                       className={`p-3 cursor-pointer transition-all border ${
                         isIn ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-500/30' : 'bg-card border-border hover:bg-accent/50 hover:border-accent'
                       }`}
                       onClick={() => !isPending && togglePlaylist(playlist)}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`
                           h-5 w-5 rounded border flex items-center justify-center transition-colors
                           ${isIn ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600 bg-transparent'}
                         `}>
                           {isIn && <Check className="h-3 w-3 text-white" />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className={`font-medium break-all line-clamp-2 text-sm mb-0.5 ${isIn ? 'text-purple-700 dark:text-purple-300' : 'text-foreground'}`}>
                             {playlist.name}
                           </p>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <span>{playlist.totalVideos} videos</span>
                             <span className="flex items-center gap-0.5">
                               • {playlist.isPublished ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                               {playlist.isPublished ? 'Public' : 'Private'}
                             </span>
                           </div>
                         </div>
                         {(loadingOperations[playlist._id]) && (
                           <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                         )}
                       </div>
                     </Card>
                   );
                 })}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="pt-2 border-t">
          {isCreating ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <Label htmlFor="newPlaylistName" className="text-xs font-semibold text-gray-500 uppercase">
                  New Playlist Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="newPlaylistName"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Enter playlist name..."
                    autoFocus
                    className="h-9 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => setIsPublished(!isPublished)}
                    title={isPublished ? "Public Playlist" : "Private Playlist"}
                  >
                    {isPublished ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-amber-600" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-right px-1">
                  {isPublished ? "Visible to everyone" : "Only visible to you"}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCreating(false)}
                  disabled={createPlaylist.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  disabled={!newPlaylistName.trim() || createPlaylist.isPending}
                >
                  {createPlaylist.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Create
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start text-foreground hover:bg-accent hover:text-purple-600 border-dashed"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create new playlist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
