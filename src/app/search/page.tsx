'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { VideoCard } from '@/components/video/VideoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';
import { useToggleVideoLike } from '@/lib/hooks/useVideos';
import { Search as SearchIcon, Video, Users, X, TrendingUp, ListVideo, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { User, Video as VideoType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { formatViews } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Playlist type for search results
interface PlaylistResult {
  _id: string;
  name: string;
  description?: string;
  totalVideos: number;
  playlistThumbnail?: string;
  updatedAt?: string;
  owner: {
    _id: string;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface VideosResponse {
  docs: VideoType[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  
  // Sync with URL query when it changes (for navbar search)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    // Only update state if the URL change does not match our current debounced query
    // (meaning it's an external change like back button, not our own navigation)
    if (urlQuery !== debouncedQuery) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }

  // Videos with infinite query for pagination
  const {
    data: videosData,
    isLoading: videosLoading,
    fetchNextPage: fetchMoreVideos,
    hasNextPage: hasMoreVideos,
    isFetchingNextPage: loadingMoreVideos,
  } = useInfiniteQuery({
    queryKey: ['search', 'videos', debouncedQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/video', {
        params: { query: debouncedQuery, page: pageParam, limit: 12 },
      });
      return response.data.data as VideosResponse;
    },
    getNextPageParam: (lastPage) => lastPage?.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!debouncedQuery,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['search', 'users', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const response = await api.get('/user/search', {
        params: { query: debouncedQuery, limit: 20 },
      });
      return response.data.data;
    },
    enabled: !!debouncedQuery,
  });

  const { data: playlistsData, isLoading: playlistsLoading } = useQuery({
    queryKey: ['search', 'playlists', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const response = await api.get('/playlist/search', {
        params: { query: debouncedQuery, limit: 20 },
      });
      return response.data.data;
    },
    enabled: !!debouncedQuery,
  });

  const toggleLike = useToggleVideoLike();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
    // Update URL without reload
    if (query) {
      router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
    } else {
      router.replace('/search', { scroll: false });
    }
  };

  const handleLike = (videoId: string) => {
    toggleLike.mutate(videoId);
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    router.replace('/search', { scroll: false });
  };

  // Flatten video pages into single array
  const allVideos = useMemo(() => {
    return videosData?.pages?.flatMap(page => page.docs) || [];
  }, [videosData]);

  // Get total count from first page
  const videoCount = useMemo(() => videosData?.pages?.[0]?.totalDocs || 0, [videosData]);
  const userCount = useMemo(() => usersData?.length || 0, [usersData]);
  const playlistCount = useMemo(() => playlistsData?.length || 0, [playlistsData]);
  const isSearching = videosLoading || usersLoading || playlistsLoading;

  // State for active tab
  const [activeTab, setActiveTab] = useState('videos');
  
  // Track which query we last auto-switched for to prevent fighting user interaction
  const lastProcessedQuery = useRef('');

  // Reset last processed query when debounced query changes (new search started)
  useEffect(() => {
    if (debouncedQuery !== lastProcessedQuery.current) {
      // We don't reset activeTab here immediately to avoid jumping, 
      // we wait for results to load in the other effect.
    }
  }, [debouncedQuery]);

  // Logic to determine which tab to show on new search
  useEffect(() => {
    // Only switch if we're not loading, have a query, and haven't processed this query yet
    if (!videosLoading && !usersLoading && !playlistsLoading && debouncedQuery && debouncedQuery !== lastProcessedQuery.current) {
       // Get counts
       const vCount = videosData?.pages?.[0]?.totalDocs || 0;
       const uCount = usersData?.length || 0;
       const pCount = playlistsData?.length || 0;

       // Identify the winner
       let winner = 'videos';
       let maxCount = vCount;

       if (pCount > maxCount) {
         winner = 'playlists';
         maxCount = pCount;
       }
       
       if (uCount > maxCount) {
         winner = 'users';
         maxCount = uCount; 
       }

       // Only switch if we found results
       if (maxCount > 0) {
          // eslint-disable-next-line 
          setActiveTab(winner);
       } else {
          // If no results anywhere, default back to videos
          setActiveTab('videos');
       }
       
       // Mark this query as processed so we don't switch again if user changes tab manually
       lastProcessedQuery.current = debouncedQuery;
    }
  }, [videosData, usersData, playlistsData, videosLoading, usersLoading, playlistsLoading, debouncedQuery]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Search Header */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
              Search
            </h1>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for videos, users, and playlists..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 pl-4 pr-24 text-base rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-gray-700 dark:bg-gray-900 dark:text-white transition-colors"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Results */}
          {debouncedQuery ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Pill-style tabs */}
              <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex bg-transparent p-1 gap-2 flex-nowrap sm:flex-wrap">
                  <TabsTrigger 
                    value="videos" 
                    className="rounded-full px-5 py-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="hidden sm:inline">Videos</span>
                      <span className="ml-1 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                        {isSearching ? '...' : formatViews(videoCount)}
                      </span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="playlists" 
                    className="rounded-full px-5 py-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2">
                      <ListVideo className="h-4 w-4" />
                      <span className="hidden sm:inline">Playlists</span>
                      <span className="ml-1 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                        {isSearching ? '...' : formatViews(playlistCount)}
                      </span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="rounded-full px-5 py-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Users</span>
                      <span className="ml-1 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                        {isSearching ? '...' : formatViews(userCount)}
                      </span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Videos Tab */}
              <TabsContent value="videos">
                {videosLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : allVideos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {allVideos.map((video: VideoType) => (
                        <VideoCard
                          key={video._id}
                          video={video}
                          onLike={handleLike}
                          isLiking={toggleLike.isPending}
                        />
                      ))}
                    </div>
                    {/* Load More Button */}
                    {hasMoreVideos && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={() => fetchMoreVideos()}
                          disabled={loadingMoreVideos}
                          className="rounded-full px-8 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {loadingMoreVideos ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-12 text-center dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                    <Video className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No videos found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try searching with different keywords</p>
                  </Card>
                )}
              </TabsContent>

              {/* Playlists Tab */}
              <TabsContent value="playlists">
                {playlistsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : playlistsData && playlistsData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {playlistsData.map((playlist: PlaylistResult) => (
                      <Link key={playlist._id} href={`/playlists/${playlist._id}`}>
                        <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer dark:bg-gray-900 dark:border-gray-800 rounded-xl group">
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                            {playlist.playlistThumbnail ? (
                              <Image
                                src={playlist.playlistThumbnail}
                                alt={playlist.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ListVideo className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            {/* Video count badge */}
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <ListVideo className="h-3 w-3" />
                              {playlist.totalVideos} videos
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-3 sm:p-4 pb-1">
                            {/* Title (No Description for compact view) */}
                            <div className="mb-2 sm:mb-3">
                              <h3 className="font-semibold text-sm sm:text-base line-clamp-2 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight sm:leading-snug">
                                {playlist.name}
                              </h3>
                            </div>

                            {/* Owner Info & Stats */}
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-300 dark:group-hover:ring-purple-700 transition-all">
                                <AvatarImage src={playlist.owner.profileImage} alt={playlist.owner.name} />
                                <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-medium">
                                  {playlist.owner.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {playlist.owner.name}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {playlist.updatedAt && (
                                    <span className="truncate">
                                      Updated {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                    <ListVideo className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No playlists found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try searching with different keywords</p>
                  </Card>
                )}
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                {usersLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="p-4 dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : usersData && usersData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {usersData.map((user: User) => (
                      <Link key={user._id} href={`/profile/${user.username}`}>
                        <Card className="p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer dark:bg-gray-900 dark:border-gray-800 rounded-xl group">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-purple-100 dark:ring-purple-900/50 group-hover:ring-purple-300 dark:group-hover:ring-purple-700 transition-all">
                              <AvatarImage src={user.profileImage} alt={user.name} />
                              <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                    <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No users found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try searching with different keywords</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            /* Empty State - When no search query */
            <Card className="max-w-lg mx-auto p-12 text-center dark:bg-gray-900 dark:border-gray-800 rounded-xl">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-6">
                <TrendingUp className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                Discover Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Search for your favorite videos, playlists, and creators
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
       </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
