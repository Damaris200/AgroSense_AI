# AgroSense AI Task 
---

## Project context

**AgroSense AI** is an event-driven farming assistant for small-scale farmers in Cameroon. It reacts to farm observations and weather changes, then uses AI + rule-based logic to produce crop recommendations (plant, irrigate, fertilize, harvest, protect from frost).

**Stack already in place (do not reinstall):**
- Frontend: React + TypeScript + Tailwind CSS (Vite)
- A landing page and authentication pages already exist — **modify, do not recreate**
- CI/CD and IaC scaffolding exists

**Stack to add:**
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL 15
- Event broker + apache kafka
- Weather: OpenWeatherMap API (real weather data)
- AI: Google Gemini API (for nuanced recommendations) + rule-based fallback
- Containerization: Docker (multi-stage) + docker-compose
- CI: Jenkins (Jenkinsfile with 5 stages)
- IaC: Ansible playbook

**Architecture style:** Event-Driven Architecture (EDA). Farm observations and weather updates are published to Redis Streams; the AI Recommendation Service consumes them asynchronously.

---

## Before you start

1. Read the current repository structure. Run `tree -L 3 -I 'node_modules|dist|build'` or use the file explorer. Identify:
   - Where the existing React app lives (look for `src/`, `vite.config.ts`, `tailwind.config.js`)
   - Where the existing landing page and auth pages are
   - Whether a `backend/` or `server/` folder already exists
2. **Do not delete existing files.** Add new ones and modify in place.
3. Create a `backend/` folder at the repo root for the Node.js API if one does not already exist.
4. All new code must be TypeScript, not JavaScript.
5. Use `.env.example` for every service so secrets are never committed.
6. After every task, run the relevant lint/build/test command to verify nothing broke before moving on.

---

## Task 1 — Install Node.js, PostgreSQL, Redis locally

**Goal:** The developer machine (Windows 11 with WSL2, or Linux, or macOS) must be able to run Postgres and Redis. Node.js is assumed already installed since the frontend runs; verify version.

**Instructions:**

1. Check Node version: `node -v` — must be ≥ 20. If not, tell the user to upgrade.
2. **Prefer Docker for Postgres and Redis** rather than installing them natively. It is faster, reversible, and matches production. Create `docker-compose.dev.yml` at the repo root:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15-alpine
    container_name: agrosense-postgres
    environment:
      POSTGRES_USER: agrosense
      POSTGRES_PASSWORD: agrosense_dev
      POSTGRES_DB: agrosense
    ports:
      - "5432:5432"
    volumes:
      - agrosense_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agrosense"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: agrosense-redis
    ports:
      - "6379:6379"
    volumes:
      - agrosense_redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  agrosense_pgdata:
  agrosense_redisdata:
```

3. Add a README note: `docker compose -f docker-compose.dev.yml up -d` starts both services. `docker compose -f docker-compose.dev.yml down` stops them.

**Acceptance:** `docker compose -f docker-compose.dev.yml up -d` brings both containers to healthy state. `docker exec -it agrosense-postgres psql -U agrosense -d agrosense -c "SELECT 1"` returns 1. `docker exec -it agrosense-redis redis-cli ping` returns PONG.

---

## Task 2 — Backend project scaffold

**Goal:** Create a TypeScript Express backend in `backend/`.

**Instructions:**

1. `cd backend && npm init -y`
2. Install runtime deps: `npm i express cors helmet morgan dotenv pg ioredis bcrypt jsonwebtoken zod axios`
3. Install dev deps: `npm i -D typescript @types/node @types/express @types/cors @types/morgan @types/pg @types/bcrypt @types/jsonwebtoken ts-node-dev vitest supertest @types/supertest`
4. Create `tsconfig.json` with strict mode, `outDir: dist`, `rootDir: src`, `target: ES2022`, `module: commonjs`, `esModuleInterop: true`, `resolveJsonModule: true`, `skipLibCheck: true`.
5. Create this folder structure under `backend/src/`:

```
src/
  config/        # env loading, db pool, redis client
  models/        # TypeScript interfaces mirroring DB tables
  routes/        # Express routers per resource
  controllers/   # request handlers
  services/      # business logic (recommendation, weather, auth)
  middleware/    # auth, error handler, validation
  events/
    publisher.ts # publish to Redis Streams
    consumer.ts  # consume from Redis Streams
    types.ts     # shared event type definitions
  db/
    schema.sql   # the DDL from Task 3
    migrate.ts   # simple migration runner
  index.ts       # app entry point
  app.ts         # express app factory (for testing)
  __tests__/
