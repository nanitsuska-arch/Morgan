import React from 'react';
import { ActiveTab } from '../types';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white tracking-tight">
            Snap<span className="text-rose-500">Tok</span>
          </span>
          <span>— Fast TikTok Downloader</span>
        </div>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('home')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('downloads')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Downloads
          </button>
          <button
            onClick={() => onTabChange('about')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            About & Terms
          </button>
        </nav>

        <div>
          <p className="text-center md:text-right">
            SnapTok is not affiliated with ByteDance or TikTok. For personal use only.
          </p>
        </div>
      </div>
    </footer>
  );
};
