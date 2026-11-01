# SnapTok – Modern TikTok Video Downloader

SnapTok is a high-performance, minimalist web application for downloading TikTok videos, audio tracks, and photo carousels without watermarks.

## Key Features

- **No Watermarks**: Automatically removes TikTok logo animations and overlays.
- **HD Quality**: Retrieves 1080p and 720p high-definition streams when available.
- **Audio Extraction**: Converts and saves TikTok background sounds directly to MP3.
- **Photo Slideshows**: Displays and downloads multi-image carousels in original resolution.
- **Bulk Queue Processing**: Paste multiple TikTok URLs and batch-download them without interruption.
- **Clipboard Detection**: Discreetly detects copied TikTok URLs and offers one-click pasting.
- **Dedicated Download Manager**: Tracks downloaded videos with offline re-download capability.
- **Dark & Light Mode**: Seamless dual-theme support with persistent settings.
- **High Security & SSRF Protection**: Strict hostname whitelisting and direct streaming proxy with mirror fallback.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, Axios
- **API Engine**: TikWM API integration with mirror failover
- **Build Tool**: Vite, TSX

## Project Structure

```
├── server.ts               # Express application mounting Vite dev middleware
├── server/
│   ├── routes/             # API routes (/tiktok/info, /tiktok/batch-info, /download)
│   ├── services/           # TikWM integration and media stream failover
│   ├── utils/              # URL validation, SSRF checks, rate limiter
│   └── types.ts            # Backend data types
├── src/
│   ├── components/         # Navbar, HeroInput, VideoResultCard, FAQ, etc.
│   ├── context/            # DownloadContext for history & queue management
│   ├── hooks/              # useTheme, useClipboardWatcher
│   ├── pages/              # HomePage, DownloadsPage, BulkPage, AboutPage
│   ├── services/           # Axios client
│   └── types/              # Frontend TypeScript definitions
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
npm install
```

### Development

Run the full-stack server (Express + Vite on port 3000):

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Security & Fair Use Disclaimer

SnapTok does not host or store any video or audio files. All content is streamed directly from official public content delivery networks. For personal and educational fair use only.
