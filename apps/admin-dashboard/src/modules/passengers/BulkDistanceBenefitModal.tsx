import React, { useState, useEffect } from 'react';
import { X, Users, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Check, Zap, Power } from 'lucide-react';
import api from '../../lib/api';

export interface BulkDistanceBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: string;
  affectedCount?: number;
}

const getBulkModalTranslations = (lang: string = 'AR') => {
  const isFr = lang === 'FR';
  const isEs = lang === 'ES';
  const isEn = lang === 'EN';

  return {
    title: isFr ? 'Activer l’avantage de distance pour TOUS les passagers'
         : isEs ? 'Activar beneficio de distancia para TODOS los pasajeros'
         : isEn ? 'Activate Distance Benefit for All Passengers'
         : 'تفعيل ميزة المسافة لجميع الركاب (Bulk Distance Benefit)',
    targetPassengers: isFr ? '👥 Passagers ciblés :' : isEs ? '👥 Pasajeros objetivo:' : isEn ? '👥 Target Passengers:' : '👥 الركاب المستهدفون:',
    driverBenefitLabel: isFr ? 'Réduction de distance chauffeur (Driver Benefit) :' : isEs ? 'Reducción de distancia para el conductor:' : isEn ? 'Driver Distance Adjustment (Benefit):' : 'تعديل مسافة السائق (Driver Distance Adjustment):',
    passengerCreditLabel: isFr ? 'Bonus de distance passager (Passenger Credit) :' : isEs ? 'Bonus de distancia para el pasajero:' : isEn ? 'Passenger Distance Adjustment (Credit):' : 'تعديل مسافة الزبون (Passenger Distance Adjustment):',
    reasonLabel: isFr ? 'Motif de l’activation globale (Obligatoire) :' : isEs ? 'Motivo de la activación global (Obligatorio):' : isEn ? 'Reason for Bulk Activation (Mandatory):' : 'سبب التفعيل الجماعي (إلزامي):',
    reasonPlaceholder: isFr ? 'ex. Promotion nationale d’été / Programme de fidélité' : isEs ? 'ej. Promoción nacional de verano / Programa de fidelización' : isEn ? 'e.g. National summer promotion / Loyalty program' : 'مثال: National loyalty promotion / Summer campaign',
    mandatoryRequired: isFr ? '* Obligatoire' : isEs ? '* Obligatorio' : isEn ? '* Required' : '* إلزامي',
    mandatoryError: isFr ? 'Le motif est obligatoire et ne peut pas être vide.'
                   : isEs ? 'El motivo es obligatorio y no puede estar vacío.'
                   : isEn ? 'Reason is mandatory and cannot be empty.'
                   : 'السبب إلزامي ولا يمكن ترك الحقل فارغاً',
    successToast: isFr ? '✅ Règle globale d’avantage de distance mise à jour avec succès !'
                 : isEs ? '✅ ¡Regla global de beneficio de distancia actualizada con éxito!'
                 : isEn ? '✅ Global Distance Benefit rule updated successfully!'
                 : '✅ تم تحديث ميزة المسافة الجماعية لجميع الركاب بنجاح!',
    previewTitle: isFr ? 'Aperçu en direct (Dual Presentation)' : isEs ? 'Vista previa en vivo (Dual Presentation)' : isEn ? 'Live Dual Presentation Preview' : 'معاينة النتيجة الحية للمنظومة (Dual Presentation Preview)',
    driverVisible: isFr ? 'Chauffeur voit :' : isEs ? 'El conductor ve:' : isEn ? 'Driver Sees:' : 'ما يراه السائق (Driver):',
    passengerVisible: isFr ? 'Passager voit :' : isEs ? 'El pasajero ve:' : isEn ? 'Passenger Sees:' : 'ما يراه الزبون (Passenger):',
    fareUnchanged: isFr ? 'Tarif : INCHANGÉ' : isEs ? 'Tarifa: SIN CAMBIOS' : isEn ? 'Fare: UNCHANGED' : 'السعر: غير ممسوس',
    statusActive: isFr ? 'Statut : ACTIF' : isEs ? 'Estado: ACTIVO' : isEn ? 'Status: ACTIVE' : 'الحالة: مفتاح نشط',
    statusInactive: isFr ? 'Statut : INACTIF' : isEs ? 'Estado: INACTIVO' : isEn ? 'Status: INACTIVE' : 'الحالة: غير نشط',
    toggleEnable: isFr ? '● Activé' : isEs ? '● Activado' : isEn ? '● Enabled' : '● مفعل',
    toggleDisable: isFr ? '○ Désactivé' : isEs ? '○ Desactivado' : isEn ? '○ Disabled' : '○ معطل',
    applyBtn: isFr ? 'Confirmer l’activation' : isEs ? 'Confirmar activación' : isEn ? 'Confirm Activation' : 'تأكيد التفعيل الجماعي',
    cancelBtn: isFr ? 'Annuler' : isEs ? 'Cancelar' : isEn ? 'Cancel' : 'إلغاء',
    confirmTitle: isFr ? 'Confirmer l’activation globale pour tous les passagers ?' : isEs ? '¿Confirmar activación global para todos los pasajeros?' : isEn ? 'Confirm Bulk Activation for All Passengers?' : 'تأكيد تفعيل ميزة المسافة الجماعية لجميع الركاب؟',
    futureNotice: isFr ? 'Cette règle s’appliquera uniquement aux NOUVELLES courses. Les anciennes courses ne seront pas modifiées.' : isEs ? 'Esta regla se aplicará solo a NUEVOS viajes. Los viajes anteriores no cambiarán.' : isEn ? 'Applies ONLY to NEW future rides. Past rides are NOT modified.' : 'تنبيه: سيتم تطبيق هذه القاعدة على الرحلات الجديدة المستقبلية فقط. الرحلات السابقة لا تتغير.',
    backBtn: isFr ? 'Retour' : isEs ? 'Volver' : isEn ? 'Back' : 'تراجع',
    submitting: isFr ? 'Enregistrement...' : isEs ? 'Guardando...' : isEn ? 'Submitting...' : 'جاري التفعيل...',
    confirmBtn: isFr ? 'Oui, activer maintenant' : isEs ? 'Sí, activar ahora' : isEn ? 'Yes, Activate Now' : 'نعم، تطبيق الآن',
  };
};

