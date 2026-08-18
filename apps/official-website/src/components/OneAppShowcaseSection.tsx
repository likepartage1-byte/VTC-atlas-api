import React, { useState } from 'react';
import { Smartphone, Shield, MapPin, DollarSign, Car, Sparkles } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface OneAppShowcaseSectionProps {
  lang: SupportedLang;
}

export const OneAppShowcaseSection: React.FC<OneAppShowcaseSectionProps> = ({ lang }) => {
  const t = Translations[lang].oneApp;
  const isAr = lang === 'AR';
  const [activeMode, setActiveMode] = useState<'passenger' | 'driver'>('passenger');

  return (
    <section id="app-showcase" className="py-24 relative bg-slate-950/60 border-y border-slate-900/80 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.1),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black mb-4">
            <Sparkles size={14} />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            {t.title.split('\n').map((line, i) => (
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
          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Interactive Mode Switcher Tabs */}
        <div className="flex justify-center mb-16">
          <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveMode('passenger')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                activeMode === 'passenger'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{t.passengerTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('driver')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                activeMode === 'driver'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{t.driverTab}</span>
            </button>
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Phone UI Mockup based on Active Mode */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative">
              {/* Glow background */}
              <div className={`absolute inset-0 blur-[90px] rounded-full scale-75 transition-all duration-500 ${
                activeMode === 'passenger' ? 'bg-purple-600/25' : 'bg-emerald-600/25'
              }`} />

              {/* Shell */}
              <div className="relative w-[240px] sm:w-[280px] bg-slate-900 rounded-[38px] border-4 border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                {/* Phone Status */}
                <div className="flex justify-between items-center px-6 pt-3 pb-1 bg-slate-950">
                  <span className="text-[10px] font-bold text-slate-400">9:41</span>
                  <div className="w-20 h-4 bg-slate-800 rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>

                {/* App Navigation Bar inside App */}
                <div className={`px-4 py-3 flex items-center justify-between transition-colors ${
                  activeMode === 'passenger'
                    ? 'bg-gradient-to-r from-purple-800 to-indigo-800'
                    : 'bg-gradient-to-r from-emerald-800 to-teal-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <Car size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white leading-none">Yalla VTC</p>
                      <p className="text-[8px] text-purple-200 font-bold">
                        {activeMode === 'passenger' ? (isAr ? 'وضع الراكب' : 'Passenger Mode') : (isAr ? 'وضع السائق' : 'Driver Mode')}
                      </p>
                    </div>
                  </div>

                  {/* Inside App Role Indicator */}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
                    {activeMode === 'passenger' ? '👤' : '🚗'}
                  </span>
                </div>

                {/* Dynamic Content Preview */}
                {activeMode === 'passenger' ? (
                  <div className="p-3 bg-slate-950/90 space-y-2.5">
                    {/* Passenger Map preview */}
                    <div className="h-28 bg-slate-800/80 rounded-2xl relative overflow-hidden">
                      <svg className="w-full h-full opacity-70" viewBox="0 0 280 112">
                        <line x1="0" y1="56" x2="280" y2="56" stroke="#334155" strokeWidth="6" />
                        <line x1="140" y1="0" x2="140" y2="112" stroke="#334155" strokeWidth="6" />
                        <path d="M 60 70 Q 140 25 220 50" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeDasharray="6,3" />
                        <circle cx="60" cy="70" r="6" fill="#10b981" />
                        <circle cx="220" cy="50" r="6" fill="#8b5cf6" />
                      </svg>
                      <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2 py-1 rounded-lg flex items-center gap-1">
                        <MapPin size={10} className="text-emerald-400" />
                        <span className="text-[8px] font-black text-white">{isAr ? 'وسط المدينة' : 'Downtown'}</span>
                      </div>
                    </div>

                    {/* Propose fare card */}
                    <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-between">
                      <span className="text-[9px] font-black text-purple-300">{isAr ? 'عرضك المقترح:' : 'Your offer:'}</span>
                      <span className="text-xs font-black text-white">35</span>
                    </div>

                    {/* Driver offer */}
                    <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[9px] font-black">
                          ي
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white">{isAr ? 'يوسف م. (4.9★)' : 'Youssef M. (4.9★)'}</p>
                          <p className="text-[7px] text-slate-400">3 min arrival</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">35</span>
                    </div>

                    {/* OTP preview */}
                    <div className="py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-center">
                      <span className="text-[9px] font-black text-white">🔒 OTP: 4821</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/90 space-y-2.5">
                    {/* Driver Online Stats */}
                    <div className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-300">{isAr ? 'متصل — جاهز للعمل' : 'Online — Ready'}</span>
                      </div>
                      <span className="text-xs font-black text-white">245</span>
                    </div>

                    {/* New Ride Request Alert */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-amber-300">{isAr ? 'طلب رحلة قريب!' : 'Nearby Ride Request!'}</span>
                        <span className="text-[10px] font-black text-emerald-400">45</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1 py-1 rounded bg-emerald-600 text-center text-[8px] font-black text-white">
                          {isAr ? 'قبول' : 'Accept'}
                        </div>
                        <div className="flex-1 py-1 rounded bg-slate-800 text-center text-[8px] font-black text-slate-300">
                          {isAr ? 'عرض مضاد' : 'Counter'}
                        </div>
                      </div>
                    </div>

                    {/* Driver Stats */}
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="bg-slate-900 p-1.5 rounded-lg">
                        <p className="text-[9px] font-black text-white">12</p>
                        <p className="text-[7px] text-slate-500">{isAr ? 'رحلة' : 'Trips'}</p>
                      </div>
                      <div className="bg-slate-900 p-1.5 rounded-lg">
                        <p className="text-[9px] font-black text-amber-400">4.9★</p>
                        <p className="text-[7px] text-slate-500">{isAr ? 'تقييم' : 'Rating'}</p>
                      </div>
                      <div className="bg-slate-900 p-1.5 rounded-lg">
                        <p className="text-[9px] font-black text-emerald-400">100%</p>
                        <p className="text-[7px] text-slate-500">{isAr ? 'قبول' : 'Accept'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Home bar */}
                <div className="py-2 bg-slate-950 flex justify-center">
                  <div className="w-20 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content describing active mode */}
          <div className={`space-y-6 order-1 lg:order-2 ${isAr ? 'text-right' : 'text-left'}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${
              activeMode === 'passenger'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <span>{activeMode === 'passenger' ? t.passengerTab : t.driverTab}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {activeMode === 'passenger' ? t.passengerTitle : t.driverTitle}
            </h3>

            <p className="text-slate-400 text-base font-medium leading-relaxed">
              {activeMode === 'passenger' ? t.passengerDesc : t.driverDesc}
            </p>

            {/* Feature Cards */}
            <div className="space-y-3 pt-2">
              {[
                { title: t.feature1Title, desc: t.feature1Desc, icon: <Smartphone size={18} className="text-purple-400" /> },
                { title: t.feature2Title, desc: t.feature2Desc, icon: <DollarSign size={18} className="text-emerald-400" /> },
                { title: t.feature3Title, desc: t.feature3Desc, icon: <Shield size={18} className="text-indigo-400" /> },
              ].map((f, i) => (
                <div key={i} className={`flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white mb-0.5">{f.title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
