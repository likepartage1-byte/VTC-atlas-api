import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Car, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Eye
} from 'lucide-react';
import api from '../../lib/api';
import { DocumentInspectionModal } from './DocumentInspectionModal';
import type { DriverInspectionTarget } from './DocumentInspectionModal';

export const PendingVerificationsTable: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [items, setItems] = useState<DriverInspectionTarget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverInspectionTarget | null>(null);

  const isAr = lang === 'AR';

  const fetchPendingVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/verification/pending');
      // The backend returns { count: number, items: Array<Item> }
      if (response.data && Array.isArray(response.data.items)) {
        setItems(response.data.items);
      } else if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch pending driver verifications', err);
      setError(err.response?.data?.message || 'Unable to load pending driver verifications. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Car className="text-purple-600 dark:text-purple-400" size={22} />
            {isAr ? 'طلبـات توثيـق السائقين الجدد (KYC)' : 'Pending Driver Verifications'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'قائمة السائقين الذين قاموا برفع وثائقهم وينتظرون المعاينة الإدارية.'
              : 'Drivers with pending applications awaiting document inspection.'}
          </p>
        </div>

        <button
          onClick={fetchPendingVerifications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث القائمة' : 'Refresh List')}
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
            onClick={fetchPendingVerifications}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table / State Render */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="pb-4 font-bold">{isAr ? 'اسم السائق' : 'Driver Name'}</th>
              <th className="pb-4 font-bold">{isAr ? 'رقم الهاتف' : 'Phone Number'}</th>
              <th className="pb-4 font-bold">{isAr ? 'حالة التوثيق' : 'Verification Status'}</th>
              <th className="pb-4 font-bold">{isAr ? 'الوثائق الأساسية (3)' : 'Uploaded Docs'}</th>
              <th className="pb-4 font-bold text-right">{isAr ? 'آخر تحديث' : 'Last Updated'}</th>
              <th className="pb-4 font-bold text-right">{isAr ? 'إجراء المعاينة' : 'Inspection'}</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-purple-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل قائمة التوثيق...' : 'Loading pending queue...'}</span>
                  </div>
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => {
                const updatedDate = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—';
                const updatedTime = item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <tr
                    key={item.id || item.driverId}
                    onClick={() => setSelectedDriver(item)}
                    className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div>
                          <span className="block font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.name || 'Unnamed Driver'}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{item.driverId ? `ID: ${item.driverId.slice(0, 8)}...` : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs font-medium text-gray-600 dark:text-slate-300">{item.phone || 'N/A'}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        item.status === 'UNDER_REVIEW' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        item.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {item.status === 'APPROVED' ? <CheckCircle2 size={12} /> :
                         item.status === 'UNDER_REVIEW' ? <Clock size={12} /> :
                         item.status === 'REJECTED' ? <ShieldAlert size={12} /> :
                         <Clock size={12} />}
                        {item.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200">
                        <FileText size={14} className="text-gray-400" />
                        <span>{item.documentCount ?? 0} / 3 {isAr ? 'وثائق' : 'docs'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xs">{updatedDate}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{updatedTime}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDriver(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl font-bold text-xs transition-colors"
                      >
                        <Eye size={14} />
                        <span>{isAr ? 'معاينة الوثائق' : 'Inspect Docs'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Car size={36} className="opacity-30 mb-1" />
                    <p className="font-bold text-sm">{isAr ? 'لا يوجد سائقين في قائمة الانتظار حالياً.' : 'No pending driver verifications.'}</p>
                    <p className="text-xs opacity-70">{isAr ? 'جميع طلبات توثيق السائقين تم معالجتها بالكامل.' : 'All driver onboarding applications have been processed.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Driver Read-Only Document Inspection Modal */}
      {selectedDriver && (
        <DocumentInspectionModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onRefresh={fetchPendingVerifications}
          lang={lang}
        />
      )}
    </div>
  );
};
