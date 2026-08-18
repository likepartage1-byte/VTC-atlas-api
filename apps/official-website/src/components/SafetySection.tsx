import React from 'react';
import { Shield, BadgeCheck, Star, Map, Headphones, Share2 } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface SafetySectionProps {
  lang: SupportedLang;
}

export const SafetySection: React.FC<SafetySectionProps> = ({ lang }) => {
  const t = Translations[lang].safety;
  const isAr = lang === 'AR';

  const safetyItems = [
    {
      icon: <Shield size={24} className="text-purple-400" />,
      title: t.otpTitle,
      desc: t.otpDesc,
      highlight: true,
    },
    {
      icon: <BadgeCheck size={24} className="text-indigo-400" />,
      title: t.verificationTitle,
      desc: t.verificationDesc,
      highlight: false,
    },
    {
      icon: <Star size={24} className="text-amber-400" />,
      title: t.ratingTitle,
      desc: t.ratingDesc,
      highlight: false,
    },
    {
      icon: <Map size={24} className="text-blue-400" />,
      title: t.trackingTitle,
      desc: t.trackingDesc,
      highlight: false,
    },
    {
      icon: <Headphones size={24} className="text-emerald-400" />,
      title: t.supportTitle,
      desc: t.supportDesc,
      highlight: false,
    },
    {
      icon: <Share2 size={24} className="text-pink-400" />,
      title: t.sharedTitle,
      desc: t.sharedDesc,
      highlight: false,
    },
  ];

  const titleLines = t.title.split('\n');

  return (
    <section id="safety" className="py-24 relative bg-slate-950/50 border-y border-slate-900/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(139,92,246,0.08),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16`}>
          <span className="inline-block text-purple-400 text-xs font-black uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 mb-4">
            {t.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
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
          <p className="text-slate-400 font-medium leading-relaxed">{t.subtitle}</p>
        </div>

        {/* OTP Hero Card */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-purple-950/60 to-indigo-950/60 border border-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(139,92,246,0.15),transparent_60%)]" />
          <div className={`relative flex flex-col lg:flex-row items-center gap-8 ${isAr ? 'lg:flex-row-reverse' : ''}`}>
            {/* OTP Visual */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />
                <div className="relative w-36 h-36 rounded-3xl bg-slate-900/80 border-2 border-purple-500/30 flex flex-col items-center justify-center gap-2 shadow-2xl">
                  <Shield size={32} className="text-purple-400" />
                  <div className="flex gap-2">
                    {['4', '8', '2', '1'].map((d, i) => (
                      <div key={i} className="w-8 h-10 rounded-lg bg-purple-900/60 border border-purple-500/30 flex items-center justify-center">
                        <span className="text-xl font-black text-purple-300">{d}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">OTP</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-black text-white mb-3">{safetyItems[0].title}</h3>
              <p className="text-slate-300 font-medium leading-relaxed text-base">{safetyItems[0].desc}</p>
            </div>
          </div>
        </div>

        {/* Other safety items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {safetyItems.slice(1).map((item, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all hover:-translate-y-0.5 group ${isAr ? 'text-right' : 'text-left'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
