import React, { useState } from 'react';
import { HeroInput } from '../components/HeroInput';
import { VideoResultCard } from '../components/VideoResultCard';
import { TikTokVideoData } from '../types';
import { getVideoInfo } from '../services/api';
import { useClipboardWatcher } from '../hooks/useClipboardWatcher';
import { AlertCircle, X } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<TikTokVideoData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    detectedUrl,
    dismiss: dismissClipboard,
    accept: acceptClipboard,
    readClipboardDirectly,
  } = useClipboardWatcher();

  const handleFetchVideo = async (targetUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getVideoInfo(targetUrl);
      setVideoData(data);
      // Scroll smoothly to video preview card
      setTimeout(() => {
        window.scrollTo({ top: 320, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(
        err?.message ||
          'Unable to fetch this TikTok video. It might be private, deleted, or region-restricted. Please verify the URL and try again.'
      );
      setVideoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptClipboard = () => {
    const accepted = acceptClipboard();
    if (accepted) {
      setUrl(accepted);
      handleFetchVideo(accepted);
    }
  };

  const handlePasteFromClipboard = async () => {
    const text = await readClipboardDirectly();
    if (text) {
      setUrl(text);
      if (text.includes('tiktok.com') || text.includes('douyin.com')) {
        handleFetchVideo(text);
      }
    }
  };

  return (
    <div className="py-6 sm:py-12">
      {/* Hero and Search Input */}
      <HeroInput
        url={url}
        setUrl={setUrl}
        onSubmit={handleFetchVideo}
        isLoading={isLoading}
        detectedClipboardUrl={detectedUrl}
        onAcceptClipboard={handleAcceptClipboard}
        onDismissClipboard={dismissClipboard}
        onPasteFromClipboard={handlePasteFromClipboard}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto px-4 mb-10 animate-in fade-in">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <strong>Error:</strong> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Video Result Preview Card */}
      {videoData && (
        <VideoResultCard
          video={videoData}
          onReset={() => {
            setVideoData(null);
            setUrl('');
          }}
        />
      )}
    </div>
  );
};
