import React from 'react';
import {
  Activity, Map, ShieldAlert, Users, CreditCard, Plus, Layers
} from 'lucide-react';
import type { WidgetType } from '../types/page-builder.types';

interface ElementsSidebarProps {
  onAddWidget: (type: WidgetType) => void;
  onAddSection: () => void;
  isAr: boolean;
}

const AVAILABLE_WIDGETS: Array<{
  type: WidgetType;
  title: string;
  desc: string;
  icon: any;
}> = [
  {
    type: 'kpi-metrics',
    title: 'Live Platform KPIs',
    desc: 'Realtime active rides, online drivers, daily revenue telemetry',
    icon: Activity,
  },
  {
    type: 'live-map',
    title: 'Live Operations Map',
    desc: 'Realtime driver positions & active ride routes map',
    icon: Map,
  },
  {
    type: 'rides-table',
    title: 'Active Rides Stream',
    desc: 'Live dispatched rides overview and lifecycle feed',
    icon: Layers,
  },
  {
    type: 'drivers-table',
    title: 'Drivers Management',
    desc: 'Active driver statuses, ratings, and vehicle compliance',
    icon: Users,
  },
  {
    type: 'financial-summary',
    title: 'Financial Ledger',
    desc: 'Platform commissions and driver withdrawal requests',
    icon: CreditCard,
  },
  {
    type: 'fraud-alerts',
    title: 'Security & Integrity Feed',
    desc: 'Realtime fraud detection and security alerts stream',
    icon: ShieldAlert,
  },
];

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({
  onAddWidget,
  onAddSection,
  isAr,
}) => {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
          {isAr ? 'مكتبة العناصر (Widgets)' : 'Control Center Widgets'}
        </h2>
        <button
          type="button"
          onClick={onAddSection}
          className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20"
        >
          <Plus size={13} />
          <span>{isAr ? 'قسم جديد' : 'Add Section'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {AVAILABLE_WIDGETS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              onClick={() => onAddWidget(item.type)}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-950 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
