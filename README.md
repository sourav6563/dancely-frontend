# Dancely Frontend Application

### The modern, dynamic user interface for the Dancely social video platform.

## Introduction

This document provides a comprehensive overview of the Dancely Frontend, a high-performance Single Page Application built with Next.js, React, and shadcn. It serves as the client-side interface for the Dancely platform, enabling users to discover dance videos, engage with the community, manage their profiles, and upload content. The application features a responsive design, robust state management, and a seamless user experience.

## Project Resources

| Resource | URL |
| --- | --- |
| Live Application | https://www.dancely.in |
| Documentation | https://docs.dancely.in |
| Backend Repository | https://github.com/sourav6563/dancely-backend |
| Frontend Repository | https://github.com/sourav6563/dancely-frontend |

## Demo Credentials
Use the following credentials to access the demo account:

**Email**
```
dancelydemo@gmail.com
```

**Password**
```
Dancely@3900
```

The frontend application provides a rich set of interactive features mapped available to specific routes:

| Feature Domain | Capabilities | Primary Route |
| --- | --- | --- |
| Video Discovery | Infinite scroll feed, recommended videos, trending content | `/` (Home) |
| Watch Experience | Dedicated video player, side-panel recommendations, comments, likes | `/watch?v={id}` |
| Content Creation | Video file upload, thumbnail selection, metadata editing | `/upload` |
| User Profile | Personal bio, avatar/cover management, video library, follower stats | `/profile/{username}` |
| Community | Text-based posts, community feed, threaded discussions | `/community` |
| Playlists | Create and manage custom video collections, "Watch Later" | `/playlists` |
| Dashboard | Creator analytics, content management table | `/dashboard` |
| Authentication | Sign up, login, password reset flow (via secure API) | `/(auth)/*` |
| Search | Global search for videos and users | `/search` |

## Technology Stack

| Category | Technology |
| --- | --- |
| Core Framework | **Framework:** Next.js 16 (App Router)<br>**Library:** React 19<br>**Language:** TypeScript |
| User Interface & Styling | **Styling Engine:** Tailwind CSS v4<br>**Component Library:** shadcn/ui (Built on Radix UI primitives)<br>**Icons:** Lucide React |
| State & Data Fetching | **Server State:** TanStack Query (React Query) v5<br>**HTTP Client:** Axios |
| Forms & Validation | **Form Management:** React Hook Form<br>**Schema Validation:** Zod |

## Application Architecture

The project follows the standard Next.js App Router structure with feature-based organization:

### Directory Structure

- `src/app`: Contains the application routes and layouts.
  - `(auth)`: Route group for authentication pages (login, register).
  - `dashboard`, `profile`, `watch`: Feature-specific route directories.
- `src/components`: Reusable UI components.
  - `ui`: Basic building blocks from shadcn/ui (Button, Dialog, Input, etc.).
  - `video`, `profile`, `community`: Feature-specific complex components.
- `src/context`: React Context providers (e.g., `AuthContext`).
- `src/lib`: Utility functions and configuration.
  - `utils.ts`: Helper functions (`cn`, class merger).
  - `axios.ts`: Configured API client.
- `src/hooks`: Custom React hooks.

### Key Systems Overview

The application is organized into several major subsystems:

#### 1. Authentication System
Manages user authentication with automatic token refresh. The `AuthContext` provides `user`, `isAuthenticated`, `login()`, `logout()`, and `register()` to all components. The `api` axios instance automatically refreshes expired tokens without user intervention.

Key Components:
- `AuthContext` provider
- Token refresh interceptor
- Login/Logout mutations

#### 2. Route Protection
Implements dual-layer security:
- **Server-side**: `proxy.ts` checks for `accessToken` cookie before rendering.
- **Client-side**: `ProtectedRoute` component verifies authentication after page load.

Routes are categorized as:
- **PUBLIC**: Landing page (`/`)
- **GUEST_ONLY**: Auth pages (`/login`, `/register`, etc.) - redirect authenticated users
- **PRIVATE**: All other routes - redirect unauthenticated users

#### 3. Video Management System
Provides complete video lifecycle management:
- **Watch**: Video playback with likes, comments, sharing.
- **Upload**: Video upload with progress tracking and thumbnail.
- **Dashboard**: Video list with statistics, edit, publish, delete.
- **Edit**: Modify video details, thumbnail, visibility.

#### 4. Playlist System
Organize videos into custom playlists:
- Create, edit, delete playlists
- Add/remove videos from playlists
- Playlist queue during video playback
- Public/private playlist visibility

#### 5. User Interface
Reusable components are built on shadcn/ui primitives using Tailwind CSS for styling.

#### 6. State Management
- **Strategy**: React Query + React Context
- **Server State**: React Query manages all API data with caching, refetching, and optimistic updates.
- **Auth State**: React Context provides global authentication state.
- **Form State**: react-hook-form with Zod validation.
- **UI State**: Local component state for modals, dialogs, loading indicators.

#### 7. SEO & Metadata
The application implements comprehensive SEO strategies:
- **Metadata**: Global configuration in `layout.tsx` for Title, Description, OpenGraph, and Twitter cards.
- **Sitemap**: Dynamic `sitemap.ts` generates a valid XML sitemap for search engine indexing.
- **Robots**: `robots.ts` directs crawlers to the sitemap and defines access rules.
- **Manifest**: `manifest.ts` provides PWA metadata (icons, theme colors) for installability.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (preferred package manager)

### Installation

Clone the repository:
```bash
git clone https://github.com/sourav6563/dancely-frontend.git
cd dancely-frontend
```

Install dependencies:
```bash
pnpm install
```

### Configure environment variables

Create a `.env.local` file in the root directory. You can start by copying the example:
```bash
cp .env.example .env.local
```

### Start Development Server

Build for production:
```bash
pnpm run build
pnpm run start
```

Start Development Server:
```bash
pnpm run dev
```

### Configuration

The application requires the following environment variables to be defined in `.env.local`:

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Check the backend API URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_MAX_VIDEO_SIZE_MB` | Max upload size limit for videos | `100` |
| `NEXT_PUBLIC_MAX_IMAGE_SIZE_MB` | Max upload size limit for images | `5` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name for optimization | `dancely-cloud` |
