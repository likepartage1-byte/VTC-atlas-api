# CRITICAL BUG AUDIT REPORT — Account Deletion & Re-registration Lifecycle

## 1. Root Cause Analysis

### A. Missing Backend Account Deletion Endpoint
- In `SettingsScreen.tsx` (line 1204), when a user clicks **Confirm Deletion**, the mobile app executes:
  ```typescript
  await api.delete('/driver/profile').catch(() => {});
  ```
- **Finding**: The backend API has **no route** matching `DELETE /driver/profile` or `DELETE /auth/account`.
- The request returned `404 Not Found`. Because of `.catch(() => {})`, the error was silently swallowed without notifying the user or stopping the frontend reset.
- Consequently, **the user record in MySQL DB was NEVER deleted or deactivated**, and sessions in Redis were **NEVER invalidated**.

### B. Database Upsert Behavior on Re-Registration
- In `auth.service.ts` (`verifyOtp` method, line 60):
  ```typescript
  const user = await this.prisma.user.upsert({
    where: { phoneNumber },
    update: { ... },
    create: { ... }
  });
  ```
- **Finding**: Because the old `User` record with `phoneNumber` was never deleted or anonymized in MySQL, registering again with the same phone number matched the **existing `User.id`**.
- Prisma's `upsert` updated the existing record and returned the **OLD `User.id`**, restoring the deleted account instead of creating a new one.

---

## 2. Technical Findings Summary

| Area | Current Behavior | Required Correct Behavior |
| :--- | :--- | :--- |
| **Backend API Route** | `DELETE /driver/profile` returns `404` (missing) | Implement `DELETE /auth/account` endpoint with `@UseGuards(AuthGuard)` |
| **MySQL User Record** | `User` record remains intact in MySQL with active `phoneNumber` | Unlink/anonymize `phoneNumber` (e.g. `DELETED_<timestamp>_<phone>`) or delete record so phone number is free |
| **Redis Session** | Active sessions remain valid in Redis | Call `sessionService.deleteSession(userId)` to invalidate all tokens |
| **Refresh Tokens** | Old refresh tokens still function | Immediately rejected with `401 Unauthorized` after deletion |
| **Mobile Storage** | `AsyncStorage.clear()` executed locally only | `DELETE /auth/account` called first, followed by purging `AsyncStorage` and Zustand stores |
| **Auth Navigation** | App resets to `PhoneAuth` | Resets to `PhoneAuth` with clean, unauthenticated state |

---

## 3. Proposed Fix Architecture

### Phase 1: Backend `DELETE /auth/account` Endpoint (`apps/backend-api`)
1. In `auth.controller.ts`, add:
   ```typescript
   @Delete('account')
   @Version('1')
   @UseGuards(AuthGuard)
   async deleteAccount(@CurrentUser('userId') userId: string) {
     return this.authService.deleteAccount(userId);
   }
   ```
2. In `auth.service.ts`, implement `deleteAccount(userId)`:
   - Invalidate all Redis sessions for `userId` via `sessionService.deleteSession(userId)`.
   - Update `User` record in MySQL: set `status = 'INACTIVE'` or `DELETED`, and release `phoneNumber` by updating it to `DELETED_${Date.now()}_${user.phoneNumber}` (or deleting the user record if no active rides exist).
   - This ensures the phone number is 100% free for a brand-new registration.

### Phase 2: Mobile App Account Deletion Logic (`apps/driver-app`)
1. In `SettingsScreen.tsx`:
   - Call `await api.delete('/auth/account')`.
   - Purge `AsyncStorage.clear()`.
   - Reset all Zustand stores (`useAppModeStore`, `usePassengerRideStore`).
   - Reset navigation stack cleanly to `PhoneAuth`.

### Phase 3: Verification Test Plan
1. Login as User A (`phoneNumber: +212611223344`).
2. Record `User A ID`.
3. Perform Account Deletion in Settings.
4. Verify DB: User A `phoneNumber` is unlinked/anonymized, Redis session is destroyed.
5. Register with `+212611223344` as User B.
6. Verify DB: `User B ID !== User A ID` (New unique UUID created).
