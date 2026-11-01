import React, { useState } from 'react';
import { useDownloadManager } from '../context/DownloadContext';
import {
  Download,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Film,
  Music,
} from 'lucide-react';
import { triggerFileDownload, downloadMediaFile } from '../services/api';

interface DownloadsPageProps {
  onGoHome: () => void;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({ onGoHome }) => {
  const { downloads, removeDownload, clearAllDownloads } = useDownloadManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = downloads.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.authorName.toLowerCase().includes(q) ||
      item.authorUsername.toLowerCase().includes(q)
    );
  });

  const [redownloadingId, setRedownloadingId] = useState<string | null>(null);

  const handleCopyLink = (item: any) => {
    navigator.clipboard.writeText(item.originalUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRedownload = async (item: any) => {
    setRedownloadingId(item.id);
    const filename = `SnapTok_${item.authorUsername}_${item.type}.${item.format}`;
    try {
      await downloadMediaFile(item.downloadUrl, filename);
    } catch (e) {
      console.warn('Direct blob download failed, falling back to trigger link:', e);
      triggerFileDownload(item.downloadUrl, filename);
    } finally {
      setTimeout(() => setRedownloadingId(null), 1000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Download Manager
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View, re-download, or manage your recent video downloads saved in this browser.
          </p>
        </div>

        {downloads.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearAllDownloads}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      {downloads.length > 0 && (
        <div className="mt-6 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved videos by title or creator..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      )}

      {/* Downloads List */}
      <div className="mt-6">
        {downloads.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No downloads yet
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Videos and audio you download will appear here for easy access and re-downloading.
            </p>
            <button
              onClick={onGoHome}
              className="mt-5 px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Download a Video Now</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">
            No downloaded videos matched "{searchTerm}"
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {filtered.map((item) => {
              const isAudio = item.type === 'audio';

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                      {item.coverUrl ? (
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          {isAudio ? <Music className="w-6 h-6" /> : <Film className="w-6 h-6" />}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          @{item.authorUsername}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {formatDate(item.downloadedAt)}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate mt-0.5">
                        {item.title || 'TikTok Video'}
                      </h4>

                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300 uppercase">
                          {item.format}
                        </span>
                        {item.sizeFormatted && (
                          <>
                            <span>·</span>
                            <span className="font-mono tabular-nums">{item.sizeFormatted}</span>
                          </>
                        )}
                        <span>·</span>
                        {item.status === 'completed' && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        )}
                        {item.status === 'downloading' && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleRedownload(item)}
                      title="Re-download file"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Re-download</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(item)}
                      title="Copy original TikTok link"
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      title="Open on TikTok"
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => removeDownload(item.id)}
                      title="Remove from history"
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
