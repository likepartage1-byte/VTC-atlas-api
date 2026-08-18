import React from 'react';
import { DollarSign, Check, BadgeCheck, Car, Shield } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface DriverExperienceSectionProps {
  lang: SupportedLang;
}

export const DriverExperienceSection: React.FC<DriverExperienceSectionProps> = ({ lang }) => {
  const t = Translations[lang].driverExperience;
  const isAr = lang === 'AR';

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc, icon: <DollarSign size={20} className="text-emerald-400" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
    { title: t.feature2Title, desc: t.feature2Desc, icon: <Check size={20} className="text-purple-400" />, color: 'border-purple-500/20 bg-purple-500/5' },
    { title: t.feature3Title, desc: t.feature3Desc, icon: <BadgeCheck size={20} className="text-indigo-400" />, color: 'border-indigo-500/20 bg-indigo-500/5' },
    { title: t.feature4Title, desc: t.feature4Desc, icon: <Shield size={20} className="text-amber-400" />, color: 'border-amber-500/20 bg-amber-500/5' },
  ];

  return (
    <section id="driver-experience" className="py-20 relative bg-slate-950/40 border-y border-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>

          {/* Left: Driver Visual Showcase */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-white">{isAr ? 'رحلة السائق في التطبيق' : 'Driver Workflow'}</span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">Yalla VTC Driver</span>
              </div>

              {[
                { num: '01', title: isAr ? 'الاتصال واستقبال الطلبات' : 'Go Online & Receive Requests', desc: isAr ? 'تصفح طلبات الرحلات القريبة مع رؤية كاملة للمسافة والوجهة' : 'View nearby requests with full distance & destination upfront' },
                { num: '02', title: isAr ? 'القبول أو التقديم بعرض مضاد' : 'Accept or Counter Offer', desc: isAr ? 'قبول السعر المعروض فوراً أو اقتراح السعر المناسب لك' : 'Accept proposed fare instantly or propose your counter price' },
                { num: '03', title: isAr ? 'إدخال رمز OTP لبدء الرحلة' : 'Enter OTP to Start Ride', desc: isAr ? 'إدخال رمز التأكيد السري الخاص بالراكب لضمان الرحلة' : 'Verify rider secret OTP code for guaranteed start' },
                { num: '04', title: isAr ? 'إتمام الرحلة والربح السريع' : 'Complete Trip & Earn', desc: isAr ? 'إعادة التقييم وسحب الأرباح بسهولة وشفافية' : 'Rate rider & view instant updated payout' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">{s.num}</span>
                  <div>
                    <p className="text-xs font-black text-white">{s.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Text & Features */}
          <div className={`space-y-6 order-1 lg:order-2 ${isAr ? 'text-right' : 'text-left'}`}>
            <span className="inline-block text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              {t.badge}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
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
                  <h3 className="text-sm font-black text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <Car size={16} />
                <span>{isAr ? 'حمّل Yalla VTC وابدأ القيادة' : 'Download Yalla VTC & Start Driving'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
