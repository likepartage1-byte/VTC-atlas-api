import React, { useState } from 'react';
import { MapPin, DollarSign, Users, Check, Map, Shield, Car } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface HowItWorksSectionProps {
  lang: SupportedLang;
}

const stepIcons = [
  <MapPin size={22} className="text-purple-400" />,
  <Car size={22} className="text-indigo-400" />,
  <DollarSign size={22} className="text-emerald-400" />,
  <Users size={22} className="text-amber-400" />,
  <Check size={22} className="text-emerald-400" />,
  <Map size={22} className="text-blue-400" />,
  <Shield size={22} className="text-purple-400" />,
];

const stepColors = [
  'from-purple-600/20 border-purple-500/30',
  'from-indigo-600/20 border-indigo-500/30',
  'from-emerald-600/20 border-emerald-500/30',
  'from-amber-600/20 border-amber-500/30',
  'from-emerald-600/20 border-emerald-500/30',
  'from-blue-600/20 border-blue-500/30',
  'from-purple-600/20 border-purple-500/30',
];

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ lang }) => {
  const t = Translations[lang].howItWorks;
  const isAr = lang === 'AR';
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: t.step1Title, desc: t.step1Desc },
    { title: t.step2Title, desc: t.step2Desc },
    { title: t.step3Title, desc: t.step3Desc },
    { title: t.step4Title, desc: t.step4Desc },
    { title: t.step5Title, desc: t.step5Desc },
    { title: t.step6Title, desc: t.step6Desc },
    { title: t.step7Title, desc: t.step7Desc },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-slate-950/50 border-y border-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`max-w-2xl mb-16 ${isAr ? 'text-right mr-0 ml-auto' : 'text-left'}`}>
          <span className="inline-block text-purple-400 text-xs font-black uppercase tracking-widest mb-4 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
            {t.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            {t.title}
          </h2>
          <p className="text-slate-400 text-base font-medium leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 lg:gap-2">
          {steps.map((step, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`relative group text-${isAr ? 'right' : 'left'} p-5 rounded-2xl border bg-gradient-to-b transition-all duration-200 cursor-pointer ${
                activeStep === index
                  ? `${stepColors[index]} shadow-lg scale-[1.02]`
                  : 'from-slate-900/60 border-slate-800/60 hover:border-slate-700 hover:scale-[1.01]'
              }`}
            >
              {/* Step number */}
              <div className={`text-[10px] font-black tracking-widest mb-3 ${
                activeStep === index ? 'text-purple-400' : 'text-slate-600'
              }`}>
                0{index + 1}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                activeStep === index ? 'bg-slate-800/60' : 'bg-slate-900/60'
              }`}>
                {stepIcons[index]}
              </div>

              {/* Title */}
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mb-2">
                {step.title}
              </h3>

              {/* Desc - only on active */}
              <div className={`overflow-hidden transition-all duration-300 ${
                activeStep === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Active step detail — mobile friendly */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 lg:hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              {stepIcons[activeStep]}
            </div>
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                {isAr ? 'الخطوة' : 'Step'} 0{activeStep + 1}
              </p>
              <h3 className="text-sm font-black text-white">{steps[activeStep].title}</h3>
            </div>
          </div>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {steps[activeStep].desc}
          </p>
        </div>
      </div>
    </section>
  );
};
