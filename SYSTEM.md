# 🧠 Atlas VTC - System Brain & Engineering Constitution

This document is the **Source of Truth** for the Atlas Ride-Hailing Platform. Every architectural decision, module status, and engineering rule is documented here to prevent "Instruction Drift" and ensure long-term scalability.

---

## 🏛️ 1. Core Architectural Pillars (The Rules)

### 🟢 Pillar 1: Deterministic Identity (Sync Core)
- **Rule:** Authentication (OTP), Authorization, and Session Management must be **synchronous, deterministic, and traceable**.
- **Constraint:** No Event Bus usage inside the identity critical path. Failure must be immediate and explicit.

### 🟡 Pillar 2: Transactional Ride Core (Unit of Work)
- **Rule:** Ride state transitions (Request, Accept, Arrive) must be wrapped in a **Single Database Transaction**.
- **Constraint:** Every state change must schedule an **Outbox Event** within the same transaction to guarantee eventual consistency for downstream systems.

### 🔵 Pillar 3: Reactive Scaling (EDA)
- **Rule:** Anything that isn't a core state change or financial commitment (e.g., Notifications, Analytics, Logging) must be **Event-Driven**.
- **Constraint:** Side effects reside in listeners, keeping the Use Cases lean.

---

## 🗺️ 2. System Status & Roadmap

### 📦 Current Modules Status
| Module | State | Readiness | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Identity** | 🟢 Production Hardened | 90% | JWT, Redis (Rate Limit), libphonenumber |
| **Ride Domain** | 🟡 Core Established | 40% | DDD, State Machine, Prisma Outbox |
| **Dispatching** | 🔴 Not Started | 0% | Planned: Redis GEO |
| **Real-time** | 🔴 Foundation Only | 5% | Planned: Socket.io Gateway |
| **Backbone** | 🟢 Operational | 95% | i18n Interceptors, Outbox Processor |

### 🚀 Roadmap (Next Safe Steps)
1.  **[CRITICAL] Geospatial Location Tracker:** Redis GEO implementation for drivers.
2.  **WebSocket Gateway:** Establishing the real-time nervous system.
3.  **Map Service Adapter:** Integrating distance/polyline calculation.

---

## 🛡️ 3. Security & Governance

### Layered Defense
1.  **Input:** Mandatory DTO Validation + Phone Normalization (E.164).
2.  **Abuse:** Multi-tier Rate Limiting (IP + Phone) in `RateLimiterService`.
3.  **Persistence:** No manual SQL. Everything via Prisma to prevent injection.
4.  **Audit:** Transactional logging of all identity and financial events.

---

## 🌍 4. Internationalization (i18n) Strategy
- **Law:** No hardcoded strings in Business Logic.
- **Execution:** Services return `KEY.PATH` (e.g., `RIDE.ERRORS.INVALID_STATE`).
- **Resolution:** The `I18nInterceptor` resolves strings on-the-fly via the `x-lang` header.

---

## 🔧 5. Engineering Operating Guide
- **New Feature Flow:** Entity -> Use Case -> Transactional Persistence -> Outbox Event.
- **Debugging Rule:** If you need to trace an event to debug a login, you over-engineered.
- **Scaling Rule:** If the DB is the bottleneck, move the query to a Read Replica or Redis Cache—don't break the Domain rules.

---

**Last Updated:** 2026-06-16
**Status:** **ACTIVE CONSTITUTION**
