import type { Metadata, ResolvingMetadata } from 'next';
import WatchVideoClient from './WatchVideoClient';

type Props = {
  params: Promise<{ videoId: string }>;
};

// Fetch video data for metadata
async function getVideo(videoId: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    try {
        const res = await fetch(`${apiUrl}/video/${videoId}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching video metadata:", error);
        return null;
    }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideo(videoId);

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: video.title,
    description: video.description || 'Watch this amazing dance video on Dancely!',
    openGraph: {
        title: video.title,
        description: video.description || 'Watch this amazing dance video on Dancely!',
        type: 'video.other',
        url: `https://dancely.in/watch/${video._id}`,
        images: [
            {
                url: video.thumbnail.url,
                width: 1280,
                height: 720,
            },
            ...previousImages,
        ],
        videos: [
            {
                url: video.videoFile.url,
                // securely linked if HTTPS
                secureUrl: video.videoFile.url.startsWith('https') ? video.videoFile.url : undefined,
                type: 'video/mp4', // Assuming MP4, or check extension
                width: 1280,
                height: 720,
            }
        ]
    },
    twitter: {
        card: "player",
        title: video.title,
        description: video.description,
        images: [video.thumbnail.url],
        players: [
            {
                playerUrl: `https://dancely.in/watch/${video._id}`,
                streamUrl: video.videoFile.url,
                width: 1280,
                height: 720
            }
        ]
    }
  };
}

export default function Page() {
  return <WatchVideoClient />;
}
