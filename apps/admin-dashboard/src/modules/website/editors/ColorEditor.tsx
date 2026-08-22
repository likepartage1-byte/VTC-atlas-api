import React from 'react';
import type { ColorPair } from '../types/homepage-config.types';

interface ColorEditorProps {
  label: string;
  value: ColorPair;
  onChange: (value: ColorPair) => void;
}

const Swatch: React.FC<{ label: string; icon: string; value: string; onChange: (v: string) => void }> = ({
  label, icon, value, onChange,
}) => (
  <div className="flex items-center gap-2">
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase w-20">
      <span>{icon}</span>{label}
    </label>
    <div className="relative flex items-center gap-2 flex-1">
      <div
        className="w-7 h-7 rounded-lg border border-slate-700 shadow-inner cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500/60 transition-colors"
        maxLength={7}
        placeholder="#FFFFFF"
      />
    </div>
  </div>
);

export const ColorEditor: React.FC<ColorEditorProps> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="bg-slate-900/50 rounded-xl p-3 space-y-2 border border-slate-800/60">
      <Swatch
        label="Light" icon="☀️"
        value={value.light}
        onChange={v => onChange({ ...value, light: v })}
      />
      <Swatch
        label="Dark" icon="🌙"
        value={value.dark}
        onChange={v => onChange({ ...value, dark: v })}
      />
    </div>
  </div>
);

interface SingleColorEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const SingleColorEditor: React.FC<SingleColorEditorProps> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-20">{label}</label>
    <div className="relative flex items-center gap-2 flex-1">
      <div
        className="w-7 h-7 rounded-lg border border-slate-700 shadow-inner cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500/60 transition-colors"
        maxLength={7}
        placeholder="#683EE6"
      />
    </div>
  </div>
);
