import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  MapPin,
  Clock
} from 'lucide-react';
import api from '../../lib/api';
import { RideNegotiationModal } from './RideNegotiationModal';
import type { RideCenterItem } from './RideNegotiationModal';

export const RidesCenterTable: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [rides, setRides] = useState<RideCenterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedRide, setSelectedRide] = useState<RideCenterItem | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchRidesList();
  }, []);

  const fetchRidesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/passenger/rides/active').catch(() => null);
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          setRides(res.data);
        } else {
          setRides([res.data]);
        }
      } else {
        setRides([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch rides list', err);
      setError(err.response?.data?.message || 'Unable to load active rides center.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (r.id && r.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.passengerId && r.passengerId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.driverId && r.driverId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Navigation className="text-purple-600 dark:text-purple-400" size={22} />
            {isAr ? 'مركز الرحلات والمزايدات (Rides Center & Negotiation)' : 'Rides Center & Negotiation Inspector'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'مراقبة الرحلات والتفاوض المباشر وعروض الأسعار المقابلة بنمط InDrive.'
              : 'Inspect active dispatched rides, fare proposals, and counter bidding history.'}
          </p>
        </div>

        <button
          onClick={fetchRidesList}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث الرحلات' : 'Refresh Rides')}
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAr ? 'الكل' : 'All Rides'} ({rides.length})
          </button>

          <button
            onClick={() => setStatusFilter('REQUESTED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'REQUESTED'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isAr ? 'قيد الطلب' : 'Requested'}
          </button>

          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20'
            }`}
          >
            {isAr ? 'قيد التنفيذ' : 'In Progress'}
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث برقم الرحلة أو الراكب...' : 'Search Ride ID, Passenger...'}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Error Feedback Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRidesList}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Rides Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="pb-4 font-bold">{isAr ? 'معرف الرحلة' : 'Ride ID'}</th>
              <th className="pb-4 font-bold">{isAr ? 'حالة الرحلة' : 'Status'}</th>
              <th className="pb-4 font-bold">{isAr ? 'عنوان الانطلاق والوصول' : 'Route'}</th>
              <th className="pb-4 font-bold">{isAr ? 'السعر المقترح' : 'Fare'}</th>
              <th className="pb-4 font-bold text-right">{isAr ? 'معاينة التفاوض' : 'Inspect Bids'}</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-purple-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل الرحلات...' : 'Loading active rides...'}</span>
                  </div>
                </td>
              </tr>
            ) : filteredRides.length > 0 ? (
              filteredRides.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedRide(item)}
                  className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
                        <Navigation size={16} />
                      </div>
                      <div>
                        <span className="block font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-mono">
                          {item.id}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border bg-purple-500/10 border-purple-500/20 text-purple-500">
                      <Clock size={12} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-medium">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1 font-bold text-gray-800 dark:text-slate-200">
                        <MapPin size={12} className="text-emerald-500 shrink-0" />
                        <span className="truncate max-w-xs">{item.pickupAddress || '—'}</span>
                      </p>
                      <p className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                        <MapPin size={12} className="text-purple-500 shrink-0" />
                        <span className="truncate max-w-xs">{item.dropoffAddress || '—'}</span>
                      </p>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-black text-purple-600 dark:text-purple-400 text-sm">
                    {item.estimatedPrice ? `${item.estimatedPrice} MAD` : '—'}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRide(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Eye size={14} />
                      <span>{isAr ? 'معاينة العروض' : 'Inspect Bids'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Navigation size={36} className="opacity-30 mb-1" />
                    <p className="font-bold text-sm">{isAr ? 'لا توجد رحلات نشطة حالياً.' : 'No active rides currently.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ride Negotiation Inspector Modal */}
      <RideNegotiationModal
        ride={selectedRide}
        onClose={() => setSelectedRide(null)}
        lang={lang}
      />
    </div>
  );
};
