'use client';

import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { VideoCard } from '@/components/video/VideoCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  useUserProfile,
  useUserVideos,
  useUserFollowers,
  useUserFollowing,
  useUserPosts,
} from '@/lib/hooks/useUserProfile';
import { useToggleFollow, useToggleVideoLike } from '@/lib/hooks/useVideos';
import { useTogglePostLike } from '@/lib/hooks/useCommunity';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, UserCheck, Users, Video as VideoIcon, MessageSquare, ListMusic, Calendar, Eye } from 'lucide-react';
import { CreatePostForm } from '@/components/community/CreatePostForm';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { useUserPlaylists } from '@/lib/hooks/usePlaylists';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { UserListModal } from '@/components/profile/UserListModal';
import { useState } from 'react';
import { Playlist } from '@/types';
import { EditProfileModal } from '@/components/profile/EditProfileModal';



import { formatViews } from '@/lib/utils';
/**
 * User Profile Page
 * Displays user information, videos, stats, and connections
 */
export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isAboutBioExpanded, setIsAboutBioExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState("videos");

  const { data: profile, isLoading: profileLoading } = useUserProfile(username);
  const { data: videosData, isLoading: videosLoading } = useUserVideos(profile?._id || '');
  const { data: playlistsData, isLoading: playlistsLoading } = useUserPlaylists(profile?._id || '');
  const { data: postsData, isLoading: postsLoading } = useUserPosts(profile?._id || '');
  const { data: followersData } = useUserFollowers(profile?._id || '');
  const { data: followingData } = useUserFollowing(profile?._id || '');
  
  const toggleFollow = useToggleFollow();
  const toggleLike = useToggleVideoLike();
  const togglePostLike = useTogglePostLike();

  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const handleFollow = () => {
    if (profile) {
      toggleFollow.mutate(profile._id);
    }
  };

  const handleLike = (videoId: string) => {
    toggleLike.mutate(videoId);
  };

  const handlePostLike = (postId: string) => {
    togglePostLike.mutate(postId);
  };



  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="relative mb-6 max-w-2xl mx-auto">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl transform -z-10" />
            
            <Card className="border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900 overflow-hidden rounded-2xl">
              <div className="absolute top-0 w-full h-12 bg-linear-to-r from-purple-600 to-blue-600 opacity-90 rounded-t-2xl" />
              
              <CardContent className="p-0">
                {profileLoading ? (
                  <div className="pt-10 pb-4 px-6 flex flex-col items-center gap-3">
                    <Skeleton className="h-20 w-20 rounded-full ring-4 ring-white dark:ring-gray-900" />
                    <div className="space-y-2 text-center w-full max-w-sm">
                      <Skeleton className="h-6 w-32 mx-auto" />
                      <Skeleton className="h-3 w-24 mx-auto" />
                      <div className="flex gap-3 justify-center mt-3">
                        <Skeleton className="h-12 w-16 rounded-xl" />
                        <Skeleton className="h-12 w-16 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ) : profile ? (
                  <div className="flex flex-col items-center relative">
                    {/* Avatar - overlapping the banner */}
                    <div className="mt-1.5 mb-1 relative group">
                      <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600 to-blue-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-white dark:ring-gray-900 shadow-lg relative cursor-pointer transition-transform hover:scale-105 duration-300">
                        <AvatarImage src={profile.profileImage} alt={profile.name} className="object-cover" />
                        <AvatarFallback className="bg-linear-to-br from-purple-100 to-blue-100 text-purple-600 text-base sm:text-lg font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* User Info */}
                    <div className="text-center px-4 pb-2.5 w-full max-w-md mx-auto">
                      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                        {profile.name}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1.5 flex items-center justify-center gap-1.5">
                        @{profile.username}
                        {isOwnProfile && <span className="text-[9px] bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-full">You</span>}
                      </p>
                      
                      {profile.bio && (
                        <div className="mb-2 max-w-xs mx-auto">
                          <div className={`overflow-hidden transition-all duration-300 ${!isBioExpanded ? 'max-h-11' : 'max-h-32'}`}>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {profile.bio}
                            </p>
                          </div>
                          {profile.bio.length > 80 && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setIsBioExpanded(!isBioExpanded); }}
                              className="flex items-center gap-0.5 mx-auto text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mt-1"
                            >
                              <svg 
                                className={`w-3 h-3 transition-transform duration-300 ${isBioExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Stats - Inline */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div 
                          onClick={() => setIsFollowersOpen(true)}
                          className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
                        >
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {formatViews(profile.followersCount || 0)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">followers</span>
                        </div>
                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                        <div 
                          onClick={() => setIsFollowingOpen(true)}
                          className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
                        >
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {formatViews(profile.followingCount || 0)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">following</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {currentUser && !isOwnProfile && (
                        <div className="flex justify-center">
                          <Button
                              variant={profile.isFollowed ? 'outline' : 'default'}
                              onClick={handleFollow}
                              size="sm"
                              className={`rounded-full px-6 text-sm font-medium transition-all active:scale-95 ${
                                !profile.isFollowed 
                                  ? 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                                  : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700'
                              }`}
                            >
                              {profile.isFollowed ? (
                                <>
                                  <UserCheck className="mr-2 h-5 w-5" />
                                  Following
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-5 w-5" />
                                  Follow
                                </>
                              )}
                            </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto flex items-center justify-center mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User not found</h2>
                    <p className="text-gray-500">The profile you are looking for does not exist.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs 
            id="profile-content-tabs"
            value={currentTab} 
            onValueChange={setCurrentTab}
            className="space-y-6"
          >
            <div className="w-full overflow-x-auto pb-2 scrollbar-none flex justify-start sm:justify-center">
              <TabsList className="inline-flex w-auto bg-transparent p-1 gap-2">
                <TabsTrigger 
                  value="videos" 
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Videos</span>
                    <span className="ml-1.5 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {formatViews(videosData?.totalDocs || 0)}
                    </span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="playlists" 
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <ListMusic className="h-4 w-4" />
                    <span className="hidden sm:inline">Playlists</span>
                    <span className="ml-1.5 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {formatViews(playlistsData?.length || 0)}
                    </span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="community" 
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Community</span>
                    <span className="ml-1.5 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {formatViews(postsData?.totalDocs || 0)}
                    </span>
                  </div>
                </TabsTrigger>

                <TabsTrigger 
                  value="about" 
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">About</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 px-4 sm:px-6 lg:px-8">
              {videosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-video w-full rounded-2xl" />
                      <Skeleton className="h-4 w-3/4 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-1/2 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : videosData && videosData.docs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {videosData.docs.map((video) => (
                    <VideoCard
                      key={video._id}
                      video={video}
                      onLike={handleLike}
                      isLiking={toggleLike.isPending}
                      hideOwner={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-6">
                    <VideoIcon className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No videos yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {isOwnProfile
                      ? "Upload your first video to get started sharing your moves!"
                      : "This user hasn't uploaded any videos yet."}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {playlistsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-video w-full rounded-2xl" />
                      <Skeleton className="h-4 w-3/4 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-1/2 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : playlistsData && playlistsData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {playlistsData.map((playlist: Playlist) => (
                    <PlaylistCard
                      key={playlist._id}
                      playlist={playlist}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-6">
                    <ListMusic className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No playlists yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {isOwnProfile
                      ? "Create your first playlist to organize your videos!"
                      : "This user hasn't created any playlists yet."}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {isOwnProfile && (
                <div className="max-w-2xl mx-auto mb-8">
                  <CreatePostForm />
                </div>
              )}

              {postsLoading ? (
                <div className="max-w-2xl mx-auto space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-6 dark:bg-gray-900 dark:border-gray-800 h-full rounded-2xl">
                      <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-800" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32 dark:bg-gray-800" />
                          <Skeleton className="h-4 w-full dark:bg-gray-800" />
                          <Skeleton className="h-4 w-2/3 dark:bg-gray-800" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : postsData && postsData.docs.length > 0 ? (
                <div className="max-w-2xl mx-auto space-y-4">
                  {postsData.docs.map((post) => (
                    <CommunityPostCard
                      key={post._id}
                      post={post}
                      onLike={handlePostLike}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-6">
                    <MessageSquare className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No community posts</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {isOwnProfile
                      ? "Share something with the community to get the conversation started!"
                      : "This user hasn't posted anything yet."}
                  </p>
                </div>
              )}
            </TabsContent>



            {/* About Tab */}
            <TabsContent value="about" className="mt-8">
              <div className="max-w-2xl mx-auto">
                <Card className="border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-900/5 dark:shadow-none bg-white dark:bg-gray-900 overflow-hidden rounded-2xl">
                  <CardContent className="p-3 sm:p-5 md:p-6">
                    {profile ? (
                      <div className="space-y-4">
                        {/* Bio Section */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bio</h3>
                          {profile.bio ? (
                            <div>
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isAboutBioExpanded ? 'max-h-18' : 'max-h-96'}`}>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-6 max-w-prose">
                                  {profile.bio}
                                </p>
                              </div>
                              {profile.bio.length > 150 && (
                                <button 
                                  onClick={() => setIsAboutBioExpanded(!isAboutBioExpanded)}
                                  className="flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mt-2 focus:outline-none"
                                >
                                  <span>{isAboutBioExpanded ? 'Show less' : 'Show more'}</span>
                                  <svg 
                                    className={`w-4 h-4 transition-transform duration-300 ${isAboutBioExpanded ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-400 dark:text-gray-500 text-sm">No bio added yet.</p>
                          )}
                        </div>

                        {/* Stats Section */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Joined Date */}
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
                                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Total Views */}
                            {((profile.totalViews || 0) > 0 || isOwnProfile) && (
                              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
                                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {(profile.totalViews || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-center py-8">No information available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <UserListModal 
        isOpen={isFollowersOpen}
        onClose={() => setIsFollowersOpen(false)}
        title="Followers"
        users={followersData?.docs || []}
        emptyMessage="No followers yet"
      />
      <UserListModal 
        isOpen={isFollowingOpen}
        onClose={() => setIsFollowingOpen(false)}
        title="Following"
        users={followingData?.docs || []}
        emptyMessage="Not following anyone yet"
      />
      {profile && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          currentUser={profile}
        />
      )}
    </>
  );
}
