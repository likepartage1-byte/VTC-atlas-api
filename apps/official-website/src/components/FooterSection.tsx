import React from 'react';
import { Car } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';

interface FooterSectionProps {
  lang: SupportedLang;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ lang, onOpenLegal }) => {
  const t = Translations[lang].footer;
  const nav = Translations[lang].nav;
  const isAr = lang === 'AR';
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 border-t border-slate-900/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className={`space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-3 ${isAr ? 'justify-end' : 'justify-start'}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                <Car size={18} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                YALLA<span className="text-purple-500">VTC</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{t.tagline}</p>
            <p className="text-xs text-slate-600 font-medium">{t.madeWith}</p>
          </div>

          {/* Platform & App */}
          <div className={`space-y-3 ${isAr ? 'text-right' : 'text-left'}`}>
            <h4 className="text-sm font-black text-white">{isAr ? 'التطبيق والمنصة' : 'App & Platform'}</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">{nav.howItWorks}</a></li>
              <li><a href="#app-showcase" className="hover:text-purple-400 transition-colors">{nav.appShowcase}</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">{nav.services}</a></li>
              <li><a href="#safety" className="hover:text-purple-400 transition-colors">{nav.safety}</a></li>
            </ul>
          </div>

          {/* Pages & Journal */}
          <div className={`space-y-3 ${isAr ? 'text-right' : 'text-left'}`}>
            <h4 className="text-sm font-black text-white">{isAr ? 'الصفحات والمحتوى' : 'Pages & Content'}</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-purple-400 transition-colors text-start"
                >
                  {nav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-purple-400 transition-colors text-start"
                >
                  {nav.contact}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/journal')}
                  className="hover:text-purple-400 transition-colors text-start"
                >
                  {nav.journal}
                </button>
              </li>
              <li><a href="/#download" className="hover:text-purple-400 transition-colors">{nav.downloadApp}</a></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className={`space-y-3 ${isAr ? 'text-right' : 'text-left'}`}>
            <h4 className="text-sm font-black text-white">{t.legal}</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-purple-400 transition-colors text-start"
                >
                  {t.terms}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-purple-400 transition-colors text-start"
                >
                  {t.privacy}
                </button>
              </li>
              <li>
                <a href="mailto:support@yallavtc.com" className="hover:text-purple-400 transition-colors">
                  {t.support}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-medium">{t.rights}</p>
          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <span>Yalla VTC Unified Mobility Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
