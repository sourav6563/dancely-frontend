'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Trash2,
  ListVideo,
  PlaySquare,
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Playlist } from '@/types';
import { EditPlaylistModal } from './EditPlaylistModal';
import { useDeletePlaylist, useUpdatePlaylist } from '@/lib/hooks/usePlaylists';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PlaylistCardProps {
  playlist: Playlist;
  isOwner?: boolean;
}

export function PlaylistCard({ playlist, isOwner = false }: PlaylistCardProps) {
  const deletePlaylist = useDeletePlaylist();
  const updatePlaylist = useUpdatePlaylist(playlist._id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = () => {
    setShowDeleteAlert(false); // Close dialog first to show the fading effect
    const promise = deletePlaylist.mutateAsync(playlist._id);
    
    toast.promise(promise, {
      loading: 'Deleting playlist...',
      success: 'Playlist deleted successfully',
      error: (err) => err?.response?.data?.message || 'Failed to delete playlist',
    });
  };

  const handleTogglePublish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updatePlaylist.mutate({ isPublished: !playlist.isPublished });
  };

  // Determine thumbnail: Try playlist thumbnail -> first video thumbnail -> placeholder logic
  const rawThumbnail = playlist.playlistThumbnail || playlist.videos?.[0]?.thumbnail;
  const hasThumbnail = typeof rawThumbnail === 'string' && rawThumbnail.trim().length > 0;

  return (
    <>
      <Card 
        className={`group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-2 sm:p-3 ${deletePlaylist.isPending ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Link href={`/playlists/${playlist._id}`} className="block">
          {/* Thumbnail Section */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2 ring-1 ring-black/5 dark:ring-white/5">
            {hasThumbnail ? (
              <Image
                src={rawThumbnail}
                alt={playlist.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized={true}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800">
                <PlaySquare className="h-12 w-12 text-gray-400 dark:text-gray-600" />
              </div>
            )}

            {/* Published Status Badge - Show if Private OR if Owner (to see Public status) */}
            {(!playlist.isPublished || isOwner) && (
              <div className="absolute top-2 left-2">
                <Badge
                  variant={playlist.isPublished ? 'default' : 'secondary'}
                  className={
                    playlist.isPublished
                      ? 'bg-green-500/90 hover:bg-green-600 text-xs py-0 h-5'
                      : 'bg-gray-500/90 hover:bg-gray-600 text-xs py-0 h-5'
                  }
                >
                  {playlist.isPublished ? 'Public' : 'Private'}
                </Badge>
              </div>
            )}

            {/* Video Count Overlay */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center shadow-sm">
              <ListVideo className="h-3 w-3 mr-1" />
              {playlist.totalVideos} videos
            </div>

            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-200" />
          </div>
        </Link>

        {/* Content Section */}
        <div className="flex justify-between items-start gap-2">
          <Link href={`/playlists/${playlist._id}`} className="flex-1 min-w-0 block">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {playlist.name}
                </h3>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">Updated {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </Link>

          {/* Actions (Only for owner) */}
          {isOwner && (
            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 dark:bg-gray-900 dark:border-gray-800">
                  <DropdownMenuItem onClick={handleTogglePublish}>
                    {playlist.isPublished ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        <span>Private</span>
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Public</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteAlert(true)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </Card>
      
      {/* Edit Modal */}
      <EditPlaylistModal 
        playlist={playlist} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playlist? This cannot be undone.
              (Videos inside will not be deleted)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
