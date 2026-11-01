# 🛠️ Bubl Developer & Contributor Guide

Welcome to the **Bubl** development guide. This document explains the system architecture, configuration details, local setup, test conventions, and deployment procedures for contributors and engineers.

---

## 🏛️ System Architecture

Bubl is structured as an **isomorphic, decoupled full-stack monorepo** designed to support both the Vite React web client and upcoming mobile clients (React Native / Expo).

```
├── shared/                      # Isomorphic domain models & pure business logic
│   ├── types.ts                 # TypeScript interfaces (User, BubblePost, Friend, Message)
│   ├── constants.ts             # Mindful game loops, limits, color palettes, burst limits
│   └── moderation.ts            # Anti-dating & sensitive keyword analyzer (zero dependencies)
├── server/                      # Headless REST API Backend (Runs on Bun or Node.js)
│   ├── db/                      # Neon / PostgreSQL layer with Drizzle ORM
│   │   ├── schema.ts            # Relational database schema (10 tables)
│   │   ├── index.ts             # Database client with SSL & connection pooling
│   │   └── migrations/          # Version-controlled SQL migration snapshots
│   ├── routes/                  # Modular Hono route controllers
│   │   ├── auth.ts              # OTP flow, Neon Auth JWKS verification, session tokens
│   │   ├── users.ts             # User profiles, avatar updates, breath leveling
│   │   ├── bubbles.ts           # Atmospheric drift, 3-of-5 bursts, weekly 1-bubble publish
│   │   ├── orbits.ts            # Connected pen-pal orbits (max 50 quota), quiet releases
│   │   ├── messages.ts          # Wind-paced epistolary dispatches (10-18m transit delays)
│   │   └── dev.ts               # Test harnesses (accelerate winds, reset moderation)
│   └── index.ts                 # Hono server entrypoint (Node @hono/node-server + Bun native)
├── src/                         # Web Client (Vite + React 19 + Tailwind CSS)
│   ├── components/              # Tactile UI (BubbleBoard, OrbitView, AvatarEditor, etc.)
│   ├── services/                # apiClient.ts, audioService.ts, moderationService.ts
│   └── App.tsx                  # Main client shell with optimistic state & offline fallback
├── neon.ts                      # Neon cloud infrastructure declaration
├── vercel.json                  # Vercel deployment & SPA routing configuration
├── railway.json                 # Railway Nixpacks container configuration
├── drizzle.config.ts            # Drizzle Kit configuration (unpooled migration support)
└── test-e2e.ts                  # End-to-end integration test suite with automatic cleanup
```

---

## ⚙️ Environment Configuration

Bubl supports two database modes:
1. **Cloud PostgreSQL (Neon)** *(Primary production & staging database)*
2. **Local PostgreSQL** *(via Docker Compose for offline development)*

### Environment Variables (`.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Pooled PostgreSQL connection string for API runtime | `postgresql://user:pass@ep-xyz-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | Direct unpooled connection string for Drizzle migrations | `postgresql://user:pass@ep-xyz.us-west-2.aws.neon.tech/neondb?sslmode=require` |
| `NEON_BRANCH` | Neon branch identifier | `production` |
| `NEON_AUTH_BASE_URL` | Neon Auth service URL | `https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth` |
| `NEON_AUTH_JWKS_URL` | Neon Auth JSON Web Key Set endpoint | `.../auth/.well-known/jwks.json` |
| `PORT` | API server port (default: 3001) | `3001` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `CLIENT_URL` | Web client origin for CORS | `http://localhost:3000` |
| `VITE_API_URL` | Frontend API base URL (set in Vercel or `.env.local`) | `https://bubl-api.up.railway.app` |

---

## 🚀 Local Development Workflow

### Prerequisites
- **Node.js** (v20+ or v22+) or **Bun** (v1.1+)
- **Git**
- Optional: **Docker** (if testing with local PostgreSQL instead of Neon)

