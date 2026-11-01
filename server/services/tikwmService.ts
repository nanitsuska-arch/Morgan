import axios, { AxiosRequestConfig } from 'axios';
import { TikTokVideoData, TikTokDownloadOption } from '../types.js';
import { formatBytes } from '../utils/validator.js';

const TIKWM_PRIMARY = 'https://www.tikwm.com/api/';
const TIKWM_SECONDARY = 'https://tikwm.com/api/';
const REQUEST_TIMEOUT = 12000; // 12 seconds

interface TikWMApiResponse {
  code: number;
  msg: string;
  processed_time?: number;
  data?: {
    id: string;
    region?: string;
    title?: string;
    cover?: string;
    origin_cover?: string;
    duration?: number;
    play?: string;
    wmplay?: string;
    hdplay?: string;
    size?: number;
    wm_size?: number;
    hd_size?: number;
    music?: string;
    music_info?: {
      id?: string;
      title?: string;
      author?: string;
      original?: boolean;
      duration?: number;
      album?: string;
      play?: string;
    };
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    share_count?: number;
    download_count?: number;
    author?: {
      id?: string;
      unique_id?: string;
      nickname?: string;
      avatar?: string;
    };
    images?: string[];
    create_time?: number;
  };
}

/**
 * Normalizes a relative TikWM URL to an absolute URL
 */
function normalizeMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('/')) {
    return `https://www.tikwm.com${url}`;
  }
  return `https://www.tikwm.com/${url}`;
}

/**
 * Validates if a media URL responds with 200 or acceptable headers
 */
export async function verifyMediaUrlAlive(url: string, timeout = 5000): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await axios.head(url, {
      timeout,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://www.tiktok.com/',
      },
      validateStatus: (status) => (status >= 200 && status < 400) || status === 403, // Some CDNs return 403 to HEAD but 200 to GET range
    });
    return res.status >= 200 && res.status < 400;
  } catch (err: any) {
    // If HEAD fails, try a fast GET with 0-10 byte range
    try {
      const getRes = await axios.get(url, {
        timeout: 4000,
        headers: {
          Range: 'bytes=0-10',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Referer: 'https://www.tiktok.com/',
        },
        responseType: 'arraybuffer',
        validateStatus: (status) => status >= 200 && status < 400,
      });
      return getRes.status >= 200 && getRes.status < 400;
    } catch {
      return false;
    }
  }
}

/**
 * Fetches TikTok video data from TikWM with retry and mirror fallback
 */
export async function fetchTikTokData(tiktokUrl: string): Promise<TikTokVideoData> {
  const endpoints = [TIKWM_PRIMARY, TIKWM_SECONDARY];
  let lastError: Error | null = null;
  let rawData: TikWMApiResponse | null = null;

  for (const endpoint of endpoints) {
    // 1. Try GET query
    try {
      const getRes = await axios.get<TikWMApiResponse>(endpoint, {
        params: {
          url: tiktokUrl,
          hd: 1,
        },
        timeout: REQUEST_TIMEOUT,
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 SnapTok/1.0',
        },
      });

      if (getRes.data && getRes.data.code === 0 && getRes.data.data) {
        rawData = getRes.data;
        break;
      }
    } catch (err: any) {
      lastError = err;
    }

    // 2. Try POST with urlencoded form
    try {
      const params = new URLSearchParams();
      params.append('url', tiktokUrl);
      params.append('hd', '1');

      const postRes = await axios.post<TikWMApiResponse>(endpoint, params.toString(), {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 SnapTok/1.0',
        },
      });

      if (postRes.data && postRes.data.code === 0 && postRes.data.data) {
        rawData = postRes.data;
        break;
      } else if (postRes.data && postRes.data.code !== 0) {
        lastError = new Error(postRes.data.msg || 'TikTok video not found or private');
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!rawData || !rawData.data) {
    const message = lastError?.message || 'Unable to fetch video information from TikTok. The video may be deleted, private, or region-restricted.';
    throw new Error(message);
  }

  const item = rawData.data;

  // Build download options with fallback priority
  const downloads: TikTokDownloadOption[] = [];

  const hdPlay = normalizeMediaUrl(item.hdplay);
  const play = normalizeMediaUrl(item.play);
  const wmPlay = normalizeMediaUrl(item.wmplay);
  const musicPlay = normalizeMediaUrl(item.music || item.music_info?.play);

  // 1. HD No Watermark (Preferred if present)
  if (hdPlay) {
    downloads.push({
      type: 'video_hd',
      label: 'HD Without Watermark',
      quality: '1080p / 720p HD',
      format: 'mp4',
      url: hdPlay,
      sizeBytes: item.hd_size,
      sizeFormatted: formatBytes(item.hd_size),
      isPreferred: true,
    });
  }

  // 2. Standard No Watermark
  if (play) {
    downloads.push({
      type: 'video_nowatermark',
      label: 'Without Watermark (Fast)',
      quality: 'Standard Quality',
      format: 'mp4',
      url: play,
      sizeBytes: item.size,
      sizeFormatted: formatBytes(item.size),
      isPreferred: !hdPlay,
    });
  }

  // 3. Watermarked Video
  if (wmPlay) {
    downloads.push({
      type: 'video_watermark',
      label: 'With Watermark',
      quality: 'Original Watermark',
      format: 'mp4',
      url: wmPlay,
      sizeBytes: item.wm_size,
      sizeFormatted: formatBytes(item.wm_size),
      isPreferred: false,
    });
  }

  // 4. Audio MP3
  if (musicPlay) {
    downloads.push({
      type: 'audio',
      label: 'Download Audio (MP3)',
      quality: 'Original Sound',
      format: 'mp3',
      url: musicPlay,
      isPreferred: false,
    });
  }

  // 5. Images / Slideshow Photos
  const images = item.images && Array.isArray(item.images)
    ? item.images.map((img) => normalizeMediaUrl(img))
    : [];

  const videoData: TikTokVideoData = {
    id: item.id || String(Date.now()),
    url: tiktokUrl,
    title: item.title ? item.title.trim() : 'TikTok Video',
    cover: normalizeMediaUrl(item.cover || item.origin_cover),
    origin_cover: normalizeMediaUrl(item.origin_cover),
    duration: item.duration || 0,
    author: {
      id: item.author?.id || '',
      unique_id: item.author?.unique_id || 'tiktok_user',
      nickname: item.author?.nickname || 'TikTok Creator',
      avatar: normalizeMediaUrl(item.author?.avatar),
    },
    music: {
      id: item.music_info?.id,
      title: item.music_info?.title || 'Original Sound',
      author: item.music_info?.author || item.author?.nickname || 'TikTok Artist',
      play_url: musicPlay,
      duration: item.music_info?.duration,
    },
    stats: {
      views: item.play_count || 0,
      likes: item.digg_count || 0,
      comments: item.comment_count || 0,
      shares: item.share_count || 0,
      downloads: item.download_count || 0,
    },
    downloads,
    images: images.length > 0 ? images : undefined,
    created_at: item.create_time ? item.create_time * 1000 : undefined,
  };

  return videoData;
}
