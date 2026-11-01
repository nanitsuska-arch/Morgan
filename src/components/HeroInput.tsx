import React, { useState } from 'react';
import { Search, Clipboard, X, ArrowRight, Sparkles } from 'lucide-react';

interface HeroInputProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (url: string) => void;
  isLoading: boolean;
  detectedClipboardUrl: string | null;
  onAcceptClipboard: () => void;
  onDismissClipboard: () => void;
  onPasteFromClipboard: () => void;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  setUrl,
  onSubmit,
  isLoading,
  detectedClipboardUrl,
  onAcceptClipboard,
  onDismissClipboard,
  onPasteFromClipboard,
}) => {
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setInputError('Please paste or enter a TikTok link first.');
      return;
    }

    if (!trimmed.includes('tiktok.com') && !trimmed.includes('douyin.com')) {
      setInputError('Please enter a valid TikTok video URL (e.g. https://www.tiktok.com/@user/video/...)');
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <section className="relative pt-8 pb-10 px-4 sm:px-6 max-w-2xl mx-auto text-center">
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[220px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
        Snap<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400">Tok</span>
      </h1>

      {/* Clipboard Toast Banner */}
      {detectedClipboardUrl && (
        <div className="mt-6 mb-2 inline-flex items-center gap-3 py-2 px-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl shadow-xs text-sm text-slate-800 dark:text-slate-200 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate max-w-xs sm:max-w-md">
            TikTok link copied: <strong className="font-mono text-xs">{detectedClipboardUrl.slice(0, 32)}...</strong>
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={onAcceptClipboard}
              className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              Paste & Fetch
            </button>
            <button
              onClick={onDismissClipboard}
              aria-label="Dismiss clipboard notification"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search / Input Box */}
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl mx-auto">
        <div className="relative flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white dark:bg-[#12121c] rounded-2xl border border-slate-300 dark:border-[#202032] shadow-sm focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <div className="flex items-center w-full px-3 gap-2">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Paste TikTok video link here..."
              className="w-full py-2.5 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm sm:text-base font-normal"
              disabled={isLoading}
            />

            {/* Clear Button */}
            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setInputError(null);
                }}
                aria-label="Clear input"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste Button */}
            <button
              type="button"
              onClick={onPasteFromClipboard}
              title="Paste from clipboard"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1928] dark:hover:bg-[#232338] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Download</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Input validation error */}
        {inputError && (
          <p className="mt-2.5 text-xs sm:text-sm text-rose-500 font-medium text-left px-2 animate-in fade-in">
            {inputError}
          </p>
        )}
      </form>
    </section>
  );
};
