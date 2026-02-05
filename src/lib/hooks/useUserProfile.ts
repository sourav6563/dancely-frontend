import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/users";
import { videoApi } from "@/lib/api/videos";
import { followerApi } from "@/lib/api/followers";
import { communityApi } from "@/lib/api/community";

/**
 * Custom hook to fetch user profile by username
 */
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["user", "profile", username],
    queryFn: async () => {
      const response = await userApi.getProfile(username);
      return response.data;
    },
    enabled: !!username,
  });
}

/**
 * Custom hook to fetch user's videos
 */
export function useUserVideos(userId: string) {
  return useQuery({
    queryKey: ["videos", "user", userId],
    queryFn: async () => {
      const response = await videoApi.getAll({ userId });
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Custom hook to fetch user's community posts
 */
export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ["community-posts", userId],
    queryFn: async () => {
      const response = await communityApi.getUserPosts(userId);
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Custom hook to fetch user's followers
 */
export function useUserFollowers(userId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ["followers", userId, page, limit],
    queryFn: async () => {
      const response = await followerApi.getFollowers(userId, {
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      return response.data;
    },
    enabled: !!userId,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });
}

/**
 * Custom hook to fetch user's following
 */
export function useUserFollowing(userId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ["following", userId, page, limit],
    queryFn: async () => {
      const response = await followerApi.getFollowing(userId, {
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      return response.data;
    },
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
  });
}
