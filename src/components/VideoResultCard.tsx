import React, { useState } from 'react';
import { TikTokVideoData, TikTokDownloadOption } from '../types';
import {
  Download,
  Film,
  Music,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useDownloadManager } from '../context/DownloadContext';

interface VideoResultCardProps {
  video: TikTokVideoData;
  onReset: () => void;
}

type SelectedFormat = 'mp4' | 'mp3';
type SelectedQuality = 'best' | '1080p' | '720p';
type DownloadState = 'idle' | 'preparing' | 'downloading' | 'completed' | 'failed';

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ video, onReset }) => {
  const { startDownload } = useDownloadManager();
  const [selectedFormat, setSelectedFormat] = useState<SelectedFormat>('mp4');
  const [selectedQuality, setSelectedQuality] = useState<SelectedQuality>('best');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check available streams
  const hdOption = video.downloads.find((d) => d.type === 'video_hd');
  const standardOption = video.downloads.find((d) => d.type === 'video_nowatermark');
  const audioOption = video.downloads.find((d) => d.type === 'audio');

  const has1080p = Boolean(hdOption);
  const is1080pUnavailable = selectedFormat === 'mp4' && selectedQuality === '1080p' && !has1080p;

  // Pick best preview video URL
  const previewSource =
    hdOption?.url ||
    standardOption?.url ||
    video.downloads.find((d) => d.type === 'video_watermark')?.url;

  const handleDownloadNow = async () => {
    // Prevent multiple requests
    if (downloadState === 'preparing' || downloadState === 'downloading') {
      return;
    }

    setErrorMessage(null);

    // If 1080p is unavailable, inform user
    if (is1080pUnavailable) {
      setErrorMessage(
        '1080p resolution is unavailable for this video. Please select "Best" or "720p" to download.'
      );
      return;
    }

    setDownloadState('preparing');
    setProgressPercent(0);

    try {
      let targetOption: TikTokDownloadOption | undefined;

      if (selectedFormat === 'mp3') {
        // MP3 Audio
        targetOption = audioOption || {
          type: 'audio',
          label: 'Audio (MP3)',
          quality: '192 kbps',
          format: 'mp3',
          url: hdOption?.url || standardOption?.url || video.url,
        };
      } else {
        // MP4 Video
        if (selectedQuality === '1080p') {
          targetOption = hdOption;
        } else if (selectedQuality === '720p') {
          targetOption = standardOption || hdOption || video.downloads[0];
        } else {
          // Best: pick highest available
          targetOption = hdOption || standardOption || video.downloads[0];
        }
      }

      if (!targetOption) {
        throw new Error('No valid download source found for this format.');
      }

      // Start download with live progress listener
      await startDownload(video, targetOption, (progress) => {
        setDownloadState('downloading');
        setProgressPercent(progress);
      });

      // Mark completed
      setDownloadState('completed');
      setTimeout(() => {
        setDownloadState('idle');
      }, 4000);
    } catch (err: any) {
      console.error('[SnapTok] Download error:', err);
      setDownloadState('failed');
      setErrorMessage(
        err?.message || 'Unable to download video file from server. Please try another option.'
      );
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Container matching dark purple-toned surface #12121c / #09090D */}
      <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-5 sm:p-6 shadow-2xl">
        {/* Reset button at top */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e1e2e]">
          <span className="text-xs font-medium text-slate-400">Ready to download</span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Video</span>
          </button>
        </div>

        {/* Video Preview Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-22 sm:w-20 sm:h-26 rounded-xl overflow-hidden bg-black shrink-0 border border-[#232338]">
            {isPlayingPreview && previewSource ? (
              <video
                src={previewSource}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <img
                  src={video.cover || video.origin_cover}
                  alt={video.title || 'TikTok thumbnail'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {previewSource && (
                  <button
                    onClick={() => setIsPlayingPreview(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors cursor-pointer group"
                    aria-label="Play video preview"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/90 flex items-center justify-center text-white shadow-md">
                      <Play className="w-4 h-4 ml-0.5 fill-white" />
                    </div>
                  </button>
                )}
                {video.duration > 0 && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] text-white font-mono rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white truncate">
              {video.author.nickname}
            </h3>
            <p className="text-xs text-blue-400 truncate mt-0.5">
              @{video.author.unique_id}
            </p>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {video.title || 'TikTok Video'}
            </p>
          </div>
        </div>

        {/* 1. Format Selection */}
        <div className="mb-5">
          <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide mb-2.5">
            Format
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* MP4 (Video) Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedFormat('mp4');
                setErrorMessage(null);
              }}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                selectedFormat === 'mp4'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25'
                  : 'bg-[#181826] text-slate-300 hover:text-white hover:bg-[#1f1e32] border border-[#232338]'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>MP4 (Video)</span>
            </button>

            {/* MP3 (Audio) Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedFormat('mp3');
                setErrorMessage(null);
              }}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                selectedFormat === 'mp3'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25'
                  : 'bg-[#181826] text-slate-300 hover:text-white hover:bg-[#1f1e32] border border-[#232338]'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>MP3 (Audio)</span>
            </button>
          </div>
        </div>

        {/* 2. Quality Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              Quality
            </h4>
            {selectedFormat === 'mp4' && (
              <span className="text-[11px] text-slate-400 font-mono">
                {has1080p ? '1080p HD available' : 'Max 720p Standard'}
              </span>
            )}
          </div>

          <div className="bg-[#181826] p-1 rounded-xl grid grid-cols-3 gap-1 border border-[#232338]">
            {/* Best */}
            <button
              type="button"
              onClick={() => {
                setSelectedQuality('best');
                setErrorMessage(null);
              }}
              className={`py-2 text-center text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                selectedQuality === 'best'
                  ? 'bg-[#0d0d16] text-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Best
            </button>

            {/* 1080p */}
            <button
              type="button"
              onClick={() => {
                setSelectedQuality('1080p');
                if (!has1080p) {
                  setErrorMessage(
                    '1080p is unavailable for this video (creator uploaded in 720p). Please select "Best" or "720p".'
                  );
                } else {
                  setErrorMessage(null);
                }
              }}
              disabled={selectedFormat === 'mp3'}
              className={`py-2 text-center text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer disabled:opacity-40 ${
                selectedQuality === '1080p'
                  ? 'bg-[#0d0d16] text-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1080p
            </button>

            {/* 720p */}
            <button
              type="button"
              onClick={() => {
                setSelectedQuality('720p');
                setErrorMessage(null);
              }}
              disabled={selectedFormat === 'mp3'}
              className={`py-2 text-center text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer disabled:opacity-40 ${
                selectedQuality === '720p'
                  ? 'bg-[#0d0d16] text-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              720p
            </button>
          </div>

          {/* Quality Notice if 1080p is not available */}
          {is1080pUnavailable && (
            <div className="mt-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2 flex items-center justify-between gap-2">
              <span>1080p is unavailable for this video.</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuality('best');
                  setErrorMessage(null);
                }}
                className="underline font-semibold cursor-pointer whitespace-nowrap"
              >
                Switch to Best (720p)
              </button>
            </div>
          )}
        </div>

        {/* 3. Download Button with live states */}
        <button
          type="button"
          onClick={handleDownloadNow}
          disabled={downloadState === 'preparing' || downloadState === 'downloading' || is1080pUnavailable}
          className={`w-full py-3.5 sm:py-4 font-bold text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            downloadState === 'completed'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : downloadState === 'failed'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-600/60 text-white shadow-blue-600/30'
          }`}
        >
          {downloadState === 'preparing' && (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Preparing download...</span>
            </>
          )}

          {downloadState === 'downloading' && (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                Downloading... {progressPercent > 0 ? `${progressPercent}%` : ''}
              </span>
            </>
          )}

          {downloadState === 'completed' && (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Download completed!</span>
            </>
          )}

          {downloadState === 'failed' && (
            <>
              <AlertCircle className="w-5 h-5 text-white" />
              <span>Download failed. Try again</span>
            </>
          )}

          {downloadState === 'idle' && (
            <>
              <Download className="w-5 h-5" />
              <span>Download Now</span>
            </>
          )}
        </button>

        {/* Download Progress Bar */}
        {downloadState === 'downloading' && (
          <div className="w-full bg-[#1e1e30] h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-blue-500 h-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-2 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Photo carousel option if present */}
        {video.images && video.images.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#1e1e2e]">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Slideshow Photos ({video.images.length})</span>
            </h5>
            <div className="grid grid-cols-4 gap-2">
              {video.images.slice(0, 4).map((imgUrl, idx) => (
                <a
                  key={idx}
                  href={`/api/download?url=${encodeURIComponent(imgUrl)}&filename=SnapTok_photo_${idx + 1}.jpg&format=jpg`}
                  className="aspect-square rounded-lg overflow-hidden border border-[#232338] bg-black block relative group"
                  title="Download photo"
                >
                  <img
                    src={imgUrl}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Download className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Completely removed purple SnapTok logo and "Snaptok" branding underneath the Download Now button */}
      </div>
    </div>
  );
};
