import React, { useState } from 'react';
import { useDownloadManager } from '../context/DownloadContext';
import { useTheme } from '../hooks/useTheme';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Trash2,
  ShieldCheck,
  Check,
  Smartphone,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { downloads, clearAllDownloads } = useDownloadManager();
  const { isDark, toggleTheme } = useTheme();
  const [clearedMessage, setClearedMessage] = useState(false);
  const [autoPaste, setAutoPaste] = useState(true);

  const handleClearHistory = () => {
    clearAllDownloads();
    setClearedMessage(true);
    setTimeout(() => setClearedMessage(false), 2500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-28">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#1e1e2d]">
        <SettingsIcon className="w-5 h-5 text-blue-500" />
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      <div className="space-y-5 text-sm">
        {/* Appearance Section */}
        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Appearance
          </h3>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-white font-medium">Dark Mode</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isDark ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Preferences
          </h3>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white font-medium">Auto-detect Clipboard</p>
                <p className="text-xs text-slate-500">Suggest copied TikTok links</p>
              </div>
            </div>
            <button
              onClick={() => setAutoPaste(!autoPaste)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                autoPaste ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Storage & History
          </h3>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-white font-medium">Saved Downloads</p>
              <p className="text-xs text-slate-500">{downloads.length} items recorded locally</p>
            </div>
            {downloads.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
          {clearedMessage && (
            <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>History cleared successfully.</span>
            </p>
          )}
        </div>

        {/* About Info */}
        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-2 text-white font-semibold">
            <Info className="w-4 h-4 text-blue-400" />
            <span>SnapTok Mobile Web v2.0</span>
          </div>
          <p className="leading-relaxed">
            High-speed, watermark-free TikTok media downloader. Designed with privacy, reliability, and simplicity in mind.
          </p>
        </div>
      </div>
    </div>
  );
};
