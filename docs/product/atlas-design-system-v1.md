# 🏛️ Atlas VTC - Design System V1

## 1. Core Brand Identity
The Atlas design language communicates **Speed**, **Trust**, and **Premium Quality**.

### Color Palette (Premium Dark/Gold Theme)
| Token | HEX | Usage |
| :--- | :--- | :--- |
| **Primary (Atlas Gold)** | `#F59E0B` | Buttons, Active States, Branding |
| **Secondary (Midnight)** | `#111827` | Main Backgrounds, Nav Bars |
| **Surface (Deep Slate)** | `#1F2937` | Cards, Modals, Inputs |
| **Text Main** | `#F9FAFB` | Primary Content |
| **Text Muted** | `#9CA3AF` | Supporting Info, Placeholders |
| **Success (Emerald)** | `#10B981` | Completed Rides, Wallet Deposits |
| **Danger (Crimson)** | `#EF4444` | Cancellations, Fraud Alerts, Errors |

---

## 2. Operational Specification (Phase 1)

### 📱 Passenger App
- **Map Focus**: 80% screen usage.
- **Booking Flow**: Bottom-sheet driven logic.
- **Realtime**: WebSocket updates for driver position every 3 seconds.

### 🚕 Driver App
- **Online State**: High-visibility toggle.
- **Requests**: 15-second countdown timer for acceptance.
- **Navigation**: In-app map redirection (Google/Waze).

### 🖥️ Admin Dashboard
- **Integrity**: Real-time fraud feed with status codes.
- **Finance**: Dynamic commission management.

---

## 🚀 Next Strategic Steps (Production Readiness)
1. **Audit Logging**: Implementation of `AuditLogService` for sensitive actions.
2. **Rate Limiting**: Hardening `/auth` and `/otp` endpoints.
3. **Observability**: Integration of Prometheus/Sentry.
