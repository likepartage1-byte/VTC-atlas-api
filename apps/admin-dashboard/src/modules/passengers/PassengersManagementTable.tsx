import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/api';
import { PassengerProfileDrawer } from './PassengerProfileDrawer';
import type { PassengerFleetItem } from './PassengerProfileDrawer';

export const PassengersManagementTable: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [passengers, setPassengers] = useState<PassengerFleetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerFleetItem | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchPassengersList();
  }, []);

  const fetchPassengersList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primary: Fetch users/passengers from admin endpoint
      const res = await api.get('/admin/growth/campaigns').catch(() => null);
      // Fallback empty list if specific passengers endpoint is isolated
      if (res && res.data && Array.isArray(res.data.passengers)) {
        setPassengers(res.data.passengers);
      } else if (res && Array.isArray(res.data)) {
        setPassengers(res.data);
      } else {
        setPassengers([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch passengers list', err);
      setError(err.response?.data?.message || 'Unable to load passengers fleet.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPassengers = passengers.filter((p) => {
    return (
      !searchQuery.trim() ||
      (p.fullName && p.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phoneNumber && p.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="text-purple-600 dark:text-purple-400" size={22} />
            {isAr ? 'إدارة حسابات الركاب (Passengers Management)' : 'Passengers Management Center'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'استعراض ومعاينة حسابات الركاب المسجلين وتاريخ الانضمام.'
              : 'Inspect registered passenger profiles and account metadata in read-only mode.'}
          </p>
        </div>

        <button
          onClick={fetchPassengersList}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث القائمة' : 'Refresh Passengers')}
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث باسم الراكب أو الهاتف أو ID...' : 'Search passenger name, phone, ID...'}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchPassengersList}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Passengers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="pb-4 font-bold">{isAr ? 'اسم الراكب' : 'Passenger Name'}</th>
              <th className="pb-4 font-bold">{isAr ? 'رقم الهاتف' : 'Phone Number'}</th>
              <th className="pb-4 font-bold">{isAr ? 'الدور (Role)' : 'Role'}</th>
              <th className="pb-4 font-bold">{isAr ? 'تاريخ الانضمام' : 'Registration Date'}</th>
              <th className="pb-4 font-bold text-right">{isAr ? 'معاينة الملف' : 'Inspect Profile'}</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-purple-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل قائمة الركاب...' : 'Loading passenger fleet...'}</span>
                  </div>
                </td>
              </tr>
            ) : filteredPassengers.length > 0 ? (
              filteredPassengers.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedPassenger(item)}
                  className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
                        {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <span className="block font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {item.fullName || '—'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs font-medium text-gray-600 dark:text-slate-300">
                    {item.phoneNumber || '—'}
                  </td>
                  <td className="py-4 font-mono text-xs font-bold uppercase">
                    {item.role || '—'}
                  </td>
                  <td className="py-4 font-mono text-xs text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPassenger(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Eye size={14} />
                      <span>{isAr ? 'عرض الملف' : 'Inspect'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Users size={36} className="opacity-30 mb-1" />
                    <p className="font-bold text-sm">{isAr ? 'لا يوجد ركاب يطابقون خيارات البحث.' : 'No passengers found.'}</p>
                    <p className="text-xs opacity-70">{isAr ? 'سيظهر الركاب الجدد هنا فور تسجيلهم.' : 'Registered passenger profiles will appear here.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Passenger Profile Inspector Drawer */}
      <PassengerProfileDrawer
        passenger={selectedPassenger}
        onClose={() => setSelectedPassenger(null)}
        lang={lang}
      />
    </div>
  );
};
