# AgroSense AI Services Implementation Handoff

## Why This Document Exists

This handoff explains, in engineering detail, what is currently implemented across backend and frontend so any team member can quickly understand:

- what each service is responsible for,
- how data flows between services,
- where validation and security boundaries are enforced,
- what was hardened in this iteration,
- and where to extend next without breaking current behavior.

## Scope of Work Completed

Core hardening and cleanup was completed in:

- services/notification-service
- services/soil-service
- services/weather-service

And integrated context/verification was documented for:

- services/auth-service
- services/api-gateway
- frontend (all current pages and route coverage)

## High-Level Architecture Overview

AgroSense is currently structured as event-driven microservices around Kafka topics:

1. Farm domain publishes `farm.saved`.
2. Soil service consumes `farm.saved`, computes soil metrics, saves to DB, publishes `soil.analyzed`.
3. Weather service consumes `farm.saved`, fetches OpenWeather data, saves to DB, publishes `weather.fetched`.
4. Orchestrator/AI pipeline (existing design) eventually produces `recommendation.generated`.
5. Notification service consumes `recommendation.generated`, sends email, persists notification log.

Auth service and API gateway provide HTTP-side access control and request handling.

## Detailed Service Breakdown

## Auth Service

Path: `services/auth-service`

### Auth Responsibility

Auth is the identity and session boundary for user-facing clients. It owns registration, login, JWT issuance, and authenticated self-profile fetch.

### Auth HTTP Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Auth Internal Flow

1. Request enters Express app with security middleware (`helmet`, `cors`, `morgan`, JSON body parsing).
2. Route-level validation runs with Zod through `validateBody` middleware.
3. Controller delegates business logic to service layer.
4. Service layer interacts with Prisma and applies security logic:
   - password hashing with bcrypt,
   - credential verification,
   - JWT generation with role/email claims.
5. Error middleware maps known app errors to stable HTTP responses.

### Auth Security Model

- Password hashes are never exposed in API responses.
- Only selected public user fields are returned (`publicUserSelect`).
- Login rejects inactive users and invalid credentials uniformly.
- JWT claims include subject (`sub`), role, and email.

### Auth Key Implementation Files

- `src/app.ts`
- `src/routes/auth.routes.ts`
- `src/controllers/auth.controller.ts`
- `src/services/auth.service.ts`
- `src/middleware/auth.middleware.ts`
- `src/middleware/error.middleware.ts`

## Soil Service

Path: `services/soil-service`

### Soil Responsibility

Soil service transforms a farm submission into analyzable soil metrics and publishes normalized event output for downstream recommendations.

### Soil Event Contract

Input topic:

- `farm.saved`

Output topic:

- `soil.analyzed`

### Soil Hardening Added

- Strong schema constraints for incoming farm event:
  - non-empty `name`, `location`, `cropType` (trimmed),
  - bounded GPS: `gpsLat` in [-90, 90], `gpsLng` in [-180, 180].
- Service test isolation:
  - Prisma is imported lazily inside the processing function, which allows pure-unit tests to run without DB client loading.

### Soil Processing Pipeline

1. Kafka consumer receives `farm.saved` message.
2. JSON parsing + schema validation (`safeParse`).
3. Soil data simulation executes (`simulateSoilData`).
4. Record persisted to `soil_data` table.
5. Canonical `soil.analyzed` event constructed and published.

### Soil Data Persistence

Prisma model stores:

- pH,
- moisture,
- N/P/K values,
- analysis timestamp,
- farm reference ID.

### Soil Key Implementation Files

- `src/index.ts`
- `src/events/consumers/farm-saved.consumer.ts`
- `src/services/soil.service.ts`
- `src/events/producers/soil-analyzed.producer.ts`
- `src/models/soil.model.ts`

## Weather Service

Path: `services/weather-service`

### Weather Responsibility

Weather service enriches farm submissions with live external weather context and emits normalized weather events.

### Weather Event Contract

Input topic:

- `farm.saved`

Output topic:

- `weather.fetched`

### Weather Hardening Added

- Incoming farm payload validation tightened to the same quality bar as soil service:
  - trimmed non-empty fields,
  - bounded GPS coordinates.
- Runtime dependency isolation:
  - Prisma imported lazily in processing path,
  - `OPENWEATHER_API_KEY` read at runtime only in external fetch path.

### Weather Processing Pipeline

1. Consumer receives `farm.saved`.
2. Payload is parsed and validated.
3. OpenWeather API call is made with provided coordinates.
4. External response shape validated against `openWeatherResponseSchema`.
5. Weather values normalized (`temperature`, `humidity`, `rainfall`, `windSpeed`, `description`).
6. Record persisted to `weather_data` table.
7. `weather.fetched` event published.

