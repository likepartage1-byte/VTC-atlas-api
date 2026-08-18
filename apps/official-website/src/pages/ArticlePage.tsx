import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { SupportedLang, Translations, JournalArticle } from '../i18n/translations';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface ArticlePageProps {
  lang: SupportedLang;
}

const categoryColors: Record<JournalArticle['category'], string> = {
  passenger: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  driver: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  services: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  news: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// Simple markdown-like renderer
const renderContent = (content: string) => {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-black text-white mt-8 mb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-black text-slate-200 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      // Collect list items
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-2 my-4 ms-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-slate-300 font-medium text-sm">
              <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} className="font-black text-white text-base my-3">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} className="border-slate-800 my-6" />);
    } else if (line.includes('|') && line.trim().startsWith('|')) {
      // Simple table
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        if (!lines[i].match(/^\|[-\s|]+\|$/)) {
          rows.push(lines[i].split('|').filter(c => c.trim() !== ''));
        }
        i++;
      }
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-6 rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            {rows.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? 'bg-slate-800/60' : 'border-t border-slate-800/60 hover:bg-slate-900/40'}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 font-${ri === 0 ? 'black text-white' : 'medium text-slate-300'}`}>
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      );
      continue;
    } else if (line.trim() === '') {
      // Skip empty lines (treated as spacing)
    } else {
      // Regular paragraph — handle bold inline
      elements.push(
        <p
          key={i}
          className="text-slate-300 font-medium text-sm leading-relaxed mb-3"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>')
          }}
        />
      );
    }
    i++;
  }

  return elements;
};

export const ArticlePage: React.FC<ArticlePageProps> = ({ lang }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const t = Translations[lang].journal;
  const isAr = lang === 'AR';

  const article = t.articles.find((a) => a.slug === slug);

  const getCategoryLabel = (cat: JournalArticle['category']) => {
    const map: Record<JournalArticle['category'], string> = {
      passenger: t.passengerLabel,
      driver: t.driverLabel,
      services: t.servicesLabel,
      news: t.newsLabel,
    };
    return map[cat];
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">
            {isAr ? 'المقال غير موجود' : 'Article not found'}
          </h1>
          <button
            onClick={() => navigate('/journal')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-500 transition-colors"
          >
            {t.backToJournal}
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: isAr ? 'المجلة' : 'Journal', path: '/journal' },
    { name: article.title, path: `/journal/${article.slug}` },
  ];

  // Related articles
  const related = t.articles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 2);

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${article.title} — Yalla VTC Journal`}
        description={article.excerpt}
        canonicalPath={`/journal/${article.slug}`}
        ogType="article"
        publishedDate={article.date}
        articleCategory={getCategoryLabel(article.category)}
        breadcrumbs={breadcrumbs}
      />

      {/* Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={breadcrumbs} lang={lang} />
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Meta */}
        <header className="mb-10">
          <div className={`flex flex-wrap items-center gap-3 mb-6 ${isAr ? 'justify-end' : 'justify-start'}`}>
            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${categoryColors[article.category]}`}>
              {getCategoryLabel(article.category)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Clock size={12} />
              <span>{article.readingTime} {t.readingTime}</span>
            </div>
            <span className="text-xs text-slate-600 font-medium">
              {new Date(article.date).toLocaleDateString(
                lang === 'AR' ? 'ar' : lang === 'FR' ? 'fr' : lang === 'ES' ? 'es' : 'en',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className={`prose-yalla ${isAr ? 'text-right' : 'text-left'}`}>
          {renderContent(article.content)}
        </div>

        {/* Divider */}
        <hr className="border-slate-800 mt-12 mb-8" />

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h3 className={`text-lg font-black text-white mb-6 ${isAr ? 'text-right' : 'text-left'}`}>
              {isAr ? 'مقالات ذات صلة' : lang === 'FR' ? 'Articles liés' : lang === 'ES' ? 'Artículos relacionados' : 'Related Articles'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <button
                  key={rel.slug}
                  type="button"
                  onClick={() => navigate(`/journal/${rel.slug}`)}
                  className={`group text-${isAr ? 'right' : 'left'} p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 hover:-translate-y-0.5 transition-all`}
                >
                  <h4 className="text-sm font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {rel.title}
                  </h4>
                  <div className={`flex items-center gap-1 text-[11px] text-purple-400 font-bold ${isAr ? 'justify-end' : 'justify-start'}`}>
                    <span>{t.readMore}</span>
                    {isAr ? <ArrowLeft size={11} /> : <ArrowRight size={11} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
