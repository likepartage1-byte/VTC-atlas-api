import React from 'react';
import { Eye, EyeOff, Palette } from 'lucide-react';
import type { SectionId, SelectedElement, HomepageConfig } from '../types/homepage-config.types';

interface Props {
  config: HomepageConfig;
  activeSection: SectionId | null;
  selected: SelectedElement | null;
  lang: string;
  onSelectSection: (id: SectionId) => void;
  onToggleVisibility: (id: SectionId) => void;
  onSelectElement: (el: SelectedElement) => void;
}

const SECTION_ELEMENTS: Partial<Record<SectionId, Array<{ path: string; label: string }>>> = {
  hero: [
    { path: 'hero.title', label: 'Title' },
    { path: 'hero.subtitle', label: 'Subtitle' },
    { path: 'hero.primaryButton', label: 'Primary Button' },
    { path: 'hero.secondaryButton', label: 'Secondary Button' },
    { path: 'hero.background', label: 'Background Image' },
  ],
  oneApp: [
    { path: 'oneApp.badge', label: 'Badge' },
    { path: 'oneApp.heading', label: 'Heading' },
    { path: 'oneApp.subtitle', label: 'Subtitle' },
  ],
};

const SECTION_ICONS: Partial<Record<SectionId, string>> = {
  hero: '🖼️', oneApp: '📱', passenger: '👤', driver: '🚗',
  howItWorks: '🔄', safety: '🛡️', services: '⚡', journal: '📰',
  download: '⬇️', faq: '❓',
};

export const SectionsPanel: React.FC<Props> = ({
  config, activeSection, selected, lang, onSelectSection, onToggleVisibility, onSelectElement,
}) => {
  const isAr = lang === 'AR';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Sections</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">{config.sections.filter(s => s.visible).length} visible</p>
      </div>

      {/* Theme button */}
      <div className="px-3 py-2">
        <button
          type="button"
          onClick={() => onSelectElement({ sectionId: 'theme', elementPath: 'theme', label: 'Global Theme' })}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            selected?.elementPath === 'theme'
              ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'
          }`}
        >
          <Palette size={13} className="text-purple-400" />
          <span>Global Theme & Colors</span>
        </button>
      </div>

      <div className="px-3 py-1">
        <div className="h-px bg-slate-800/60" />
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {[...config.sections].sort((a, b) => a.order - b.order).map(section => {
          const isActive = activeSection === section.id;
          const elements = SECTION_ELEMENTS[section.id];
          const icon = SECTION_ICONS[section.id] || '📄';

          return (
            <div key={section.id} className="rounded-xl overflow-hidden">
              {/* Section header */}
              <div
                className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800/80 border border-slate-700/60'
                    : 'hover:bg-slate-800/40 border border-transparent'
                }`}
                onClick={() => onSelectSection(section.id)}
              >
                <span className="text-sm">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${section.visible ? 'text-white' : 'text-slate-500 line-through'}`}>
                    {isAr ? section.labelAR : section.labelEN}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onToggleVisibility(section.id); }}
                  className={`p-1 rounded-lg transition-colors ${
                    section.visible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>

              {/* Element sub-items */}
              {isActive && elements && section.visible && (
                <div className="ml-4 border-l border-slate-700/60 pl-2 pb-1 mt-0.5 space-y-0.5">
                  {elements.map(el => (
                    <button
                      key={el.path}
                      type="button"
                      onClick={() => onSelectElement({
                        sectionId: section.id,
                        elementPath: el.path as any,
                        label: `${isAr ? section.labelAR : section.labelEN} › ${el.label}`,
                      })}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        selected?.elementPath === el.path
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-500 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {el.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