```

6. Add scripts to `backend/package.json`:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "vitest run --coverage",
  "migrate": "ts-node-dev src/db/migrate.ts"
}
```

7. Create `backend/.env.example`:

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://agrosense:agrosense_dev@localhost:5432/agrosense
REDIS_URL=redis://localhost:6379
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=24h
OPENWEATHER_API_KEY=your_openweather_key_here
GEMINI_API_KEY=your_gemini_key_here
CORS_ORIGIN=http://localhost:5173
```

8. Create `backend/src/config/env.ts` that loads dotenv and exports a typed, validated config object using `zod`. Fail fast if a required var is missing.

**Acceptance:** `npm run build` succeeds with zero TypeScript errors. `npm run dev` starts a server on the configured port and responds to `GET /health` with `{"status":"ok"}`.

---

## Task 3 — PostgreSQL schema (FR-01 to FR-27)

**Goal:** Design the database to support all functional requirements in the SRS.

**Instructions:**

Create `backend/src/db/schema.sql` with the following tables. Use UUIDs for primary keys (`gen_random_uuid()` — enable `pgcrypto` extension first). All tables get `created_at TIMESTAMPTZ DEFAULT NOW()` and `updated_at TIMESTAMPTZ DEFAULT NOW()`.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (FR-01..FR-05)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer','agronomist','admin')),
  locale        TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en','fr')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Farms (FR-06)
CREATE TABLE farms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  size_ha     NUMERIC(8,2) NOT NULL CHECK (size_ha > 0),
  soil_type   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_farms_user ON farms(user_id);

-- Crops (FR-07)
CREATE TABLE crops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_type       TEXT NOT NULL,  -- maize, cassava, tomato, beans, ...
  planting_date   DATE NOT NULL,
  expected_harvest DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_crops_farm ON crops(farm_id);

-- Observations (FR-08, FR-09)
CREATE TABLE observations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_id         UUID REFERENCES crops(id) ON DELETE SET NULL,
  soil_moisture   NUMERIC(5,2),          -- 0..100 %
  temperature_c   NUMERIC(5,2),
  notes           TEXT,
  observed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_observations_farm_time ON observations(farm_id, observed_at DESC);

-- Weather snapshots (FR-11, FR-12, FR-13)
CREATE TABLE weather_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  temperature_c NUMERIC(5,2),
  humidity_pct  NUMERIC(5,2),
  rainfall_mm   NUMERIC(6,2),
  wind_kph      NUMERIC(5,2),
  condition     TEXT,          -- "Rain", "Clear", "Clouds" (OpenWeather main field)
  forecast_json JSONB,         -- full 7-day forecast
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_weather_farm_time ON weather_snapshots(farm_id, fetched_at DESC);

-- Recommendations (FR-15..FR-19)
CREATE TABLE recommendations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  observation_id  UUID REFERENCES observations(id) ON DELETE SET NULL,
  event_id        TEXT NOT NULL UNIQUE,  -- idempotency key (FR-18)
  action          TEXT NOT NULL,         -- irrigate | plant | fertilize | harvest | protect_frost | no_action
  urgency         TEXT NOT NULL CHECK (urgency IN ('low','medium','high')),
  message         TEXT NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('rule','ai','hybrid')),
  context_json    JSONB,                 -- the inputs the recommendation was based on
  reviewed_by     UUID REFERENCES users(id),
  review_status   TEXT DEFAULT 'pending' CHECK (review_status IN ('pending','accepted','overridden')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recs_farm_time ON recommendations(farm_id, created_at DESC);

-- Notifications (FR-20..FR-23)
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC);
```

Write `backend/src/db/migrate.ts` that reads `schema.sql` and executes it against `DATABASE_URL` using the `pg` client. Make it idempotent (use `CREATE TABLE IF NOT EXISTS` — update the schema accordingly).

**Acceptance:** `npm run migrate` runs without errors, and `\dt` in psql shows all 7 tables.

---

## Task 4 — Authentication (FR-01, FR-02, FR-04)

**Goal:** Register and login endpoints issuing JWTs, with role-based middleware.

**Instructions:**