export const BulkDistanceBenefitModal: React.FC<BulkDistanceBenefitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang = 'AR',
  affectedCount = 0,
}) => {
  if (!isOpen) return null;

  const t = getBulkModalTranslations(lang);

  const [enabled, setEnabled] = useState<boolean>(true);
  const [driverBenefit, setDriverBenefit] = useState<number>(1000);
  const [passengerCredit, setPassengerCredit] = useState<number>(1000);
  const [reason, setReason] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [targetPassengers, setTargetPassengers] = useState<number>(affectedCount || 0);

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch active bulk config from backend — show real errors, do NOT swallow silently
    const fetchConfig = async () => {
      try {
        const res = await api.get('/admin/passengers/bulk-distance-benefit/config');
        setBackendOnline(true);
        if (res && res.data) {
          if (res.data.enabled !== undefined) setEnabled(res.data.enabled);
          // Only override if backend has a non-zero value saved
          if (res.data.driverBenefitMeters > 0) setDriverBenefit(res.data.driverBenefitMeters);
          if (res.data.passengerCreditMeters > 0) setPassengerCredit(res.data.passengerCreditMeters);
          if (res.data.reason) setReason(res.data.reason);
          if (res.data.affectedPassengersCount) setTargetPassengers(res.data.affectedPassengersCount);
        }
      } catch (fetchErr: any) {
        setBackendOnline(false);
        // Surface the actual error — previously silently swallowed with .catch(() => null)
        const status = fetchErr?.response?.status;
        const msg = fetchErr?.response?.data?.message || fetchErr?.message || 'Unknown error';
        if (status === 401 || status === 403) {
          setErrorMsg(`Auth error (${status}): ${msg}`);
        } else if (!status) {
          setErrorMsg('⚠️ Backend unreachable — check that the server is running and VITE_API_URL is correct.');
        } else {
          setErrorMsg(`Backend error (${status}): ${msg}`);
        }
      }
    };
    fetchConfig();
  }, []);

  const origKm = 10.0;
  const driverBenefitKm = driverBenefit / 1000;
  const passengerCreditKm = passengerCredit / 1000;
  const newDriverDisplayKm = Math.max(0, origKm - driverBenefitKm).toFixed(3);
  const newPassengerDisplayKm = (origKm + passengerCreditKm).toFixed(3);

  const quickPresets = [
    { label: '1 m', meters: 1 },
    { label: '10 m', meters: 10 },
    { label: '100 m', meters: 100 },
    { label: '250 m', meters: 250 },
    { label: '500 m', meters: 500 },
    { label: '1 km', meters: 1000 },
  ];

  const handleApplyClick = () => {
    if (enabled && !reason.trim()) {
      setErrorMsg(t.mandatoryError);
      return;
    }
    setErrorMsg(null);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // ⚠️ REMOVED: .catch(() => null) — it silently swallowed backend errors
      // Now we let errors propagate so the admin sees the real failure reason
      const result = await api.post('/admin/passengers/bulk-distance-benefit', {
        enabled,
        driverBenefitMeters: driverBenefit,
        passengerCreditMeters: passengerCredit,
        reason: reason.trim() || 'Bulk Distance Benefit Rule',
      });

      console.log('[BulkBenefit] Saved successfully:', result.data);
      setShowConfirm(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      // Show the REAL error from server (auth, network, validation, etc.)
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      if (!status) {
        setErrorMsg('⚠️ Backend unreachable — الخادم غير متاح. تحقق من تشغيل Backend.');
      } else if (status === 401 || status === 403) {
        setErrorMsg(`Auth error (${status}): ${serverMsg}`);
      } else {
        setErrorMsg(`Server error (${status}): ${serverMsg}`);
      }
      console.error('[BulkBenefit] POST failed:', status, serverMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden text-gray-900 dark:text-white relative">
        
        {/* Success Toast Banner */}
        {showSuccessToast && (
          <div className="absolute top-4 left-4 right-4 z-30 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3 font-bold text-sm">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check size={20} />
              </div>
              <span>{t.successToast}</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-600/10 via-indigo-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg tracking-tight">
                {t.title}
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1.5 mt-0.5">
                <Users size={14} />
                <span>{t.targetPassengers} {targetPassengers}</span>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Backend Connectivity Status */}
          {backendOnline === false && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle size={15} className="shrink-0" />
              <span>⚠️ Backend offline — الخادم غير متصل على {import.meta.env.VITE_API_URL}. أي تفعيل لن يُحفظ حتى يعود الخادم للعمل.</span>
            </div>
          )}
          {backendOnline === true && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-semibold">
              <ShieldCheck size={15} className="shrink-0" />
              <span>✅ Backend متصل — سيتم حفظ الإعداد في قاعدة البيانات الحقيقية.</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Enable / Disable Global Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'}`}>
                <Power size={20} />
              </div>
              <div>
                <span className="font-black text-xs block">{enabled ? t.statusActive : t.statusInactive}</span>
                <span className="text-[10px] text-gray-400 font-mono">Future rides rule setting</span>
              </div>
            </div>

            <div className="flex bg-gray-200 dark:bg-slate-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setEnabled(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${enabled ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {t.toggleEnable}
              </button>
              <button
                type="button"
                onClick={() => setEnabled(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!enabled ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {t.toggleDisable}
              </button>
            </div>
          </div>

          {enabled && (
            <>
              {/* Driver Distance Adjustment */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
                  {t.driverBenefitLabel}
                </label>

                <div className="grid grid-cols-6 gap-2">
                  {quickPresets.map((pt) => (
                    <button
                      key={`b-db-${pt.meters}`}
                      type="button"
                      onClick={() => setDriverBenefit(pt.meters)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        driverBenefit === pt.meters
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-600'
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
                  <span className="text-xs text-gray-400 font-mono">meters (-{driverBenefitKm.toFixed(3)} km)</span>
                </div>
              </div>

              {/* Passenger Distance Adjustment */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
                  {t.passengerCreditLabel}
                </label>

                <div className="grid grid-cols-6 gap-2">
                  {quickPresets.map((pt) => (
                    <button
                      key={`b-ps-${pt.meters}`}
                      type="button"
                      onClick={() => setPassengerCredit(pt.meters)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        passengerCredit === pt.meters
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600'
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
                  <span className="text-xs text-gray-400 font-mono">meters (+{passengerCreditKm.toFixed(3)} km)</span>
                </div>
              </div>

              {/* Mandatory Reason Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{t.reasonLabel}</span>
                  <span className="text-[10px] text-red-500 font-bold">{t.mandatoryRequired}</span>
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Live Dual Presentation Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <ShieldCheck size={14} />
                    {t.previewTitle}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">{t.fareUnchanged}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-gray-400 block">{t.driverVisible}</span>
                    <span className="font-mono font-black text-sm text-emerald-400">{newDriverDisplayKm} km</span>
                    <span className="text-[10px] text-gray-400 block">(Original 10.00 - {driverBenefitKm.toFixed(2)} km)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-gray-400 block">{t.passengerVisible}</span>
                    <span className="font-mono font-black text-sm text-indigo-400">{newPassengerDisplayKm} km</span>
                    <span className="text-[10px] text-gray-400 block">(Original 10.00 + {passengerCreditKm.toFixed(2)} km)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono">
            Recorded in immutable Audit Log
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-gray-800 dark:text-white"
            >
              {t.cancelBtn}
            </button>
            <button
              onClick={handleApplyClick}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <span>{t.applyBtn}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Confirmation Dialog Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center animate-fadeIn space-y-4 text-white">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-base md:text-lg font-black">{t.confirmTitle}</h4>
            <p className="text-xs text-purple-300 max-w-sm">{t.futureNotice}</p>

            <div className="text-xs text-gray-300 max-w-md w-full space-y-2 bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-left">
              <div className="flex justify-between">
                <span>Rule Status:</span>
                <span className={`font-bold ${enabled ? 'text-emerald-400' : 'text-gray-400'}`}>{enabled ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Passengers:</span>
                <span className="font-bold">{targetPassengers}</span>
              </div>
              {enabled && (
                <>
                  <div className="flex justify-between text-emerald-400">
                    <span>Driver Adjustment:</span>
                    <span className="font-bold">-{driverBenefitKm.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span>Passenger Adjustment:</span>
                    <span className="font-bold">+{passengerCreditKm.toFixed(2)} km</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-amber-400">
                <span>Fare Calculation:</span>
                <span className="font-bold">UNCHANGED</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-gray-400">
                <span>Reason: {reason || 'Global Rule Toggle'}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-white"
              >
                {t.backBtn}
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>{t.submitting}</span>
                ) : (
                  <span>{t.confirmBtn}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