### Installation
```bash
# Clone the repository
git clone https://github.com/ifeelfanAstik-5/bubl.git
cd bubl

# Install dependencies (use --legacy-peer-deps for strict npm resolution)
npm install --legacy-peer-deps
```

### Running the Application

```bash
# Option A: Run frontend and backend concurrently
npm run dev:all

# Option B: Run backend only (port 3001)
npm run server
# or with Bun:
npm run server:bun

# Option C: Run frontend only (port 3000)
npm run dev
```

### Database Operations (Drizzle ORM)
```bash
# Push schema changes directly to Neon:
npm run db:push

# Generate SQL migration files:
npm run db:generate

# Start local Docker PostgreSQL (if not using Neon):
npm run db:up
```

---

## 🧪 Testing & Data Hygiene Policy

> [!IMPORTANT]
> **Zero Pollution Rule for Shared Databases**:
> Whenever you write or execute integration tests against a database (local or Neon), **every test must clean up its test data during teardown**. Never leave orphaned test users, bubbles, or OTP codes in the database.

### Running the End-to-End Suite
We maintain an automated verification suite in `test-e2e.ts`:
```bash
npm run test:e2e
```
This tests:
1. Health endpoint & runtime status.
2. Neon Postgres connection and SSL handshake.
3. Neon Auth JWKS keys reachability.
4. OTP generation, database verification, and user creation.
5. Mindful bubble publishing and retrieval.
6. **Automatic teardown & cleanup of all created rows**.

---

## ☁️ Deployment Guide

Bubl uses a split deployment model for maximum speed and persistent connection stability:
- **Frontend**: **Vercel** (Global Edge CDN, instant SPA routing).
- **Backend**: **Railway** (Persistent container, direct Neon connection pool).

---

### Step 1: Deploy Backend to Railway

1. Go to [railway.com](https://railway.com/) and create or log in to your account.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select `ifeelfanAstik-5/bubl`.
4. Railway will automatically detect `railway.json` and build the project using Nixpacks with `npm run server`.
5. In the Railway dashboard under your service **Variables**, add:
   - `DATABASE_URL`: *(Your pooled Neon connection string)*
   - `DATABASE_URL_UNPOOLED`: *(Your unpooled Neon connection string)*
   - `NEON_BRANCH`: `production`
   - `NEON_AUTH_BASE_URL`: *(Your Neon Auth base URL)*
   - `NEON_AUTH_JWKS_URL`: *(Your Neon Auth JWKS URL)*
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
6. Under **Settings** > **Networking**, click **Generate Domain** (e.g., `bubl-production.up.railway.app`).
7. Test the health endpoint: `https://<your-railway-domain>/api/health`.

---

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and click **Add New** > **Project**.
2. Import the `ifeelfanAstik-5/bubl` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-railway-domain>` (e.g., `https://bubl-production.up.railway.app` without trailing slash)
5. Click **Deploy**.
6. Vercel will build the frontend, and `vercel.json` will ensure all client-side routes redirect cleanly to `index.html`.

---

## 🧘 Mindful Product Invariants (Do Not Break)

When contributing code, you must respect these inviolable product rules:
1. **Zero Lookism**: Never introduce real photo uploads for user profiles. Identity is strictly expressed via illustrated 2D avatars (`AvatarConfig`).
2. **Scarcity & Pacing**:
   - The atmosphere presents at most **5 bubbles per day**.
   - Users may burst at most **3 bubbles per daily cycle**.
   - Authors can publish at most **1 bubble per 7-day cycle**.
3. **Epistolary Wind Delay**: Messages in orbits are never instant. They must calculate and adhere to atmospheric transit delays (10–18 minutes) to preserve thoughtful pacing.
4. **10-Word Title Rule & Clean Prose**: All titles must pass `analyzeTitle` (max 10 words, no romantic soliciting).
5. **Quiet Releases**: Removing an orbit must always be quiet, respectful, and without jarring notifications.