1. `backend/src/services/auth.service.ts` — functions `registerUser(input)`, `loginUser(email, password)`. Use `bcrypt` with 10 salt rounds. Validate input with zod schemas. Reject duplicate email with a typed `ConflictError`.
2. `backend/src/controllers/auth.controller.ts` — Express handlers that call the service and return `{ user, token }` where `token` is a JWT signed with `JWT_SECRET`, 24h expiry, payload `{ sub: user.id, role, email }`.
3. `backend/src/middleware/auth.middleware.ts` — `requireAuth` (verifies JWT, attaches `req.user`) and `requireRole(...roles)` (checks `req.user.role`).
4. `backend/src/middleware/error.middleware.ts` — central error handler mapping typed errors to HTTP codes (`ValidationError`→400, `UnauthorizedError`→401, `ForbiddenError`→403, `NotFoundError`→404, `ConflictError`→409, fallback 500). Never leak stack traces in production.
5. `backend/src/routes/auth.routes.ts` — mount `POST /api/auth/register` and `POST /api/auth/login`.
6. Write Vitest tests in `__tests__/auth.test.ts` covering: successful register, duplicate email rejected, login success, login with wrong password rejected. Use Supertest against the app factory from `app.ts`.

**Acceptance:** `npm test` passes. Manual check with curl:

```bash
curl -X POST localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"a@test.com","password":"secret123","phone":"+237600000000"}'
curl -X POST localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"secret123"}'
```

---

## Task 5 — Redis Streams as event broker

**Goal:** Replace direct service calls with asynchronous events.

### Understanding Redis Streams (brief)

Redis Streams is a log data structure inside Redis. Producers `XADD` events to a named stream (e.g. `farm.data.submitted`). Consumers use consumer groups (`XGROUP CREATE`, `XREADGROUP`) to read events — each group processes every event exactly once, and multiple instances in the same group share the load. Events persist until acknowledged with `XACK`. This gives you durability, replay, and at-least-once delivery without the operational weight of Kafka. It matches your 8 GB laptop constraint.

### Instructions

1. `backend/src/config/redis.ts` — export a singleton `ioredis` client built from `REDIS_URL`.
2. `backend/src/events/types.ts` — TypeScript interfaces for every event:

```ts
export type EventName =
  | "farm.data.submitted"
  | "weather.updated"
  | "recommendation.created";

export interface BaseEvent<T> {
  id: string;            // uuid — idempotency key
  name: EventName;
  occurredAt: string;    // ISO timestamp
  payload: T;
}

export interface FarmDataSubmittedPayload {
  farmId: string;
  observationId: string;
  soilMoisture: number | null;
  temperatureC: number | null;
  cropType: string | null;
  userId: string;
}

export interface WeatherUpdatedPayload {
  farmId: string;
  condition: string;
  rainfallMm: number;
  temperatureC: number;
}

export interface RecommendationCreatedPayload {
  recommendationId: string;
  farmId: string;
  userId: string;
  action: string;
  urgency: "low" | "medium" | "high";
  message: string;
}
```

3. `backend/src/events/publisher.ts` — function `publishEvent(event: BaseEvent<unknown>)` that calls `XADD <stream> * data <json>`. One stream per event name.

4. `backend/src/events/consumer.ts` — function `startConsumer(streamName, groupName, consumerName, handler)` that:
   - creates the consumer group if it does not exist (swallow `BUSYGROUP` error)
   - loops with `XREADGROUP GROUP ... BLOCK 5000 COUNT 10 STREAMS <stream> >`
   - for each message, calls `handler(event)` inside a try/catch
   - on success, `XACK` the message
   - on failure, log and do **not** ack — Redis will redeliver after a configurable idle time
   - respect a shutdown signal so the process exits cleanly

5. Implement idempotency: before handling any event, check if a row with `event_id = event.id` already exists in the relevant table (e.g. `recommendations`). If yes, ack and skip. This satisfies FR-18.

**Acceptance:** unit test that publishes an event and reads it back from a test consumer group. Integration test in `__tests__/events.test.ts` verifying idempotency (publishing the same event twice produces only one DB row).

---

## Task 6 — Weather integration with OpenWeatherMap (FR-11..FR-14)

**Important correction:** Gemini is an LLM — it does NOT provide weather data. Use **OpenWeatherMap** for weather (free tier: 1,000 calls/day). Get a key at https://openweathermap.org/api.

**Instructions:**

