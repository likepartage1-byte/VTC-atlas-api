import React from 'react';
import type { FontSize, FontWeight, TextAlign, StyleProps } from '../types/homepage-config.types';

interface TypographyEditorProps {
  style: StyleProps;
  onChange: (style: StyleProps) => void;
}

const SIZES: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl'];
const WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: '400', label: 'Regular' },
  { value: '600', label: 'Semi' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'ExtraBold' },
  { value: '900', label: 'Black' },
];
const ALIGNS: { value: TextAlign; icon: string }[] = [
  { value: 'left', icon: '⬅️' },
  { value: 'center', icon: '↔️' },
  { value: 'right', icon: '➡️' },
];

export const TypographyEditor: React.FC<TypographyEditorProps> = ({ style, onChange }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Typography</label>
    <div className="bg-slate-900/50 rounded-xl p-3 space-y-3 border border-slate-800/60">
      {/* Font Size */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Size</span>
        <select
          value={style.fontSize || 'xl'}
          onChange={e => onChange({ ...style, fontSize: e.target.value as FontSize })}
          className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
        >
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {/* Font Weight */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Weight</span>
        <div className="flex gap-1 flex-wrap">
          {WEIGHTS.map(w => (
            <button
              key={w.value}
              type="button"
              onClick={() => onChange({ ...style, fontWeight: w.value })}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                style.fontWeight === w.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      {/* Text Align */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Align</span>
        <div className="flex gap-1">
          {ALIGNS.map(a => (
            <button
              key={a.value}
              type="button"
              onClick={() => onChange({ ...style, textAlign: a.value })}
              className={`flex-1 py-1.5 rounded-lg text-sm transition-all ${
                style.textAlign === a.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {a.icon}
            </button>
          ))}
        </div>
      </div>
      {/* Visibility */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Visible</span>
        <button
          type="button"
          onClick={() => onChange({ ...style, visible: !style.visible })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            style.visible !== false ? 'bg-purple-600' : 'bg-slate-700'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            style.visible !== false ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>
    </div>
  </div>
);
