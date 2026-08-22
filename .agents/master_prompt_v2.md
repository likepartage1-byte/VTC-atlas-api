# 🏛️ MASTER PROMPT V2 — YALLA VTC OPERATIONAL CONTROL CENTER ARCHITECTURE

> **Target System**: Yalla VTC Monorepo (`atlas-monorepo`)
> **Core Objective**: Engineer the Admin Dashboard into a state-of-the-art **Operational Control Center** for ride-hailing fleet operations across Morocco.

---

## 📌 SECTION A — KNOWN STATE & PRE-LOADED SYSTEM SNAPSHOT

### 1. Architecture & Infrastructure
- **Monorepo Structure**: NestJS Backend (`apps/backend-api`), Vite React Admin Dashboard (`apps/admin-dashboard`), React Native Driver App (`apps/driver-app`), Marketing Website (`apps/official-website`).
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client: ^6.19.3`).
- **Caching & Real-time**: Redis Pub/Sub, `ioredis`, Socket.IO real-time event streams.
- **Live Production URL**: `https://admin.yallavtc.com/` (Nginx served from `/var/www/atlas-admin/dist/`).

### 2. Authentication & Session Persistence (P0-A — VERIFIED & LIVE)
- **Token Model**: Short-lived Access Token (`expiresIn: '60s'`) + Long-lived Refresh Token (`expiresIn: '30d'`).
- **Frontend Interceptor (`apps/admin-dashboard/src/lib/api.ts`)**: Single-Flight Mutex Refresh Interceptor deployed and verified live on production. Intercepts HTTP 401s, silently requests `POST /api/v1/auth/refresh`, updates `localStorage`, and retries original requests seamlessly.
- **Auth Modals (`EmailAuth.tsx` & `PhoneAuth.tsx`)**: Both email and phone OTP authentication store `admin_token` and `refresh_token` in `localStorage`.

### 3. Current Dashboard Capabilities
- **CommandCenterView**: Real-time platform metrics, daily revenue, active rides, online drivers.
- **OperationsCenter**: Interactive Leaflet map displaying real-time driver coordinates (`/admin/location/live`).
- **PendingVerificationsTable**: Driver KYC document inspection modal (CIN, License, Carte Grise).
- **FinancialLedgerCenter**: Commission rates, platform insights, driver RIB withdrawal approvals (`/admin/withdrawals/pending`).
- **IntegrityCenterTable**: Anomaly detection and security event feed (`/admin/integrity/events`).
- **ControlCenterBuilderShell**: Prototype visual builder chunk created in `apps/admin-dashboard/src/modules/builder/` (`21.47 KB` lazy-loaded).

---

## 🎯 SECTION B — TARGET PRODUCT VISION

The Yalla VTC Admin Dashboard must function as an **Operational Control Center**, not a generic CRUD dashboard.

### Core Experience Requirements:
1. **Instant Operational Telemetry Header**:
   - At a glance (within 3 seconds of load), display:
     `TODAY: [Active Users] | [Drivers Online] | [Searching Passengers] | [Active Rides Stream] | [Pending Verification Queue] | [Operational Risk Alerts]`
2. **Live Marrakech & Morocco Fleet Map**:
   - Interactive Leaflet map with real-time driver markers, clustered fleet density, active trip polylines, and zero full-map re-renders when single GPS coordinates update.
3. **360° Seamless Entity Navigation**:
   - Click any entity to inspect full context in-place without page jumping:
     `Driver ➔ Linked Ride ➔ Passenger ➔ Realtime Location ➔ Historical Audit Timeline`

---

## 🔎 SECTION C — TARGETED EXISTING SYSTEM VERIFICATION

Before writing new code or advancing to new modules:
1. Conduct a **Targeted Read-Only Check** of the candidate module (do NOT perform a wasteful full-system re-audit from scratch).
2. Priority Question: Evaluate whether the next planned feature (e.g., Phase B Drag-and-Drop Builder) is truly the highest priority gap, or if an operational foundation gap (e.g., Live Fleet Map clustering, WebSocket real-time event updates, Driver-Ride entity navigation) takes precedence.

---

## ⚡ SECTION D — END-TO-END ARCHITECTURE INTEGRATION

Ensure clean data flow across all system layers:
```text
Driver Mobile App (GPS / Status)
       │
       ▼
NestJS Backend API (Prisma / Redis Geo / Socket.IO)
       │
       ▼
Admin Control Center (Real-time Stream / Interactive Map / Financial Ledger)
```
- **Zero Orphan Schemas**: Every UI metric must connect to validated NestJS controllers or WebSocket events.
- **Zero Mock Data in Production**: Fallback gracefully when data is pending, but never render fake statistics.

---