1. `backend/src/services/weather.service.ts` — function `fetchWeather(lat, lon)` that:
   - First checks Redis cache with key `weather:${lat}:${lon}` (TTL 30 min — FR-12)
   - On miss, calls `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}` via axios
   - Parses the response into a normalized shape: `{ current: {...}, forecast: [...] }`
   - Writes to cache with `SET weather:... <json> EX 1800`
   - Persists a row in `weather_snapshots`
   - Returns the normalized shape
2. Schedule a background job (simple `setInterval` every 30 min) that refreshes weather for every registered farm. Only run this in the main API process, not in the consumer process. If rainfall > 5mm in next 24h, or temp forecast drops below 5°C, publish a `weather.updated` event (FR-13).
3. Expose `GET /api/weather/:farmId` (auth required, farm must belong to user) returning the cached weather snapshot.

**Acceptance:** endpoint returns current + 7-day forecast. Second call within 30 min hits the cache (verify by logging or by checking Redis). A row appears in `weather_snapshots` per fetch.

---

## Task 7 — AI Recommendation Service (FR-15..FR-17)

**This answers your question: should you train your own model? NO — not for an 8-week project.**

### Approach: Hybrid rule-based + Gemini LLM

Why not train your own model:
- You have no labeled training data from Cameroonian farms.
- Training, validating, and serving an ML model is a multi-week project on its own.
- An LLM with good prompting outperforms a shallow model trained on a tiny dataset.
- The hybrid approach is what real production systems use — fast deterministic rules for obvious cases, LLM for nuance.

### Instructions

1. `backend/src/services/recommendation.service.ts` with this structure:

```ts
export interface RecommendationInput {
  observation: { soilMoisture: number | null; temperatureC: number | null };
  crop: { type: string; plantingDate: string } | null;
  weather: { condition: string; rainfallNext24h: number; minTempNext48h: number };
}

export interface RecommendationOutput {
  action: "irrigate" | "plant" | "fertilize" | "harvest" | "protect_frost" | "no_action";
  urgency: "low" | "medium" | "high";
  message: string;
  source: "rule" | "ai" | "hybrid";
}
```

2. **Rule layer** — implement first, covers 80% of cases:

```
if soilMoisture < 30 and rainfallNext24h < 2:
  return { action: irrigate, urgency: high, source: rule,
           message: "Soil moisture critical. Irrigate within 24 hours." }

if soilMoisture < 45 and rainfallNext24h < 2:
  return { action: irrigate, urgency: medium, source: rule, ... }

if minTempNext48h < 5:
  return { action: protect_frost, urgency: high, source: rule, ... }

if crop and daysSincePlanting(crop) > cropCycleDays(crop.type):
  return { action: harvest, urgency: medium, source: rule, ... }
```

Hard-code `cropCycleDays` for maize (120), cassava (300), tomato (90), beans (75), rice (130).

3. **AI layer (Gemini)** — if no rule fires, call Gemini. Install `@google/generative-ai`. In the service:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `You are an agronomy assistant for small-scale farmers in Cameroon.
Based on the data below, return ONLY a JSON object with keys
action (one of: irrigate, plant, fertilize, harvest, protect_frost, no_action),
urgency (low|medium|high),
and a short message (one sentence, under 120 characters).

Data:
- Crop: ${input.crop?.type ?? "unknown"}
- Days since planting: ${daysSincePlanting}
- Soil moisture: ${input.observation.soilMoisture}%
- Temperature: ${input.observation.temperatureC}°C
- Weather condition: ${input.weather.condition}
- Rainfall next 24h: ${input.weather.rainfallNext24h}mm
- Min temp next 48h: ${input.weather.minTempNext48h}°C

Respond with JSON only, no markdown, no code fences.`;

