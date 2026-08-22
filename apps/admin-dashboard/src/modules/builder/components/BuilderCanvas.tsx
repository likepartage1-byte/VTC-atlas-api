import React from 'react';
import {
  Activity, Map, Layers, Users, CreditCard, ShieldAlert
} from 'lucide-react';
import type {
  PageConfig,
  SelectedElementRef,
  WidgetType
} from '../types/page-builder.types';

interface BuilderCanvasProps {
  page: PageConfig;
  selected: SelectedElementRef | null;
  onSelect: (ref: SelectedElementRef) => void;
}

function renderWidgetPlaceholder(type: WidgetType) {
  switch (type) {
    case 'kpi-metrics':
      return (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Telemetry</span>
              <p className="text-xs font-bold text-white">Live Platform KPIs & System Status</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            99.9% Uptime
          </span>
        </div>
      );
    case 'live-map':
      return (
        <div className="h-44 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Map size={28} className="text-purple-400 opacity-60" />
          <span className="text-xs font-bold text-slate-400">Live Operations Map Container</span>
          <span className="text-[10px] text-slate-600">Realtime Driver Markers & Active Trip Geofences</span>
        </div>
      );
    case 'rides-table':
      return (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5"><Layers size={14} className="text-purple-400" /> Active Rides Feed</span>
            <span className="text-[10px] text-slate-500">3 Rides Dispatched</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-8 rounded-lg bg-slate-950/60 border border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-300">
              <span>Trip #R-8092 • Casablanca Center</span>
              <span className="text-emerald-400 font-bold">ON TRIP</span>
            </div>
            <div className="h-8 rounded-lg bg-slate-950/60 border border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-300">
              <span>Trip #R-8093 • Rabat Agdal</span>
              <span className="text-purple-400 font-bold">MATCHING</span>
            </div>
          </div>
        </div>
      );
    case 'drivers-table':
      return (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5"><Users size={14} className="text-purple-400" /> Active Drivers</span>
            <span className="text-[10px] text-slate-500">142 Online</span>
          </div>
          <div className="h-16 rounded-lg bg-slate-950/60 border border-slate-800/80 p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Verified Fleet Status Overview</span>
            <span className="text-xs font-bold text-white">98% Active</span>
          </div>
        </div>
      );
    case 'financial-summary':
      return (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Financial Ledger</span>
              <p className="text-xs font-bold text-white">Platform Commission Stream</p>
            </div>
          </div>
          <span className="text-sm font-mono font-black text-white">15.0%</span>
        </div>
      );
    case 'fraud-alerts':
      return (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Security & Integrity</span>
              <p className="text-xs font-bold text-white">Realtime Anomaly Stream</p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
            0 Critical
          </span>
        </div>
      );
    default:
      return null;
  }
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  page,
  selected,
  onSelect,
}) => {
  const getDeviceWidthClass = () => {
    switch (page.device) {
      case 'tablet':
        return 'max-w-[768px]';
      case 'mobile':
        return 'max-w-[375px]';
      case 'desktop':
      default:
        return 'max-w-full';
    }
  };

  return (
    <main className="flex-1 bg-slate-950 overflow-y-auto p-6 flex flex-col items-center select-none min-h-[calc(100vh-3.5rem)]">
      <div className={`w-full transition-all duration-300 space-y-6 ${getDeviceWidthClass()}`}>
        {page.sections.map((section) => {
          const isSectionSelected =
            selected?.type === 'section' && selected.sectionId === section.id;

          return (
            <div
              key={section.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect({ type: 'section', sectionId: section.id });
              }}
              className={`relative rounded-2xl p-5 transition-all cursor-pointer ${
                section.bgType === 'dark'
                  ? 'bg-slate-900 border border-slate-800'
                  : section.bgType === 'transparent'
                  ? 'bg-transparent border border-dashed border-slate-800'
                  : 'bg-slate-900/90 border border-slate-800 shadow-lg'
              } ${
                isSectionSelected
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-950'
                  : 'hover:border-slate-700'
              }`}
            >
              {/* Section Header */}
              {section.title && (
                <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {section.title}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    Section ({section.columns.length} Cols)
                  </span>
                </div>
              )}

              {/* Section Columns Layout */}
              <div className="flex flex-col md:flex-row gap-4">
                {section.columns.map((col) => (
                  <div
                    key={col.id}
                    style={{ flex: col.widthRatio ? col.widthRatio : 1 }}
                    className="flex flex-col gap-4 min-w-0"
                  >
                    {col.widgets.map((widget) => {
                      const isWidgetSelected =
                        selected?.type === 'widget' && selected.widgetId === widget.id;

                      return (
                        <div
                          key={widget.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({
                              type: 'widget',
                              sectionId: section.id,
                              columnId: col.id,
                              widgetId: widget.id,
                            });
                          }}
                          className={`relative transition-all rounded-xl ${
                            isWidgetSelected
                              ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900'
                              : 'hover:opacity-95'
                          }`}
                        >
                          {renderWidgetPlaceholder(widget.type)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
