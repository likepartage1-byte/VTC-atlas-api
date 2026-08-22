import React from 'react';
import { Sliders, Trash2, Eye, EyeOff } from 'lucide-react';
import type {
  PageConfig,
  SelectedElementRef,
  SectionConfig,
  WidgetConfig
} from '../types/page-builder.types';

interface InspectorSidebarProps {
  page: PageConfig;
  selected: SelectedElementRef | null;
  onUpdateSection: (sectionId: string, updater: (s: SectionConfig) => SectionConfig) => void;
  onUpdateWidget: (sectionId: string, widgetId: string, updater: (w: WidgetConfig) => WidgetConfig) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteWidget: (sectionId: string, widgetId: string) => void;
  isAr: boolean;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  page,
  selected,
  onUpdateSection,
  onUpdateWidget,
  onDeleteSection,
  onDeleteWidget,
  isAr,
}) => {
  if (!selected) {
    return (
      <aside className="w-72 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-500 h-[calc(100vh-3.5rem)] select-none">
        <Sliders size={32} className="opacity-20 mb-3 text-purple-400" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          {isAr ? 'لم يتم تحديد عنصر' : 'No Element Selected'}
        </h3>
        <p className="text-[11px] mt-1">
          {isAr ? 'انقر على أي قسم أو ودجت في اللوحة الرئيسية لتعديل إعداداته.' : 'Click on any section or widget in the canvas to inspect & edit.'}
        </p>
      </aside>
    );
  }

  const currentSection = page.sections.find((s) => s.id === selected.sectionId);

  let currentWidget: WidgetConfig | undefined;
  if (selected.type === 'widget' && selected.widgetId && currentSection) {
    for (const col of currentSection.columns) {
      const found = col.widgets.find((w) => w.id === selected.widgetId);
      if (found) {
        currentWidget = found;
        break;
      }
    }
  }

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
          {selected.type === 'section' ? (isAr ? 'خصائص القسم' : 'Section Inspector') : (isAr ? 'خصائص الودجت' : 'Widget Inspector')}
        </h2>
        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
          {selected.type.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {selected.type === 'section' && currentSection && (
          <>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'عنوان القسم' : 'Section Title'}
              </label>
              <input
                type="text"
                value={currentSection.title || ''}
                onChange={(e) =>
                  onUpdateSection(currentSection.id, (s) => ({
                    ...s,
                    title: e.target.value,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'خلفية القسم' : 'Background Type'}
              </label>
              <select
                value={currentSection.bgType || 'card'}
                onChange={(e) =>
                  onUpdateSection(currentSection.id, (s) => ({
                    ...s,
                    bgType: e.target.value as any,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="card">Card (White / Dark Slate)</option>
                <option value="transparent">Transparent</option>
                <option value="dark">Solid Dark Deep</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  onUpdateSection(currentSection.id, (s) => ({
                    ...s,
                    visible: !s.visible,
                  }))
                }
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
              >
                {currentSection.visible ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-500" />}
                <span>{currentSection.visible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteSection(currentSection.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20"
              >
                <Trash2 size={13} />
                <span>{isAr ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </>
        )}

        {selected.type === 'widget' && currentWidget && (
          <>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'عنوان الودجت' : 'Widget Title'}
              </label>
              <input
                type="text"
                value={currentWidget.title}
                onChange={(e) =>
                  onUpdateWidget(selected.sectionId, currentWidget!.id, (w) => ({
                    ...w,
                    title: e.target.value,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'نوع الودجت' : 'Widget Type'}
              </label>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-purple-400 font-mono">
                {currentWidget.type}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  onUpdateWidget(selected.sectionId, currentWidget!.id, (w) => ({
                    ...w,
                    visible: !w.visible,
                  }))
                }
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
              >
                {currentWidget.visible ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-500" />}
                <span>{currentWidget.visible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteWidget(selected.sectionId, currentWidget!.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20"
              >
                <Trash2 size={13} />
                <span>{isAr ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
