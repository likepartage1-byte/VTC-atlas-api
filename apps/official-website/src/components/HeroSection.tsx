import React from 'react';
import { Smartphone, Car, ArrowLeft, ArrowRight } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface HeroSectionProps {
  lang: SupportedLang;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang }) => {
  const t = Translations[lang].hero;
  const isAr = lang === 'AR';

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

      {/* Full-Coverage Overlay for centered text legibility */}
      <div className="absolute inset-0 z-0 bg-slate-950/70 transition-colors duration-300" />

      {/* Subtle brand glow overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(104,62,230,0.15),transparent_70%)] pointer-events-none" />


      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.05] drop-shadow-sm mb-6">
            <span className="bg-gradient-to-r from-[#683EE6] via-indigo-500 to-purple-600 dark:from-purple-300 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              YALLA VTC
            </span>
            <br />
            <span className="text-white drop-shadow-lg">
              {isAr ? 'طريقة أذكى للتنقل.' : 'A Smarter Way to Get Around.'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 dark:text-white font-semibold leading-relaxed max-w-2xl mx-auto mb-10">
            {t.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
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
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-transparent hover:bg-white/10 border border-white/40 hover:border-white/70 text-white font-black text-sm backdrop-blur-sm transition-all hover:scale-105 hover:-translate-y-0.5"
            >
              <Car size={18} className="text-purple-400" />
              {t.exploreExperience}
            </a>
          </div>

      </div>
    </section>
  );
};
