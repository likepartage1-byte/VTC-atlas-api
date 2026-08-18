import React, { useState } from 'react';
import {
  X,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import api from '../../lib/api';

export interface PendingWithdrawalItem {
  id: string;
  driverId: string;
  amount: number;
  bankDetails?: any;
  status: string;
  createdAt: string;
  driver?: {
    user?: {
      fullName?: string;
      phoneNumber?: string;
    };
  };
}

export interface PayoutReviewModalProps {
  request: PendingWithdrawalItem | null;
  onClose: () => void;
  onRefresh?: () => void;
  lang?: string;
}

export const PayoutReviewModal: React.FC<PayoutReviewModalProps> = ({
  request,
  onClose,
  onRefresh,
  lang = 'AR',
}) => {
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!request) return null;

  const isAr = lang === 'AR';

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/admin/withdrawals/${request.id}/approve`, {
        notes: notes.trim() || undefined,
      });
      setSuccess(isAr ? 'تم اعتماد تحويل الحساب البنكي للسائق بنجاح!' : 'Withdrawal payout approved successfully!');
      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to approve withdrawal request', err);
      setError(err.response?.data?.message || 'Failed to approve payout request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError(isAr ? 'يرجى كتابة سبب عدم قبول طلب السحب البنكي' : 'Rejection reason is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/admin/withdrawals/${request.id}/reject`, {
        reason: reason.trim(),
      });
      setSuccess(isAr ? 'تم رفض طلب السحب البنكي وإرجاع الرصيد بنجاح.' : 'Withdrawal payout rejected.');
      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to reject withdrawal request', err);
      setError(err.response?.data?.message || 'Failed to reject payout request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden text-gray-900 dark:text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">{isAr ? 'مراجعة طلب السحب البنكي (RIB)' : 'Inspect Driver RIB Payout'}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">Request ID: {request.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banners */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Driver & Payout Summary */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <span className="text-gray-400">{isAr ? 'اسم السائق:' : 'Driver Name:'}</span>
              <span className="font-bold">{request.driver?.user?.fullName || '—'}</span>
            </div>

            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <span className="text-gray-400">{isAr ? 'رقم الهاتف:' : 'Phone Number:'}</span>
              <span className="font-mono font-bold">{request.driver?.user?.phoneNumber || '—'}</span>
            </div>

            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <span className="text-gray-400">{isAr ? 'المبلغ المطلوب سحبه:' : 'Payout Amount:'}</span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">
                {request.amount ? `${request.amount} MAD` : '—'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">{isAr ? 'تاريخ الطلب:' : 'Requested Date:'}</span>
              <span className="font-mono font-bold">
                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>

          {/* Action Selector Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActionType('APPROVE');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                actionType === 'APPROVE'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck size={16} />
              <span>{isAr ? 'اعتماد التحويل (Approve Payout)' : 'Approve Payout'}</span>
            </button>

            <button
              onClick={() => {
                setActionType('REJECT');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                actionType === 'REJECT'
                  ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                  : 'bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-gray-100'
              }`}
            >
              <ShieldAlert size={16} />
              <span>{isAr ? 'رفض السحب (Reject Payout)' : 'Reject Payout'}</span>
            </button>
          </div>

          {/* Form Inputs */}
          {actionType === 'APPROVE' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400">
                {isAr ? 'ملاحظات الإدارة الاختيارية (Notes):' : 'Optional Admin Notes:'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? 'أدخل أي رقم مرجعي للتحويل البنكي...' : 'Enter RIB transaction reference notes...'}
                className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-red-500">
                {isAr ? 'سبب الرفض الإجباري (Mandatory Rejection Reason):' : 'Mandatory Rejection Reason:'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={isAr ? 'اكتب سبب رفض طلب السحب البنكي هنا...' : 'Enter mandatory rejection reason...'}
                rows={3}
                className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          {actionType === 'APPROVE' ? (
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              <span>{isAr ? 'تأكيد اعتماد السحب' : 'Confirm Payout Approval'}</span>
            </button>
          ) : (
            <button
              onClick={handleReject}
              disabled={isSubmitting || !reason.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{isAr ? 'تأكيد الرفض والإرجاع' : 'Confirm Payout Rejection'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
