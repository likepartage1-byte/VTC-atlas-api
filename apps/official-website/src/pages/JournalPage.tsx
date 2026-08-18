import React, { useState } from 'react';
import { Clock, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { SupportedLang, Translations, JournalArticle } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface JournalPageProps {
  lang: SupportedLang;
}

const categoryColors: Record<JournalArticle['category'], string> = {
  passenger: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  driver: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  services: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  news: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export const JournalPage: React.FC<JournalPageProps> = ({ lang }) => {
  const t = Translations[lang].journal;
  const isAr = lang === 'AR';
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<JournalArticle['category'] | 'all'>('all');

  const breadcrumbs = [
    { name: isAr ? 'المجلة' : 'Journal', path: '/journal' },
  ];

  const filters = [
    { key: 'all' as const, label: t.allLabel },
    { key: 'passenger' as const, label: t.passengerLabel },
    { key: 'driver' as const, label: t.driverLabel },
    { key: 'services' as const, label: t.servicesLabel },
    { key: 'news' as const, label: t.newsLabel },
  ];

  const filteredArticles = activeFilter === 'all'
    ? t.articles
    : t.articles.filter((a) => a.category === activeFilter);

  const getCategoryLabel = (cat: JournalArticle['category']) => {
    const map: Record<JournalArticle['category'], string> = {
      passenger: t.passengerLabel,
      driver: t.driverLabel,
      services: t.servicesLabel,
      news: t.newsLabel,
    };
    return map[cat];
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={isAr ? 'المجلة الرسمية — Yalla VTC Journal' : 'Official Journal — Yalla VTC'}
        description={t.subtitle}
        canonicalPath="/journal"
        ogType="website"
        breadcrumbs={breadcrumbs}
      />

      {/* Hero */}
      <section className="py-16 relative border-b border-slate-900/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Breadcrumbs items={breadcrumbs} lang={lang} />
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black mb-6">
              <BookOpen size={14} />
              {t.badge}
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              {t.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {i === 0 ? line : (
                    <><br /><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{line}</span></>
                  )}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Filters & Articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter tabs */}
          <div className={`flex flex-wrap gap-2 mb-10 ${isAr ? 'justify-end' : 'justify-start'}`}>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeFilter === f.key
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Articles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <button
                key={article.slug}
                type="button"
                onClick={() => navigate(`/journal/${article.slug}`)}
                className={`group text-${isAr ? 'right' : 'left'} p-6 rounded-2xl bg-slate-900/70 border border-slate-800/60 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-200`}
              >
                {/* Category */}
                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 ${categoryColors[article.category]}`}>
                  {getCategoryLabel(article.category)}
                </span>

                <h2 className="text-base font-black text-white leading-snug mb-3 group-hover:text-amber-300 transition-colors">
                  {article.title}
                </h2>

                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className={`flex items-center justify-between text-[10px] text-slate-600 font-semibold pt-4 border-t border-slate-800/60`}>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} />
                    <span>{article.readingTime} {t.readingTime}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-amber-400 font-bold group-hover:gap-2 transition-all`}>
                    <span>{t.readMore}</span>
                    {isAr ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
