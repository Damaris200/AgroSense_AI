# 🌱 AgroSense AI

> An event-driven microservices platform that helps small-scale farmers make data-driven decisions using AI and real-time information.

AgroSense AI collects farm, weather, and soil data, processes it asynchronously through Kafka-powered microservices, and delivers personalized AI-generated recommendations — such as optimal planting times and irrigation schedules — directly to the farmer.

---

## Table of Contents

- [Why this project](#why-this-project)
- [Architecture at a glance](#architecture-at-a-glance)
- [Services](#services)
- [Event flow](#event-flow)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running tests](#running-tests)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [Documentation index](#documentation-index)

---

## Why this project

Small-scale farmers often lose crops due to poor timing — planting too early, irrigating too late, or misreading soil and weather signals. AgroSense AI solves this by automating the analysis: the farmer submits basic farm data once, and the system orchestrates weather lookups, soil analysis, and AI-generated recommendations behind the scenes, then notifies them when insights are ready.

The system is **event-driven** rather than request/response because real agricultural analysis is inherently asynchronous — weather APIs are slow, AI inference takes seconds, and notifications need retry logic. Events decouple all of this.

---

## Architecture at a glance

```
CLIENT (React)
    │  HTTP POST /api/farm
    ▼
API GATEWAY  ──publishes──►  farm.submitted
                                   │
                                   ▼
                            FARM SERVICE  ──►  farm.saved
                                   │
                        ┌──────────┴──────────┐
                        ▼                     ▼
                 WEATHER SERVICE        SOIL SERVICE
                        │                     │
                  weather.fetched        soil.analyzed
                        │                     │
                        └──────────┬──────────┘
                                   ▼
                            ORCHESTRATOR
                                   │
                            analysis.ready
                                   ▼
                             AI SERVICE
                                   │
                         recommendation.generated
                                   ▼
                         NOTIFICATION SERVICE
                                   │
                                   ▼
                          📧 / 📱 to farmer
```

**Core principles:**

- Each service owns its own database. No service reads another service's tables.
- All inter-service communication happens through Kafka events — never direct HTTP calls between services.
- The API Gateway is the **only** entry point for clients.
- The Orchestrator coordinates multi-step workflows that need data from multiple services.

---

## Services

| Service                        | Responsibility                                                          | Owns DB             |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------- |
| **API Gateway**          | Single entry point. Validates incoming requests, publishes events.      | —                  |
| **Auth Service**         | Registration, login, JWT issuance and validation.                       | `auth_db`         |
| **Farm Service**         | Persists farm submissions. Publishes `farm.saved`.                    | `farm_db`         |
| **Weather Service**      | Fetches weather data via OpenWeather API.                               | `weather_db`      |
| **Soil Service**         | Analyzes (or simulates) soil data.                                      | `soil_db`         |
| **Orchestrator**         | Waits for weather + soil per submission, then emits `analysis.ready`. | (state store)       |
| **AI Service**           | Calls the LLM, generates recommendations.                               | `ai_db`           |
| **Notification Service** | Delivers recommendations via email/SMS/in-app.                          | `notification_db` |
| **Analytics Service**    | Logs events and metrics across the system.                              | `analytics_db`    |

See **[docs/EVENTS.md](./docs/EVENTS.md)** for the full event contract.

---

## Event flow

| # | Topic                        | Producer        | Consumer(s)             | Purpose                          |
| - | ---------------------------- | --------------- | ----------------------- | -------------------------------- |
| 1 | `farm.submitted`           | API Gateway     | Farm Service            | New farm data from client        |
| 2 | `farm.saved`               | Farm Service    | Weather, Soil           | Farm persisted, trigger analysis |
| 3 | `weather.fetched`          | Weather Service | Orchestrator            | Weather ready for this farm      |
| 4 | `soil.analyzed`            | Soil Service    | Orchestrator            | Soil ready for this farm         |
| 5 | `analysis.ready`           | Orchestrator    | AI Service              | Both weather + soil ready        |
| 6 | `recommendation.generated` | AI Service      | Notification, Analytics | AI output ready                  |

Full schemas, examples, and error-handling rules are in **[docs/EVENTS.md](./docs/EVENTS.md)**.

---

## Tech stack

- **Runtime:** Bun (TypeScript)
- **Messaging:** Apache Kafka + Zookeeper
- **Database:** PostgreSQL 15 (one instance, multiple named databases)
- **Frontend:** React + Vite + TailwindCSS
- **AI:** Google Gemini API (swappable with OpenAI)
- **Validation:** Zod
- **Containerization:** Docker + Docker Compose
- **CI/CD:** Jenkins
- **Testing:** Jest, Supertest, Cypress

---

## Repository structure

```
agrosense/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── farm-service/
│   ├── weather-service/
│   ├── soil-service/
│   ├── orchestrator-service/
│   ├── ai-service/
│   ├── notification-service/
│   └── analytics-service/
│
├── frontend/
│
├── shared/
│   ├── kafka/         # shared Kafka producer/consumer helpers
│   ├── types/         # shared TypeScript types (event schemas)
│   └── utils/
│
├── infrastructure/
│   └── postgres/
│       ├── init/      # runs on Postgres first boot (DB creation)
│       └── schemas/   # per-database table schemas
│
├── tests/
│   └── infrastructure/  # cross-cutting infra tests
│
├── docs/
│   ├── EVENTS.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml
├── Jenkinsfile
├── package.json
└── README.md
```

---

## Getting started

### Prerequisites

- **Docker** and **Docker Compose** (v2+)
- **Bun** (for running tests and local service development) — [install guide](https://bun.sh)
- **Git**

### 1. Clone the repo

```bash
git clone <your-repo-url> agrosense
cd agrosense
```

### 2. Start the infrastructure

This brings up Postgres (with all databases auto-created), Kafka, and Zookeeper:

```bash
docker compose up -d postgres kafka zookeeper
```

Wait for Postgres to be healthy:

```bash
docker compose ps
```

Verify all 7 databases were created:

```bash
docker exec agrosense-postgres psql -U postgres -c "\l"
```

You should see: `auth_db`, `farm_db`, `weather_db`, `soil_db`, `ai_db`, `notification_db`, `analytics_db`.

### 3. Install dependencies

At the repo root:

```bash
bun install
```

### 4. Start a specific service

```bash
cd services/api-gateway
bun install
bun run dev
```

### 5. Start everything

```bash
docker compose up -d
```

### 6. Reset everything (fresh start)

```bash
docker compose down -v   # -v wipes volumes, so DBs will re-init
docker compose up -d
```

> ⚠️ **Important:** Postgres init scripts (`infrastructure/postgres/init/`) only run on an **empty** volume. If you change them, you must `down -v` first or they won't apply.

---

## Environment variables

Each service has its own `.env`. Example for Farm Service:

```env
# services/farm-service/.env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/farm_db
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=farm-service
KAFKA_GROUP_ID=farm-service-group
PORT=3002
```

Copy the `.env.example` in each service folder when setting up locally.

**Never commit real `.env` files.** They are in `.gitignore`.

---

## Running tests

### All tests

```bash
bun test
```

### A specific service

```bash
cd services/farm-service
bun test
```

### With coverage

```bash
bun test --coverage
```

Coverage target: **70%+ across all services.**

Infrastructure tests under `tests/infrastructure/` are opt-in on local machines. Run them after starting Docker with `RUN_INFRA_TESTS=1 bun test tests/infrastructure`.

### Test philosophy — TDD

We write tests **before** the code, not after. The loop is:

1. Write a failing test that describes what the code should do.
2. Run it — confirm it fails for the right reason.
3. Write the minimum code to make it pass.
4. Refactor.
5. Commit.

We write three kinds of tests:

| Kind                  | What it tests                                      | Tools                 |
| --------------------- | -------------------------------------------------- | --------------------- |
| **Unit**        | Pure functions, schemas, validators                | Jest                  |
| **Integration** | Service + DB, service + Kafka                      | Jest + Testcontainers |
| **E2E**         | Full flow: form submit → recommendation displayed | Cypress               |

---

## CI/CD

Every push to `main` or a pull-request branch triggers the Jenkins pipeline defined in `Jenkinsfile`:

```
Clone → Install → Test → Coverage → Build Docker → (Deploy)
```

If any stage fails, the pipeline stops and the build is marked red. Deployment only runs on `main` after all tests pass.

Build history, test reports, and coverage are viewable in the Jenkins UI.

---

## Contributing

### Branch naming

- `feature/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `refactor/<short-description>` — internal changes with no behavior change
- `docs/<short-description>` — docs only

### Commit messages

Use **Conventional Commits**:

```
feat(farm-service): add farm.saved event publisher
fix(api-gateway): reject requests with unknown fields
docs(events): add example payload for recommendation.generated
test(auth): cover expired JWT case
```

### Pull request checklist

- [ ] Tests written and passing locally
- [ ] Coverage hasn't dropped
- [ ] No direct service-to-service HTTP calls added
- [ ] New events documented in `docs/EVENTS.md`
- [ ] `README.md` updated if setup steps changed
- [ ] No secrets or `.env` files committed

### The hard rules

1. **One service = one job.** If a service starts doing two things, split it.
2. **No direct service calls.** Services communicate only through Kafka.
3. **No cross-database reads.** A service reads only its own DB.
4. **Always define the event first.** Event schema goes in `docs/EVENTS.md` and `shared/types/` before any producer/consumer code.
5. **Use AI for code, not for decisions.** Architectural choices are ours to make.

---

## Documentation index

- **[docs/EVENTS.md](./docs/EVENTS.md)** — full Kafka event contract (topics, payloads, examples, error handling)
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — deeper architectural rationale *(to be added)*

---

## Team

Built by the AgroSense team as a real-world demonstration of event-driven architecture and applied AI in agriculture.
