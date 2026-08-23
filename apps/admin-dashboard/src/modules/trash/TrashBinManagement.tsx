import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Users,
  Car,
  CheckSquare,
  Square,
  AlertCircle,
  Flame,
} from 'lucide-react';
import api from '../../lib/api';

export const TrashBinManagement: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [activeTab, setActiveTab] = useState<'PASSENGERS' | 'DRIVERS'>('PASSENGERS');
  const [trashItems, setTrashItems] = useState<{
    passengers: any[];
    drivers: any[];
    totalCount: number;
  }>({ passengers: [], drivers: [], totalCount: 0 });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Confirmation modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'RESTORE' | 'PERMANENT_DELETE' | 'EMPTY_TRASH' | null;
  }>({ isOpen: false, type: null });

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const fetchTrashItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/trash');
      if (res && res.data) {
        setTrashItems({
          passengers: Array.isArray(res.data.passengers) ? res.data.passengers : [],
          drivers: Array.isArray(res.data.drivers) ? res.data.drivers : [],
          totalCount: res.data.totalCount || 0,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch trash items', err);
      setError(err.response?.data?.message || 'Unable to load trash bin items.');
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  const currentList = activeTab === 'PASSENGERS' ? trashItems.passengers : trashItems.drivers;

  const isAllSelected =
    currentList.length > 0 && currentList.every((item) => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentList.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExecuteModalAction = async () => {
    if (!modalState.type) return;
    setActionLoading(true);
    setError(null);
    try {
      if (modalState.type === 'RESTORE' && selectedIds.length > 0) {
        await api.post('/admin/users/bulk-restore', { userIds: selectedIds });
      } else if (modalState.type === 'PERMANENT_DELETE' && selectedIds.length > 0) {
        await api.delete('/admin/trash/permanent', { data: { userIds: selectedIds } });
      } else if (modalState.type === 'EMPTY_TRASH') {
        await api.delete('/admin/trash/empty');
      }
      setModalState({ isOpen: false, type: null });
      fetchTrashItems();
    } catch (err: any) {
      console.error('Trash action failed', err);
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 text-gray-900 dark:text-white">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 size={22} />
            {isAr ? 'سلة المهملات (Trash Bin Management)' : 'Trash Bin Management'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'معاينة الحسابات المتواجدة في سلة المهملات، إمكانية الاسترجاع، والحذف النهائي الآمن مع حماية سجل الرحلات.'
              : 'Review trashed profiles, restore previous account state, or permanently anonymize PII safely.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {trashItems.totalCount > 0 && (
            <button
              onClick={() => setModalState({ isOpen: true, type: 'EMPTY_TRASH' })}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20 transition-all active:scale-[0.98]"
            >
              <Flame size={15} />
              <span>{isAr ? '🧹 تنظيف السلة بالكامل' : 'Empty Trash Bin'}</span>
            </button>
          )}

          <button
            onClick={fetchTrashItems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all border border-gray-200 dark:border-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث السلة' : 'Refresh Trash')}
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('PASSENGERS');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'PASSENGERS'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users size={15} />
            <span>{isAr ? 'الركاب في السلة' : 'Trashed Passengers'} ({trashItems.passengers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('DRIVERS');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'DRIVERS'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <Car size={15} />
            <span>{isAr ? 'السائقون في السلة' : 'Trashed Drivers'} ({trashItems.drivers.length})</span>
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in duration-200">
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              {isAr ? `محدد: ${selectedIds.length}` : `Selected: ${selectedIds.length}`}
            </span>

            <button
              onClick={() => setModalState({ isOpen: true, type: 'RESTORE' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <RotateCcw size={14} />
              <span>{isAr ? '🔄 استرجاع' : 'Restore'}</span>
            </button>

            <button
              onClick={() => setModalState({ isOpen: true, type: 'PERMANENT_DELETE' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <Flame size={14} />
              <span>{isAr ? '💥 حذف نهائي' : 'Permanent Delete'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchTrashItems} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Retry
          </button>
        </div>
      )}

      {/* Trash Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-400 dark:text-slate-400 text-[11px] uppercase font-mono tracking-widest border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-purple-600 transition-colors">
                  {isAllSelected ? <CheckSquare size={16} className="text-purple-600" /> : <Square size={16} />}
                </button>
              </th>
              <th className="py-3">{isAr ? 'المستخدم' : 'User'}</th>
              <th className="py-3">{isAr ? 'الهاتف' : 'Phone'}</th>
              <th className="py-3">{isAr ? 'الحالة السابقة' : 'Deleted From'}</th>
              <th className="py-3">{isAr ? 'تاريخ الحذف' : 'Deleted At'}</th>
              <th className="py-3 text-right">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-purple-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري قراءة سلة المهملات...' : 'Loading trash items...'}</span>
                  </div>
                </td>
              </tr>
            ) : currentList.length > 0 ? (
              currentList.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-purple-50/80 dark:bg-slate-800/80' : ''
                    }`}
                  >
                    <td className="py-4 px-3 text-center" onClick={(e) => toggleSelectItem(item.id, e)}>
                      <button className="text-gray-400 hover:text-purple-600 transition-colors">
                        {isSelected ? <CheckSquare size={16} className="text-purple-600" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="py-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 font-black flex items-center justify-center text-xs">
                          {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900 dark:text-white">
                            {item.fullName || 'Unnamed'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs font-medium text-gray-600 dark:text-slate-300">
                      {item.phoneNumber || '—'}
                    </td>
                    <td className="py-4 font-mono text-xs font-bold text-amber-500">
                      {item.deletedFromStatus || 'ACTIVE'}
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-500">
                      {item.deletedAt ? new Date(item.deletedAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedIds([item.id]);
                            setModalState({ isOpen: true, type: 'RESTORE' });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-xl font-bold text-xs transition-colors"
                        >
                          <RotateCcw size={13} />
                          <span>{isAr ? 'استرجاع' : 'Restore'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedIds([item.id]);
                            setModalState({ isOpen: true, type: 'PERMANENT_DELETE' });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 rounded-xl font-bold text-xs transition-colors"
                        >
                          <Flame size={13} />
                          <span>{isAr ? 'حذف نهائي' : 'Permanent'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Trash2 size={36} className="opacity-30 mb-1" />
                    <p className="font-bold text-sm">{isAr ? 'سلة المهملات فارغة حالياً.' : 'Trash bin is empty.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modals */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <ShieldAlert size={28} />
              <h4 className="text-lg font-black tracking-tight">
                {modalState.type === 'RESTORE'
                  ? (isAr ? 'تأكيد استرجاع الحسابات' : 'Confirm Account Restoration')
                  : modalState.type === 'PERMANENT_DELETE'
                  ? (isAr ? '⚠️ تأكيد الحذف النهائي الشامل (PII Anonymization)' : '⚠️ Confirm Permanent PII Anonymization')
                  : (isAr ? '🧹 تأكيد تنظيف سلة المهملات بالكامل' : 'Confirm Empty Trash Bin')}
              </h4>
            </div>

            <p className="text-xs font-semibold text-gray-600 dark:text-slate-300 leading-relaxed">
              {modalState.type === 'RESTORE'
                ? (isAr
                    ? `سيتم استرجاع ${selectedIds.length} حسابات من سلة المهملات وإعادتها لحالتها الكاملة السابقة. الحسابات تستطيع العمل وتسجيل الدخول مجدداً.`
                    : `Restore ${selectedIds.length} accounts to their previous active state. Users will be able to log in again.`)
                : modalState.type === 'PERMANENT_DELETE'
                ? (isAr
                    ? `⚠️ تحذير: سيتم إخفاء وتشفير البيانات الشخصية (الاسم، الهاتف، البريد) نهائياً لـ ${selectedIds.length} حسابات. رقم الهاتف الأصلي سيصبح متاحاً لإعادة التسجيل والنقر من جديد. تاريخ الرحلات والسجلات المالية التراكمية سيبقى محفوظاً للامتثال المحاسبي ولن يُحذف.`
                    : `⚠️ Warning: Personal PII (name, phone, email) for ${selectedIds.length} accounts will be anonymized. Phone numbers will be released for fresh re-registration. Historical ride & financial records will be preserved.`)
                : (isAr
                    ? `⚠️ تحذير شديد: سيتم تنظيف جميع العناصر الموجودة في سلة المهملات وتشفير بياناتها الشخصية نهائياً. الرحلات والسجلات المالية التراكمية ستكون محفوظة ومحمية.`
                    : `⚠️ Severe Warning: All items in the trash bin will be permanently anonymized. Ride & financial histories will be preserved.`)}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setModalState({ isOpen: false, type: null })}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                onClick={handleExecuteModalAction}
                disabled={actionLoading}
                className={`px-5 py-2 text-white rounded-xl font-bold text-xs shadow-md transition-all ${
                  modalState.type === 'RESTORE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {actionLoading
                  ? (isAr ? 'جاري التنفيذ...' : 'Processing...')
                  : modalState.type === 'RESTORE'
                  ? (isAr ? '🔄 استرجاع الحسابات' : 'Restore Accounts')
                  : (isAr ? '💥 تنفيذ الحذف النهائي' : 'Permanent Anonymize')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