## 🔒 SECTION E — SECURITY FIRST & ZERO DATA LEAKS

- **RBAC Enforcement**: Respect NestJS `JwtAuthGuard` and `RolesGuard` (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `FINANCIAL_OFFICER`, `SUPPORT_AGENT`). Never bypass auth guards.
- **Token Protection**: Keep Access Token TTL at 60 seconds; rely exclusively on silent refresh in `api.ts`.
- **Sanitization**: Escape all inputs, sanitize raw JSON, and prevent XSS or SQL injection across all query interfaces.

---

## 🌐 SECTION F — MULTILINGUAL & RTL/LTR ENGINE

- **Supported Languages**: Arabic (`AR` - Default), French (`FR`), English (`EN`), Spanish (`ES`).
- **RTL / LTR Bi-directional Layout**: Full layout mirroring for Arabic (`dir="rtl"`).
- **Fallback Guarantee**: Every translation string MUST have an explicit English fallback to prevent runtime `TypeError` crashes or unhandled UI states.

---

## 💎 SECTION G — PROFESSIONAL CONTROL CENTER UX

- **Design Tokens**: Sleek glassmorphism dark theme (`bg-slate-950`, `border-slate-800`), vibrant HSL accent gradients, polished micro-animations (`framer-motion`), high contrast readability.
- **Zero Placeholders**: Never use placeholder text or broken image links. Use clean SVG icons (`lucide-react`) and standard system fallback avatars.

---

## 📜 SECTION H — STRICT MODULE-BY-MODULE DISCIPLINE

Follow this strict 5-step development loop for every single feature/module:
```text
Targeted Audit ➔ Implementation Plan ➔ User Approval ➔ Code & Build ➔ Multi-Layer Verification
```
- **Constraint**: Work on ONE module at a time. Never begin a new module until the current module is 100% completed, built, and verified.

---

## 🧪 SECTION I — MULTI-LAYER TESTING QUALITY GATES

For every completed module, execute:
1. **Compilation & Type Safety**: `npx tsc -b` in `apps/admin-dashboard` (Exit Code 0).
2. **Production Build Verification**: `npm run build` in target app directory.
3. **Visual & Behavioral QA**: Verify layouts, responsive viewports (Desktop/Tablet/Mobile), and dark mode rendering.
4. **Runtime QA**: Verify API request/response flows and network stability.

---

## 🚀 SECTION J — STAGING PIPELINE GOVERNANCE

Enforce strict deployment flow:
```text
LOCAL DEVELOPMENT ➔ BUILD VERIFICATION ➔ STAGING DEPLOYMENT ➔ QA ➔ EXPLICIT APPROVAL ➔ PRODUCTION
```
- **Production Rule**: NEVER deploy directly to `admin.yallavtc.com` without explicit user approval after Staging/Local verification.

---

## ↺ SECTION K — ROLLBACK CHECKPOINTS

- Maintain explicit rollback checkpoints (`git tag` or stash commit references) prior to starting major architectural phases, allowing instant revert if regressions occur.

---

## ⚡ SECTION L — HIGH PERFORMANCE & REALTIME OPTIMIZATION

- **Leaflet Map**: Use marker clustering (`react-leaflet-cluster` or custom canvas rendering) for large driver counts.
- **Re-render Optimization**: Wrap map layers in `React.memo` and use stable callbacks (`useCallback`) so driver coordinate updates do not trigger full map canvas re-renders.

---

## 🛡️ SECTION M — ROLE-BASED ACCESS CONTROL (RBAC) INTEGRATION

- Align UI feature visibility with backend RBAC roles:
  - `SUPER_ADMIN`: Full system access, setting modification, RIB payouts approval.
  - `OPERATIONS_MANAGER`: Live fleet tracking, ride dispatching, driver status overrides.
  - `FINANCIAL_OFFICER`: Financial ledger viewing, withdrawal requests inspection.
  - `SUPPORT_AGENT`: Support ticket helpdesk, AI conversation inspector.

---

## ♿ SECTION N — ACCESSIBILITY & MODERN STANDARDS

- Implement ARIA attributes (`aria-expanded`, `aria-label`, `role="dialog"`), proper heading hierarchy (`<h1>` to `<h3>`), and keyboard focus management.

---

## 📦 SECTION O — GIT BRANCHING & STAGING SAFETY

- **Strict Rule**: NEVER use `git add .` or `git commit -a`.
- **Targeted Staging**: Stage ONLY specific files relevant to the module under development using `git add path/to/file`.

---

## 🛑 SECTION P — FINAL APPROVAL GATE

Before executing any code edits, terminal commands, or deployments:
1. Present the targeted audit findings and proposed implementation plan.
2. STOP and wait for explicit user approval (`Proceed` or written confirmation).
