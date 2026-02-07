import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareVideoModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  className?: string;
}

export function ShareVideoModal({
  videoId,
  isOpen,
  onClose,
  videoTitle,
  className,
}: ShareVideoModalProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const shareUrl = mounted && typeof window !== 'undefined' 
    ? `${window.location.origin}/watch/${videoId}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      toast.success("Link copied to clipboard!");
      
      // Reset the checkmark after 2 seconds
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-md bg-white dark:bg-gray-900 dark:border-gray-800", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <Share2 className="h-5 w-5" />
            </div>
            <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
              Share Video
            </span>
          </DialogTitle>
          <DialogDescription>
            Share this video with your friends and community.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-6">
          {videoTitle && (
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm font-medium line-clamp-2 break-all">
              {videoTitle}
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="share-link" className="text-sm font-medium text-muted-foreground ml-1">
              Video Link
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="pr-4 h-11 font-mono text-sm bg-muted/40 border-border/50 transition-all"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              <Button
                size="icon"
                onClick={handleCopy}
                className={`h-11 w-11 shrink-0 rounded-lg transition-all duration-300 shadow-sm ${
                  hasCopied 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
                    : "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20"
                }`}
                variant={hasCopied ? "default" : "outline"}
              >
                {hasCopied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
