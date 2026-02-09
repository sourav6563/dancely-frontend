'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Playlist } from '@/types';

interface PlaylistQueueProps {
  playlist: Playlist;
  videoId: string;
  playlistId: string;
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function PlaylistQueue({ playlist, videoId, playlistId, className, variant = 'desktop' }: PlaylistQueueProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(variant === 'desktop');

  if (!playlist) return null;

  return (
    <Card className={cn(
      "flex flex-col border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 bg-white dark:bg-gray-900",
      variant === 'desktop' ? "sticky top-24" : "rounded-lg border mb-6",
      "max-h-[600px] overflow-hidden",
      className
    )}>
      <div 
        className={cn("p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", variant === 'desktop' && "cursor-default hover:bg-white dark:hover:bg-gray-900")}
        onClick={() => variant === 'mobile' && setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-bold text-lg leading-tight truncate">{playlist.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {typeof playlist.owner === 'object' ? playlist.owner.name : 'Unknown'} - {playlist.videos.findIndex((v) => v._id === videoId) + 1} / {playlist.videos.length}
          </p>
        </div>
        {variant === 'mobile' && (
          <div className="text-muted-foreground">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        )}
      </div>
      {isOpen && (
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {playlist.videos.map((v, index: number) => {
          const isCurrent = v._id === videoId;
          return (
            <div 
              key={v._id}
              className={cn(
                "flex gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors group",
                isCurrent ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              )}
              onClick={() => router.push(`/watch/${v._id}?playlistId=${playlistId}`)}
            >
              <div className="relative w-20 sm:w-24 aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden shrink-0">
                {v.thumbnail && (
                  <Image 
                    src={typeof v.thumbnail === 'string' ? v.thumbnail : v.thumbnail.url} 
                    alt={v.title} 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                )}
                {isCurrent && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                )}
                {!isCurrent && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className={cn(
                  "text-xs sm:text-sm font-medium line-clamp-2 leading-tight",
                  isCurrent ? "text-foreground font-semibold" : "text-foreground/90 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                )}>
                  {v.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {index + 1} of {playlist.videos.length}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </Card>
  );
}
