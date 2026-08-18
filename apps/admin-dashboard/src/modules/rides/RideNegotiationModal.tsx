import React from 'react';
import {
  X,
  Navigation,
  MapPin,
  Clock,
  Key,
  User,
  Car
} from 'lucide-react';

export interface RideCenterItem {
  id: string;
  status: string;
  passengerId: string;
  passengerName?: string;
  driverId?: string;
  driverName?: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupAddress?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  dropoffAddress?: string;
  estimatedPrice?: number;
  verificationCode?: string;
  createdAt?: string;
  bids?: Array<{
    driverId: string;
    driverName?: string;
    bidPrice: number;
    createdAt?: string;
  }>;
}

export interface RideNegotiationModalProps {
  ride: RideCenterItem | null;
  onClose: () => void;
  lang?: string;
}

export const RideNegotiationModal: React.FC<RideNegotiationModalProps> = ({
  ride,
  onClose,
  lang = 'AR',
}) => {
  if (!ride) return null;

  const isAr = lang === 'AR';

  const statusColors: Record<string, string> = {
    REQUESTED: '#F59E0B',
    COUNTER_OFFERED: '#8B5CF6',
    ACCEPTED: '#3B82F6',
    IN_PROGRESS: '#6366F1',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
  };

  const statusBg = statusColors[ride.status] || '#64748B';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900 dark:text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Navigation size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">{isAr ? 'مفحّص تفاوض الرحلة (Ride Negotiation Inspector)' : 'Ride Negotiation Inspector'}</h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
                  style={{
                    backgroundColor: `${statusBg}20`,
                    color: statusBg,
                    borderColor: `${statusBg}40`,
                  }}
                >
                  {ride.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                Ride ID: {ride.id}
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Fare & Price Counter-Offer Summary */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isAr ? 'ملخص التفاوض والسعر المقترح' : 'Fare Negotiation Summary'}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'عرض الراكب الأساسي:' : 'Initial Offer:'}</span>
                <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">
                  {ride.estimatedPrice ? `${ride.estimatedPrice} MAD` : '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'كود التوثيق (OTP):' : 'Verification OTP:'}</span>
                <span className="font-mono font-black text-emerald-500 text-sm flex items-center gap-1">
                  <Key size={12} />
                  {ride.verificationCode || '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'تاريخ الإنشاء:' : 'Creation Time:'}</span>
                <span className="font-mono font-bold">
                  {ride.createdAt ? new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger & Driver Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5">
                <User size={14} className="text-purple-500" />
                {isAr ? 'بيانات الراكب' : 'Passenger Details'}
              </span>
              <div className="text-xs space-y-1">
                <p className="font-bold">{ride.passengerName || '—'}</p>
                <p className="font-mono text-gray-400 text-[10px]">ID: {ride.passengerId}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5">
                <Car size={14} className="text-purple-500" />
                {isAr ? 'بيانات السائق المعيّن' : 'Assigned Driver Details'}
              </span>
              <div className="text-xs space-y-1">
                <p className="font-bold">{ride.driverName || '—'}</p>
                <p className="font-mono text-gray-400 text-[10px]">{ride.driverId ? `ID: ${ride.driverId}` : (isAr ? 'لم يعيّن سائق بعد' : 'Unassigned')}</p>
              </div>
            </div>
          </div>

          {/* Pickup & Dropoff Route Details */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <MapPin size={14} className="text-purple-500" />
              {isAr ? 'مسار انطلاق ووصول الرحلة' : 'Pickup & Dropoff Route'}
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block">{isAr ? 'عنوان الانطلاق (Pickup):' : 'Pickup Location:'}</span>
                  <p className="font-bold">{ride.pickupAddress || '—'}</p>
                  <p className="font-mono text-[10px] text-gray-400">
                    {ride.pickupLat && ride.pickupLng ? `${ride.pickupLat.toFixed(5)}, ${ride.pickupLng.toFixed(5)}` : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block">{isAr ? 'عنوان الوصول (Destination):' : 'Dropoff Location:'}</span>
                  <p className="font-bold">{ride.dropoffAddress || '—'}</p>
                  <p className="font-mono text-[10px] text-gray-400">
                    {ride.dropoffLat && ride.dropoffLng ? `${ride.dropoffLat.toFixed(5)}, ${ride.dropoffLng.toFixed(5)}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Bids & Counter Proposals History (Strict Zero Fake Data) */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Clock size={14} className="text-purple-500" />
              {isAr ? 'سجل المزايدات والعروض المقابلة (Bidding History)' : 'Counter Bidding History'}
            </h4>

            {ride.bids && ride.bids.length > 0 ? (
              <div className="space-y-2">
                {ride.bids.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 text-xs">
                    <span className="font-bold">{b.driverName || `Driver ${b.driverId.slice(0, 6)}`}</span>
                    <span className="font-mono font-black text-purple-500">{b.bidPrice} MAD</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-medium py-2">
                {isAr ? 'سجل عروض المزايدة المقابلة غير مسجل لهذه الرحلة —' : 'Counter offer bidding history not available —'}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-gray-800 dark:text-white"
          >
            {isAr ? 'إغلاق النافذة' : 'Close Inspector'}
          </button>
        </div>
      </div>
    </div>
  );
};
