import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export interface TopHeaderProps {
  currentLang: string;
  onSelectLang: (lang: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  unreadNotificationsCount?: number;
}

const LANGUAGES = [
  { code: 'AR', label: 'العربية', flag: '🇲🇦', dir: 'rtl' },
  { code: 'FR', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'EN', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ES', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentLang,
  onSelectLang,
  isDark,
  onToggleTheme,
  onLogout,
  unreadNotificationsCount = 3,
}) => {
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  const isAr = currentLang === 'AR';

  return (
    <header className="h-20 px-6 bg-bg-card border-b border-gray-200 dark:border-slate-800/80 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder={
            isAr
              ? 'بحث عام عن السائقين، الرحلات، أو الوثائق...'
              : 'Search drivers, rides, verification documents...'
          }
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
        />
      </div>

      {/* Action Utilities Controls */}
      <div className="flex items-center gap-3">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangDropdown(!showLangDropdown);
              setShowNotifDropdown(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-sm font-bold transition-colors border border-transparent dark:border-slate-800"
          >
            <span className="text-base">{activeLangObj.flag}</span>
            <span>{activeLangObj.code}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onSelectLang(l.code);
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors ${
                    l.code === currentLang ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </div>
                  {l.code === currentLang && <CheckCircle2 size={14} className="text-purple-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300 transition-colors border border-transparent dark:border-slate-800"
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowLangDropdown(false);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300 transition-colors relative border border-transparent dark:border-slate-800"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-purple-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <span className="font-bold text-sm">Notifications</span>
                <span className="text-xs font-bold text-purple-500 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                  {unreadNotificationsCount} New
                </span>
              </div>
              <div className="py-2 space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                  <UserCheck size={16} className="text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-200">New Driver Pending Approval</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">Mohammed Amine uploaded 3 documents.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <ShieldAlert size={16} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-200">Risk Anomaly Flagged</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">High speed location anomaly detected.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 mx-1" />

        {/* Admin User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowLangDropdown(false);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center shadow-md shadow-purple-600/20">
              A
            </div>
            <div className="flex flex-col text-start hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                Super Admin
              </span>
              <span className="text-[10px] font-semibold text-purple-500">Root Access</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200">Logged in as</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">admin@yalla-vtc.ma</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
