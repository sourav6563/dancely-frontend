'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { EditPlaylistModal } from '@/components/playlist/EditPlaylistModal';
import { usePlaylist, useDeletePlaylist, useRemoveVideoFromPlaylist, useUpdatePlaylist } from '@/lib/hooks/usePlaylists';
import { useAuth } from '@/context/AuthContext';
import { 
  PlaySquare, 
  Trash2, 
  Pencil, 
  Clock, 
  ListVideo,
  Play,
  Plus,
  ArrowLeft,
  Lock,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { toast } from 'sonner';


export default function PlaylistInternalPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.playlistId as string;
  const { user } = useAuth();
  
  const { data: playlist, isLoading } = usePlaylist(playlistId);
  const deletePlaylist = useDeletePlaylist();
  const updatePlaylist = useUpdatePlaylist(playlistId);
  const removeVideo = useRemoveVideoFromPlaylist();

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [videoToRemove, setVideoToRemove] = useState<string | null>(null);

  const getOwnerId = (owner: string | { _id: string }) => {
    if (typeof owner === 'string') return owner;
    return owner?._id;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isOwner = user && playlist && String(user._id) === String(getOwnerId(playlist.owner as any));

  // Handlers
  const handleDeletePlaylist = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleRemoveVideo = (videoId: string) => {
    setVideoToRemove(videoId);
  };

  const handlePlayAll = () => {
    if (playlist && playlist.videos.length > 0) {
      router.push(`/watch/${playlist.videos[0]._id}?playlistId=${playlist._id}`);
    } else {
      toast.error("No videos to play");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
          <div className="container mx-auto px-4 py-8">
             <div className="mb-6">
                <Skeleton className="h-10 w-24" /> {/* Back button */}
             </div>
             
             <div className="flex flex-col lg:flex-row gap-8">
               {/* Left Sidebar Skeleton */}
               <div className="lg:w-1/3 lg:sticky lg:top-24 h-fit">
                 <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-100 dark:border-gray-800 shadow-xl rounded-2xl">
                   <Skeleton className="aspect-video w-full rounded-xl mb-6 shadow-sm" />
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <Skeleton className="h-8 w-3/4 dark:bg-gray-800" />
                       <Skeleton className="h-4 w-full dark:bg-gray-800" />
                       <Skeleton className="h-4 w-2/3 dark:bg-gray-800" />
                     </div>
                     <div className="flex gap-4 pt-2">
                       <Skeleton className="h-4 w-20 dark:bg-gray-800" />
                       <Skeleton className="h-4 w-24 dark:bg-gray-800" />
                     </div>
                     <div className="pt-4 space-y-3">
                       <Skeleton className="h-12 w-full rounded-md dark:bg-gray-800" />
                       <div className="flex gap-2">
                         <Skeleton className="h-10 flex-1 rounded-md dark:bg-gray-800" />
                         <Skeleton className="h-10 flex-1 rounded-md dark:bg-gray-800" />
                         <Skeleton className="h-10 flex-1 rounded-md dark:bg-gray-800" />
                       </div>
                     </div>
                   </div>
                 </Card>
               </div>

               {/* Right Side Videos Skeleton */}
               <div className="flex-1 space-y-4">
                 {Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="flex gap-4 p-3 rounded-xl border border-transparent bg-white/40 dark:bg-gray-900/80">
                      <div className="hidden sm:block w-8 self-center">
                        <Skeleton className="h-4 w-4 mx-auto dark:bg-gray-800" />
                      </div>
                      <Skeleton className="w-40 aspect-video rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-2">
                        <Skeleton className="h-5 w-3/4 dark:bg-gray-800" />
                        <Skeleton className="h-4 w-1/2 dark:bg-gray-800" />
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </>
    );
  }

  if (!playlist) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <PlaySquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Playlist not found</h1>
          <p className="text-gray-600 mb-6">The playlist you are looking for does not exist or has been deleted.</p>
          <Link href="/playlists">
            <Button variant="outline">Back to Playlists</Button>
          </Link>
        </div>
      </>
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const firstVideoThumbnail = playlist.videos[0]?.thumbnail as any;
  const rawThumbnail = playlist.playlistThumbnail || (typeof firstVideoThumbnail === 'string' ? firstVideoThumbnail : firstVideoThumbnail?.url);
  const hasThumbnail = Boolean(rawThumbnail && rawThumbnail.trim().length > 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 pl-0 hover:bg-transparent hover:text-purple-600"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar: Playlist Info */}
            <div className="lg:w-1/3 lg:sticky lg:top-24 h-fit">
              <Card className="p-4 sm:p-6 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-100 dark:border-gray-800 shadow-xl rounded-2xl">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-md group">
                   {hasThumbnail ? (
                    <Image
                      src={rawThumbnail}
                      alt={playlist.name}
                      fill
                      priority
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-gray-100 to-gray-200">
                      <PlaySquare className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {/* Published Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={playlist.isPublished ? 'default' : 'secondary'}
                      className={
                        playlist.isPublished
                          ? 'bg-green-500/90 hover:bg-green-600 text-xs py-1 px-2 h-auto gap-1'
                          : 'bg-gray-500/90 hover:bg-gray-600 text-xs py-1 px-2 h-auto gap-1'
                      }
                    >
                      {playlist.isPublished ? (
                        <>
                          <Globe className="h-3 w-3" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Private
                        </>
                      )}
                    </Badge>
                  </div>
                  {/* Play All Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <div className="bg-white/20 backdrop-blur p-4 rounded-full ring-2 ring-white/50">
                       <Play className="h-8 w-8 text-white fill-current" />
                     </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                      {playlist.name}
                    </h1>
                    {playlist.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {playlist.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <ListVideo className="h-4 w-4 mr-1.5" />
                      {playlist.totalVideos} videos
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      Updated {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-3 pt-4">
                    <Button 
                      className="w-full bg-linear-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white"
                      size="default"
                      onClick={handlePlayAll}
                    >
                      <Play className="mr-2 h-5 w-5 fill-current" />
                      Play All
                    </Button>

                    {isOwner && (
                      <>
                        <Button 
                          asChild
                          variant="outline" 
                          className="w-full hover:text-purple-600 hover:bg-purple-50 group border-dashed"
                        >
                          <Link href="/">
                            <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                            Add
                          </Link>
                        </Button>

                        <div className="flex gap-2 text-xs sm:text-sm">
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => updatePlaylist.mutate({ isPublished: !playlist.isPublished })}
                           className="flex-1 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 h-9 sm:h-10 px-2"
                           disabled={updatePlaylist.isPending}
                         >
                           {playlist.isPublished ? (
                             <>
                               <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                               Private
                             </>
                           ) : (
                             <>
                               <Eye className="mr-1.5 h-3.5 w-3.5" />
                               Public
                             </>
                           )}
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => setIsEditOpen(true)} 
                           className="flex-1 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 h-9 sm:h-10 px-2"
                         >
                           <Pencil className="mr-1.5 h-3.5 w-3.5" />
                           Edit
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={handleDeletePlaylist}
                           className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 h-9 sm:h-10 px-2"
                         >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                         </Button>
                      </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side: Videos List */}
            <div className="flex-1 space-y-4">
              {playlist.videos.length === 0 ? (
                <Card className="p-12 text-center bg-transparent border-dashed border-2">
                   <p className="text-gray-500 text-lg">No videos in this playlist yet.</p>
                   <Link href="/">
                     <Button variant="link" className="text-purple-600 mt-2">
                       Explore videos to add
                     </Button>
                   </Link>
                </Card>
              ) : (
                playlist.videos.map((video, index) => {
                  const isRemoving = removeVideo.isPending && removeVideo.variables?.videoId === video._id;
                  
                  return (
                    <div 
                      key={video._id} 
                      className={`group flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 cursor-pointer bg-white dark:bg-gray-900 items-center ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => router.push(`/watch/${video._id}?playlistId=${playlist._id}`)}
                    >
                    {/* Index */}
                    <div className="hidden sm:flex items-center justify-center w-8 text-gray-400 dark:text-gray-500 font-medium group-hover:hidden whitespace-nowrap">
                      {index + 1}
                    </div>
                    <div className="hidden sm:group-hover:flex items-center justify-center w-8 text-purple-600 whitespace-nowrap">
                      <Play className="h-4 w-4 fill-current" />
                    </div>

                      {/* Thumbnail */}
                    <div className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">

                      {(typeof video.thumbnail === 'string' ? video.thumbnail : (video.thumbnail as any)?.url) ? (
                        <Image 

                          src={typeof video.thumbnail === 'string' ? video.thumbnail : (video.thumbnail as any).url} 
                          alt={video.title} 
                          fill 
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <ListVideo className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-foreground line-clamp-2 text-sm sm:text-base md:text-lg mb-1 transition-colors">
                        {video.title}
                      </h3>
                       {/* We might not have channel name in basic video object used for playlist, logic depends on backend population */}
                       {/* If needed, we can show it. For now, keeping it simple. */}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center self-center pl-2" onClick={(e) => e.stopPropagation()}>
                       {isOwner && (
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleRemoveVideo(video._id);
                           }}
                           title="Remove from playlist"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                    </div>
                  </div>
                  ); // closing return
                }) // closing map
              )}
            </div>
          </div>

          {/* Edit Modal */}
          {playlist && (
            <EditPlaylistModal 
              playlist={playlist}
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            />
          )}

          {/* Delete Playlist Alert */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="bg-white dark:bg-gray-900 dark:border-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the playlist
                  <span className="font-semibold text-foreground"> &quot;{playlist?.name}&quot; </span>
                  and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                     // Close alert immediately to show processing state on the page
                     setIsDeleteDialogOpen(false);

                     const promise = deletePlaylist.mutateAsync(playlistId);
                     
                     toast.promise(promise, {
                       loading: 'Deleting playlist...',
                       success: 'Playlist deleted successfully',
                       error: (err) => err?.response?.data?.message || 'Failed to delete playlist',
                     });

                     promise.then(() => {
                        router.push('/playlists');
                     });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Remove Video Alert */}
          <AlertDialog open={!!videoToRemove} onOpenChange={(open) => !open && setVideoToRemove(null)}>
            <AlertDialogContent className="bg-white dark:bg-gray-900 dark:border-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Remove video from playlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this video from <span className="font-semibold">&quot;{playlist?.name}&quot;</span>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (videoToRemove) {
                      // Close alert
                      const idToRemove = videoToRemove;
                      setVideoToRemove(null);

                      const promise = removeVideo.mutateAsync({ playlistId, videoId: idToRemove });

                      toast.promise(promise, {
                          loading: 'Removing video...',
                          success: 'Video removed from playlist',
                          error: (err) => err?.response?.data?.message || 'Failed to remove video',
                      });
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
