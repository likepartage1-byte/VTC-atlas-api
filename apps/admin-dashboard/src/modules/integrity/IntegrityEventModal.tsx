import React from 'react';
import {
  X,
  ShieldAlert,
  User,
  Clock,
  Code
} from 'lucide-react';

export interface FraudEventItem {
  id: string;
  eventType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  entityType: string;
  userId: string;
  metadata?: any;
  createdAt: string;
}

export interface IntegrityEventModalProps {
  event: FraudEventItem | null;
  onClose: () => void;
  lang?: string;
}

export const IntegrityEventModal: React.FC<IntegrityEventModalProps> = ({
  event,
  onClose,
  lang = 'AR',
}) => {
  if (!event) return null;

  const isAr = lang === 'AR';

  const severityColors: Record<string, string> = {
    CRITICAL: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#F59E0B',
    LOW: '#3B82F6',
  };

  const badgeColor = severityColors[event.severity] || '#64748B';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900 dark:text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">{event.eventType || 'Suspicious Event'}</h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
                  style={{
                    backgroundColor: `${badgeColor}20`,
                    color: badgeColor,
                    borderColor: `${badgeColor}40`,
                  }}
                >
                  {event.severity}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">Event ID: {event.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Main Attributes Grid */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <span className="text-gray-400 flex items-center gap-1.5">
                <User size={14} />
                {isAr ? 'الكيان المستهدف:' : 'Target Entity:'}
              </span>
              <span className="font-mono font-bold uppercase">{event.entityType || '—'}</span>
            </div>

            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <span className="text-gray-400 flex items-center gap-1.5">
                <User size={14} />
                {isAr ? 'معرف المستخدم:' : 'User ID:'}
              </span>
              <span className="font-mono font-bold">{event.userId || '—'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Clock size={14} />
                {isAr ? 'تاريخ ووقت الكشف:' : 'Detection Timestamp:'}
              </span>
              <span className="font-mono font-bold">
                {event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}
              </span>
            </div>
          </div>

          {/* Raw Metadata Display (Strict Zero Fake Data) */}
          <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
              <Code size={14} />
              {isAr ? 'البيانات الوصفية للحدث (Metadata JSON)' : 'Raw Event Metadata JSON'}
            </span>

            {event.metadata ? (
              <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-400 max-h-56">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            ) : (
              <p className="text-xs font-mono text-slate-500 py-2">—</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-gray-800 dark:text-white"
          >
            {isAr ? 'إغلاق النافذة' : 'Close Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
