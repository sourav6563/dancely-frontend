import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVideos } from '@/lib/hooks/useVideos';
import { Skeleton } from '@/components/ui/skeleton';
import { formatViews } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Video } from '@/types';
import { Play } from 'lucide-react';

interface OtherVideosProps {
  currentVideoId: string;
}

export function OtherVideos({ currentVideoId }: OtherVideosProps) {
  // Fetch more videos to allow for good randomization
  // Increasing limit to 50 to ensure we get a good variety from the backend
  // even if we only show 8. Ideally this would use a random seed endpoint.
  const { data, isLoading } = useVideos({ limit: 50 });
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);


  useEffect(() => {
    // Only select videos if we have data and haven't selected any yet
    if (data?.pages && selectedVideoIds.length === 0) {
      const allVideos = data.pages.flatMap((page) => page.docs);
      const validVideos = allVideos
        .filter((video) => video._id !== currentVideoId);
      
      if (validVideos.length > 0) {
        // Use a functional update or just set it directly since we are inside an effect
        // and we checked the length condition.
        // To be extra safe and avoid strict mode double-invocations issues, we can just set it.
        const shuffled = [...validVideos]
          .sort(() => 0.5 - Math.random())
          .slice(0, 10)
          .map(v => v._id);
        
        setSelectedVideoIds(shuffled);
      }
    }
    // We intentionally exclude selectedVideoIds.length to avoid the cycle. 
    // We only want to run this when data changes or currentVideoId changes.
    // If selectedVideoIds is already populated, we don't want to re-shuffle just because something else changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentVideoId]);

  // Derive the actual video objects from the selected IDs and the *latest* data.
  // This ensures that if a user likes a video, the 'data' updates with the new like status,
  // and we display the updated video object, but the *list order* remains stable
  // because we are driving the list from 'selectedVideoIds'.
  const displayVideos = selectedVideoIds
    .map(id => {
      if (!data?.pages) return undefined;
      for (const page of data.pages) {
        const found = page.docs.find(v => v._id === id);
        if (found) return found;
      }
      return undefined;
    })
    .filter((v): v is Video => !!v);

  // Calculate if we have valid videos to show, to determine if we should show skeletons
  // while waiting for the effect to select them.
  const hasVideosToSelect = data?.pages?.some(page => 
    page.docs.some(v => v._id !== currentVideoId)
  );

  // Show skeletons if:
  // 1. We are loading the initial data
  // 2. We have data but haven't selected videos yet (waiting for effect)
  if (isLoading || (hasVideosToSelect && selectedVideoIds.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-foreground">Other Videos</h3>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 group">
             <Skeleton className="aspect-video w-40 rounded-xl shrink-0" />
             <div className="flex flex-col gap-2 w-full py-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayVideos.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-4 w-full">
      <h3 className="font-bold text-xl text-foreground px-1">Other Videos</h3>
      <div className="flex flex-col gap-4">
        {displayVideos.map((video) => (
           <OtherVideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

function OtherVideoCard({ video }: { video: Video }) {
  return (
    <Link 
        href={`/watch/${video._id}`} 
        className="group flex flex-row gap-3 sm:gap-4 items-start p-2 sm:p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-40 sm:w-44 shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={video.thumbnail.url} 
          alt={video.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
             <Play className="fill-white text-white w-6 h-6 drop-shadow-md" />
        </div>
        <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium border border-white/10 shadow-sm">
           {formatDuration(video.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0 py-0.5 gap-1">
        <h4 className="font-semibold text-sm sm:text-[15px] line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
          {video.title}
        </h4>
        <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
          <p className="hover:text-foreground transition-colors font-medium">{video.owner.name}</p>
          <div className="flex items-center gap-1.5 opacity-80">
            <span>{formatViews(video.views)} views</span>
            <span className="text-[10px]">•</span>
            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: false })} ago</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
