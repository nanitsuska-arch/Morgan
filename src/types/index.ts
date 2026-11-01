export interface TikTokAuthor {
  id: string;
  unique_id: string;
  nickname: string;
  avatar: string;
}

export interface TikTokMusic {
  id?: string;
  title?: string;
  author?: string;
  play_url?: string;
  duration?: number;
}

export interface TikTokDownloadOption {
  type: 'video_hd' | 'video_nowatermark' | 'video_watermark' | 'audio' | 'image';
  label: string;
  quality?: string;
  format: 'mp4' | 'mp3' | 'jpg' | 'webp';
  url: string;
  sizeBytes?: number;
  sizeFormatted?: string;
  isPreferred?: boolean;
}

export interface TikTokVideoData {
  id: string;
  url: string;
  title: string;
  cover: string;
  origin_cover?: string;
  duration: number;
  author: TikTokAuthor;
  music?: TikTokMusic;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    downloads: number;
  };
  downloads: TikTokDownloadOption[];
  images?: string[];
  created_at?: number;
}

export interface DownloadHistoryItem {
  id: string;
  videoId: string;
  title: string;
  authorName: string;
  authorUsername: string;
  coverUrl: string;
  downloadUrl: string;
  type: 'video_hd' | 'video_nowatermark' | 'video_watermark' | 'audio' | 'image';
  format: string;
  sizeFormatted?: string;
  downloadedAt: number;
  status: 'completed' | 'downloading' | 'failed';
  originalUrl: string;
}

export interface BulkQueueItem {
  id: string;
  url: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  data?: TikTokVideoData;
  error?: string;
  downloadProgress?: number;
}

export type ActiveTab = 'home' | 'downloads' | 'settings' | 'about' | 'bulk';
