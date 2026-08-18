import React from 'react';
import { DollarSign, Users, Map, Shield } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface PassengerExperienceSectionProps {
  lang: SupportedLang;
}

export const PassengerExperienceSection: React.FC<PassengerExperienceSectionProps> = ({ lang }) => {
  const t = Translations[lang].passengerExperience;
  const isAr = lang === 'AR';

  const features = [
    { icon: <DollarSign size={20} className="text-emerald-400" />, title: t.feature1Title, desc: t.feature1Desc, color: 'border-emerald-500/20 bg-emerald-500/5' },
    { icon: <Users size={20} className="text-amber-400" />, title: t.feature2Title, desc: t.feature2Desc, color: 'border-amber-500/20 bg-amber-500/5' },
    { icon: <Map size={20} className="text-blue-400" />, title: t.feature3Title, desc: t.feature3Desc, color: 'border-blue-500/20 bg-blue-500/5' },
    { icon: <Shield size={20} className="text-purple-400" />, title: t.feature4Title, desc: t.feature4Desc, color: 'border-purple-500/20 bg-purple-500/5' },
  ];

  return (
    <section id="passenger-experience" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>

          {/* Left: Text & Features */}
          <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
            <span className="inline-block text-purple-400 text-xs font-black uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
              {t.badge}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {t.title}
            </h2>

            <p className="text-slate-400 font-medium leading-relaxed">
              {t.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${f.color} transition-all hover:-translate-y-0.5`}>
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Passenger Visual Showcase */}
          <div className="flex justify-center">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-slate-900 dark:text-white">{isAr ? 'خطوات رحلة الراكب' : 'Passenger Ride Steps'}</span>
                <span className="text-[10px] font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10">Yalla VTC</span>
              </div>

              {[
                { num: '01', title: isAr ? 'تحديد الانطلاق والوجهة' : 'Set Pickup & Destination', desc: isAr ? 'اختيار النقطتين على الخريطة مباشرة' : 'Pin location & destination on live map' },
                { num: '02', title: isAr ? 'اقترح السعر' : 'Propose Your Fare', desc: isAr ? 'إدخال السعر بدون تسعير آلي مفروض' : 'Enter initial price without forced surge' },
                { num: '03', title: isAr ? 'مقارنة عروض السائقين' : 'Compare Driver Offers', desc: isAr ? 'اختيار السائق حسب السعر والتقييم' : 'Select driver based on rating & fare' },
                { num: '04', title: isAr ? 'إدخال رمز OTP والبدء' : 'Enter OTP & Enjoy Ride', desc: isAr ? 'تأكيد الرمز وبدء الرحلة بأمان' : 'Verify OTP code for guaranteed safety' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">{s.num}</span>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{s.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
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
