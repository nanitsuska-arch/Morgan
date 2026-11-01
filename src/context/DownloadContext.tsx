import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DownloadHistoryItem, TikTokVideoData, TikTokDownloadOption } from '../types';
import { buildDownloadProxyUrl, downloadMediaFile } from '../services/api';

interface DownloadContextType {
  downloads: DownloadHistoryItem[];
  addDownload: (item: DownloadHistoryItem) => void;
  removeDownload: (id: string) => void;
  clearAllDownloads: () => void;
  startDownload: (
    video: TikTokVideoData,
    option: TikTokDownloadOption,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  downloadingCount: number;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

const STORAGE_KEY = 'snaptok_downloads_history';

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error('Failed to parse download history:', e);
      }
    }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(downloads));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable:', e);
    }
  }, [downloads]);

  const addDownload = useCallback((item: DownloadHistoryItem) => {
    setDownloads((prev) => [item, ...prev.filter((d) => d.id !== item.id)]);
  }, []);

  const removeDownload = useCallback((id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const clearAllDownloads = useCallback(() => {
    setDownloads([]);
  }, []);

  const startDownload = useCallback(
    async (
      video: TikTokVideoData,
      option: TikTokDownloadOption,
      onProgress?: (progress: number) => void
    ) => {
      const downloadId = `${video.id}_${option.type}_${Date.now()}`;
      
      // Determine fallback option if this is HD
      let fallbackOption: TikTokDownloadOption | undefined;
      if (option.type === 'video_hd') {
        fallbackOption = video.downloads.find((d) => d.type === 'video_nowatermark');
      }

      const proxyUrl = buildDownloadProxyUrl(option, video, fallbackOption);
      const safeTitle = (video.author.unique_id + '_' + (video.title || 'video'))
        .slice(0, 40)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `SnapTok_${safeTitle}_${option.type}.${option.format}`;

      const historyItem: DownloadHistoryItem = {
        id: downloadId,
        videoId: video.id,
        title: video.title || 'TikTok Video',
        authorName: video.author.nickname,
        authorUsername: video.author.unique_id,
        coverUrl: video.cover,
        downloadUrl: proxyUrl,
        type: option.type,
        format: option.format,
        sizeFormatted: option.sizeFormatted,
        downloadedAt: Date.now(),
        status: 'downloading',
        originalUrl: video.url,
      };

      // Add to list as downloading
      setDownloads((prev) => [historyItem, ...prev]);

      try {
        // Fetch binary data and trigger real browser download
        await downloadMediaFile(proxyUrl, filename, onProgress);

        // Mark as completed only after the file is successfully downloaded
        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, status: 'completed' } : d))
        );
      } catch (err: any) {
        console.error('[SnapTok] Download execution failed:', err);
        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, status: 'failed' } : d))
        );
        throw err;
      }
    },
    []
  );

  const downloadingCount = downloads.filter((d) => d.status === 'downloading').length;

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        addDownload,
        removeDownload,
        clearAllDownloads,
        startDownload,
        downloadingCount,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export function useDownloadManager() {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownloadManager must be used within a DownloadProvider');
  }
  return context;
}
