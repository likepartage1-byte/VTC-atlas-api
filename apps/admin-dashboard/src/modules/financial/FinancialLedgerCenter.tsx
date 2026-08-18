import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import api from '../../lib/api';
import { PayoutReviewModal } from './PayoutReviewModal';
import type { PendingWithdrawalItem } from './PayoutReviewModal';

export interface FinancialInsightsData {
  totalGrossVolume?: number;
  netCommissionRevenue?: number;
  pendingPayoutsCount?: number;
  totalWithdrawnAmount?: number;
}

export const FinancialLedgerCenter: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [insights, setInsights] = useState<FinancialInsightsData | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingWithdrawalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PendingWithdrawalItem | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Insights
      const insightsRes = await api.get('/admin/financial/insights').catch(() => null);
      if (insightsRes && insightsRes.data) {
        setInsights(insightsRes.data);
      }

      // 2. Fetch Pending Driver RIB Withdrawals
      const pendingRes = await api.get('/admin/withdrawals/pending').catch(() => null);
      if (pendingRes && Array.isArray(pendingRes.data)) {
        setPendingRequests(pendingRes.data);
      } else {
        setPendingRequests([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch financial ledger data', err);
      setError(err.response?.data?.message || 'Unable to load financial ledger data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'إجمالي حجم المعاملات' : 'Gross Volume'}</p>
              <h3 className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                {insights?.totalGrossVolume ? `${insights.totalGrossVolume} MAD` : '—'}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'صافي عمولة المنصة' : 'Net Commission'}</p>
              <h3 className="text-2xl font-extrabold mt-1 text-emerald-500">
                {insights?.netCommissionRevenue ? `${insights.netCommissionRevenue} MAD` : '—'}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'طلبات السحب المعلقة' : 'Pending Withdrawals'}</p>
              <h3 className="text-2xl font-extrabold mt-1 text-amber-500">
                {pendingRequests.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Table Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
              <Wallet className="text-purple-600 dark:text-purple-400" size={22} />
              {isAr ? 'طلبات سحب مستحقات السائقين (RIB Payout Requests)' : 'Pending Driver RIB Payout Requests'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
              {isAr
                ? 'مراجعة واعتماد التحويلات البنكية المستحقة لحسابات السائقين.'
                : 'Inspect and process driver balance withdrawal requests for bank transfer.'}
            </p>
          </div>

          <button
            onClick={fetchFinancialData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث السحوبات' : 'Refresh Queue')}
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchFinancialData}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pending Withdrawals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="pb-4 font-bold">{isAr ? 'اسم السائق' : 'Driver Name'}</th>
                <th className="pb-4 font-bold">{isAr ? 'رقم الهاتف' : 'Phone Number'}</th>
                <th className="pb-4 font-bold">{isAr ? 'المبلغ المطلوب' : 'Amount'}</th>
                <th className="pb-4 font-bold">{isAr ? 'تاريخ الطلب' : 'Request Date'}</th>
                <th className="pb-4 font-bold text-right">{isAr ? 'مراجعة التحويل' : 'Inspect Payout'}</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-purple-500" size={28} />
                      <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل قائمة السحوبات...' : 'Loading withdrawal queue...'}</span>
                    </div>
                  </td>
                </tr>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRequest(item)}
                    className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
                          {item.driver?.user?.fullName ? item.driver.user.fullName.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div>
                          <span className="block font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {item.driver?.user?.fullName || '—'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {item.driverId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs font-medium text-gray-600 dark:text-slate-300">
                      {item.driver?.user?.phoneNumber || '—'}
                    </td>
                    <td className="py-4 font-mono font-black text-purple-600 dark:text-purple-400 text-sm">
                      {item.amount ? `${item.amount} MAD` : '—'}
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                      >
                        <ShieldCheck size={14} />
                        <span>{isAr ? 'مراجعة التحويل' : 'Review Payout'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Wallet size={36} className="opacity-30 mb-1" />
                      <p className="font-bold text-sm">{isAr ? 'لا توجد طلبات سحب معلقة حالياً.' : 'No pending driver withdrawal requests.'}</p>
                      <p className="text-xs opacity-70">{isAr ? 'جميع المستحقات المالية تم تحويلها بالكامل.' : 'All driver balance payouts have been processed.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payout Review Modal */}
        <PayoutReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchFinancialData}
          lang={lang}
        />
      </div>
    </div>
  );
};
