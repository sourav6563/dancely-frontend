import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Globe, Lock, AlertTriangle } from "lucide-react";
import {
  useUpdateVideoDetails,
  useUpdateVideoThumbnail,
  useTogglePublishStatus,
  useDeleteVideo,
} from "@/lib/hooks/useVideos";
import { VideoWithStats, MyVideo } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditVideoModalProps {
  video: VideoWithStats | MyVideo;
  isOpen: boolean;
  onClose: () => void;
}

  const updateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  isPublished: z.boolean(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export function EditVideoModal({ video, isOpen, onClose }: EditVideoModalProps) {
  const router = useRouter();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(video.thumbnail.url);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateDetails = useUpdateVideoDetails();
  const updateThumbnail = useUpdateVideoThumbnail();
  const togglePublish = useTogglePublishStatus();
  const deleteVideo = useDeleteVideo();

  // Get max image size from ENV (default 5MB)
  const MAX_IMAGE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB) || 5;

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: video.title,
      description: video.description,
      isPublished: video.isPublished,
    },
  });

  const { reset, formState: { isDirty } } = form;

  // Reset form when video data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: video.title,
        description: video.description,
        isPublished: video.isPublished,
      });
      // eslint-disable-next-line
      setThumbnailPreview(video.thumbnail.url);
      setThumbnailFile(null);
      setIsDeleting(false);
    }
  }, [isOpen, video, reset]);

  const onDetailsSubmit = async (data: UpdateFormValues) => {
    // Ensure description is always a string (empty string if not provided)
    const submitData = {
      title: data.title,
      description: data.description || "",
    };
    
    // Track what we need to wait for
    const promises: Promise<unknown>[] = [updateDetails.mutateAsync({ videoId: video._id, data: submitData })];
    if (thumbnailFile) {
      promises.push(updateThumbnail.mutateAsync({ videoId: video._id, thumbnail: thumbnailFile }));
    }

    // Check if publish status changed
    if (data.isPublished !== video.isPublished) {
      promises.push(togglePublish.mutateAsync(video._id));
    }

    // Execute all properties
    const results = await Promise.allSettled(promises);

    const failedResults = results.filter(r => r.status === 'rejected');

    if (failedResults.length === 0) {
      // Success case
      toast.success("Video updated successfully");
      onClose();
    } else {
      // Failure Reporting
      // Just start showing the first error message
      const firstFailure = failedResults[0] as PromiseRejectedResult;
      const msg = firstFailure.reason?.response?.data?.message || "Failed to update video";
      toast.error(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleDelete = () => {
    // We can keep the prompt open or close it. 
    // Since it redirects, maybe keeping loading state is fine. 
    // BUT to match the requested pattern: "Processing... then Delete"
    
    // If we use toast.promise:
    const promise = deleteVideo.mutateAsync(video._id);
    
    toast.promise(promise, {
      loading: 'Deleting video...',
      success: 'Video deleted successfully',
      error: (err) => err?.response?.data?.message || 'Failed to delete video',
    });
    
    // We should probably wait for it to finish before redirecting?
    // The previous implementation had onSuccess router.push.
    // The onSuccess in the hook is gone now. We need to handle it here.
    
    promise.then(() => {
       router.push("/"); // Redirect after successful deletion
    });
  };

  const isProcessing = updateDetails.isPending || updateThumbnail.isPending || togglePublish.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>Edit Video Details</DialogTitle>
          <DialogDescription>
            Make changes to your video content, visibility, or delete it permanently.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onDetailsSubmit)} className="space-y-6">
          {/* Thumbnail Section */}
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex gap-4 items-start">
              <div className="relative aspect-video w-40 rounded-md overflow-hidden border bg-muted">
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upload a new thumbnail (JPG/PNG). Max size: {MAX_IMAGE_SIZE_MB}MB. Recommended: 1280x720.
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors">
                      <Upload className="h-4 w-4" />
                      Choose File
                    </div>
                  </Label>
                  <Input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {thumbnailFile && (
                    <span className="text-xs text-green-600 font-medium truncate max-w-37.5">
                      {thumbnailFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Title</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/100
                    </span>
                  </div>
                  <FormControl>
                    <Input placeholder="Video title" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description (Optional)</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/500
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Tell viewers about your video"
                      className="resize-none"
                      rows={5}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Visibility Section */}
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Visibility</Label>
                    {field.value ? (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {field.value
                      ? "Your video is visible to everyone."
                      : "Only you can see this video (Draft)."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={field.value ? "outline" : "default"}
                  size="sm"
                  onClick={() => field.onChange(!field.value)}
                >
                  {field.value ? "Unpublish" : "Publish"}
                </Button>
              </div>
            )}
          />

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            {!isDeleting ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Video
              </Button>
            ) : (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                <span className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Confirm deletion?
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteVideo.isPending}
                >
                  {deleteVideo.isPending ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleting(false)}
                >
                  Cancel
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing || (!isDirty && !thumbnailFile)}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
