import React from 'react';
import { Car, Map, Handshake, Eye } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface ServicesSectionProps {
  lang: SupportedLang;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ lang }) => {
  const t = Translations[lang].services;
  const isAr = lang === 'AR';

  const confirmedServices = [
    {
      id: 'ride',
      icon: <Car size={24} />,
      title: t.rideTitle,
      desc: t.rideDesc,
      image: '/images/service_ride.png',
      color: 'from-purple-600 to-indigo-600',
      glow: 'shadow-purple-600/20',
      bg: 'bg-purple-600/10 border-purple-500/20',
      options: ['Standard', 'Comfort', 'Van'],
    },
    {
      id: 'intercity',
      icon: <Map size={24} />,
      title: t.intercityTitle,
      desc: t.intercityDesc,
      image: '/images/service_intercity.png',
      color: 'from-emerald-600 to-teal-600',
      glow: 'shadow-emerald-600/20',
      bg: 'bg-emerald-600/10 border-emerald-500/20',
      options: [isAr ? 'حجز مسبق' : 'Pre-booking', isAr ? 'سعر ثابت' : 'Fixed fare'],
    },
  ];

  const features = [
    {
      icon: <Handshake size={22} className="text-purple-400" />,
      title: t.negotiationTitle,
      desc: t.negotiationDesc,
    },
    {
      icon: <Eye size={22} className="text-emerald-400" />,
      title: t.nohiddenTitle,
      desc: t.nohiddenDesc,
    },
  ];

  const titleLines = t.title.split('\n');

  return (
    <section id="services" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        {/* Confirmed Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {confirmedServices.map((s) => (
            <div
              key={s.id}
              className={`relative rounded-3xl border overflow-hidden ${s.bg} transition-all hover:-translate-y-1 hover:shadow-xl ${s.glow}`}
            >
              {/* Visual Banner */}
              <div className="h-52 overflow-hidden relative">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  width="500"
                  height="260"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                  {s.icon}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                  {s.desc}
                </p>

                {/* Options tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {s.options.map((opt) => (
                    <span key={opt} className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-purple-300 text-xs font-bold">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className={`flex items-start gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
