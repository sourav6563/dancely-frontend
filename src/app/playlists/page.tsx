'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyPlaylists } from '@/lib/hooks/usePlaylists';
import { FolderPlus, ListVideo, Search, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PlaylistsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useMyPlaylists({ limit: 50 });

  const filteredPlaylists = data?.docs.filter(playlist => 
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 w-fit">
                My Playlists
              </h1>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <p>Manage and organize your video collections</p>
                <div className="hidden sm:block h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                <span className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold px-3 py-1 rounded-full transition-all hover:bg-purple-200 dark:hover:bg-purple-900/50">
                   <ListVideo className="h-4 w-4" />
                   {data?.totalDocs || 0} Playlists
                </span>
              </div>
            </div>

            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-800 dark:text-white"
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : filteredPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredPlaylists.map((playlist) => (
                <PlaylistCard 
                  key={playlist._id} 
                  playlist={playlist} 
                  isOwner={true}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 bg-white/50 dark:bg-gray-900/50 dark:border-gray-800">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full">
                  <ListVideo className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No playlists found' : 'No playlists yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {searchQuery 
                  ? `We couldn't find any playlists matching "${searchQuery}"`
                  : "Create your first playlist to start organizing your favorite videos."}
              </p>
              {!searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(true)}
                  className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              )}
            </Card>
          )}

          <CreatePlaylistModal 
            open={isCreateOpen} 
            onOpenChange={setIsCreateOpen} 
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
