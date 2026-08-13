import AsyncStorage from '@react-native-async-storage/async-storage';

export type DriverVerificationStep = 'VEHICLE' | 'DOCUMENTS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface DriverVerificationState {
  vehicleVerificationPercentage: number; // 0 to 100
  documentVerificationPercentage: number; // 0 to 100
  verificationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  isApproved: boolean;
  currentMissingStep: DriverVerificationStep;
}

/**
 * Evaluates real driver verification state from local storage & backend cache
 */
export const getDriverVerificationState = async (): Promise<DriverVerificationState> => {
  try {
    // 1. Vehicle Verification Check
    const vehicleCache = await AsyncStorage.getItem('@vehicle_info_local_cache');
    let vehiclePercentage = 0;
    if (vehicleCache) {
      const parsed = JSON.parse(vehicleCache);
      if (parsed && (parsed.make || parsed.model || parsed.plateNumber)) {
        vehiclePercentage = 100;
      }
    }

    // 2. Mandatory Basic Documents Verification Check (EXACTLY 3 basic required docs count for 100%)
    const mandatoryBasicDocKeys = [
      'driver_license',
      'national_id_or_passport',
      'vehicle_registration',
    ];

    const docKeyAliases: Record<string, string[]> = {
      'driver_license': [
        'driver_license',
        'DRIVER_LICENSE',
        'DRIVING_LICENSE',
        'license',
        'LICENSE'
      ],
      'national_id_or_passport': [
        'national_id_or_passport',
        'NATIONAL_ID_OR_PASSPORT',
        'IDENTITY_CARD',
        'PASSPORT',
        'CIN',
        'cin',
        'cin_recto',
        'cin_verso',
        'CIN_RECTO',
        'CIN_VERSO'
      ],
      'vehicle_registration': [
        'vehicle_registration',
        'VEHICLE_REGISTRATION',
        'CARTE_GRISE',
        'carte_grise',
        'vehicle_grey_card',
        'VEHICLE_GREY_CARD',
        'grey_card',
        'GREY_CARD',
        'REGISTRATION_CARD'
      ],
    };

    let uploadedCount = 0;
    for (const mainKey of mandatoryBasicDocKeys) {
      const aliases = docKeyAliases[mainKey] || [mainKey];
      let isUploaded = false;
      for (const aliasKey of aliases) {
        const stored = await AsyncStorage.getItem(`@uploaded_doc_${aliasKey}`);
        if (stored) {
          isUploaded = true;
          break;
        }
      }
      if (isUploaded) uploadedCount++;
    }

    // Only mandatory basic required documents count for 100% completion (optional docs do NOT alter 100%)
    const documentPercentage = Math.round((uploadedCount / mandatoryBasicDocKeys.length) * 100);

    // 3. Verification Status Check
    const storedStatus = await AsyncStorage.getItem('@driver_verification_status');
    let verificationStatus: DriverVerificationState['verificationStatus'] = 'NOT_STARTED';

    if (storedStatus) {
      verificationStatus = storedStatus as any;
    } else if (vehiclePercentage === 100 && documentPercentage === 100) {
      verificationStatus = 'COMPLETED';
    } else if (vehiclePercentage > 0 || documentPercentage > 0) {
      verificationStatus = 'IN_PROGRESS';
    }

    // Determine missing step
    let missingStep: DriverVerificationStep = 'APPROVED';
    if (verificationStatus === 'APPROVED') {
      missingStep = 'APPROVED';
    } else if (verificationStatus === 'REJECTED') {
      missingStep = 'REJECTED';
    } else if (vehiclePercentage < 100) {
      missingStep = 'VEHICLE';
    } else if (documentPercentage < 100) {
      missingStep = 'DOCUMENTS';
    } else {
      missingStep = 'PENDING_REVIEW';
    }

    const isApproved = verificationStatus === 'APPROVED';

    return {
      vehicleVerificationPercentage: vehiclePercentage,
      documentVerificationPercentage: documentPercentage,
      verificationStatus,
      isApproved,
      currentMissingStep: missingStep,
    };
  } catch (_) {
    return {
      vehicleVerificationPercentage: 0,
      documentVerificationPercentage: 0,
      verificationStatus: 'NOT_STARTED',
      isApproved: false,
      currentMissingStep: 'VEHICLE',
    };
  }
};

/**
 * Central Guard: Determines if driver is allowed to access ride details & accept orders
 */
export const canDriverAccessOrder = async (): Promise<{
  allowed: boolean;
  state: DriverVerificationState;
}> => {
  const state = await getDriverVerificationState();
  return {
    allowed: state.isApproved,
    state,
  };
};

/**
 * Triggers official review request submission to Backend Queue
 */
export const submitDriverReviewRequest = async (): Promise<{ success: boolean; status: string }> => {
  try {
    await AsyncStorage.setItem('@driver_verification_status', 'PENDING_REVIEW');
    await AsyncStorage.setItem('@driver_review_submitted_at', new Date().toISOString());

    const { api } = await import('../api/axios.instance');
    await api.post('/driver/verification/submit-review').catch(() => {});

    return {
      success: true,
      status: 'PENDING_REVIEW',
    };
  } catch (_) {
    return {
      success: false,
      status: 'PENDING_REVIEW',
    };
  }
};
