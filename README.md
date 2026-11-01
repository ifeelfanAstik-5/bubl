# 🫧 Bubl — Mindful Pen Pal & Thought Exchange

> A slow-paced sanctuary for introverts and deep thinkers to connect across the world through ideas, questions, and calm epistolary pacing. Full-stack application powered by **Bun**, **TypeScript**, **Hono**, **PostgreSQL (Drizzle ORM)**, and **Vite + React 19**.

---

## 📖 Documentation & Guides

- [**Application Manifesto (APP_MANIFESTO.md)**](./APP_MANIFESTO.md) — Comprehensive product vision, metaphors, community rules, and design guidelines.
- [**Developer & Contribution Guide (CONTRIBUTING.md)**](./CONTRIBUTING.md) — Complete engineering manual: architecture, environment variables, Neon database workflows, testing guidelines, and Vercel + Railway deployment steps.

---

## 🌟 Core Concepts at a Glance

1. **Drifting Thought Bubbles**:
   - Ideas drift across the atmosphere as gentle, iridescent bubbles.
   - The outer membrane displays the author's 2D avatar, location, distance, and a concise title (max 10 words).
   - The inner reflection is revealed only when you intentionally choose to **burst** the bubble.

2. **Scarcity & The 3-of-5 Daily Selection**:
   - Each daily drift presents 5 bubbles.
   - Users can choose to burst at most 3 bubbles per cycle, cultivating mindful attention over mindless swiping.

3. **Anti-Dating & Zero Lookism**:
   - **No selfies or face photos**: Identities are expressed solely through illustrated 2D avatars.
   - **Strictly ideas and crafts**: Automated moderation filters prevent romantic solicitation, hookup spam, and hate speech.
   - **10-Word Title Rule**: Encourages thoughtful, focused questions and reflections.
   - **3-Strike Moderation**: 3 violations result in a 7-day account suspension.

4. **Mutual Media Handshake**:
   - Open bubbles contain pure prose (no photos, videos, or external links).
   - Craft photos and soundscapes can only be exchanged once two users have formed a 1-on-1 friendship and **both** have accepted a mutual media handshake.

5. **Calm Delivery Pacing**:
   - Dispatches travel on simulated atmospheric wind currents with realistic delivery delays (10 to 18 minutes depending on breath effort).
   - Strict **50 Orbits Quota** prioritizes meaningful, enduring pen pal relationships.
   - Pen pals can be released quietly and gracefully without notifications or awkwardness.

---

## 🏗️ Full-Stack Architecture

```
├── shared/                  # Isomorphic domain models & validators (Ready for React Native)
│   ├── types.ts             # Domain models (UserProfile, BubblePost, Friend, DirectMessage)
│   ├── constants.ts         # Hobbies, BubbleTypes, Quotas, Word limits
│   └── moderation.ts        # Isomorphic anti-dating and sensitive language analyzer
├── server/                  # Bun + TypeScript + Hono API Backend
│   ├── db/                  # PostgreSQL database layer
│   │   ├── schema.ts        # Drizzle ORM relational schema (10 tables)
│   │   ├── index.ts         # Postgres client & connection pooling
│   │   └── migrations/      # Drizzle Kit generated SQL migrations
│   ├── routes/              # Headless REST endpoints
│   │   ├── auth.ts          # Passwordless OTP, session tokens (Cookie & Bearer)
│   │   ├── users.ts         # Profile, breath XP, 2D avatar configuration
│   │   ├── bubbles.ts       # Daily atmosphere, burst quota, weekly 1-bubble publish
│   │   ├── orbits.ts        # Connected orbits (max 50 quota), quiet releases
│   │   ├── messages.ts      # Wind-paced dispatches with calculated arrival time
│   │   └── dev.ts           # Test tools (Accelerate Winds, Reset Suspension)
│   └── index.ts             # Hono app server (Runs natively on Bun & Node)
├── src/                     # Web Client (Vite + React 19 + Tailwind CSS)
│   ├── components/          # Tactile UI components (BubbleBoard, FriendsSidebar, ProfileModal)
│   ├── services/            # apiClient.ts, soundEffects.ts, moderationService.ts
│   └── App.tsx              # Main application shell with resilient offline fallback
├── docker-compose.yml       # Local PostgreSQL 16 container definition
└── drizzle.config.ts        # Drizzle Kit configuration
```

---

## 🚀 Quick Start

### 1. Start PostgreSQL (via Docker)
```bash
docker compose up -d
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already configured for the local Docker PostgreSQL container):
```bash
DATABASE_URL=postgres://bubl:bubl_secret_password@localhost:5432/bubl_db
PORT=3001
```

### 3. Run Migrations
```bash
npm run db:push
# or generate migrations:
npm run db:generate
```

### 4. Run the Development Servers
```bash
# Run both the frontend (port 3000) and backend (port 3001) concurrently:
npm run dev:all

# Or run separately:
npm run dev          # Starts Vite web client on http://localhost:3000
npm run server       # Starts Hono API on http://localhost:3001
# On Bun:
bun run server/index.ts
```

---

## ☁️ Deployment

Bubl is pre-configured for instant zero-downtime deployment:
- **Frontend on Vercel**: Configured via `vercel.json` with Vite SPA client-side routing.
- **Backend on Railway**: Configured via `railway.json` using Nixpacks for persistent Hono container hosting.
- **Database on Neon**: Serverless cloud PostgreSQL with connection pooling.

See [**CONTRIBUTING.md**](./CONTRIBUTING.md#️-deployment-guide) for step-by-step instructions.

---

## 📱 Mobile Client (React Native / Expo) Compatibility

The backend in `server/` is completely headless and decoupled from the web DOM:
- **Shared Types**: A future React Native or Expo app can import models directly from `shared/types.ts`.
- **Dual Authentication**: Supports standard `Authorization: Bearer <token>` headers as well as HTTP-only cookies.
- **Pure REST Contracts**: All endpoints return standard JSON `ApiResponse<T>` objects without web-specific dependencies.
