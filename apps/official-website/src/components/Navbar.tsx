import React, { useState, useRef, useEffect } from 'react';
import { Car, Globe, ChevronDown, Check, Menu, X, Smartphone, Sun, Moon } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  lang: SupportedLang;
  onLanguageChange: (lang: SupportedLang) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
}) => {
  const t = Translations[lang].nav;
  const isAr = lang === 'AR';
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLang; label: string; flag: string }[] = [
    { code: 'AR', label: 'العربية', flag: '🇲🇦' },
    { code: 'FR', label: 'Français', flag: '🇫🇷' },
    { code: 'EN', label: 'English', flag: '🇬🇧' },
    { code: 'ES', label: 'Español', flag: '🇪🇸' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: t.howItWorks, href: '/#how-it-works' },
    { label: t.appShowcase, href: '/#app-showcase' },
    { label: t.services, href: '/#services' },
    { label: t.safety, href: '/#safety' },
    { label: t.journal, to: '/journal' },
    { label: t.about, to: '/about' },
    { label: t.contact, to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-900/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
              <Car size={18} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black text-white tracking-tight">
                YALLA<span className="text-purple-500">VTC</span>
              </span>
              <span className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase">
                {isAr ? 'تطبيق تنقل موحد' : 'Unified Mobility'}
              </span>
            </div>
          </Link>

          {/* Center Nav Links — Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.to ? (
                <button
                  key={link.label}
                  onClick={() => navigate(link.to!)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href!}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-purple-500/40 hover:text-purple-400 transition-all"
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition-all"
              >
                <Globe size={14} className="text-purple-400" />
                <span>{lang}</span>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className={`absolute top-full mt-2 w-40 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 space-y-0.5 ${isAr ? 'left-0' : 'right-0'}`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { onLanguageChange(l.code); setIsLangOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        lang === l.code
                          ? 'bg-purple-600/20 text-purple-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download App CTA */}
            <a
              href="/#download"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <Smartphone size={14} />
              <span>{t.downloadApp}</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-900 py-3 space-y-1">
            {navLinks.map((link) =>
              link.to ? (
                <button
                  key={link.label}
                  onClick={() => { navigate(link.to!); setIsMobileMenuOpen(false); }}
                  className="w-full text-start px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href!}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  {link.label}
                </a>
              )
            )}
            <div className="pt-2">
              <a
                href="/#download"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm"
              >
                <Smartphone size={16} />
                <span>{t.downloadApp}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
