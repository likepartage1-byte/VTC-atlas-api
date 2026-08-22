import React from 'react';
import { X, Palette, Type, Image, AlignCenter } from 'lucide-react';
import type { SelectedElement, HomepageConfig } from '../types/homepage-config.types';
import { TextEditor } from '../editors/TextEditor';
import { ColorEditor } from '../editors/ColorEditor';
import { TypographyEditor } from '../editors/TypographyEditor';
import { ImageEditor } from '../editors/ImageEditor';
import { ThemeEditor } from '../editors/ThemeEditor';

interface Props {
  selected: SelectedElement | null;
  config: HomepageConfig;
  onClose: () => void;
  onUpdateHero: (updater: (h: any) => any) => void;
  onUpdateOneApp: (updater: (o: any) => any) => void;
  onUpdateTheme: (updater: (t: any) => any) => void;
}

type Tab = 'text' | 'style' | 'image' | 'typography';

export const ElementEditorPanel: React.FC<Props> = ({
  selected, config, onClose, onUpdateHero, onUpdateOneApp, onUpdateTheme,
}) => {
  const [tab, setTab] = React.useState<Tab>('text');

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
          <AlignCenter className="text-slate-600" size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400">No element selected</p>
          <p className="text-xs text-slate-600 mt-1">Click on any element in the preview to edit it</p>
        </div>
      </div>
    );
  }

  // Theme editor
  if (selected.elementPath === 'theme') {
    return (
      <div className="h-full flex flex-col">
        <Header label="Global Theme" onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-4">
          <ThemeEditor theme={config.theme} onChange={t => onUpdateTheme(() => t)} />
        </div>
      </div>
    );
  }

  // Element editors
  const getElement = () => {
    const [section, field] = selected.elementPath.split('.');
    if (section === 'hero') return (config.hero as any)[field];
    if (section === 'oneApp') return (config.oneApp as any)[field];
    return null;
  };

  const updateElement = (updatedEl: any) => {
    const [section, field] = selected.elementPath.split('.');
    if (section === 'hero') onUpdateHero(h => ({ ...h, [field]: updatedEl }));
    else if (section === 'oneApp') onUpdateOneApp(o => ({ ...o, [field]: updatedEl }));
  };

  const element = getElement();
  if (!element) return null;

  const isBackground = selected.elementPath === 'hero.background';

  const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode; show: boolean }> = [
    { id: 'text' as Tab,       label: 'Text',   icon: <Type size={12} />,    show: !isBackground },
    { id: 'style' as Tab,      label: 'Color',  icon: <Palette size={12} />, show: !isBackground && !!element.style?.color },
    { id: 'typography' as Tab, label: 'Type',   icon: <AlignCenter size={12} />, show: !isBackground },
    { id: 'image' as Tab,      label: 'Image',  icon: <Image size={12} />,   show: isBackground },
  ].filter(t => t.show);

  return (
    <div className="h-full flex flex-col">
      <Header label={selected.label} onClose={onClose} />

      {/* Tabs */}
      <div className="flex gap-1 px-3 pb-2 border-b border-slate-800/60">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              tab === t.id ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {tab === 'text' && !isBackground && (
          <TextEditor
            label="Text Content"
            value={element.text}
            onChange={text => updateElement({ ...element, text })}
            multiline={selected.elementPath === 'hero.subtitle' || selected.elementPath === 'oneApp.subtitle'}
          />
        )}
        {tab === 'style' && element.style?.color && (
          <ColorEditor
            label="Text Color"
            value={element.style.color}
            onChange={color => updateElement({ ...element, style: { ...element.style, color } })}
          />
        )}
        {tab === 'typography' && !isBackground && (
          <TypographyEditor
            style={element.style || {}}
            onChange={style => updateElement({ ...element, style })}
          />
        )}
        {tab === 'image' && isBackground && (
          <ImageEditor value={element} onChange={updateElement} />
        )}
      </div>
    </div>
  );
};

const Header: React.FC<{ label: string; onClose: () => void }> = ({ label, onClose }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Editing</p>
      <h3 className="text-sm font-black text-white">{label}</h3>
    </div>
    <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
      <X size={14} />
    </button>
  </div>
);
