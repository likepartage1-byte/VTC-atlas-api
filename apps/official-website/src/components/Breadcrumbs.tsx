import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { SupportedLang } from '../i18n/translations';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  lang: SupportedLang;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, lang }) => {
  const isAr = lang === 'AR';

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 ${isAr ? 'justify-start' : 'justify-start'}`}>
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home size={13} className="text-purple-400" />
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isAr ? (
                <ChevronLeft size={13} className="text-slate-600 flex-shrink-0" />
              ) : (
                <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />
              )}
              {isLast ? (
                <span className="text-purple-300 font-bold max-w-[200px] sm:max-w-xs truncate" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
