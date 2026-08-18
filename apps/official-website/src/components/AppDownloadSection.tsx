import React from 'react';

import { SupportedLang, Translations } from '../i18n/translations';

interface AppDownloadSectionProps {
  lang: SupportedLang;
}

const AppStoreBadge: React.FC<{ store: 'google' | 'apple'; label: string; sublabel: string }> = ({ store, label, sublabel }) => (
  <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer group shadow-xl">
    {store === 'apple' ? (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white group-hover:scale-110 transition-transform">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="w-8 h-8 group-hover:scale-110 transition-transform">
        <path d="M3.18 23.76c.38.21.82.23 1.22.07L14.84 12 3.4.17C3 .01 2.56.03 2.18.24A1.5 1.5 0 001.5 1.5v21c0 .54.28 1.03.68 1.26z" fill="#4CAF50" />
        <path d="M20.5 10.5l-3.17-1.83L14.84 12l2.49 2.33 3.17-1.83a1.5 1.5 0 000-2z" fill="#FFD700" />
        <path d="M3.4.17l11.44 11.83 2.49-2.33L5.08.48A1.5 1.5 0 003.4.17z" fill="#F44336" />
        <path d="M3.4 23.83a1.5 1.5 0 001.68-.07l12.25-7.09-2.49-2.33L3.4 23.83z" fill="#00BCD4" />
      </svg>
    )}
    <div className="text-start">
      <p className="text-[10px] text-slate-400 font-medium">{sublabel}</p>
      <p className="text-base font-black text-white">{label}</p>
    </div>
  </div>
);

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({ lang }) => {
  const t = Translations[lang].appDownload;
  const isAr = lang === 'AR';

  const titleLines = t.title.split('\n');

  return (
    <section id="download" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/25 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.12),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Unified App Card */}
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            <span className="inline-block text-purple-400 text-xs font-black uppercase tracking-widest bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
              {t.badge}
            </span>

            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {titleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i === 0 ? line : (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        {line}
                      </span>
                    </>
                  )}
                </React.Fragment>
              ))}
            </h2>

            <p className="text-slate-300 font-semibold text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <AppStoreBadge store="apple" label={t.appStore} sublabel={isAr ? 'حمّل من' : 'Download on'} />
              <AppStoreBadge store="google" label={t.googlePlay} sublabel={isAr ? 'متاح على' : 'Get it on'} />
            </div>

            <p className="text-xs text-slate-400 font-medium pt-2">
              ✓ {t.oneAppSubtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
