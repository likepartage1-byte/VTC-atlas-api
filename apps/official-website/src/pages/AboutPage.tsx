import React from 'react';
import { SupportedLang } from '../i18n/translations';
import { SEOHead } from '../components/SEOHead';
import { Sparkles, Shield, Compass, Zap, ArrowLeft, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  lang: SupportedLang;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang }) => {
  const isAr = lang === 'AR';

  const titles: Record<SupportedLang, string> = {
    AR: 'من نحن — Yalla VTC',
    FR: 'À propos — Yalla VTC',
    EN: 'About Us — Yalla VTC',
    ES: 'Sobre Nosotros — Yalla VTC',
  };

  const descriptions: Record<SupportedLang, string> = {
    AR: 'تعرف على Yalla VTC — المنصة الموحدة للتنقل الذكي والعادل بين الركاب والسائقين.',
    FR: 'Découvrez Yalla VTC — La plateforme unifiée de mobilité intelligente et équitable.',
    EN: 'Learn about Yalla VTC — The unified smart mobility platform built for fair, transparent rides.',
    ES: 'Conozca Yalla VTC — La plataforma unificada de movilidad inteligente.',
  };

  const principles = [
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: isAr ? 'البساطة والسرعة' : 'Simplicity & Speed',
      desc: isAr ? 'تطبيق واحد يختصر تعقيدات التنقل ويمنحك الوصول المباشر للرحلات دون خطوات إضافية.' : 'One unified app that streamlines mobility without unnecessary friction or complex steps.',
    },
    {
      icon: <Compass className="w-6 h-6 text-emerald-400" />,
      title: isAr ? 'المرونة والعدالة' : 'Flexibility & Fairness',
      desc: isAr ? 'تفاوض مباشر حر بين الراكب والسائق للوصول لسعر عادل يرضي الطرفين تماماً.' : 'Direct price negotiation between passenger and driver for a fair rate that satisfies both.',
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: isAr ? 'الأمان والموثوقية' : 'Safety & Security',
      desc: isAr ? 'رمز OTP سري لكل رحلة، تتبع مباشر لحظي، وتدقيق كامل للبيانات لسلامتك أولاً.' : 'Unique secret OTP verification code for every ride, live GPS tracking, and safety verification.',
    },
  ];

  return (
    <main className="py-16 sm:py-24 relative overflow-hidden">
      <SEOHead
        title={titles[lang]}
        description={descriptions[lang]}
        canonicalPath="/about"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black">
            <Sparkles size={14} />
            <span>{isAr ? 'عن المنصة' : 'About Platform'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {isAr ? 'Yalla VTC' : 'Yalla VTC'}
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {isAr ? 'منصة تنقل مرنة وعادلة' : 'Unified Mobility Platform'}
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {isAr
              ? 'تأسست Yalla VTC لتكون الحل العصري للتنقل الرقمي. نجمع الراكب والسائق داخل تطبيق موحد يمنح الطرفين الحرية الكاملة في اختيار وتحديد سعر الرحلة بكل شفافية.'
              : 'Yalla VTC was created to be the modern answer to digital mobility. We connect riders and drivers in one single app giving both total freedom and transparency.'}
          </p>
        </div>

        {/* Product Visual */}
        <div className="my-12 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl relative">
          <img
            src="/images/about_product.png"
            alt="Yalla VTC Platform Visual"
            className="w-full h-auto object-cover max-h-[450px]"
            loading="eager"
            width="1000"
            height="450"
          />
        </div>

        {/* 3 Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          {principles.map((p, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="text-lg font-black text-white">{p.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'جاهز لتجربة تنقل أفضل؟' : 'Ready for a Better Mobility Experience?'}
          </h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto font-medium">
            {isAr
              ? 'حمّل تطبيق Yalla VTC الآن واكتشف سهولة طلب أو استقبال الرحلات بحرية كاملة.'
              : 'Download Yalla VTC today and discover how easy and flexible mobility can be.'}
          </p>

          <div className="flex justify-center gap-4 pt-2">
            <a
              href="/#download"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <span>{isAr ? 'حمّل التطبيق الآن' : 'Get the App'}</span>
              {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
