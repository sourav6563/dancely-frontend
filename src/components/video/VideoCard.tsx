import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useMemo } from 'react';
import { CldVideoPlayer } from 'next-cloudinary';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ShareVideoModal } from '@/components/video/ShareVideoModal';
import { Eye, Clock, MoreVertical, ListPlus, Heart, Share2 } from 'lucide-react';
import { AddToPlaylistModal } from '@/components/playlist/AddToPlaylistModal';
import { formatDuration, formatViews, getVideoPreviewUrl } from '@/lib/utils';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  onLike?: (videoId: string) => void;
  isLiking?: boolean;
  hideOwner?: boolean;
  thumbnailOverlay?: React.ReactNode;
  afterTitleContent?: React.ReactNode;
  enablePreview?: boolean;
}

/**
 * Video Card Component
 * Displays a single video with thumbnail, title, owner info, and stats
 * Supports instant video preview on hover (Desktop only)
 */
export function VideoCard({ 
  video, 
  onLike, 
  hideOwner = false,
  thumbnailOverlay,
  afterTitleContent,
  enablePreview = false 
}: VideoCardProps) {
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const previewUrl = useMemo(() => getVideoPreviewUrl(video.videoFile), [video.videoFile]);

  const handleMouseEnter = () => {
    // Small delay to prevent accidental triggers when moving mouse across grid
    if (enablePreview) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
    >
      {/* Thumbnail / Video Preview area */}
      <Link href={`/watch/${video._id}`}>
        <div 
          className="relative aspect-video bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isHovered && enablePreview ? (
            <div className="absolute inset-0 z-10 animate-in fade-in duration-300">
               <CldVideoPlayer
                width="640"
                height="360"
                src={video.videoFile.public_id || previewUrl}
                autoplay="always"
                muted
                loop
                controls={false}
                logo={false}
                poster={video.thumbnail.url}
                className="w-full h-full object-cover"
              /> 
            </div>
          ) : (
             <Image
                src={video.thumbnail.url}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
          )}
          
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
          
          {/* Custom Overlay (e.g. Public/Private badge) */}
          {thumbnailOverlay && (
            <div className="absolute top-2 left-2 z-20">
              {thumbnailOverlay}
            </div>
          )}
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 z-20">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4 pb-1">
        {/* Title & Actions */}
        <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3">
          <Link href={`/watch/${video._id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer leading-tight sm:leading-snug">
              {video.title}
            </h3>
          </Link>
          {afterTitleContent}
        </div>

        {/* Owner Info */}
        {hideOwner ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViews(video.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatViews(Math.max(video.likesCount || 0, video.isLiked ? 1 : 0))}
              </span>
              <span className="ml-auto">{formatDistanceToNow(new Date(video.createdAt))} ago</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${video.owner.username}`} className="flex items-center gap-2 sm:gap-3 flex-1 group/owner">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-purple-100 dark:ring-purple-900 group-hover/owner:ring-purple-300 dark:group-hover/owner:ring-purple-700 transition-all">
                <AvatarImage src={video.owner.profileImage} alt={video.owner.name} />
                <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-medium">
                  {video.owner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate group-hover/owner:text-purple-600 dark:group-hover/owner:text-purple-400 transition-colors">
                  {video.owner.name}
                </p>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViews(video.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatViews(Math.max(video.likesCount || 0, video.isLiked ? 1 : 0))}
                  </span>
                  <span className="ml-auto">{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                </div>
              </div>
            </Link>
            
            {onLike && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full">
                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-700">
                  <DropdownMenuItem onClick={() => setIsAddToPlaylistOpen(true)} className="dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                    <ListPlus className="h-4 w-4 mr-2" />
                    Save
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsShareModalOpen(true)} className="dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </CardContent>
      
      <AddToPlaylistModal
        videoId={video._id}
        open={isAddToPlaylistOpen}
        onOpenChange={setIsAddToPlaylistOpen}
      />

      <ShareVideoModal
        videoId={video._id}
        videoTitle={video.title}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </Card>
  );
}
