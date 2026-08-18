import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SupportedLang, Translations } from '../i18n/translations';

interface FaqSectionProps {
  lang: SupportedLang;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const t = Translations[lang].faq;
  const isAr = lang === 'AR';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 },
    { q: t.q4, a: t.a4 },
    { q: t.q5, a: t.a5 },
  ];

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-purple-400 text-xs font-black uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 mb-4">
            {t.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {t.title}
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all ${
                openIndex === i
                  ? 'bg-slate-900/80 border-purple-500/30'
                  : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full flex items-center justify-between gap-4 px-6 py-4 text-${isAr ? 'right' : 'left'}`}
              >
                <span className="text-sm font-black text-white flex-1">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-48 pb-5' : 'max-h-0'}`}>
                <p className={`px-6 text-sm text-slate-400 font-medium leading-relaxed ${isAr ? 'text-right' : 'text-left'}`}>
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
