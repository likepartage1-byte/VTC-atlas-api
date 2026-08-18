import React from 'react';
import { Smartphone, Car, Shield, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface HeroSectionProps {
  lang: SupportedLang;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang }) => {
  const t = Translations[lang].hero;
  const isAr = lang === 'AR';

  const titleLines = t.title.split('\n');

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-20 pb-20 lg:pt-28 lg:pb-28 overflow-hidden">

      {/* Full Hero WebP Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/hero_banner_mobile.webp" type="image/webp" />
          <img
            src="/images/hero_banner_desktop.webp"
            alt="Yalla VTC Premium Experience in Marrakech"
            className="w-full h-full object-cover object-right sm:object-center"
            loading="eager"
            // @ts-ignore fetchpriority is valid HTML attribute
            fetchpriority="high"
            width="1440"
            height="810"
          />
        </picture>
      </div>

      {/* Adaptive Directional Overlay Layer for Text Legibility (RTL & LTR / Light & Dark) */}
      <div
        className={`absolute inset-0 z-0 transition-colors duration-300 ${
          isAr
            ? 'bg-gradient-to-l from-slate-950/98 via-slate-950/85 to-transparent html-light-overlay-rtl'
            : 'bg-gradient-to-r from-slate-950/98 via-slate-950/85 to-transparent html-light-overlay-ltr'
        }`}
      />

      {/* Subtle brand glow overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(104,62,230,0.18),transparent_70%)] pointer-events-none" />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`}>

          {/* Text Content Column */}
          <div className={`lg:col-span-7 xl:col-span-6 space-y-8 text-center ${isAr ? 'lg:text-right' : 'lg:text-left'}`}>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] drop-shadow-sm">
              {titleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i === 0 ? line : (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-[#683EE6] via-indigo-600 to-purple-700 dark:from-purple-400 dark:via-indigo-300 dark:to-purple-500 bg-clip-text text-transparent">
                        {line}
                      </span>
                    </>
                  )}
                </React.Fragment>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {t.subtext}
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap items-center justify-center gap-4 pt-2 ${isAr ? 'lg:justify-start' : 'lg:justify-start'}`}>
              <a
                href="#download"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105 hover:-translate-y-0.5"
              >
                <Smartphone size={18} />
                {t.downloadApp}
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </a>

              <a
                href="#app-showcase"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-900 dark:text-white font-black text-sm backdrop-blur-md transition-all hover:scale-105 hover:-translate-y-0.5"
              >
                <Car size={18} className="text-purple-400" />
                {t.exploreExperience}
              </a>
            </div>

            {/* Trust signals & Badges */}
            <div className={`pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-6 ${isAr ? 'lg:justify-start' : 'lg:justify-start'}`}>
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

            {/* Floating Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                {isAr ? '✓ تفاوض مباشر بين الراكب والسائق' : '✓ Direct Pricing'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#683EE6]/90 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-lg shadow-purple-600/20 backdrop-blur-sm">
                🔒 OTP Protection & Secure Ride
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
