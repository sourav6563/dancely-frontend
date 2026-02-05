import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistApi } from "@/lib/api/playlists";
import type { PaginationParams, Playlist, PaginatedResponse, ApiError } from "@/types";
import { toast } from "sonner";

// Queries

export function useMyPlaylists(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["playlists", "my", params],
    queryFn: async () => {
      const response = await playlistApi.getMyPlaylists(params);
      return response.data;
    },
  });
}

export function useUserPlaylists(userId: string) {
  return useQuery({
    queryKey: ["playlists", "user", userId],
    queryFn: async () => {
      const response = await playlistApi.getUserPlaylists(userId);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function usePlaylist(playlistId: string) {
  return useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      const response = await playlistApi.getById(playlistId);
      return response.data;
    },
    enabled: !!playlistId,
  });
}

// Mutations

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playlistApi.create,
    onSuccess: () => {
      toast.success("Playlist created successfully");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to create playlist");
    },
  });
}

export function useUpdatePlaylist(playlistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; description?: string; isPublished?: boolean }) =>
      playlistApi.update(playlistId, data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches for playlist details and lists
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });
      await queryClient.cancelQueries({ queryKey: ["playlists"] });

      // Snapshot the previous value
      const previousPlaylist = queryClient.getQueryData(["playlist", playlistId]);

      // Snapshot all playlist lists
      const previousPlaylists = queryClient.getQueriesData({ queryKey: ["playlists"] });

      // Optimistically update details
      if (previousPlaylist) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(["playlist", playlistId], (old: any) => ({
          ...old,
          ...newData,
        }));
      }

      // Optimistically update all playlist lists (my playlists, user playlists, etc.)
      queryClient.setQueriesData(
        { queryKey: ["playlists"] },
        (old: PaginatedResponse<Playlist> | undefined) => {
          if (!old || !old.docs) return old;
          return {
            ...old,
            docs: old.docs.map((p) => (p._id === playlistId ? { ...p, ...newData } : p)),
          };
        },
      );

      return { previousPlaylist, previousPlaylists };
    },
    onError: (error: ApiError, newData, context) => {
      toast.error(error.response?.data?.message || "Failed to update playlist");
      // Rollback details
      if (context?.previousPlaylist) {
        queryClient.setQueryData(["playlist", playlistId], context.previousPlaylist);
      }
      // Rollback lists explicitly for instant UI update
      if (context?.previousPlaylists) {
        context.previousPlaylists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // Safety net
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onSuccess: () => {
      toast.success("Playlist updated successfully");
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playlistApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useAddVideoToPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: string; videoId: string }) =>
      playlistApi.addVideo(playlistId, videoId),
    onMutate: async ({ playlistId, videoId }) => {
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });
      await queryClient.cancelQueries({ queryKey: ["playlists"] });

      const previousPlaylists = queryClient.getQueryData(["playlists", "my", {}]); // Simplified key match might be needed

      // Optimistically update all playlist lists
      queryClient.setQueriesData(
        { queryKey: ["playlists"] },
        (oldData: PaginatedResponse<Playlist> | undefined) => {
          if (!oldData || !oldData.docs) return oldData;
          return {
            ...oldData,
            docs: oldData.docs.map((playlist) => {
              if (playlist._id === playlistId) {
                // Check if already exists to avoid dupes
                if (playlist.videos.some((v) => v._id === videoId)) return playlist;
                return {
                  ...playlist,
                  videos: [
                    ...playlist.videos,
                    { _id: videoId, title: "Optimistic Title", thumbnail: "Optimistic Thumb" },
                  ],
                  totalVideos: playlist.totalVideos + 1,
                };
              }
              return playlist;
            }),
          };
        },
      );

      return { previousPlaylists };
    },
    onSuccess: (data, variables) => {
      // Invalidate to get real data
      queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: (error: ApiError, variables, context) => {
      if (context?.previousPlaylists) {
        // Restore? It's hard to match exact query keys for restore without more context.
        // Simplified restoration or just refetch.
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
      }
    },
  });
}

export function useRemoveVideoFromPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: string; videoId: string }) =>
      playlistApi.removeVideo(playlistId, videoId),
    onMutate: async ({ playlistId, videoId }) => {
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });
      await queryClient.cancelQueries({ queryKey: ["playlists"] });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: ["playlists"] },
        (oldData: PaginatedResponse<Playlist> | undefined) => {
          if (!oldData || !oldData.docs) return oldData;
          return {
            ...oldData,
            docs: oldData.docs.map((playlist) => {
              if (playlist._id === playlistId) {
                return {
                  ...playlist,
                  videos: playlist.videos.filter((v) => v._id !== videoId),
                  totalVideos: Math.max(0, playlist.totalVideos - 1),
                };
              }
              return playlist;
            }),
          };
        },
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: () => {
      // Revert is complex, just refetch
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}
