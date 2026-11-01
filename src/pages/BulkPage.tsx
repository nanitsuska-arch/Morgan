import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trash2,
  ExternalLink,
  Film,
  Music,
} from 'lucide-react';
import { getVideoInfo } from '../services/api';
import { TikTokVideoData, TikTokDownloadOption } from '../types';
import { useDownloadManager } from '../context/DownloadContext';

interface QueueItem {
  id: string;
  url: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  data?: TikTokVideoData;
  error?: string;
}

const SAMPLE_BATCH = [
  'https://www.tiktok.com/@scout2015/video/6718335390845095173',
  'https://www.tiktok.com/@zachking/video/6768504823336815877',
];

export const BulkPage: React.FC = () => {
  const { startDownload } = useDownloadManager();
  const [inputText, setInputText] = useState('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Extract valid-looking URLs from textarea
  const extractedUrls = inputText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const handleLoadSamples = () => {
    setInputText(SAMPLE_BATCH.join('\n'));
  };

  const handleStartQueue = async () => {
    if (extractedUrls.length === 0) return;

    // Build initial queue
    const initialQueue: QueueItem[] = extractedUrls.map((url, i) => ({
      id: `${Date.now()}_${i}`,
      url,
      status: 'idle',
    }));

    setQueue(initialQueue);
    setIsProcessingQueue(true);

    // Process sequentially so we don't bombard TikWM with massive simultaneous requests
    const updated = [...initialQueue];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      // Mark as processing
      item.status = 'processing';
      setQueue([...updated]);

      try {
        const data = await getVideoInfo(item.url);
        item.status = 'success';
        item.data = data;
      } catch (err: any) {
        item.status = 'error';
        item.error = err?.message || 'Failed to retrieve video';
      }

      setQueue([...updated]);
      // Small pause between items for stability
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setIsProcessingQueue(false);
  };

  const handleRetryItem = async (itemId: string) => {
    const item = queue.find((q) => q.id === itemId);
    if (!item) return;

    item.status = 'processing';
    item.error = undefined;
    setQueue([...queue]);

    try {
      const data = await getVideoInfo(item.url);
      item.status = 'success';
      item.data = data;
    } catch (err: any) {
      item.status = 'error';
      item.error = err?.message || 'Retry failed';
    }

    setQueue([...queue]);
  };

  const handleDownloadAllSuccessful = async () => {
    const successfulItems = queue.filter((q) => q.status === 'success' && q.data);
    if (successfulItems.length === 0) return;

    setDownloadingAll(true);

    for (let i = 0; i < successfulItems.length; i++) {
      const { data } = successfulItems[i];
      if (!data) continue;

      const hdOption =
        data.downloads.find((d) => d.type === 'video_hd') ||
        data.downloads.find((d) => d.type === 'video_nowatermark') ||
        data.downloads[0];

      if (hdOption) {
        await startDownload(data, hdOption);
        // Stagger browser downloads by 900ms to allow browser download bar to trigger cleanly
        await new Promise((res) => setTimeout(res, 900));
      }
    }

    setDownloadingAll(false);
  };

  const completedCount = queue.filter((q) => q.status === 'success').length;
  const errorCount = queue.filter((q) => q.status === 'error').length;
  const processedCount = completedCount + errorCount;
  const totalCount = queue.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 min-h-[70vh]">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Bulk Video Downloader
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Paste multiple TikTok links (one per line) to process and download watermark-free videos in batch.
        </p>
      </div>

      {/* Input Section */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            TikTok Video URLs (One per line)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSamples}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
            >
              Load Sample URLs
            </button>
            {inputText && (
              <>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`https://www.tiktok.com/@user/video/...\nhttps://vt.tiktok.com/...\nhttps://www.tiktok.com/@creator/video/...`}
          className="w-full p-4 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 dark:focus:border-rose-500"
          disabled={isProcessingQueue}
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>Detected: </span>
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums">
              {extractedUrls.length}
            </strong>{' '}
            URLs (Max 25 at once)
          </div>

          <button
            onClick={handleStartQueue}
            disabled={isProcessingQueue || extractedUrls.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isProcessingQueue ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Queue...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Process {extractedUrls.length > 0 ? `(${extractedUrls.length}) Links` : 'Batch'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Queue Processing Status */}
      {queue.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Batch Progress
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {processedCount} of {totalCount} completed ({completedCount} successful, {errorCount} errors)
              </p>
            </div>

            {completedCount > 0 && (
              <button
                onClick={handleDownloadAllSuccessful}
                disabled={downloadingAll || isProcessingQueue}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {downloadingAll ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Triggering Downloads...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All ({completedCount}) HD Videos</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Track */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${(processedCount / totalCount) * 100}%` }}
            />
          </div>

          {/* Queue Items */}
          <div className="space-y-3">
            {queue.map((item, idx) => {
              const hdOption = item.data?.downloads.find((d) => d.type === 'video_hd');
              const audioOption = item.data?.downloads.find((d) => d.type === 'audio');

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-400 w-6 shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Thumbnail preview if fetched */}
                    {item.data ? (
                      <img
                        src={item.data.cover}
                        alt="Preview"
                        className="w-12 h-16 object-cover rounded-md bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      {item.data ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              @{item.data.author.unique_id}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              Ready
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.data.title || 'TikTok Video'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                            {item.url}
                          </p>
                          {item.status === 'processing' && (
                            <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Fetching video information...</span>
                            </p>
                          )}
                          {item.status === 'error' && (
                            <p className="text-xs text-rose-500 mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{item.error || 'Failed to fetch video'}</span>
                            </p>
                          )}
                          {item.status === 'idle' && (
                            <p className="text-xs text-slate-400 mt-0.5">In queue...</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.status === 'success' && item.data && (
                      <>
                        {hdOption && (
                          <button
                            onClick={() => startDownload(item.data!, hdOption)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download HD</span>
                          </button>
                        )}
                        {audioOption && (
                          <button
                            onClick={() => startDownload(item.data!, audioOption)}
                            title="Download Audio MP3"
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Music className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}

                    {item.status === 'error' && (
                      <button
                        onClick={() => handleRetryItem(item.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title="Open on TikTok"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
