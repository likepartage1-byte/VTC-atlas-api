import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Search,
  X,
  Crosshair,
  User,
  Clock,
  Car
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../lib/api';

// Fix default marker icon issues in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  status: 'AVAILABLE' | 'BUSY' | 'ON_TRIP' | 'OFFLINE';
  fullName?: string;
  lastUpdate?: string;
}

export interface OperationsCenterProps {
  lang?: string;
}

// Helper component to center map on selected driver position smoothly
const MapFlyTo: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 15 }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

export const OperationsCenter: React.FC<OperationsCenterProps> = ({ lang = 'AR' }) => {
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'BUSY' | 'OFFLINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, 5000); // 5s poll interval for real-time telemetry
    return () => clearInterval(interval);
  }, []);

  const fetchLiveLocations = async () => {
    try {
      const response = await api.get('/admin/location/live');
      if (Array.isArray(response.data)) {
        setLocations(response.data);
      } else if (response.data && Array.isArray(response.data.drivers)) {
        setLocations(response.data.drivers);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Failed to fetch live driver telemetry locations', error);
    }
  };

  const statusColors = {
    AVAILABLE: '#10B981', // Emerald
    BUSY: '#F59E0B',      // Amber
    ON_TRIP: '#8B5CF6',   // Purple
    OFFLINE: '#64748B'    // Slate Gray
  };

  // Filter locations by status and search query
  const filteredLocations = locations.filter((loc) => {
    const matchesStatus = statusFilter === 'ALL' || loc.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (loc.fullName && loc.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (loc.driverId && loc.driverId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const availableCount = locations.filter((l) => l.status === 'AVAILABLE').length;
  const onTripCount = locations.filter((l) => l.status === 'ON_TRIP').length;
  const busyCount = locations.filter((l) => l.status === 'BUSY').length;

  const handleFocusDriver = (driver: DriverLocation) => {
    setSelectedDriver(driver);
    if (driver.lat && driver.lng) {
      setFlyToCenter([driver.lat, driver.lng]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-fadeIn">
      {/* Top Telemetry Summary & Filter Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
        {/* Real-time Status Counters */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{isAr ? 'الكل' : 'All Drivers'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">{locations.length}</span>
          </button>

          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? 'متوفـر' : 'Available'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20">{availableCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('ON_TRIP')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ON_TRIP'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
            }`}
          >
            <Activity size={12} />
            <span>{isAr ? 'في رحلة' : 'On Trip'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500/20">{onTripCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('BUSY')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'BUSY'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <Clock size={12} />
            <span>{isAr ? 'مشغـول' : 'Busy'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20">{busyCount}</span>
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
            placeholder={isAr ? 'تصفية باسم السائق...' : 'Filter driver name...'}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Command Center Layout Grid */}
      <div className="flex-1 flex gap-6 min-h-0 relative">
        {/* Map Viewport Container (Flex 3) */}
        <div className="flex-[3] relative rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-800 bg-slate-950">
          <MapContainer
            center={[31.6295, -7.9811]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            {flyToCenter && <MapFlyTo center={flyToCenter} zoom={16} />}

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredLocations.map((loc) => {
              const hasValidCoords = loc.lat && loc.lng;
              if (!hasValidCoords) return null;

              return (
                <Marker
                  key={loc.driverId}
                  position={[loc.lat, loc.lng]}
                  eventHandlers={{
                    click: () => handleFocusDriver(loc),
                  }}
                  icon={new L.DivIcon({
                    className: 'custom-driver-pin',
                    html: `<div style="background-color: ${statusColors[loc.status] || '#64748B'}; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 12px ${statusColors[loc.status] || '#64748B'}88;"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                  })}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-2 min-w-[160px] text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 font-bold flex items-center justify-center text-xs">
                          {loc.fullName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-tight">{loc.fullName || 'Unnamed Driver'}</p>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{loc.status}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFocusDriver(loc)}
                        className="w-full py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {isAr ? 'معاينة Telemetry' : 'Inspect Telemetry'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Live Telemetry Inspector Overlay Card */}
          {selectedDriver && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-6 lg:right-auto lg:w-96 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl animate-fadeIn space-y-4 text-gray-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">{selectedDriver.fullName || 'Unnamed Driver'}</h4>
                    <span className="text-[10px] font-mono text-gray-400">ID: {selectedDriver.driverId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold">{isAr ? 'حالة التغطية الحالية:' : 'Current Telemetry Status:'}</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase"
                  style={{
                    backgroundColor: `${statusColors[selectedDriver.status]}20`,
                    color: statusColors[selectedDriver.status],
                  }}
                >
                  {selectedDriver.status}
                </span>
              </div>

              {/* Exact Coordinates Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] text-gray-400 block font-mono">LATITUDE</span>
                  <span className="font-mono font-bold">{selectedDriver.lat ? selectedDriver.lat.toFixed(6) : '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] text-gray-400 block font-mono">LONGITUDE</span>
                  <span className="font-mono font-bold">{selectedDriver.lng ? selectedDriver.lng.toFixed(6) : '—'}</span>
                </div>
              </div>

              {/* Additional Contract Properties */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">{isAr ? 'آخر تحديث للموقع:' : 'Last Position Update:'}</span>
                  <span className="font-mono font-bold">
                    {selectedDriver.lastUpdate
                      ? new Date(selectedDriver.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{isAr ? 'السرعة المقاسة:' : 'Telemetry Speed:'}</span>
                  <span className="font-mono font-bold text-gray-400">—</span>
                </div>
              </div>

              {/* Focus Button */}
              <button
                onClick={() => {
                  if (selectedDriver.lat && selectedDriver.lng) {
                    setFlyToCenter([selectedDriver.lat, selectedDriver.lng]);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all"
              >
                <Crosshair size={14} />
                <span>{isAr ? 'تركيز الخريطة على السائق' : 'Focus on Driver'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Drivers Feed Panel (Flex 1) */}
        <div className="flex-1 min-w-[300px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm min-h-0">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-black text-sm tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
              <Navigation size={16} className="text-purple-600 dark:text-purple-400" />
              <span>{isAr ? 'تغذية السائقين المباشرة' : 'Live Driver Feed'}</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full">
              {filteredLocations.length}
            </span>
          </div>

          {/* Scrollable Drivers List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = selectedDriver?.driverId === loc.driverId;
                return (
                  <div
                    key={loc.driverId}
                    onClick={() => handleFocusDriver(loc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 shadow-sm'
                        : 'bg-gray-50/50 dark:bg-slate-950/50 border-gray-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center relative border border-gray-100 dark:border-slate-800">
                        <Car size={16} className="text-gray-500 dark:text-slate-400" />
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900"
                          style={{ backgroundColor: statusColors[loc.status] || '#64748B' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate text-gray-900 dark:text-slate-100">
                          {loc.fullName || 'Unnamed Driver'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {loc.lastUpdate
                            ? new Date(loc.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </p>
                      </div>
                      <button className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors">
                        <MapPin size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-12">
                <Activity className="animate-pulse opacity-40" size={28} />
                <p className="text-xs font-bold uppercase tracking-wider">{isAr ? 'لا يوجد سائقين نشطين حالياً' : 'No active drivers found'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