const result = await model.generateContent(prompt);
const text = result.response.text().trim().replace(/^```json|```$/g, "");
const parsed = JSON.parse(text);
```

Wrap the AI call in a try/catch. If Gemini fails (network, quota, parse error), fall back to `{ action: "no_action", urgency: "low", message: "No action needed.", source: "rule" }`.

4. **Event wiring** — in `backend/src/events/consumer.ts` register a consumer for the `farm.data.submitted` stream. On each event:
   - Load the observation, crop, and latest weather snapshot
   - Call `generateRecommendation(input)`
   - Insert into `recommendations` with `event_id = event.id` for idempotency
   - Publish a `recommendation.created` event
   - On failure, do not ack

5. Register a second consumer for `recommendation.created` that inserts a row into `notifications` for the farm owner (FR-20).

6. Start both consumers from a separate entry point `backend/src/worker.ts` so the API process and the worker can scale independently on Kubernetes.

**Acceptance:** submit an observation with `soilMoisture=20` → a recommendation with `action=irrigate, urgency=high` appears within 5 seconds and a notification is created for the farm owner. Submit the same event id twice → only one recommendation. Unit tests for the rule layer cover all branches.

---

## Task 8 — Farm, observation, recommendation, notification endpoints

**Goal:** Complete the REST API exposed to the frontend.

**Instructions:**

All routes below require `requireAuth`. Farm-scoped routes must verify `farm.user_id === req.user.sub` before reading/writing.

- `POST /api/farms` — create farm, body `{ name, latitude, longitude, sizeHa, soilType }`
- `GET /api/farms` — list farms for current user
- `GET /api/farms/:id` — single farm
- `POST /api/farms/:id/crops` — add crop
- `GET /api/farms/:id/crops` — list crops
- `POST /api/farms/:id/observations` — body `{ cropId?, soilMoisture, temperatureC, notes? }`. On success, insert the observation, then publish a `farm.data.submitted` event with a fresh UUID, and return the observation.
- `GET /api/farms/:id/observations?limit=50` — list observations
- `GET /api/farms/:id/recommendations?limit=20` — list recommendations
- `GET /api/notifications?unread=true` — list notifications for current user
- `PATCH /api/notifications/:id/read` — mark as read
- `GET /health` — `{ status: "ok", db: "ok" | "down", redis: "ok" | "down" }`
- `GET /metrics` — Prometheus metrics endpoint (install `prom-client`, expose default + custom `http_requests_total` and `recommendation_generation_seconds` histogram)

Validate all request bodies with zod. Use the error middleware from Task 4.

**Acceptance:** A Postman collection (create one at `backend/postman/AgroSense.postman_collection.json`) walks through the full flow: register → login → create farm → add crop → submit observation → wait 2s → list recommendations → list notifications.

---

## Task 9 — Modify the existing landing page (professional + innovative)

**Goal:** Upgrade the existing landing page **in place**. Do not create a new file — find the existing landing page component and rewrite its content. Use Tailwind classes only; do not add new dependencies unless listed below.

**Design direction:**
- **Hero:** dark gradient background (`bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900`), large headline "AgroSense AI — Smart Decisions for Every Farm", subheadline about event-driven AI advisory for small-scale farmers, two CTAs (`Get Started` → /register, `Sign In` → /login). Add a subtle animated gradient or a floating SVG of leaves/wheat. Use `text-white` with `text-emerald-200` accents.
- **Stats strip:** 4 metrics — "< 2s recommendations", "500+ farmers supported", "99% uptime", "Bilingual EN/FR". Use `grid grid-cols-2 md:grid-cols-4 gap-6` with icons from `lucide-react` (already in tailwind-friendly projects; if not installed, run `npm i lucide-react`).
- **Features section:** 6 cards in a `grid md:grid-cols-2 lg:grid-cols-3 gap-6`, each with an icon, title, one-sentence description. Use these six:
  1. Real-time weather integration (CloudRain icon)
  2. AI crop recommendations (Sparkles icon)
  3. Smart irrigation alerts (Droplets icon)
  4. Event-driven architecture (Zap icon)
  5. Mobile-friendly dashboard (Smartphone icon)
  6. Bilingual support (Languages icon)
  Cards: `rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition`
- **How it works section:** 4-step numbered timeline. Steps: "Register your farm" → "Submit daily observations" → "AI analyses weather + soil" → "Receive actionable advice". Use vertical line on desktop, stacked on mobile.
- **Testimonial / quote block** with a stylized quote about smallholder farming impact.
- **Footer:** logo, quick links (Features, How it works, Sign in, Register), copyright, social icons.

**Innovation touches:**
- Use `backdrop-blur-sm` and semi-transparent cards over the hero.
- Add a small "Powered by Gemini AI" badge in the hero.
- Smooth scroll behavior (`html { scroll-behavior: smooth }` in index.css if not already).
- Respect `prefers-reduced-motion`.
- Fully responsive from 360px to 1920px (NFR-12).
- Add `aria-label`s on icon-only buttons, keyboard-focusable CTAs.

**Acceptance:** the page renders cleanly at mobile, tablet, and desktop widths. Lighthouse accessibility score ≥ 90. No console warnings. All CTAs navigate to the existing auth routes.

---

## Task 10 — Modify the existing authentication pages

**Goal:** Upgrade the existing login and register pages **in place** for polish and correct wiring to the backend API.

**Design:**
- Split-screen layout on desktop (`md:grid md:grid-cols-2`): left panel is a branded emerald gradient with the AgroSense logo, tagline, and a short marketing line; right panel is the form. On mobile, stack vertically with the form on top.
- Form card: `rounded-2xl bg-white p-8 shadow-xl max-w-md w-full`.
- Inputs: floating labels or top-aligned labels with `focus:ring-2 focus:ring-emerald-500`. Show inline validation errors in red below each field.
- Primary button: `w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-3 transition disabled:opacity-60`. Disable while submitting, show a spinner.
- Link to the other auth page at the bottom.
- Show API errors in a red banner above the form.

**Wiring:**
- Create `src/lib/api.ts` (or similar, adapt to existing structure) with an axios instance pointing to `VITE_API_BASE_URL` (default `http://localhost:4000`).
- Register form posts to `POST /api/auth/register`, login to `POST /api/auth/login`.
- On success, store `{ user, token }` in a React context `AuthContext` and persist the token in `localStorage` under `agrosense_token`.
- Add an axios interceptor that attaches `Authorization: Bearer <token>` on every request.
- Add `ProtectedRoute` wrapper that redirects unauthenticated users to `/login`.
- Redirect to `/dashboard` on successful login/register.

