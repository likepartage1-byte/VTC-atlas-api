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

    // 2. Documents Verification Check
    const docKeys = ['cin_recto', 'cin_verso', 'driver_license', 'vehicle_grey_card', 'insurance'];
    let uploadedCount = 0;
    for (const key of docKeys) {
      const stored = await AsyncStorage.getItem(`@uploaded_doc_${key}`);
      if (stored) uploadedCount++;
    }
    const documentPercentage = Math.round((uploadedCount / docKeys.length) * 100);

    // 3. Verification Status Check
    const storedStatus = await AsyncStorage.getItem('@driver_verification_status');
    let verificationStatus: DriverVerificationState['verificationStatus'] = 'NOT_STARTED';

    if (storedStatus) {
      verificationStatus = storedStatus as any;
    } else if (vehiclePercentage === 100 && documentPercentage === 100) {
      // Default to PENDING_REVIEW once both vehicle and docs are 100% submitted
      verificationStatus = 'PENDING_REVIEW';
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
