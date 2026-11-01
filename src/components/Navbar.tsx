import React from 'react';
import { ActiveTab } from '../types';
import { Sun, Moon, Download, Home, Info, Sparkles } from 'lucide-react';
import { useDownloadManager } from '../context/DownloadContext';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
}) => {
  const { downloads } = useDownloadManager();
  const completedCount = downloads.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element) */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-rose-500 to-amber-400 p-[1.5px] transition-transform duration-200 group-hover:scale-105">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            Snap<span className="text-rose-500">Tok</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single-line, unboxed, hover underline/state) */}
        <nav className="flex items-center gap-2 sm:gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onTabChange('home')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'home'
                ? 'text-slate-950 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 hidden sm:inline-block" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onTabChange('downloads')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'downloads'
                ? 'text-slate-950 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4 hidden sm:inline-block" />
            <span>Downloads</span>
            {completedCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono tabular-nums">
                {completedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('about')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'about'
                ? 'text-slate-950 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4 hidden sm:inline-block" />
            <span>About</span>
          </button>
        </nav>

        {/* Zone 3: Theme Toggle & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
