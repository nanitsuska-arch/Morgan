/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DownloadProvider } from './context/DownloadContext';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { DownloadsPage } from './pages/DownloadsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { ActiveTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <DownloadProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#09090D] text-slate-900 dark:text-slate-100 selection:bg-blue-600/25 selection:text-blue-400 transition-colors duration-200">
        {/* Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content Area with bottom padding for fixed bottom navigation */}
        <main className="flex-1 pb-24 sm:pb-28">
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'downloads' && (
            <DownloadsPage onGoHome={() => setActiveTab('home')} />
          )}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'about' && <AboutPage />}
        </main>

        {/* Bottom Navigation fixed to bottom */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </DownloadProvider>
  );
}
