import React, { useState } from 'react';
import { Clock, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { SupportedLang, Translations, JournalArticle } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';

interface JournalSectionProps {
  lang: SupportedLang;
}

const categoryColors: Record<JournalArticle['category'], string> = {
  passenger: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  driver: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  services: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  news: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export const JournalSection: React.FC<JournalSectionProps> = ({ lang }) => {
  const t = Translations[lang].journal;
  const isAr = lang === 'AR';
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<JournalArticle['category'] | 'all'>('all');

  const filters = [
    { key: 'all' as const, label: t.allLabel },
    { key: 'passenger' as const, label: t.passengerLabel },
    { key: 'driver' as const, label: t.driverLabel },
    { key: 'services' as const, label: t.servicesLabel },
  ];

  const filteredArticles = (
    activeFilter === 'all'
      ? t.articles
      : t.articles.filter((a) => a.category === activeFilter)
  ).slice(0, 3); // Max 3 on homepage for clean lightweight feel

  const getCategoryLabel = (cat: JournalArticle['category']) => {
    const map: Record<JournalArticle['category'], string> = {
      passenger: t.passengerLabel,
      driver: t.driverLabel,
      services: t.servicesLabel,
      news: t.newsLabel,
    };
    return map[cat];
  };

  const titleLines = t.title.split('\n');
  const featuredArticle = filteredArticles[0];
  const sideArticles = filteredArticles.slice(1, 3);

  return (
    <section id="journal" className="py-24 relative border-y border-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
          <div className={`max-w-xl ${isAr ? 'text-right' : 'text-left'}`}>
            <span className="inline-block text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 mb-4">
              {t.badge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              {titleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i === 0 ? line : (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        {line}
                      </span>
                    </>
                  )}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">{t.subtitle}</p>
          </div>

          <button
            onClick={() => navigate('/journal')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex-shrink-0"
          >
            <BookOpen size={15} />
            <span>{isAr ? 'عرض جميع المقالات' : 'View all articles'}</span>
            {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>

        {/* Filter tabs */}
        <div className={`flex flex-wrap gap-2 mb-8 ${isAr ? 'justify-end' : 'justify-start'}`}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === f.key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Featured layout: 1 big featured article + 2 side articles */}
        {featuredArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Featured Article (spans 2 cols on lg) */}
            <button
              type="button"
              onClick={() => navigate(`/journal/${featuredArticle.slug}`)}
              className={`lg:col-span-2 group text-${isAr ? 'right' : 'left'} p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${categoryColors[featuredArticle.category]}`}>
                    {getCategoryLabel(featuredArticle.category)}
                  </span>
                  <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full">
                    ★ {isAr ? 'مقال مميز' : 'Featured'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug mb-4 group-hover:text-purple-300 transition-colors">
                  {featuredArticle.title}
                </h3>

                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock size={13} />
                  <span>{featuredArticle.readingTime} {t.readingTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-400 font-bold group-hover:gap-2.5 transition-all">
                  <span>{t.readMore}</span>
                  {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </div>
              </div>
            </button>

            {/* Side Articles (1 col) */}
            <div className="space-y-6">
              {sideArticles.map((article) => (
                <button
                  key={article.slug}
                  type="button"
                  onClick={() => navigate(`/journal/${article.slug}`)}
                  className={`w-full group text-${isAr ? 'right' : 'left'} p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 hover:shadow-xl transition-all duration-200 flex flex-col justify-between`}
                >
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-3 ${categoryColors[article.category]}`}>
                      {getCategoryLabel(article.category)}
                    </span>

                    <h4 className="text-base font-black text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors">
                      {article.title}
                    </h4>

                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-3 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {article.readingTime} {t.readingTime}
                    </span>
                    <span className="text-purple-400 font-bold">{t.readMore}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
