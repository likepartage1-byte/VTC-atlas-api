import axios from 'axios';

export interface RouteResult {
  distanceKm: number;
  durationMins: number;
  coordinates: { latitude: number; longitude: number }[];
}

export interface GeocodedPlace {
  name: string;
  lat: number;
  lng: number;
}

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

export const routingService = {
  /** Calculate real driving route distance and duration using OSRM engine */
  calculateRoute: async (
    pickup: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteResult> => {
    try {
      const url = `${OSRM_BASE_URL}/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const response = await axios.get(url, { timeout: 6000 });

      if (response.data?.routes?.[0]) {
        const route = response.data.routes[0];
        const distanceMeters = route.distance || 0;
        const durationSeconds = route.duration || 0;

        const distanceKm = Math.max(1, Math.round((distanceMeters / 1000) * 10) / 10);
        const osrmDurationMins = Math.max(2, Math.round(durationSeconds / 60));

        // Realistic Urban Driving Traffic Model for Moroccan Cities (Marrakech)
        let baseMinutes = 0;
        if (distanceKm < 4) {
          // Short trips (< 4 km): Avg speed ~21 km/h + 1.0 min signals/startup
          baseMinutes = (distanceKm / 21) * 60 + 1.0;
        } else if (distanceKm <= 10) {
          // Medium trips (4 - 10 km): Avg speed ~30 km/h + 1.0 min roundabouts
          // e.g. 7.0 km -> (7 / 30) * 60 + 1.0 = 15 mins (Google Maps benchmark)
          baseMinutes = (distanceKm / 30) * 60 + 1.0;
        } else {
          // Long trips (> 10 km): Avg arterial speed ~35 km/h + 2.0 min major junctions
          // e.g. 15.0 km -> (15 / 35) * 60 + 2.0 = 27.7 -> 28 mins
          baseMinutes = (distanceKm / 35) * 60 + 2.0;
        }

        const urbanDurationMins = Math.ceil(baseMinutes);
        // Ensure ETA is never lower than OSRM raw duration
        const durationMins = Math.max(osrmDurationMins, urbanDurationMins);

        const coords = (route.geometry?.coordinates || []).map((pt: [number, number]) => ({
          longitude: pt[0],
          latitude: pt[1],
        }));

        return { distanceKm, durationMins, coordinates: coords };
      }
    } catch (err) {
      console.warn('[RoutingService] OSRM query failed, using Haversine fallback:', err);
    }

    // Haversine fallback if OSRM is offline
    const rad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = rad(destination.lat - pickup.lat);
    const dLon = rad(destination.lng - pickup.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(pickup.lat)) * Math.cos(rad(destination.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.max(1.5, Math.round(R * c * 1.3 * 10) / 10); // 1.3 road winding factor
    const dur = Math.round(dist * 2.5);

    return { distanceKm: dist, durationMins: dur, coordinates: [] };
  },

  /** Autocomplete search places in Morocco using OpenStreetMap Photon API */
  searchPlaces: async (query: string): Promise<GeocodedPlace[]> => {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=31.6258&lon=-7.9891&limit=5`;
      const response = await axios.get(url, { timeout: 4000 });
      const features = response.data?.features || [];

      return features.map((f: any) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [-7.9891, 31.6258];
        const lng = typeof coords[0] === 'number' && !isNaN(coords[0]) ? coords[0] : -7.9891;
        const lat = typeof coords[1] === 'number' && !isNaN(coords[1]) ? coords[1] : 31.6258;

        const nameParts = [props.name, props.street, props.city || props.town || props.state || 'Marrakech', 'Maroc'];
        const uniqueParts = Array.from(new Set(nameParts.filter(Boolean)));
        const name = uniqueParts.join(', ');

        return {
          name: name || query,
          lng,
          lat,
        };
      });
    } catch (err) {
      console.warn('[RoutingService] searchPlaces error:', err);
      return [];
    }
  },

  /** Reverse geocode lat/lng to human readable address */
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
      const response = await axios.get(url, { timeout: 4000 });
      const feature = response.data?.features?.[0];
      if (feature) {
        const props = feature.properties || {};
        const name = [props.name, props.street, props.city || props.town]
          .filter(Boolean)
          .join(', ');
        if (name) return name;
      }
    } catch (_) {}
    return `Point choisi (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  },
};
