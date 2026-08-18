import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export interface ControlCenterShellProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  currentLang: string;
  onSelectLang: (lang: string) => void;
}

export const ControlCenterShell: React.FC<ControlCenterShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onLogout,
  currentLang,
  onSelectLang,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isRTL = currentLang === 'AR';

  useEffect(() => {
    // Dynamic RTL/LTR document direction setting
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.toLowerCase();

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isRTL, currentLang, isDark]);

  return (
    <div className={`min-h-screen flex bg-bg-main text-text-main transition-colors ${isDark ? 'dark bg-[#080C14]' : 'bg-slate-50'}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isRTL={isRTL}
        lang={currentLang}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navigation Header */}
        <TopHeader
          currentLang={currentLang}
          onSelectLang={onSelectLang}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />

        {/* View Router Main Viewport Container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-8 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
};
