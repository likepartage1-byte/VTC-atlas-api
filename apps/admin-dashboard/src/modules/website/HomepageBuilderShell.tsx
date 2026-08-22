import React, { useState, useCallback } from 'react';
import {
  Undo2, Redo2, Save, Globe, CheckCircle2, AlertCircle, Clock, Loader2
} from 'lucide-react';
import { useHomepageConfig } from './hooks/useHomepageConfig';
import { SectionsPanel } from './panels/SectionsPanel';
import { PreviewPanel } from './panels/PreviewPanel';
import { ElementEditorPanel } from './panels/ElementEditorPanel';
import type { SectionId, SelectedElement } from './types/homepage-config.types';

interface Props { lang: string; }

export const HomepageBuilderShell: React.FC<Props> = ({ lang }) => {
  const {
    config, isDirty, canUndo, canRedo,
    toggleSectionVisibility, updateHero, updateOneApp, updateTheme,
    undo, redo, saveDraft, publish, resetToDefault,
  } = useHomepageConfig();

  const [activeSection, setActiveSection] = useState<SectionId | null>('hero');
  const [selected, setSelected] = useState<SelectedElement | null>({
    sectionId: 'hero',
    elementPath: 'hero.title' as any,
    label: 'Title',
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [previewLang, setPreviewLang] = useState(lang);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const res = await saveDraft();
    setIsSaving(false);
    if (res.isRemote) {
      showNotice('success', 'Draft saved to database');
    } else {
      showNotice('success', 'Draft saved locally (Offline mode)');
    }
  }, [saveDraft]);

  const handlePublish = useCallback(async () => {
    if (!confirm('Publish changes to production?')) return;
    setIsPublishing(true);
    const res = await publish();
    setIsPublishing(false);
    if (res.isRemote) {
      showNotice('success', `Published to Production! Version ${res.version}`);
    } else {
      showNotice('success', `Published locally (Version ${res.version})`);
    }
  }, [publish]);

  const handleSelectElement = useCallback((path: string, label: string) => {
    const sectionId = path.split('.')[0] as SectionId;
    setSelected({ sectionId, elementPath: path as any, label });
    setActiveSection(sectionId);
  }, []);

  const isAr = lang === 'AR';
  const lastSaved = config.lastSavedAt
    ? new Date(config.lastSavedAt).toLocaleTimeString()
    : null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden -mx-4 -mt-4 sm:-mx-6 lg:-mx-8">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md flex-shrink-0">
        {/* Left: title + status */}
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-black text-white leading-none">Homepage Builder</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {config.isDraft ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <Clock size={9} /> Draft
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 size={9} /> Published
                </span>
              )}
              {isDirty && <span className="text-[10px] text-slate-500">• unsaved changes</span>}
              {lastSaved && !isDirty && <span className="text-[10px] text-slate-600">• saved {lastSaved}</span>}
            </div>
          </div>
        </div>

        {/* Center: undo/redo + preview lang */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo} disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white transition-all"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={redo} disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white transition-all"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Preview language */}
          <div className="flex gap-0.5 bg-slate-800 p-0.5 rounded-lg">
            {['AR', 'FR', 'EN'].map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setPreviewLang(l)}
                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${
                  previewLang === l ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Notice */}
          {notice && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              notice.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {notice.type === 'success' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
              {notice.msg}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white disabled:opacity-40 transition-all"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save Draft
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all"
          >
            {isPublishing ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
            Publish
          </button>
        </div>
      </div>

      {/* ── 3-Panel Layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Sections Panel */}
        <div className="w-52 flex-shrink-0 border-r border-slate-800/60 bg-slate-900/50 overflow-hidden flex flex-col">
          <SectionsPanel
            config={config}
            activeSection={activeSection}
            selected={selected}
            lang={isAr ? 'AR' : 'EN'}
            onSelectSection={id => { setActiveSection(id); setSelected(null); }}
            onToggleVisibility={toggleSectionVisibility}
            onSelectElement={el => setSelected(el)}
          />
        </div>

        {/* Center: Preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <PreviewPanel
            config={config}
            lang={previewLang}
            previewDevice={previewDevice}
            previewTheme={previewTheme}
            onDeviceChange={setPreviewDevice}
            onThemeChange={setPreviewTheme}
            onSelectElement={handleSelectElement}
          />
        </div>

        {/* Right: Editor Panel */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800/60 bg-slate-900/50 overflow-hidden flex flex-col">
          <ElementEditorPanel
            selected={selected}
            config={config}
            onClose={() => setSelected(null)}
            onUpdateHero={updateHero}
            onUpdateOneApp={updateOneApp}
            onUpdateTheme={updateTheme}
          />
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/80 border-t border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-3 text-[10px] text-slate-600">
          <span>v{config.version}</span>
          <span>•</span>
          <span>{config.sections.filter(s => s.visible).length} sections visible</span>
        </div>
        <button
          type="button"
          onClick={() => { if (confirm('Reset all changes to defaults?')) resetToDefault(); }}
          className="text-[10px] text-slate-600 hover:text-red-400 transition-colors"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
};
