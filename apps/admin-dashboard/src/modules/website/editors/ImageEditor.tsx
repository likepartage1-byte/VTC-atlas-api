import React from 'react';
import type { ImageElement } from '../types/homepage-config.types';

interface ImageEditorProps {
  value: ImageElement;
  onChange: (value: ImageElement) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ value, onChange }) => (
  <div className="space-y-4">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Background Image</label>
    <div className="bg-slate-900/50 rounded-xl p-3 space-y-4 border border-slate-800/60">
      {/* Preview */}
      <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800">
        {value.src && (
          <img src={value.src} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="absolute inset-0" style={{ background: `rgba(2,6,23,${value.overlayOpacity / 100})` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold opacity-70">Preview</span>
        </div>
      </div>
      {/* Image URL */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Desktop Image URL</span>
        <input
          type="text"
          value={value.src}
          onChange={e => onChange({ ...value, src: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500/60"
          placeholder="/images/hero_banner_desktop.webp"
        />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Mobile Image URL</span>
        <input
          type="text"
          value={value.srcMobile || ''}
          onChange={e => onChange({ ...value, srcMobile: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500/60"
          placeholder="/images/hero_banner_mobile.webp"
        />
      </div>
      {/* Overlay Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Overlay Opacity</span>
          <span className="text-[11px] font-black text-purple-400">{value.overlayOpacity}%</span>
        </div>
        <input
          type="range"
          min={0} max={100} step={5}
          value={value.overlayOpacity}
          onChange={e => onChange({ ...value, overlayOpacity: Number(e.target.value) })}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>Transparent</span><span>Opaque</span>
        </div>
      </div>
    </div>
  </div>
);
