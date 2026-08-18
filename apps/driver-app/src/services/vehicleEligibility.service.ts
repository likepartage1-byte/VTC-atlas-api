export interface VehicleData {
  category: 'CAR' | 'MOTORCYCLE' | 'TAXI' | 'TRUCK';
  make: string;               // Brand e.g. Dacia, Renault, Peugeot, Toyota
  model: string;              // Model e.g. Logan, Clio, 301, Corolla
  year: number;               // Manufacture Year e.g. 2024
  plateNumber?: string;
  color?: string;
  hasAirConditioning: boolean;// Climatisation
  acWorkingStatus?: 'EXCELLENT' | 'GOOD' | 'NEEDS_SERVICE' | 'NONE';
  numberOfSeats?: number;
  trunkCapacity?: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export type EligibleTier = 'Yalla Eco' | 'Yalla Course+' | 'Yalla Confort' | 'Yalla Moto' | 'Yalla Taxi' | 'Freight Cargo';

export interface TierBadgeInfo {
  name: EligibleTier;
  isGranted: boolean;
  reason: string;
}

export interface VehicleEligibilityResult {
  vehicleAge: number;
  isEligible: boolean;
  eligibleTiers: EligibleTier[];
  primaryTier: EligibleTier;
  rejectionReasons: string[];
  tierBadges: TierBadgeInfo[];
}

/**
 * Automated Vehicle Eligibility & Tier Classification Engine
 * Evaluates vehicle age, specs, climatisation, and type according to Yalla VTC rules.
 * 
 * Rules Matrix:
 * - Yalla Confort: Age <= 5 years (Year >= 2021), Working Climatisation, High-comfort car.
 *   Qualifies for: [Yalla Confort, Yalla Course+, Yalla Eco]
 * - Yalla Course+: Age <= 8 years (Year >= 2018), Climatisation present.
 *   Qualifies for: [Yalla Course+, Yalla Eco]
 * - Yalla Eco: Standard car (Age <= 15 years).
 *   Qualifies for: [Yalla Eco]
 * - Yalla Moto: Motorcycle category.
 *   Qualifies for: [Yalla Moto] ONLY
 * - Yalla Taxi: Taxi category with official Agrément.
 *   Qualifies for: [Yalla Taxi] ONLY
 */
export const calculateVehicleEligibility = (vehicle: VehicleData): VehicleEligibilityResult => {
  const currentYear = new Date().getFullYear();
  const yearNum = Number(vehicle.year) || currentYear;
  const vehicleAge = Math.max(0, currentYear - yearNum);
  const eligibleTiers: EligibleTier[] = [];
  const rejectionReasons: string[] = [];

  // 1. MOTORCYCLE / MOTO
  if (vehicle.category === 'MOTORCYCLE') {
    eligibleTiers.push('Yalla Moto');
    return {
      vehicleAge,
      isEligible: true,
      eligibleTiers,
      primaryTier: 'Yalla Moto',
      rejectionReasons: [],
      tierBadges: [
        { name: 'Yalla Moto', isGranted: true, reason: 'مؤهلة لرحلات الدراجة النارية والطرود السريعة' },
      ],
    };
  }

  // 2. TAXI
  if (vehicle.category === 'TAXI') {
    eligibleTiers.push('Yalla Taxi');
    return {
      vehicleAge,
      isEligible: true,
      eligibleTiers,
      primaryTier: 'Yalla Taxi',
      rejectionReasons: [],
      tierBadges: [
        { name: 'Yalla Taxi', isGranted: true, reason: 'مؤهلة لرحلات التاكسي الحضرية المعتمدة' },
      ],
    };
  }

  // 3. FREIGHT / TRUCK
  if (vehicle.category === 'TRUCK') {
    eligibleTiers.push('Freight Cargo');
    return {
      vehicleAge,
      isEligible: true,
      eligibleTiers,
      primaryTier: 'Freight Cargo',
      rejectionReasons: [],
      tierBadges: [
        { name: 'Freight Cargo', isGranted: true, reason: 'مؤهلة لخدمات نقل البضائع والشحن' },
      ],
    };
  }

  // 4. CARS (VTC & TOURISM)
  if (vehicleAge > 15) {
    rejectionReasons.push(`عمر المركبة (${vehicleAge} سنة) يتجاوز 15 سنة المسموح بها لقوانين النقل VTC`);
    return {
      vehicleAge,
      isEligible: false,
      eligibleTiers: [],
      primaryTier: 'Yalla Eco',
      rejectionReasons,
      tierBadges: [
        { name: 'Yalla Confort', isGranted: false, reason: 'يتطلب عمر المركبة 5 سنوات أو أقل مع تكييف يعمل' },
        { name: 'Yalla Course+', isGranted: false, reason: 'يتطلب عمر المركبة 8 سنوات أو أقل' },
        { name: 'Yalla Eco', isGranted: false, reason: 'يتطلب عمر المركبة أقل من 15 سنة' },
      ],
    };
  }

  // Air conditioning verification
  const isAcOk = vehicle.hasAirConditioning && (vehicle.acWorkingStatus === 'EXCELLENT' || vehicle.acWorkingStatus === 'GOOD' || !vehicle.acWorkingStatus);

  // A. Yalla Confort Qualification: Year >= 2017 & AC Present & AC Working Status === 'EXCELLENT'
  const isConfortEligible =
    yearNum >= 2017 &&
    vehicle.hasAirConditioning &&
    vehicle.acWorkingStatus === 'EXCELLENT';

  // B. Yalla Course+ Qualification: Year >= 2015 & AC Present & AC Working Status === 'EXCELLENT'
  const isCoursePlusEligible =
    yearNum >= 2015 &&
    vehicle.hasAirConditioning &&
    vehicle.acWorkingStatus === 'EXCELLENT';

  // C. Yalla Eco Qualification: Age <= 15 years
  const isEcoEligible = vehicleAge <= 15;

  // Cascading qualification hierarchy
  if (isConfortEligible) {
    eligibleTiers.push('Yalla Confort', 'Yalla Course+', 'Yalla Eco');
  } else if (isCoursePlusEligible) {
    eligibleTiers.push('Yalla Course+', 'Yalla Eco');
  } else if (isEcoEligible) {
    eligibleTiers.push('Yalla Eco');
  }

  return {
    vehicleAge,
    isEligible: eligibleTiers.length > 0,
    eligibleTiers,
    primaryTier: eligibleTiers[0] || 'Yalla Eco',
    rejectionReasons: [],
    tierBadges: [
      {
        name: 'Yalla Confort',
        isGranted: isConfortEligible,
        reason: isConfortEligible
          ? `مؤهلة للفئة المريحة (سنة الصنع ${yearNum} >= 2017 وتكييف ممتاز ❄️)`
          : `تتطلب سنة صنع حديثة ابتداءً من 2017 وتكييف يعمل بجودة ممتازة ❄️`,
      },
      {
        name: 'Yalla Course+',
        isGranted: isCoursePlusEligible,
        reason: isCoursePlusEligible
          ? `مؤهلة لطلبات الفئة الممتازة (سنة الصنع ${yearNum} >= 2015 وتكييف ممتاز ❄️)`
          : `تتطلب سنة صنع 2015 أو أحدث وتكييف متوفر بحالة ممتازة ❄️`,
      },
      {
        name: 'Yalla Eco',
        isGranted: isEcoEligible,
        reason: 'مؤهلة لجميع طلبات الفئة الاقتصادية العادية',
      },
    ],
  };
};
