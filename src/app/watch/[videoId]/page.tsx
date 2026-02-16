'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CldVideoPlayer } from 'next-cloudinary';
import { Comments } from '@/components/comments/Comments';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideoById, useVideoComments } from '@/lib/hooks/useVideoWatch';
import { useToggleVideoLike, useToggleFollow } from '@/lib/hooks/useVideos';
import { Heart, UserPlus, UserCheck, ListPlus, Pencil, Lock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddToPlaylistModal } from '@/components/playlist/AddToPlaylistModal';
import { EditVideoModal } from '@/components/video/EditVideoModal';
import { formatDistanceToNow } from 'date-fns';
import { formatViews } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { usePlaylist } from '@/lib/hooks/usePlaylists';
import { PlaylistQueue } from '@/components/playlist/PlaylistQueue';

import { OtherVideos } from '@/components/video/OtherVideos';
import { ShareVideoModal } from '@/components/video/ShareVideoModal';
import { Share2 } from 'lucide-react';

/**
 * Video Watch Page
 * Full video player with details, comments, and interactions
 */
export default function WatchVideo() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const playlistId = searchParams.get('playlistId');
  const { user } = useAuth();
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { data: video, isLoading, isError } = useVideoById(videoId);
  const { data: commentsData, isLoading: commentsLoading } = useVideoComments(videoId);
  const { data: playlist } = usePlaylist(playlistId || '');
  
  const toggleLike = useToggleVideoLike();
  const toggleFollow = useToggleFollow();

  const handleVideoEnded = () => {
    if (playlist && playlist.videos) {
      const currentIndex = playlist.videos.findIndex((v) => v._id === videoId);
      if (currentIndex !== -1 && currentIndex < playlist.videos.length - 1) {
        const nextVideo = playlist.videos[currentIndex + 1];
        router.push(`/watch/${nextVideo._id}?playlistId=${playlistId}`);
      }
    }
  };

  const handleLike = () => {
    if (video) {
      toggleLike.mutate(video._id);
    }
  };

  const handleFollow = () => {
    if (video) {
      toggleFollow.mutate(video.owner._id);
    }
  };



  if (isError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Video not found</h2>
            <p className="text-muted-foreground mb-4">This video may have been deleted or made private.</p>
            <Button onClick={() => router.push('/')}>Back to Home</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
                {isLoading ? (
                <Skeleton className="aspect-video w-full rounded-lg" />
              ) : (
              <div className="rounded-lg aspect-video border border-border/50 shadow-xl overflow-hidden select-none relative z-0 [&_.cld-video-player]:h-full [&_.cld-video-player]:w-full [&_video]:rounded-lg">
                  <CldVideoPlayer
                    key={video?._id}
                    width="1920"
                    height="1080"
                    src={video?.videoFile.public_id || video?.videoFile.url || ''}
                    autoplay={true}
                    playsinline
                    controls
                    muted={false}
                    logo={false}
                    sourceTypes={['hls', 'mp4']}
                    // @ts-expect-error qualitySelector might be missing in types but valid in runtime
                    qualitySelector={true}

                    sourceTransformation={{
                      hls: [{ streaming_profile: 'hd' }],
                    }}
                    colors={{
                      accent: '#9333ea',
                      base: '#000000',
                      text: '#ffffff'
                    }}
                    seekThumbnails={true}
                    poster={video?.thumbnail.url}
                    onEnded={handleVideoEnded}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Video Details */}
              {isLoading ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : video ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 shadow-sm">
                  {/* Title and Visibility Badge */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-lg md:text-2xl font-bold text-card-foreground line-clamp-2">{video.title}</h1>
                    {user?._id === video.owner._id && (
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${video.isPublished 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" 
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          }
                        `}
                      >
                        {video.isPublished ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    )}
                  </div>

                  {/* Action Bar: Owner & Interactions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    {/* Owner Info */}
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/profile/${video.owner.username}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                      >
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-border group-hover:ring-purple-500/50 transition-all">
                          <AvatarImage src={video.owner.profileImage} alt={video.owner.name} />
                          <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white text-xs sm:text-base">
                            {video.owner.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground text-sm md:text-base leading-tight group-hover:text-purple-600 transition-colors">{video.owner.name}</p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">
                            {video.owner.followersCount} followers
                          </p>
                        </div>
                      </Link>
                      {user?._id === video.owner._id ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditModalOpen(true)}
                          size="sm"
                          className="rounded-full h-9 px-4 text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95 border-border/50 hover:border-purple-500/50 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                      ) : (
                        <Button
                          variant={video.owner.isFollowed ? 'outline' : 'default'}
                          onClick={handleFollow}
                          size="sm"
                          className={`rounded-full h-9 px-5 text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95 ${
                            !video.owner.isFollowed 
                              ? 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/20 hover:shadow-purple-500/40' 
                              : 'bg-secondary text-purple-600 border-border/50 hover:bg-gray-200 hover:text-purple-600 dark:bg-secondary dark:text-purple-400 dark:hover:bg-gray-800 dark:hover:text-purple-400'
                          }`}
                        >
                          {video.owner.isFollowed ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                Following
                              </>
                           ) : (
                              <>
                                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                Follow
                              </>
                           )}
                        </Button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={handleLike}
                        className={`rounded-full h-10 px-4 transition-all duration-300 active:scale-95 ${
                          video.isLiked 
                            ? 'bg-red-500/10 text-red-600 hover:text-red-600 hover:bg-red-500/20 border border-red-500/20' 
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:text-red-600'
                        }`}
                      >
                        <Heart className={`h-5 w-5 mr-2 ${video.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{video.likesCount > 0 ? video.likesCount : 'Like'}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsShareModalOpen(true)}
                        className="rounded-full h-10 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:text-purple-600 transition-all duration-200 active:scale-95"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        <span className="font-medium">Share</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsAddToPlaylistOpen(true)}
                        className="rounded-full h-10 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:text-purple-600 transition-all duration-200 active:scale-95"
                      >
                        <ListPlus className="h-5 w-5 mr-2" />
                        <span className="font-medium">Save</span>
                      </Button>
                    </div>
                  </div>
                  
                  <AddToPlaylistModal
                    videoId={video._id}
                    open={isAddToPlaylistOpen}
                    onOpenChange={setIsAddToPlaylistOpen}
                  />

                  <EditVideoModal
                    video={video}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                  />

                  <ShareVideoModal
                    videoId={video._id}
                    videoTitle={video.title}
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                  />

                  {/* Description Box - Only show if description exists */}
                  {video.description && video.description.trim() && (
                    <div className="bg-muted/30 rounded-xl overflow-hidden transition-all duration-300">
                       <div 
                          className={`p-3 sm:p-4 transition-colors ${video.description.length > 150 ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                          onClick={() => video.description.length > 150 && setIsDescriptionExpanded(!isDescriptionExpanded)}
                       >
                          <div className="flex items-center gap-3 font-semibold text-xs sm:text-sm mb-2 text-foreground">
                             <span>{formatViews(video.views)} views</span>
                             <span>•</span>
                             <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                          </div>
                          <div 
                             className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                                isDescriptionExpanded ? 'max-h-125' : 'max-h-18'
                             }`}
                          >
                             <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed wrap-break-word">
                                {video.description}
                             </p>
                             {!isDescriptionExpanded && video.description.length > 150 && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-muted/30 to-transparent pointer-events-none" />
                             )}
                          </div>
                          {video.description.length > 150 && (
                            <div className="mt-2 pt-2 flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors">
                               <span>{isDescriptionExpanded ? 'Show less' : 'Show more'}</span>
                               <svg 
                                  className={`w-4 h-4 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                               >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                               </svg>
                            </div>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Mobile Playlist Queue */}
              {playlist && (
                 <div className="lg:hidden my-4">
                    <PlaylistQueue 
                      playlist={playlist} 
                      videoId={videoId} 
                      playlistId={playlistId || ''} 
                      variant="mobile"
                    />
                 </div>
              )}


              {/* Comments Section */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-6">
                <Comments
                  videoId={videoId}
                  comments={commentsData?.docs || []}
                  isLoading={commentsLoading}
                />
              </div>
            </div>

            {/* Sidebar - Playlist or Related Videos */}
            <div className="lg:col-span-1 space-y-4">
              {playlist && (
                <div className="hidden lg:block">
                  <PlaylistQueue 
                    playlist={playlist} 
                    videoId={videoId} 
                    playlistId={playlistId || ''} 
                    variant="desktop"
                  />
                </div>
              )}
              
              <div className="block">
                 <OtherVideos key={videoId} currentVideoId={videoId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
