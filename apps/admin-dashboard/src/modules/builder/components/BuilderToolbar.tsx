import React from 'react';
import { Monitor, Tablet, Smartphone, Eye, Sparkles } from 'lucide-react';
import type { DeviceType } from '../types/page-builder.types';

interface BuilderToolbarProps {
  device: DeviceType;
  onChangeDevice: (d: DeviceType) => void;
  pageName: string;
  isAr: boolean;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  device,
  onChangeDevice,
  pageName,
  isAr,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-white select-none">
      {/* Brand & Page Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Sparkles size={16} />
        </div>
        <div>
          <h1 className="text-xs font-black uppercase tracking-wider text-white">
            {isAr ? 'محرر لوحة القيادة (Control Center Builder)' : 'Control Center Visual Builder'}
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            {pageName}
          </span>
        </div>
      </div>

      {/* Center Device Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
        <button
          type="button"
          onClick={() => onChangeDevice('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            device === 'desktop'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Desktop Mode (100%)"
        >
          <Monitor size={14} />
          <span>Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDevice('tablet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            device === 'tablet'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Tablet Mode (768px)"
        >
          <Tablet size={14} />
          <span>Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDevice('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            device === 'mobile'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Mobile Mode (375px)"
        >
          <Smartphone size={14} />
          <span>Mobile</span>
        </button>
      </div>

      {/* Mode Badge */}
      <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
        <Eye size={14} />
        <span>{isAr ? 'وضع التخصيص المرئي خفيف الوزن' : 'Lightweight Visual Mode'}</span>
      </div>
    </header>
  );
};
