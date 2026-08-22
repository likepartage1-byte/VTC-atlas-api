import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  Star,
  Activity,
  Award,
  Navigation,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { GrantDistanceBenefitModal } from './GrantDistanceBenefitModal';

export interface PassengerFleetItem {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  totalTrips?: number;
  totalSpend?: number;
  rating?: number;
}

export interface PassengerRideItem {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  fareMAD: number;
  status: string;
  requestedAt: string;
  originalDistanceKm: string;
  driverDisplayDistanceKm: string;
  passengerDisplayDistanceKm: string;
  driverBenefitMeters: number;
  passengerCreditMeters: number;
  benefitReason?: string;
  driverName?: string;
}

export interface PassengerProfileDrawerProps {
  passenger: PassengerFleetItem | null;
  onClose: () => void;
  lang?: string;
}

export const PassengerProfileDrawer: React.FC<PassengerProfileDrawerProps> = ({
  passenger,
  onClose,
  lang = 'AR',
}) => {
  if (!passenger) return null;

  const isAr = lang === 'AR';
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'RIDES'>('RIDES');
  const [rides, setRides] = useState<PassengerRideItem[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState<boolean>(false);
  const [selectedRideForBenefit, setSelectedRideForBenefit] = useState<PassengerRideItem | null>(null);

const MOCK_PASSENGER_RIDES: PassengerRideItem[] = [
  {
    id: 'ride-9901',
    serviceType: 'CITY_RIDE',
    originalDistanceKm: '10.00',
    driverBenefitMeters: 1000,
    passengerCreditMeters: 1000,
    driverDisplayDistanceKm: '9.00',
    passengerDisplayDistanceKm: '11.00',
    fareMAD: 60,
    pickupAddress: 'Gueliz, Marrakech',
    dropoffAddress: 'Jemaa el-Fnaa, Marrakech',
    status: 'COMPLETED',
    requestedAt: new Date().toISOString(),
  },
];

  const fetchPassengerRides = async () => {
    if (!passenger?.id) return;
    setIsLoadingRides(true);
    try {
      const response = await fetch(`/api/v1/admin/passengers/${passenger.id}/rides`).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setRides(data);
        } else {
          setRides(MOCK_PASSENGER_RIDES);
        }
      } else {
        setRides(MOCK_PASSENGER_RIDES);
      }
    } catch (_) {
      setRides(MOCK_PASSENGER_RIDES);
    } finally {
      setIsLoadingRides(false);
    }
  };

  useEffect(() => {
    fetchPassengerRides();
  }, [passenger?.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl text-gray-900 dark:text-white">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-base">
              {passenger.fullName ? passenger.fullName.charAt(0).toUpperCase() : <User size={22} />}
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">{passenger.fullName || '—'}</h3>
              <p className="text-xs text-gray-400 font-mono">Client ID: {passenger.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="px-6 border-b border-gray-100 dark:border-slate-800 flex gap-4 bg-slate-50/30 dark:bg-slate-950/30 text-xs font-bold">
          <button
            onClick={() => setActiveTab('RIDES')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'RIDES'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <Navigation size={14} />
            <span>{isAr ? `طلبات الرحلات (${rides.length})` : `Passenger Rides (${rides.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <User size={14} />
            <span>{isAr ? 'البيانات الأساسية والإحصائيات' : 'Account Details & Metrics'}</span>
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: RIDES TABLE & DISTANCE CREDIT CONTROL */}
          {activeTab === 'RIDES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Sliders size={14} className="text-purple-500" />
                  {isAr ? 'سجل طلبات الزبون ومزايا المسافة' : 'Passenger Ride History & Distance Credit'}
                </h4>
                <button
                  onClick={fetchPassengerRides}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={12} className={isLoadingRides ? 'animate-spin' : ''} />
                </button>
              </div>

              {isLoadingRides ? (
                <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
                  {isAr ? 'جاري تحميل رحلات الزبون...' : 'Loading passenger rides...'}
                </div>
              ) : rides.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                  {isAr ? 'لا توجد رحلات مسجلة لهذا الزبون حتى الآن.' : 'No ride requests found for this client.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {rides.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 space-y-3 hover:border-purple-500/30 transition-all"
                    >
                      {/* Ride Top Bar */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">ID: {r.id.substring(0, 8)}...</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase">
                            {r.serviceType}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(r.requestedAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Addresses */}
                      <div className="space-y-1 text-xs text-gray-600 dark:text-slate-300 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="truncate">{r.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span className="truncate">{r.dropoffAddress}</span>
                        </div>
                      </div>

                      {/* Presentation Distance Layer Metrics */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 text-[11px] font-mono">
                        <div>
                          <span className="text-[9px] text-gray-400 block">{isAr ? 'المسافة الأصلية' : 'Original Dist'}</span>
                          <span className="font-bold text-gray-400">{r.originalDistanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-emerald-400 block">{isAr ? 'عَرْض السائق' : 'Driver Visible'}</span>
                          <span className="font-bold text-emerald-400">{r.driverDisplayDistanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-indigo-400 block">{isAr ? 'عَرْض الزبون' : 'Passenger Visible'}</span>
                          <span className="font-bold text-indigo-400">{r.passengerDisplayDistanceKm} km</span>
                        </div>
                      </div>

                      {/* Ride Bottom Actions */}
                      <div className="flex justify-between items-center text-xs pt-1">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-emerald-500" />
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{r.fareMAD} MAD</span>
                          <span className="text-[10px] text-gray-400 font-bold">({isAr ? 'ثابت' : 'Fixed'})</span>
                        </div>

                        <button
                          onClick={() => setSelectedRideForBenefit(r)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-600 dark:text-purple-400 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                          <Award size={13} />
                          <span>{isAr ? 'إدارة Mizaje / Distance Benefit' : 'Manage Distance Benefit'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACCOUNT DETAILS & METRICS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-6">
              {/* Identity & Account Specs */}
              <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <User size={14} className="text-purple-500" />
                  {isAr ? 'بيانات الراكب الأساسية' : 'Passenger Account Details'}
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone size={12} />
                      {isAr ? 'رقم الهاتف:' : 'Phone Number:'}
                    </span>
                    <span className="font-mono font-bold">{passenger.phoneNumber || '—'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={12} />
                      {isAr ? 'الدور (Role):' : 'Account Role:'}
                    </span>
                    <span className="font-mono font-bold uppercase">{passenger.role || '—'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Activity size={12} />
                      {isAr ? 'حالة الحساب (Status):' : 'Account Status:'}
                    </span>
                    <span className="font-mono font-bold">{passenger.status || '—'}</span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {isAr ? 'تاريخ التسجيل:' : 'Registration Date:'}
                    </span>
                    <span className="font-mono font-bold">
                      {passenger.createdAt ? new Date(passenger.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Riding Activity & Statistics Grid */}
              <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Star size={14} className="text-purple-500" />
                  {isAr ? 'إحصائيات الرحلات والإنفاق' : 'Trip Metrics & Financial Summary'}
                </h4>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-gray-400 block">{isAr ? 'إجمالي الرحلات' : 'Total Trips'}</span>
                    <span className="font-mono font-bold text-purple-400">{passenger.totalTrips ?? rides.length}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-gray-400 block">{isAr ? 'إجمالي الإنفاق' : 'Total Spend'}</span>
                    <span className="font-mono font-bold text-emerald-400">{passenger.totalSpend ?? '—'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-gray-400 block">{isAr ? 'التقييم' : 'Rating'}</span>
                    <span className="font-mono font-bold text-amber-400">{passenger.rating ? `${passenger.rating} ⭐` : '5.0 ⭐'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-gray-800 dark:text-white"
          >
            {isAr ? 'إغلاق' : 'Close Drawer'}
          </button>
        </div>
      </div>

      {/* Distance Benefit Modal */}
      {selectedRideForBenefit && (
        <GrantDistanceBenefitModal
          ride={selectedRideForBenefit}
          onClose={() => setSelectedRideForBenefit(null)}
          onSuccess={() => {
            fetchPassengerRides();
          }}
          lang={lang}
        />
      )}
    </div>
  );
};
