import axios from 'axios';
import { TikTokVideoData, TikTokDownloadOption } from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  results?: Array<{
    url: string;
    success: boolean;
    data?: TikTokVideoData;
    error?: string;
  }>;
}

/**
 * Fetch video information for a single TikTok URL
 */
export async function getVideoInfo(url: string): Promise<TikTokVideoData> {
  try {
    const res = await client.post<ApiResponse<TikTokVideoData>>('/tiktok/info', { url });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || 'Failed to fetch TikTok video details');
    }
    return res.data.data;
  } catch (err: any) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Network error occurred while fetching video details.');
  }
}

/**
 * Fetch batch video information for multiple TikTok URLs
 */
export async function getBatchInfo(urls: string[]) {
  try {
    const res = await client.post<ApiResponse<any>>('/tiktok/batch-info', { urls });
    if (!res.data.success || !res.data.results) {
      throw new Error(res.data.error || 'Failed to process batch URLs');
    }
    return res.data.results;
  } catch (err: any) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Network error occurred during batch request.');
  }
}

/**
 * Builds a direct streaming download URL through the backend proxy
 */
export function buildDownloadProxyUrl(
  option: TikTokDownloadOption,
  video: TikTokVideoData,
  fallbackOption?: TikTokDownloadOption
): string {
  const safeTitle = (video.author.unique_id + '_' + (video.title || 'video'))
    .slice(0, 40)
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  const filename = `SnapTok_${safeTitle}_${option.type}.${option.format}`;
  
  const params = new URLSearchParams({
    url: option.url,
    filename,
    format: option.format,
  });

  if (fallbackOption && fallbackOption.url && fallbackOption.url !== option.url) {
    params.set('fallbackUrl', fallbackOption.url);
  }

  // If format is mp3, tell backend to ensure genuine MP3 conversion
  if (option.format === 'mp3') {
    params.set('convertMp3', 'true');
  }

  return `/api/download?${params.toString()}`;
}

/**
 * Downloads media as a Blob via backend proxy, then triggers genuine browser file save
 */
export async function downloadMediaFile(
  downloadProxyUrl: string,
  filename: string,
  onProgress?: (progressPercent: number) => void
): Promise<void> {
  // 1. Fetch file as Blob from backend proxy with progress reporting
  const response = await axios.get(downloadProxyUrl, {
    responseType: 'blob',
    timeout: 90000, // 90 seconds timeout for large videos
    onDownloadProgress: (progressEvent) => {
      if (progressEvent.total && progressEvent.total > 0) {
        const percent = Math.min(
          99,
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
        if (onProgress) onProgress(percent);
      } else {
        // If total is not provided in Content-Length, estimate progress
        if (onProgress) onProgress(65);
      }
    },
  });

  const blob = response.data;
  if (!blob || blob.size === 0) {
    throw new Error('Received an empty file from the server.');
  }

  // Check if server returned an error JSON disguised as blob
  if (blob.type === 'application/json' || blob.type.includes('json')) {
    const text = await blob.text();
    try {
      const errJson = JSON.parse(text);
      throw new Error(errJson.error || 'Server error occurred during download');
    } catch (e: any) {
      throw new Error(e.message || 'Download failed on server');
    }
  }

  if (onProgress) onProgress(100);

  // 2. Create temporary Object URL
  const blobUrl = window.URL.createObjectURL(blob);

  // 3. Create temporary anchor and trigger download
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // 4. Clean up the temporary object URL after download initiated
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }, 3000);
}

/**
 * Triggers a file download using an anchor element (fallback)
 */
export function triggerFileDownload(downloadUrl: string, filename?: string) {
  const a = document.createElement('a');
  a.href = downloadUrl;
  if (filename) {
    a.download = filename;
  }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
