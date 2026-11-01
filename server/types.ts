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
  duration: number; // in seconds
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
  images?: string[]; // If photo slideshow
  created_at?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  rateLimitRemaining?: number;
}
