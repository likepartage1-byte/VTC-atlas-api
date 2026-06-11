# Project Atlas 🚀

Project Atlas is a luxury-grade ride-hailing platform designed specifically for Marrakech.

## Architecture

- **Monorepo Engine**: pnpm workspaces
- **Task Orchestrator**: Turborepo
- **Backend**: NestJS (Modular Monolith) + Prisma
- **Admin**: React + TypeScript + Vite
- **Mobile**: Flutter (Passenger & Driver)

## Getting Started

### Prerequisites

- Node.js (>=18)
- pnpm (>=8)
- Docker

### Installation

```bash
pnpm install
```

### Infrastructure

```bash
cd infrastructure/docker
docker-compose up -d
```

### Development

```bash
pnpm dev
```

## Structure

- `apps/`: Main applications (API, Dashboard, Mobile)
- `packages/`: Shared logic, types, and configurations
- `infrastructure/`: Docker, Database, and Proxy configurations
- `docs/`: Technical and operational documentation
