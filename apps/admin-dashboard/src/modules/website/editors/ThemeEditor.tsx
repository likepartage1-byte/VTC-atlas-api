import React from 'react';
import type { ThemeConfig, ThemeTokens } from '../types/homepage-config.types';
import { SingleColorEditor } from './ColorEditor';

interface ThemeEditorProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
}

const TOKEN_LABELS: Array<{ key: keyof ThemeTokens; label: string; desc: string }> = [
  { key: 'primary',    label: 'Primary',    desc: 'Brand color, buttons' },
  { key: 'background', label: 'Background', desc: 'Page background' },
  { key: 'surface',    label: 'Surface',    desc: 'Cards, panels' },
  { key: 'heading',    label: 'Heading',    desc: 'H1, H2, H3' },
  { key: 'body',       label: 'Body',       desc: 'Paragraphs' },
  { key: 'muted',      label: 'Muted',      desc: 'Captions, hints' },
  { key: 'border',     label: 'Border',     desc: 'Dividers, cards' },
];

const ModePanel: React.FC<{
  mode: 'light' | 'dark';
  tokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
}> = ({ mode, tokens, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">{mode === 'light' ? '☀️' : '🌙'}</span>
      <span className="text-xs font-black text-white">{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
    </div>
    {TOKEN_LABELS.map(({ key, label }) => (
      <SingleColorEditor
        key={key}
        label={label}
        value={tokens[key]}
        onChange={v => onChange({ ...tokens, [key]: v })}
      />
    ))}
  </div>
);

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  const [activeMode, setActiveMode] = React.useState<'light' | 'dark'>('dark');

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Theme Tokens</label>
      <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {(['light', 'dark'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setActiveMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === m ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {m === 'light' ? '☀️ Light' : '🌙 Dark'}
          </button>
        ))}
      </div>
      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60">
        {activeMode === 'light' ? (
          <ModePanel mode="light" tokens={theme.light} onChange={t => onChange({ ...theme, light: t })} />
        ) : (
          <ModePanel mode="dark" tokens={theme.dark} onChange={t => onChange({ ...theme, dark: t })} />
        )}
      </div>
    </div>
  );
};
