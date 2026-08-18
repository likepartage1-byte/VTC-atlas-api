/**
 * Yalla VTC - Centralized Pricing Engine
 * 
 * Category Pricing Rules Architecture:
 * 1. Category KM Rate (سعر الكيلومتر الخاص بالفئة - 100m = 10% of KM Rate)
 * 2. Yalla App Markup (+10% Application Fee)
 * 3. Category Minimum Fare (الحد الأدنى لا يُكسر أبداً - Base Fare = MAX(Calculated, CategoryMinimum))
 * 4. Negotiation Range (-10% to +10% around Base Fare, Floor NEVER below Category Minimum)
 */

export type ServiceCategoryKey = 'MOTO' | 'ECO' | 'COURSE_PLUS' | 'TAXI' | 'CONFORT' | 'CARGO' | 'COMFORT';

export interface CategoryPricingConfig {
  nameAr: string;
  nameFr: string;
  kmRate: number;            // MAD per km (each 100m = 10% of kmRate)
  minimumFare: number;       // MAD (Category Minimum Base Fare - Never Broken)
  appMarkupPercent: number;  // Default 10 (+10%)
  negotiationPercent: number;// Default 10 (-10% to +10%)
}

export const PRICING_CONFIGS: Record<string, CategoryPricingConfig> = {
  MOTO: {
    nameAr: 'يلا موتور',
    nameFr: 'Yalla Moto',
    kmRate: 3.5,
    minimumFare: 8,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
  ECO: {
    nameAr: 'يلا إيكو',
    nameFr: 'Yalla Eco',
    kmRate: 5.0,
    minimumFare: 11,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
  COURSE_PLUS: {
    nameAr: 'يلا كورس+',
    nameFr: 'Yalla Course+',
    kmRate: 6.0,
    minimumFare: 13,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
  CARGO: {
    nameAr: 'يلا كورس+',
    nameFr: 'Yalla Course+',
    kmRate: 6.0,
    minimumFare: 13,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
  TAXI: {
    nameAr: 'يلا تكسي',
    nameFr: 'Yalla Taxi',
    kmRate: 5.5,
    minimumFare: 12,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
  CONFORT: {
    nameAr: 'يلا كونفورت',
    nameFr: 'Yalla Confort',
    kmRate: 6.5,
    minimumFare: 15,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
  COMFORT: {
    nameAr: 'يلا كونفورت',
    nameFr: 'Yalla Confort',
    kmRate: 6.5,
    minimumFare: 15,
    appMarkupPercent: 10,
    negotiationPercent: 10,
  },
};

export interface PricingCalculationResult {
  categoryKey: string;
  config: CategoryPricingConfig;
  distanceKm: number;
  roundedDistanceKm: number; // Rounded to 100m increments (0.1 km)
  rawCalculatedFare: number; // distance * kmRate
  baseFare: number;           // MAX(rawCalculatedFare, minimumFare)
  appMarkup: number;         // baseFare * 0.10
  displayedPrice: number;    // Math.round(baseFare * 1.10)
  minNegotiationFloor: number;// MAX(Math.round(baseFare * 0.90), minimumFare)
  maxNegotiationCeiling: number;// Math.round(baseFare * 1.10)
}

/**
 * Calculates complete pricing breakdown according to central Yalla VTC engine rules.
 * 
 * Example: 3.2 km Eco
 * - rawCalculated = 3.2 * 5 = 16.0 MAD
 * - baseFare = MAX(16.0, 11) = 16.0 MAD
 * - appMarkup = 16.0 * 0.10 = 1.60 MAD
 * - displayedPrice = 16.0 + 1.60 = 17.60 -> 18 MAD
 * - minNegotiationFloor = MAX(16 * 0.90, 11) = 14 MAD
 * - maxNegotiationCeiling = 18 MAD
 */
export function calculatePricing(
  categoryKey: ServiceCategoryKey | string,
  distanceKm: number
): PricingCalculationResult {
  const normalizedKey = (categoryKey || 'ECO').toUpperCase();
  const config = PRICING_CONFIGS[normalizedKey] || PRICING_CONFIGS.ECO;

  // Round distance to 100-meter increments (0.1 km)
  const roundedDistanceKm = Math.max(0.1, Math.ceil((distanceKm || 0.1) * 10) / 10);

  // 1. Raw Fare calculation
  const rawCalculatedFare = roundedDistanceKm * config.kmRate;

  // 2. Base Fare calculation enforcing Category Minimum Fare (Rule: Base Fare = MAX(Calculated, Minimum))
  const baseFare = Math.max(rawCalculatedFare, config.minimumFare);

  // 3. Yalla App +10% Markup
  const appMarkup = baseFare * (config.appMarkupPercent / 100);

  // 4. Passenger Display Price (Base Fare + 10% App Markup)
  const displayedPrice = Math.round(baseFare * (1 + config.appMarkupPercent / 100));

  // 5. Negotiation Range (-10% to +10% around Base Fare, Floor NEVER below Category Minimum)
  const rawMinFloor = Math.round(baseFare * (1 - config.negotiationPercent / 100));
  const minNegotiationFloor = Math.max(rawMinFloor, config.minimumFare);

  const maxNegotiationCeiling = Math.round(baseFare * (1 + config.negotiationPercent / 100));

  return {
    categoryKey: normalizedKey,
    config,
    distanceKm,
    roundedDistanceKm,
    rawCalculatedFare,
    baseFare,
    appMarkup,
    displayedPrice,
    minNegotiationFloor,
    maxNegotiationCeiling,
  };
}
