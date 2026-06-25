import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface RouteEstimates {
  distanceText: string;
  distanceValue: number; // in meters
  durationText: string;
  durationValue: number; // in seconds
  polyline: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  /**
   * Fetches real distance, ETA, and polyline from Google Directions API (P2 Implementation)
   */
  async getEstimates(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteEstimates | null> {
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not found. Returning mock estimates.');
      return this.getMockEstimates();
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: this.apiKey,
          mode: 'driving',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google API Error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distanceText: leg.distance.text,
        distanceValue: leg.distance.value,
        durationText: leg.duration.text,
        durationValue: leg.duration.value,
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch estimates: ${error.message}`);
      return this.getMockEstimates();
    }
  }

  private getMockEstimates(): RouteEstimates {
    return {
      distanceText: '7.2 km',
      distanceValue: 7200,
      durationText: '14 min',
      durationValue: 840,
      polyline: '', // Empty in mock
    };
  }
}