### Weather Failure Handling

- Invalid JSON: logged and dropped.
- Schema mismatch: logged and dropped.
- OpenWeather/API failure: caught and logged; processing does not crash service loop.

### Weather Key Implementation Files

- `src/index.ts`
- `src/events/consumers/farm-saved.consumer.ts`
- `src/services/weather.service.ts`
- `src/events/producers/weather-fetched.producer.ts`
- `src/models/weather.model.ts`

## Notification Service

Path: `services/notification-service`

### Notification Responsibility

Notification service delivers recommendation outcomes to end users (currently email) and stores an auditable notification record.

### Notification Event Contract

Input topic:

- `recommendation.generated`

Output topic:

- none currently (persistence + outbound email only)

### Notification Hardening Added

- Recommendation event schema now rejects whitespace-only `userName` and `recommendation`.
- Email template path decoupled from strict env import to keep unit tests deterministic.
- SMTP config resolved lazily at send time with safe defaults for non-send contexts.

### Notification Processing Pipeline

1. Consumer receives `recommendation.generated`.
2. Payload parsed + Zod validated.
3. Email payload and HTML template generated.
4. SMTP transport sends message.
5. Notification row saved in DB (`channel='email'`, with user/farm refs and message body).

### Notification Key Implementation Files

- `src/index.ts`
- `src/events/consumers/recommendation-generated.consumer.ts`
- `src/services/notification.service.ts`
- `src/services/email.service.ts`
- `src/models/notification.model.ts`

## API Gateway

Path: `services/api-gateway`

### Gateway Responsibility

Gateway is the HTTP ingress scaffold where route modules from domain services will be mounted and consistently protected/validated.

### Gateway Current Behavior

- Health endpoint implemented.
- Global not-found and error handlers implemented.
- Validation middleware implemented and tested.
- Service-specific route mounts intentionally left scaffolded for incremental rollout.

### Gateway Key Implementation Files

- `src/app.ts`
- `src/index.ts`
- `src/middleware/error.ts`
- `src/middleware/validate.ts`
- `tests/middleware/validate.test.ts`

## Frontend Implementation Status

Path: `frontend/src`

### Route Coverage

All current page routes are implemented and wired:

- Public:
  - `/`
  - `/login`
  - `/register`
- Farmer dashboard (protected):
  - `/dashboard`
  - `/dashboard/farms`
  - `/dashboard/recommendations`
  - `/dashboard/notifications`
- Admin (protected):
  - `/admin`
  - `/admin/users`
  - `/admin/notifications`

### Auth UX (Advanced Behavior)

- Existing secure email/password flow retained.
- Modern passkey flow added in frontend:
  - passkey capability detection,
  - optional passkey enrollment after successful sign-in,
  - biometric-capable sign-in button (fingerprint/face where device supports WebAuthn platform authenticators),
  - safe fallback to password sign-in at all times.
- Session bootstrapping and route protection are implemented through AuthContext + ProtectedRoute.

### Dashboard UX Quality

- Admin and farmer pages are fully implemented (not placeholders).
- Stat cards, tables, activity feeds, and quick actions are in place.
- Theme support (light/dark) is applied consistently.
- Notification filter UI was hardened to avoid dynamic Tailwind class-generation pitfalls.

## Testing and Verification Status

All targeted services were validated with Bun test suites after the hardening updates.

Full-suite pass summary (latest validated baseline):

- `services/soil-service`: 20 passing, 0 failing
- `services/weather-service`: 23 passing, 0 failing
- `services/notification-service`: 14 passing, 0 failing
- `services/auth-service`: 17 passing, 0 failing
- `services/api-gateway`: 6 passing, 0 failing

## What Team Members Should Know Before Extending

1. Treat Zod schemas as service boundaries.
2. Keep event names and payload keys stable once consumed by downstream services.
3. Preserve lazy runtime imports used to keep tests isolated and fast.
4. Add tests first for boundary changes (schema, auth, event contracts).
5. Extend gateway by mounting explicit route modules per domain service.
6. If passkey is moved to production-grade server-verified WebAuthn, add backend challenge/attestation verification in auth-service.

## Next Recommended Engineering Steps

- Add producer/consumer contract tests across services.
- Add Kafka retry/backoff + dead-letter routing for transient failures.
- Add notification delivery status events (`sent`, `failed`) if orchestrator analytics require it.
- Expose read APIs for soil/weather/notifications for richer dashboard data hydration.
