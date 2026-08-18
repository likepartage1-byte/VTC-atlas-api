import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import api from '../../lib/api';
import { IntegrityEventModal } from './IntegrityEventModal';
import type { FraudEventItem } from './IntegrityEventModal';

export interface IntegrityStatsData {
  totalEvents?: number;
  criticalEvents?: number;
  ratio?: number;
}

export const IntegrityCenterTable: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [stats, setStats] = useState<IntegrityStatsData | null>(null);
  const [events, setEvents] = useState<FraudEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<FraudEventItem | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchIntegrityData();
  }, []);

  const fetchIntegrityData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Stats
      const statsRes = await api.get('/admin/integrity/stats').catch(() => null);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }

      // 2. Fetch Events
      const eventsRes = await api.get('/admin/integrity/events').catch(() => null);
      if (Array.isArray(eventsRes?.data)) {
        setEvents(eventsRes.data);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch integrity monitoring data', err);
      setError(err.response?.data?.message || 'Unable to load security integrity logs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (e.eventType && e.eventType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.userId && e.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.id && e.id.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSeverity && matchesSearch;
  });

  const severityColors: Record<string, string> = {
    CRITICAL: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#F59E0B',
    LOW: '#3B82F6',
  };

  return (
    <div className="space-y-6">
      {/* Integrity KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'إجمالي أحداث الأمان' : 'Total Security Events'}</p>
              <h3 className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                {stats?.totalEvents !== undefined ? stats.totalEvents : '—'}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'تنبيهات حرجة (Critical Alerts)' : 'Critical Alerts'}</p>
              <h3 className="text-2xl font-extrabold mt-1 text-red-500">
                {stats?.criticalEvents !== undefined ? stats.criticalEvents : '—'}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'نسبة الشذوذ والأحداث الحرجة' : 'Anomaly Ratio'}</p>
              <h3 className="text-2xl font-extrabold mt-1 text-amber-500">
                {stats?.ratio !== undefined ? `${(stats.ratio * 100).toFixed(1)}%` : '—'}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Zap size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Integrity Events Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldAlert className="text-purple-600 dark:text-purple-400" size={22} />
              {isAr ? 'سجل مراقبة النزاهة وأحداث الأمان (Integrity Anomaly Monitoring)' : 'Integrity & Security Anomaly Events'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
              {isAr
                ? 'متابعة تنبيهات كشف الاحتيال، وتتبع تغيير الموقع وأنماط الحسابات المشبوهة.'
                : 'Monitor security fraud events and unusual telemetry alerts.'}
            </p>
          </div>

          <button
            onClick={fetchIntegrityData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث الأحداث' : 'Refresh Events')}
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  severityFilter === sev
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بنوع الحدث أو المستخدم...' : 'Search event type, user ID...'}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchIntegrityData}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="pb-4 font-bold">{isAr ? 'نوع الحدث' : 'Event Type'}</th>
                <th className="pb-4 font-bold">{isAr ? 'درجة الخطورة' : 'Severity'}</th>
                <th className="pb-4 font-bold">{isAr ? 'الكيان المستهدف' : 'Target Entity'}</th>
                <th className="pb-4 font-bold">{isAr ? 'معرف المستخدم' : 'User ID'}</th>
                <th className="pb-4 font-bold">{isAr ? 'تاريخ الكشف' : 'Detected At'}</th>
                <th className="pb-4 font-bold text-right">{isAr ? 'تفاصيل الحدث' : 'Inspect Event'}</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-purple-500" size={28} />
                      <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل أحداث النزاهة...' : 'Loading integrity logs...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((item) => {
                  const badgeColor = severityColors[item.severity] || '#64748B';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedEvent(item)}
                      className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 font-bold">
                        <span className="block font-mono text-xs text-purple-600 dark:text-purple-400 group-hover:underline">
                          {item.eventType || '—'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                      </td>
                      <td className="py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
                          style={{
                            backgroundColor: `${badgeColor}15`,
                            color: badgeColor,
                            borderColor: `${badgeColor}30`,
                          }}
                        >
                          {item.severity || '—'}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs font-bold uppercase text-gray-600 dark:text-slate-300">
                        {item.entityType || '—'}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-500">
                        {item.userId || '—'}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl font-bold text-xs transition-colors"
                        >
                          <Eye size={14} />
                          <span>{isAr ? 'عرض التفاصيل' : 'Inspect'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck size={36} className="opacity-30 mb-1" />
                      <p className="font-bold text-sm">{isAr ? 'لا توجد أحداث شذوذ أمني أو احتيال حالياً.' : 'No security anomaly events logged.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Event Detail Modal */}
        <IntegrityEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          lang={lang}
        />
      </div>
    </div>
  );
};
