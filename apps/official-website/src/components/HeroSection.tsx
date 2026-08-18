import React from 'react';
import { Smartphone, Car, Shield, ArrowLeft, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface HeroSectionProps {
  lang: SupportedLang;
}

// Phone Mockup showing Yalla VTC Unified App UI
const PhoneMockup: React.FC<{ isAr: boolean }> = ({ isAr }) => (
  <div className="relative flex justify-center items-center">
    {/* Glow behind phone */}
    <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full scale-75" />

    {/* Real app UI mockup image */}
    <div className="relative max-w-[320px] sm:max-w-[360px] rounded-[36px] border-4 border-slate-800 shadow-2xl shadow-purple-900/40 overflow-hidden bg-slate-900">
      <img
        src="/images/hero_phone.png"
        alt="Yalla VTC App Mockup"
        className="w-full h-auto object-cover"
        loading="eager"
        width="360"
        height="720"
      />
    </div>

    {/* Floating badges */}
    <div className={`absolute top-8 ${isAr ? 'left-0 -translate-x-1/4' : 'right-0 translate-x-1/4'} bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 whitespace-nowrap z-10`}>
      {isAr ? '✓ تفاوض مباشر' : '✓ Direct Pricing'}
    </div>

    <div className={`absolute bottom-16 ${isAr ? 'right-0 translate-x-1/4' : 'left-0 -translate-x-1/4'} bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-purple-600/30 whitespace-nowrap z-10`}>
      🔒 OTP Protection
    </div>
  </div>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ lang }) => {
  const t = Translations[lang].hero;
  const isAr = lang === 'AR';

  const titleLines = t.title.split('\n');

  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.08),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${isAr ? 'lg:flex-row-reverse' : ''}`}>

          {/* Left: Text Content */}
          <div className={`space-y-8 text-center ${isAr ? 'lg:text-right' : 'lg:text-left'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black tracking-wide">
              <Sparkles size={14} />
              <span>{t.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
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
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 font-semibold leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t.subtitle}
            </p>

            <p className="text-sm text-slate-400 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              {t.subtext}
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap items-center justify-center gap-4 pt-2 ${isAr ? 'lg:justify-end' : 'lg:justify-start'}`}>
              <a
                href="#download"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-105 hover:-translate-y-0.5"
              >
                <Smartphone size={18} />
                {t.downloadApp}
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </a>

              <a
                href="#app-showcase"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-black text-sm transition-all hover:scale-105 hover:-translate-y-0.5"
              >
                <Car size={18} className="text-purple-400" />
                {t.exploreExperience}
              </a>
            </div>

            {/* Trust signals */}
            <div className={`pt-6 border-t border-slate-900/80 flex flex-wrap items-center justify-center gap-6 ${isAr ? 'lg:justify-end' : 'lg:justify-start'}`}>
              {[
                { icon: <Shield size={14} className="text-emerald-400" />, text: t.trustOtp },
                { icon: <Car size={14} className="text-purple-400" />, text: t.trustNoHidden },
                { icon: <MapPin size={14} className="text-indigo-400" />, text: t.trustLive },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: SVG Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup isAr={isAr} />
          </div>
        </div>
      </div>
    </section>
  );
};
