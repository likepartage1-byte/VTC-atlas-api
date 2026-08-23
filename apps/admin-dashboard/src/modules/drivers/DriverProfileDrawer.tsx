import React from 'react';
import {
  X,
  User,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export interface DriverFleetItem {
  driverId: string;
  userId?: string;
  fullName?: string;
  phone?: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_TRIP' | 'OFFLINE' | string;
  verificationStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  lat?: number;
  lng?: number;
  lastUpdate?: string;
  rating?: number;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: string;
    plate?: string;
    color?: string;
  };
}

export interface DriverProfileDrawerProps {
  driver: DriverFleetItem | null;
  onClose: () => void;
  lang?: string;
}

export const DriverProfileDrawer: React.FC<DriverProfileDrawerProps> = ({
  driver,
  onClose,
  lang = 'AR',
}) => {
  if (!driver) return null;

  const isAr = lang === 'AR';

  const statusColors: Record<string, string> = {
    AVAILABLE: '#10B981',
    ON_TRIP: '#8B5CF6',
    BUSY: '#F59E0B',
    OFFLINE: '#64748B',
  };

  const statusBg = statusColors[driver.status] || '#64748B';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl text-gray-900 dark:text-white">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-base">
              {driver.fullName ? driver.fullName.charAt(0).toUpperCase() : <User size={22} />}
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">{driver.fullName || 'Unnamed Driver'}</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {driver.driverId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Operational Badges */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isAr ? 'الحالة التشغيلية والتوثيق' : 'Operational & Verification Status'}
            </h4>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-slate-400">{isAr ? 'حالة التغطية الجغرافية:' : 'Live Telemetry Status:'}</span>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase"
                style={{
                  backgroundColor: `${statusBg}20`,
                  color: statusBg,
                }}
              >
                {driver.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-slate-400">{isAr ? 'حالة التوثيق (KYC):' : 'Verification Status:'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {driver.verificationStatus || 'APPROVED'}
              </span>
            </div>
          </div>

          {/* Account Profile Details */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <User size={14} className="text-purple-500" />
              {isAr ? 'معلومات الحساب' : 'Account Details'}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400">{isAr ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                <span className="font-mono font-bold">{driver.phone || '—'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400">{isAr ? 'التقييم العام:' : 'Overall Rating:'}</span>
                <span className="font-bold text-amber-500">{driver.rating ? `${driver.rating} ⭐` : '—'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 dark:text-slate-400">{isAr ? 'آخر تحديث للموقع:' : 'Last Position Update:'}</span>
                <span className="font-mono font-bold">
                  {driver.lastUpdate
                    ? new Date(driver.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <ShieldCheck size={14} className="text-purple-500" />
              {isAr ? 'مواصفات المركبة المسجلة' : 'Vehicle Specifications'}
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'الشركة المصنعة' : 'Make'}</span>
                <span className="font-bold">{driver.vehicleInfo?.make || '—'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'الموديل' : 'Model'}</span>
                <span className="font-bold">{driver.vehicleInfo?.model || '—'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'سنة الصنع' : 'Year'}</span>
                <span className="font-bold">{driver.vehicleInfo?.year || '—'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'رقم اللوحة' : 'Plate Number'}</span>
                <span className="font-mono font-bold text-purple-500">{driver.vehicleInfo?.plate || '—'}</span>
              </div>
            </div>
          </div>

          {/* Coordinates Telemetry */}
          <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
              <MapPin size={12} />
              {isAr ? 'الإحداثيات الجغرافية الحالية' : 'Live Coordinates Telemetry'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">LAT</span>
                <span>{driver.lat ? driver.lat.toFixed(6) : '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">LNG</span>
                <span>{driver.lng ? driver.lng.toFixed(6) : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-gray-800 dark:text-white"
          >
            {isAr ? 'إغلاق' : 'Close Drawer'}
          </button>
        </div>
      </div>
    </div>
  );
};
