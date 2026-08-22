import React, { useState } from 'react';
import { X, Award, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface GrantDistanceBenefitModalProps {
  ride: {
    id: string;
    originalDistanceKm: string;
    driverBenefitMeters: number;
    passengerCreditMeters: number;
    fareMAD: number;
    pickupAddress?: string;
    dropoffAddress?: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  lang?: string;
}

export const GrantDistanceBenefitModal: React.FC<GrantDistanceBenefitModalProps> = ({
  ride,
  onClose,
  onSuccess,
  lang = 'AR',
}) => {
  if (!ride) return null;

  const isAr = lang === 'AR';
  const origKm = parseFloat(ride.originalDistanceKm || '10.00');

  // Input states in meters
  const [driverBenefit, setDriverBenefit] = useState<number>(ride.driverBenefitMeters || 1000);
  const [passengerCredit, setPassengerCredit] = useState<number>(ride.passengerCreditMeters || 1000);
  const [reason, setReason] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived live preview distances
  const driverBenefitKm = driverBenefit / 1000;
  const passengerCreditKm = passengerCredit / 1000;
  const newDriverDisplayKm = Math.max(0, origKm - driverBenefitKm).toFixed(2);
  const newPassengerDisplayKm = (origKm + passengerCreditKm).toFixed(2);

  const quickPresets = [
    { label: '1 m', meters: 1 },
    { label: '10 m', meters: 10 },
    { label: '100 m', meters: 100 },
    { label: '250 m', meters: 250 },
    { label: '500 m', meters: 500 },
    { label: '1 km', meters: 1000 },
  ];

  const handleApplyClick = () => {
    if (!reason.trim()) {
      setErrorMsg(isAr ? 'السبب إلزامي ولا يمكن ترك الحقل فارغاً' : 'Reason is mandatory and cannot be empty.');
      return;
    }
    setErrorMsg(null);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/v1/admin/rides/${ride.id}/distance-benefit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverBenefitMeters: driverBenefit,
          passengerCreditMeters: passengerCredit,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to apply Distance Benefit');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden text-gray-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">
                {isAr ? 'Distance Credit & Benefit Control' : 'Grant Distance Credit & Benefit'}
              </h3>
              <p className="text-xs text-gray-400 font-mono">Ride ID: {ride.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ride Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">{isAr ? 'المسافة الأصلية للرحلة:' : 'Original Distance:'}</span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">{origKm.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">{isAr ? 'سعر الراكب المثبت:' : 'Passenger Fixed Fare:'}</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{ride.fareMAD} MAD ({isAr ? 'غير ممسوس' : 'Unchanged'})</span>
            </div>
          </div>

          {/* Driver Distance Benefit Control */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
              {isAr ? '1. ميزة المسافة للسائق (Driver Benefit):' : '1. Driver Display Reduction (Benefit):'}
            </label>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-6 gap-2">
              {quickPresets.map((pt) => (
                <button
                  key={`dr-${pt.meters}`}
                  type="button"
                  onClick={() => setDriverBenefit(pt.meters)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    driverBenefit === pt.meters
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-600'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="1000"
                value={driverBenefit}
                onChange={(e) => setDriverBenefit(Math.max(0, Math.min(1000, Number(e.target.value))))}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-xs text-gray-400 font-mono">meters ({driverBenefitKm.toFixed(3)} km)</span>
            </div>
          </div>

          {/* Passenger Distance Credit Control */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
              {isAr ? '2. رصيد المسافة للزبون (Passenger Credit):' : '2. Passenger Display Bonus (Credit):'}
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-6 gap-2">
              {quickPresets.map((pt) => (
                <button
                  key={`ps-${pt.meters}`}
                  type="button"
                  onClick={() => setPassengerCredit(pt.meters)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    passengerCredit === pt.meters
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="1000"
                value={passengerCredit}
                onChange={(e) => setPassengerCredit(Math.max(0, Math.min(1000, Number(e.target.value))))}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-400 font-mono">meters ({passengerCreditKm.toFixed(3)} km)</span>
            </div>
          </div>

          {/* Mandatory Reason Input */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center justify-between">
              <span>{isAr ? 'سبب المنح / التعديل (إلزامي):' : 'Reason for Adjustment (Mandatory):'}</span>
              <span className="text-[10px] text-red-500 font-bold">* Required</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isAr ? 'مثال: Customer compensation / Loyalty reward' : 'e.g. Customer loyalty benefit / Service recovery'}
              className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Live Dual Presentation Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/10 via-indigo-900/10 to-slate-950 border border-purple-500/20 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <ShieldCheck size={14} />
              {isAr ? 'معاينة النتيجة الحية للمنظومة (Dual Presentation Preview)' : 'Live Dual Presentation Preview'}
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'ما يراه السائق (Driver Visible):' : 'Driver Visible Distance:'}</span>
                <span className="font-mono font-black text-sm text-emerald-400">{newDriverDisplayKm} km</span>
                <span className="text-[10px] text-gray-500 block">({origKm.toFixed(2)} - {driverBenefitKm.toFixed(2)} km)</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'ما يراه الزبون (Passenger Visible):' : 'Passenger Visible Distance:'}</span>
                <span className="font-mono font-black text-sm text-indigo-400">{newPassengerDisplayKm} km</span>
                <span className="text-[10px] text-gray-500 block">({origKm.toFixed(2)} + {passengerCreditKm.toFixed(2)} km)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono">
            {isAr ? 'سيتم تسجيل العملية بنجاح في سجل Audit Log غير القابل للتعديل' : 'Recorded in immutable Audit Log'}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-gray-800 dark:text-white"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleApplyClick}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <span>{isAr ? 'تطبيق الميزة' : 'Apply Benefit'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Confirmation Dialog Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center animate-fadeIn space-y-4">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-lg font-black">{isAr ? 'تأكيد تطبيق ميزة المسافة؟' : 'Confirm Granting Distance Benefit?'}</h4>
            
            <div className="text-xs text-gray-300 max-w-md space-y-2 bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono">
              <div className="flex justify-between">
                <span>Original Distance:</span>
                <span className="font-bold">{origKm.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>New Driver Visible:</span>
                <span className="font-bold">{newDriverDisplayKm} km (-{driverBenefitKm.toFixed(2)} km)</span>
              </div>
              <div className="flex justify-between text-indigo-400">
                <span>New Passenger Visible:</span>
                <span className="font-bold">{newPassengerDisplayKm} km (+{passengerCreditKm.toFixed(2)} km)</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Passenger Fare:</span>
                <span className="font-bold">{ride.fareMAD} MAD (Unchanged)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-left text-gray-400">
                <span>Reason: {reason}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                {isAr ? 'تراجع' : 'Back'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>{isAr ? 'جاري الحفظ...' : 'Submitting...'}</span>
                ) : (
                  <span>{isAr ? 'تأكيد وحفظ' : 'Confirm & Apply'}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
