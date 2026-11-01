import React from 'react';
import { Home, Download, Settings } from 'lucide-react';
import { ActiveTab } from '../types';
import { useDownloadManager } from '../context/DownloadContext';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { downloads } = useDownloadManager();
  const count = downloads.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090D]/95 backdrop-blur-md border-t border-[#1e1e2d] px-6 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Home */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-blue-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] sm:text-xs">Home</span>
        </button>

        {/* Downloads */}
        <button
          type="button"
          onClick={() => onTabChange('downloads')}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'downloads'
              ? 'text-blue-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Download className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-blue-600 text-white rounded-full text-[9px] font-mono leading-tight">
                {count}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs">Downloads</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-blue-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] sm:text-xs">Settings</span>
        </button>
      </div>
    </nav>
  );
};