**Validation (client side with zod + react-hook-form):**
- Install if not already: `npm i react-hook-form @hookform/resolvers zod`
- Register: name ≥ 2 chars, valid email, phone optional but if present E.164-like, password ≥ 8 chars.
- Login: valid email, password ≥ 8 chars.

**Acceptance:** full round trip works against the local backend. Wrong password shows "Invalid credentials" banner. Duplicate email on register shows "Email already registered". Refreshing the page keeps the user logged in.

---

## Task 11 — Farmer Dashboard

**Goal:** Build the main dashboard route at `/dashboard`, accessible only when authenticated.

**Layout:**
- Top navbar: logo, current farm selector dropdown, language toggle (EN/FR), notifications bell with unread badge, user menu (profile, logout).
- Left sidebar on desktop (collapsible on mobile): links to Overview, Farms, Observations, Recommendations, Notifications.
- Main content area with a responsive grid.

**Overview page tiles:**
1. **Weather card** — current temperature, condition icon, 7-day mini-forecast. Fetches `GET /api/weather/:farmId`. Auto-refresh every 10 minutes.
2. **Submit observation card** — compact form with soil moisture slider (0-100%), temperature input, notes textarea, crop dropdown, submit button. On submit, `POST /api/farms/:id/observations`, show toast, refresh recommendations tile.
3. **Recent recommendations card** — list the 5 latest, each showing action icon, urgency badge (color-coded: red/yellow/green), message, time-ago. Click to see full context.
4. **Observations history card** — sparkline chart of soil moisture over the last 14 days (use `recharts` if available, otherwise a simple SVG).
5. **Farm summary card** — farm name, size, crops planted, days since planting.

**Notifications page:**
- List all notifications, unread first, with mark-as-read and dismiss actions.
- Polling every 30 seconds or use a simple `setInterval`; no websockets required for v1.

**Farms page:**
- List farms, "Add farm" button opens a modal with name, latitude, longitude, size, soil type. Include a "use my location" button using `navigator.geolocation`.

**Innovation touches:**
- Show an "AI" badge on recommendations where `source === 'ai'` or `'hybrid'`.
- A toggle at the top of the dashboard to switch language between English and French. Implement a minimal i18n layer: `src/i18n/en.ts` and `src/i18n/fr.ts` objects with keys like `dashboard.submit`, a `useT()` hook that reads the locale from context.
- Offline-friendly: show a banner "You are offline" when `navigator.onLine` is false.

**Acceptance:** full flow — log in, create a farm, submit an observation with low moisture, see an "irrigate / high" recommendation appear within ~5 seconds, see a new notification in the bell.

---

## Task 12 — Dockerfile (multi-stage) for backend

Create `backend/Dockerfile`:

```dockerfile
# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --production

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
USER app
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1
CMD ["node", "dist/index.js"]
```

Create `backend/.dockerignore`:

```
node_modules
dist
npm-debug.log
.env
.env.*
!.env.example
__tests__
coverage
*.md
```

