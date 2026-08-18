import React from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  Star,
  Activity
} from 'lucide-react';

export interface PassengerFleetItem {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  totalTrips?: number;
  totalSpend?: number;
  rating?: number;
}

export interface PassengerProfileDrawerProps {
  passenger: PassengerFleetItem | null;
  onClose: () => void;
  lang?: string;
}

export const PassengerProfileDrawer: React.FC<PassengerProfileDrawerProps> = ({
  passenger,
  onClose,
  lang = 'AR',
}) => {
  if (!passenger) return null;

  const isAr = lang === 'AR';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl text-gray-900 dark:text-white">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-base">
              {passenger.fullName ? passenger.fullName.charAt(0).toUpperCase() : <User size={22} />}
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">{passenger.fullName || '—'}</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {passenger.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity & Account Specs */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <User size={14} className="text-purple-500" />
              {isAr ? 'بيانات الراكب الأساسية' : 'Passenger Account Details'}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone size={12} />
                  {isAr ? 'رقم الهاتف:' : 'Phone Number:'}
                </span>
                <span className="font-mono font-bold">{passenger.phoneNumber || '—'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  {isAr ? 'الدور (Role):' : 'Account Role:'}
                </span>
                <span className="font-mono font-bold uppercase">{passenger.role || '—'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Activity size={12} />
                  {isAr ? 'حالة الحساب (Status):' : 'Account Status:'}
                </span>
                <span className="font-mono font-bold">{passenger.status || '—'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {isAr ? 'تاريخ التسجيل:' : 'Registration Date:'}
                </span>
                <span className="font-mono font-bold">
                  {passenger.createdAt ? new Date(passenger.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Riding Activity & Statistics Grid */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Star size={14} className="text-purple-500" />
              {isAr ? 'إحصائيات الرحلات والإنفاق' : 'Trip Metrics & Financial Summary'}
            </h4>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'إجمالي الرحلات' : 'Total Trips'}</span>
                <span className="font-mono font-bold text-gray-400">{passenger.totalTrips ?? '—'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'إجمالي الإنفاق' : 'Total Spend'}</span>
                <span className="font-mono font-bold text-gray-400">{passenger.totalSpend ?? '—'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'التقييم' : 'Rating'}</span>
                <span className="font-mono font-bold text-gray-400">{passenger.rating ? `${passenger.rating} ⭐` : '—'}</span>
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
