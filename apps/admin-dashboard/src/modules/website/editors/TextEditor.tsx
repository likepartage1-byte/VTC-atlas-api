import React from 'react';
import type { MultiLangText } from '../types/homepage-config.types';

interface TextEditorProps {
  label: string;
  value: MultiLangText;
  onChange: (value: MultiLangText) => void;
  multiline?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({ label, value, onChange, multiline }) => {
  const langs: Array<{ key: keyof MultiLangText; flag: string; name: string }> = [
    { key: 'AR', flag: '🇲🇦', name: 'العربية' },
    { key: 'FR', flag: '🇫🇷', name: 'Français' },
    { key: 'EN', flag: '🇬🇧', name: 'English' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      {langs.map(({ key, flag, name }) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{flag}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{name}</span>
          </div>
          {multiline ? (
            <textarea
              value={value[key] || ''}
              onChange={e => onChange({ ...value, [key]: e.target.value })}
              rows={2}
              dir={key === 'AR' ? 'rtl' : 'ltr'}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          ) : (
            <input
              type="text"
              value={value[key] || ''}
              onChange={e => onChange({ ...value, [key]: e.target.value })}
              dir={key === 'AR' ? 'rtl' : 'ltr'}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          )}
        </div>
      ))}
    </div>
  );
};