Also create `frontend/Dockerfile` (adjust path to match the existing frontend folder) using a similar two-stage build: stage 1 builds with `npm run build`, stage 2 uses `nginx:alpine` to serve `/usr/share/nginx/html`. Include a minimal `nginx.conf` that proxies `/api` to the backend service and serves `index.html` for all other routes (SPA routing).

**Acceptance:** `docker build -t agrosense-backend ./backend` succeeds, image size < 250MB, and `docker run -p 4000:4000 --env-file backend/.env agrosense-backend` starts successfully.

---

## Task 13 — docker-compose.yml for local dev (full stack)

Create `docker-compose.yml` at the repo root (separate from the dev-only one in Task 1). This runs the **whole application**.

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: agrosense
      POSTGRES_PASSWORD: agrosense_dev
      POSTGRES_DB: agrosense
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agrosense"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      PORT: 4000
      NODE_ENV: production
      DATABASE_URL: postgresql://agrosense:agrosense_dev@postgres:5432/agrosense
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-dev_secret_change_me}
      OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      CORS_ORIGIN: http://localhost:8080
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "4000:4000"

  worker:
    build: ./backend
    command: ["node", "dist/worker.js"]
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://agrosense:agrosense_dev@postgres:5432/agrosense
      REDIS_URL: redis://redis:6379
      OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build: ./frontend   # adjust to actual path
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  pgdata:
  redisdata:
```

Add a `.env` template at the repo root documenting `JWT_SECRET`, `OPENWEATHER_API_KEY`, `GEMINI_API_KEY`.

**Acceptance:** `docker compose up --build` brings the whole stack up and the frontend at `http://localhost:8080` can register/login against the backend.

---

## Task 14 — Jenkinsfile with 5 pipeline stages

Create `Jenkinsfile` at the repo root:

```groovy
pipeline {
  agent any

  environment {
    REGISTRY  = "docker.io/youraccount"
    IMAGE     = "agrosense-backend"
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {
    stage('1. Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .git-sha'
      }
    }

    stage('2. Install') {
      steps {
        dir('backend') {
          sh 'npm ci'
        }
      }
    }

    stage('3. Test') {
      steps {
        dir('backend') {
          sh 'npm test -- --reporter=verbose'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'backend/coverage/junit.xml'
          archiveArtifacts artifacts: 'backend/coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('4. Build Docker image') {
      steps {
        dir('backend') {
          sh "docker build -t ${REGISTRY}/${IMAGE}:${IMAGE_TAG} -t ${REGISTRY}/${IMAGE}:latest ."
        }
      }
    }

    stage('5. Deploy') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub',
                                          usernameVariable: 'DOCKER_USER',
                                          passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          sh "docker push ${REGISTRY}/${IMAGE}:${IMAGE_TAG}"
          sh "docker push ${REGISTRY}/${IMAGE}:latest"
        }
        // For Kubernetes deploy (uncomment when cluster is configured):
        // sh "kubectl set image deployment/agrosense-backend api=${REGISTRY}/${IMAGE}:${IMAGE_TAG} -n agrosense"
      }
    }
  }

  post {
    success { echo "Pipeline succeeded for build ${IMAGE_TAG}" }
    failure { echo "Pipeline failed. Check the logs." }
    always  { cleanWs() }
  }
}
```

### Connecting Jenkins to GitHub via webhook

Add a `docs/JENKINS_SETUP.md` file with these steps:

1. In Jenkins, install plugins: Git, Pipeline, Docker Pipeline, Credentials Binding, GitHub.
2. Create a new Pipeline job. Configure:
   - Pipeline → Definition: *Pipeline script from SCM*
   - SCM: Git, URL of the repo, credentials
   - Branches: `*/main`
   - Script Path: `Jenkinsfile`
   - Build Triggers: *GitHub hook trigger for GITScm polling*
3. In GitHub → Settings → Webhooks → Add webhook:
   - Payload URL: `http://<jenkins-host>:8080/github-webhook/` (trailing slash matters)
   - Content type: `application/json`
   - Events: "Just the push event"
4. In Jenkins → Manage Credentials, add:
   - `dockerhub` — username+password for Docker Hub
   - `github-pat` — personal access token if the repo is private
5. Push a commit to `main` → the webhook fires → Jenkins should queue a new build within seconds.
6. Verify `Build Now` works manually first before relying on the webhook.

