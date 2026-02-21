import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dancely.in'), // Replace with your actual domain if different
  title: {
    default: "Dancely - Share Your Dance Moves",
    template: "%s | Dancely",
  },
  description: "Upload, share, and discover amazing dance videos from dancers around the world. Join the community and showcase your talent.",
  keywords: [
    "dance", 
    "video sharing", 
    "dancers", 
    "choreography", 
    "dance community", 
    "social media for dancers",
    "upload dance videos",
    "learn dance",
    "dance challenges",
    "hip hop dance",
    "contemporary dance",
    "ballet",
    "street dance"
  ],
  authors: [{ name: "Dancely Team" }],
  creator: "Dancely",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dancely.in",
    title: "Dancely - The Ultimate Dance Video Platform",
    description: "Discover the best dance talent, learn new moves, and share your passion with the world on Dancely. Join our community today.",
    siteName: "Dancely",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dancely - Share Your Dance Moves",
    description: "Join the world's most vibrant dance community. Upload and watch amazing dance videos from creators worldwide.",
    creator: "@dancely", 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors duration={2500} />
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        )}
      </body>
    </html>
  );
}
