import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  Star
} from 'lucide-react';
import api from '../../lib/api';
import { DriverProfileDrawer } from './DriverProfileDrawer';
import type { DriverFleetItem } from './DriverProfileDrawer';

export const DriversManagementTable: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [drivers, setDrivers] = useState<DriverFleetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'BUSY' | 'OFFLINE'>('ALL');
  const [selectedDriver, setSelectedDriver] = useState<DriverFleetItem | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchDriversFleet();
  }, []);

  const fetchDriversFleet = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primary: Fetch live location & status telemetry for driver fleet
      const res = await api.get('/admin/location/live');
      let fleetData: DriverFleetItem[] = [];
      if (Array.isArray(res.data)) {
        fleetData = res.data;
      } else if (res.data && Array.isArray(res.data.drivers)) {
        fleetData = res.data.drivers;
      }

      setDrivers(fleetData);
    } catch (err: any) {
      console.error('Failed to fetch drivers fleet data', err);
      setError(err.response?.data?.message || 'Unable to load drivers fleet. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesStatus = statusFilter === 'ALL' || driver.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (driver.fullName && driver.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (driver.phone && driver.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (driver.driverId && driver.driverId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const availableCount = drivers.filter((d) => d.status === 'AVAILABLE').length;
  const onTripCount = drivers.filter((d) => d.status === 'ON_TRIP').length;
  const busyCount = drivers.filter((d) => d.status === 'BUSY').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="text-purple-600 dark:text-purple-400" size={22} />
            {isAr ? 'إدارة أسطول السائقين (Fleet Management)' : 'Drivers Fleet Management'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'استعراض بيانات الأسطول والتغطية الجغرافية المباشرة وحالة السائقين.'
              : 'Browse active driver fleet, operational telemetry status, and profile details.'}
          </p>
        </div>

        <button
          onClick={fetchDriversFleet}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث البيانات' : 'Refresh Fleet')}
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAr ? 'الكل' : 'All Fleet'} ({drivers.length})
          </button>

          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            {isAr ? 'متوفـر' : 'Available'} ({availableCount})
          </button>

          <button
            onClick={() => setStatusFilter('ON_TRIP')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ON_TRIP'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
            }`}
          >
            {isAr ? 'في رحلة' : 'On Trip'} ({onTripCount})
          </button>

          <button
            onClick={() => setStatusFilter('BUSY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'BUSY'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isAr ? 'مشغـول' : 'Busy'} ({busyCount})
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث باسم السائق أو الهاتف...' : 'Search driver name, phone...'}
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
            onClick={fetchDriversFleet}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Drivers Fleet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="pb-4 font-bold">{isAr ? 'اسم السائق' : 'Driver Name'}</th>
              <th className="pb-4 font-bold">{isAr ? 'رقم الهاتف' : 'Phone Number'}</th>
              <th className="pb-4 font-bold">{isAr ? 'حالة التغطية' : 'Coverage Status'}</th>
              <th className="pb-4 font-bold">{isAr ? 'المصنّع والسيارة' : 'Vehicle'}</th>
              <th className="pb-4 font-bold">{isAr ? 'التقييم' : 'Rating'}</th>
              <th className="pb-4 font-bold text-right">{isAr ? 'معاينة الملف' : 'Inspect Profile'}</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-purple-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل الأسطول...' : 'Loading drivers fleet...'}</span>
                  </div>
                </td>
              </tr>
            ) : filteredDrivers.length > 0 ? (
              filteredDrivers.map((item) => (
                <tr
                  key={item.driverId}
                  onClick={() => setSelectedDriver(item)}
                  className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
                        {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <span className="block font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {item.fullName || 'Unnamed Driver'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {item.driverId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs font-medium text-gray-600 dark:text-slate-300">
                    {item.phone || '—'}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      item.status === 'AVAILABLE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      item.status === 'ON_TRIP' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                      item.status === 'BUSY' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                      {item.status === 'AVAILABLE' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200">
                      <Car size={14} className="text-gray-400" />
                      <span>{item.vehicleInfo?.make ? `${item.vehicleInfo.make} ${item.vehicleInfo.model || ''}` : '—'}</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-xs">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} className="fill-amber-500" />
                      <span>{item.rating ? item.rating.toFixed(1) : '—'}</span>
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
                      <span>{isAr ? 'عرض الملف' : 'Inspect'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Users size={36} className="opacity-30 mb-1" />
                    <p className="font-bold text-sm">{isAr ? 'لا يوجد سائقين يطابقون خيارات البحث.' : 'No drivers matching query.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Driver Profile Inspector Drawer */}
      <DriverProfileDrawer
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
        lang={lang}
      />
    </div>
  );
};
