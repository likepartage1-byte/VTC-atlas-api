import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Info,
  Search
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../lib/api';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  status: 'AVAILABLE' | 'BUSY' | 'ON_TRIP' | 'OFFLINE';
  fullName?: string;
  lastUpdate: string;
}

export const OperationsCenter: React.FC = () => {
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [mapCenter] = useState<[number, number]>([31.6295, -7.9811]); // Default to Marrakech

  useEffect(() => {
    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, 5000); // Poll every 5s for now
    return () => clearInterval(interval);
  }, []);

  const fetchLiveLocations = async () => {
    try {
      // Endpoint to be created/verified
      const response = await api.get('/admin/location/live');
      setLocations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch live locations", error);
    } finally {
      // Done fetching
    }
  };

  const statusColors = {
    AVAILABLE: '#10B981', // Emerald
    BUSY: '#F59E0B',      // Gold
    ON_TRIP: '#3B82F6',    // Blue
    OFFLINE: '#9CA3AF'     // Gray
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-700">
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Map Container */}
        <div className="flex-[3] relative rounded-3xl overflow-hidden premium-shadow bg-bg-card dark:border dark:border-gray-800">
          <div className="absolute top-4 left-4 z-[1000] flex gap-2">
             <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-black">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   {locations.filter(l => l.status === 'AVAILABLE').length} AVAILABLE
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black">
                   <Activity size={12} />
                   {locations.filter(l => l.status === 'ON_TRIP').length} ON TRIP
                </div>
             </div>
          </div>

          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc) => (
              <Marker 
                key={loc.driverId} 
                position={[loc.lat, loc.lng]}
                icon={new L.DivIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: ${statusColors[loc.status]}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px ${statusColors[loc.status]}55;"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              >
                <Popup className="premium-popup">
                  <div className="p-2 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs uppercase">
                        {loc.fullName?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="font-black text-sm">{loc.fullName || 'Driver'}</p>
                        <p className="text-[10px] text-text-muted">{loc.status}</p>
                      </div>
                    </div>
                    <button className="w-full py-1.5 bg-primary text-white text-[10px] font-black rounded-lg">VIEW DETAILS</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Ops */}
        <div className="flex-1 flex flex-col gap-6 min-w-[300px]">
           <div className="bg-bg-card rounded-3xl p-6 premium-shadow dark:border dark:border-gray-800 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black tracking-tight text-lg flex items-center gap-2">
                  <Navigation size={20} className="text-primary" />
                  Live Feed
                </h3>
                <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
                  <Search size={16} className="text-text-muted" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {locations.length > 0 ? locations.map((loc) => (
                  <div key={loc.driverId} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center relative">
                        <Car size={18} className="text-text-muted group-hover:text-primary transition-colors" />
                        <div 
                          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900" 
                          style={{ backgroundColor: statusColors[loc.status] }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{loc.fullName || 'Unknown Driver'}</p>
                        <p className="text-[10px] text-text-muted font-medium">Updated {new Date(loc.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white dark:hover:bg-gray-900 rounded-lg text-primary">
                        <MapPin size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
                     <Activity className="animate-pulse" size={32} />
                     <p className="text-sm font-bold opacity-50 uppercase tracking-widest">No active drivers</p>
                  </div>
                )}
              </div>
           </div>

           <div className="bg-primary rounded-3xl p-6 text-white premium-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Info size={20} />
                <span className="font-bold">Optimization Tip</span>
              </div>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                High demand detected in <b>Hivernage</b>. Redirect 4 idle drivers to improve pickup times.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

const Car = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);
