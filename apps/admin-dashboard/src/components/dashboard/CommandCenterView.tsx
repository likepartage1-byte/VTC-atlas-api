import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Car, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Server
} from 'lucide-react';
import api from '../../lib/api';

interface CommandCenterProps {
  lang: string;
}

export const CommandCenterView: React.FC<CommandCenterProps> = ({ lang }) => {
  const isAr = lang === 'AR';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    systemHealth: { status: string; database: string; uptime: number; timestamp: string };
    liveRides: { active: number; todayTotal: number };
    drivers: { online: number; total: number };
    alerts: { criticalSecurity: number; pendingVerifications: number };
    recentEvents: Array<{ id: string; action: string; entityType: string; actorId: string; createdAt: string }>;
  } | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load command center summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isAr ? 'غرفة التحكم المباشر (Command Center)' : 'Live Command Center'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isAr ? 'نظرة شمولية حية للقراءة والمراقبة فقط دون تعديل البيانات' : 'Read-only live observation & telemetry'}
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {/* 1. System Health Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Server size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">System Health</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                <CheckCircle2 size={11} />
                <span>{data?.systemHealth?.status || 'HEALTHY'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Engine: <span className="text-white font-bold">{data?.systemHealth?.database || 'MySQL + Prisma'}</span>
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400 font-mono">
          {data?.systemHealth?.timestamp ? new Date(data.systemHealth.timestamp).toLocaleTimeString() : 'Live'}
        </div>
      </div>

      {/* Grid Layout for Live Rides, Drivers, Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 2. Live Rides Summary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'الرحلات النشطة الان' : 'Live Active Rides'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {data?.liveRides?.active ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isAr ? 'رحلة جارية' : 'rides in progress'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{isAr ? 'إجمالي رحلات اليوم:' : 'Total Rides Today:'}</span>
            <span className="font-bold text-slate-900 dark:text-white">{data?.liveRides?.todayTotal ?? 0}</span>
          </div>
        </div>

        {/* 3. Drivers Summary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'السائقون المتصلون' : 'Online Drivers'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Car size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {data?.drivers?.online ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {data?.drivers?.total ?? 0} {isAr ? 'سائق مسجل' : 'registered'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? 'جاهز للاستقبال والتسليم' : 'Ready for Dispatch'}</span>
          </div>
        </div>

        {/* 4. Alerts Summary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'التنبيهات الأمنية والتوثيق' : 'Security Alerts & Verification'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">
              {data?.alerts?.criticalSecurity ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isAr ? 'تنبيه أمني عالي' : 'critical flags'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{isAr ? 'توثيق معلق (KYC):' : 'Pending Verification:'}</span>
            <span className="font-bold text-amber-500">{data?.alerts?.pendingVerifications ?? 0}</span>
          </div>
        </div>

      </div>

      {/* 5. Recent Events Stream */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-purple-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isAr ? 'شريط الأحداث الأخيرة (Recent System & Audit Events)' : 'Recent System Events Stream'}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase">
            Append-Only Log
          </span>
        </div>

        {(!data?.recentEvents || data.recentEvents.length === 0) ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            {isAr ? 'لا توجد أحداث حديثة مسجلة' : 'No recent audit events logged'}
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 font-mono text-[10px] font-bold">
                    {evt.action}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {evt.entityType} ({evt.actorId})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
