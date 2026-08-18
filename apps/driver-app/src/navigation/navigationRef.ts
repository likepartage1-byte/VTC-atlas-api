/**
 * navigationRef.ts
 *
 * A global navigation ref that allows non-component code (e.g. axios interceptors)
 * to navigate programmatically — specifically to redirect to Login when the
 * refresh token is invalid/expired and the session cannot be recovered.
 */
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'PhoneAuth' }],
    });
  }
}
