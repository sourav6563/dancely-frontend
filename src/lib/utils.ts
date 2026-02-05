import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatViews = (views: number = 0) => {
  if (views >= 1000000) {
    const val = views / 1000000;
    return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`;
  }
  if (views >= 1000) {
    const val = views / 1000;
    return val % 1 === 0 ? `${val}K` : `${val.toFixed(1)}K`;
  }
  return views.toString();
};

export const formatDuration = (seconds: number = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

import { getCldVideoUrl } from 'next-cloudinary';

export const getVideoPreviewUrl = (videoFile: { url: string; public_id?: string }) => {
  try {
    if (videoFile.public_id) {
      return getCldVideoUrl({
        src: videoFile.public_id,
        width: 500,
        quality: 'auto:eco',
        rawTransformations: ['vc_auto', 'ac_none']
      });
    }
  } catch (e) {
    console.error("Error generating preview URL:", e);
  }

  // Fallback to manual string replacement for legacy data or errors
  const url = videoFile.url;
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', '/upload/q_auto:eco,w_500,vc_auto,ac_none/');
};