**Acceptance:** `Jenkinsfile` exists at repo root, passes `Jenkinsfile` lint (use `jenkins-cli declarative-linter` or the Jenkins UI "Pipeline Syntax" → "Declarative Directive Generator"). The `JENKINS_SETUP.md` is clear enough to follow without help.

---

## Task 15 — Ansible playbook: install_packages.yml

Create `ansible/install_packages.yml`:

```yaml
---
- name: Install AgroSense base packages on Ubuntu host
  hosts: webservers
  become: yes
  vars:
    nodejs_version: "20"

  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install base utilities
      apt:
        name:
          - curl
          - git
          - ufw
          - ca-certificates
          - gnupg
          - lsb-release
        state: present

    - name: Add NodeSource apt key
      apt_key:
        url: "https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key"
        state: present

    - name: Add NodeSource repository
      apt_repository:
        repo: "deb https://deb.nodesource.com/node_{{ nodejs_version }}.x {{ ansible_distribution_release }} main"
        state: present
        filename: nodesource

    - name: Install Node.js
      apt:
        name: nodejs
        state: present
        update_cache: yes

    - name: Install PostgreSQL
      apt:
        name:
          - postgresql
          - postgresql-contrib
          - python3-psycopg2
        state: present

    - name: Ensure PostgreSQL is running
      service:
        name: postgresql
        state: started
        enabled: yes

    - name: Install Redis
      apt:
        name: redis-server
        state: present

    - name: Ensure Redis is running
      service:
        name: redis-server
        state: started
        enabled: yes

    - name: Install Docker dependencies
      apt:
        name:
          - apt-transport-https
          - software-properties-common
        state: present

    - name: Add Docker GPG key
      apt_key:
        url: https://download.docker.com/linux/ubuntu/gpg
        state: present

    - name: Add Docker repository
      apt_repository:
        repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
        state: present

    - name: Install Docker
      apt:
        name:
          - docker-ce
          - docker-ce-cli
          - containerd.io
          - docker-compose-plugin
        state: present
        update_cache: yes

    - name: Ensure Docker is running
      service:
        name: docker
        state: started
        enabled: yes

    - name: Print installed versions
      shell: |
        node --version
        psql --version
        redis-server --version
        docker --version
      register: versions
      changed_when: false

    - name: Show versions
      debug:
        var: versions.stdout_lines
```

Also create `ansible/inventory.ini` with a placeholder:

```ini
[webservers]
# vps1 ansible_host=YOUR_VPS_IP ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa
```

And `ansible/ansible.cfg`:

```ini
[defaults]
inventory = ./inventory.ini
host_key_checking = False
retry_files_enabled = False
```

Add `ansible/README.md`:

```
# Running the playbook

1. Edit inventory.ini with your VPS IP and SSH user.
2. Run: ansible-playbook install_packages.yml
3. Verify by SSHing into the host and running: node -v && psql --version && redis-cli ping
```

**Acceptance:** `ansible-playbook --syntax-check install_packages.yml` passes. Against a real Ubuntu 22.04 VPS (or a local Vagrant VM), running it installs all five components and the final debug task prints their versions.

---

## Global acceptance checklist

After finishing all tasks, verify:

- [ ] `docker compose up --build` brings the full stack up
- [ ] Frontend loads at `http://localhost:8080` with the redesigned landing page
- [ ] Register + login work end to end
- [ ] Creating a farm and submitting an observation with `soilMoisture=20` produces an "irrigate/high" recommendation within 5 seconds
- [ ] The same event replayed does not produce a duplicate (idempotency)
- [ ] `GET /metrics` returns Prometheus-compatible output
- [ ] `GET /health` reports `db: ok, redis: ok`
- [ ] `npm test` in `backend/` passes with ≥ 80% coverage
- [ ] `Jenkinsfile` passes lint
- [ ] `ansible-playbook --syntax-check ansible/install_packages.yml` passes
- [ ] No secrets are committed — every `.env` is gitignored, only `.env.example` is tracked

---

## Notes for Claude Code

- Work through tasks in order. Do not skip ahead — later tasks depend on earlier ones.
- After each task, run the task's acceptance command before moving on.
- If a file conflicts with something that already exists, **read the existing file first** and merge rather than overwrite.
- If a dependency is already installed, do not reinstall.
- When you encounter an ambiguity, prefer the simpler, more maintainable option.
- Commit after each completed task with a conventional commit message: `feat(backend): add auth endpoints (task 4)`.