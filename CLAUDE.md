# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Infrastructure
```bash
# Start only infra (just Kafka — databases are managed externally)
docker compose up -d kafka

# Start everything
docker compose up -d

# Reset everything — wipes Kafka volume only; managed DBs are untouched
docker compose down -v && docker compose up -d
```

> **Critical:** Self-hosted Postgres has been removed. Relational data lives on **Neon** (free tier) and document data on **MongoDB Atlas M0** (free tier). Connection strings come from `.env` for local dev and from `agrosense-secrets` (created imperatively by Ansible from `vault.yml`) in production.

### Service development (run from inside each service directory)
```bash
bun run dev          # hot-reload dev server
bun run typecheck    # TypeScript check without emit
bun test             # run tests with coverage
bun test --coverage  # explicit coverage report
```

### Prisma (per service)
```bash
# Relational services (auth, farm) — Postgres on Neon
bun run prisma:migrate          # create + apply a new migration (dev)
bun run prisma:migrate:deploy   # apply existing migrations (prod/docker)

# Document services (weather, soil, ai, notification, analytics) — MongoDB Atlas
bun run prisma:push             # push schema to MongoDB (no migrations on Mongo)

# All services
bun run prisma:generate         # regenerate Prisma client
```

### Frontend (from `frontend/`)
```bash
bun run dev     # Vite dev server (port 5173)
bun run build   # production build
bun run lint    # ESLint
```

### Single test file
```bash
bun test src/__tests__/auth.service.test.ts
```

## Architecture

AgroSense AI is a **Kafka-driven microservices platform** that produces personalised farming recommendations. A client HTTP request triggers a chain of asynchronous events; no service calls another service directly over HTTP.

### Request → Recommendation flow

```
React frontend  →  API Gateway (4000)
                       │ publishes farm.submitted
                       ▼
                   Farm Service (4002)  →  farm.saved
                       │
              ┌────────┴────────┐
              ▼                 ▼
      Weather Service (3003)  Soil Service (3004)
              │                 │
       weather.fetched     soil.analyzed
              └────────┬────────┘
                       ▼
               Orchestrator (4005)  ←  in-memory state Map
                       │ analysis.ready
                       ▼
                AI Service (4006)   ←  fine-tuned OpenAI GPT-4.1-mini
                       │ recommendation.generated
                 ┌─────┴──────┐
                 ▼            ▼
       Notification (3006)  Analytics (4007)
```

### Hard rules encoded in the codebase
1. The **API Gateway is the only HTTP entry point** for clients. All downstream services communicate via Kafka only.
2. **No service reads another service's database.** Each service owns exactly one logical database (Postgres on Neon for `auth`/`farm`; MongoDB on Atlas for the others).
3. **New Kafka events must be schema-defined first** — add the Zod schema to the consuming service's `src/models/` before writing producer/consumer code.

### Polyglot persistence (free-tier managed)

| Service        | Storage           | Why                                    |
|----------------|-------------------|----------------------------------------|
| auth           | **Neon Postgres** | Unique email constraint, ACID matters  |
| farm           | **Neon Postgres** | Relational, queried by `userId`        |
| weather        | **MongoDB Atlas** | Append-only sensor document            |
| soil           | **MongoDB Atlas** | Append-only sensor document            |
| ai             | **MongoDB Atlas** | LLM recommendation document            |
| notification   | **MongoDB Atlas** | Append-only message log                |
| analytics      | **MongoDB Atlas** | Pure event log with JSON payload       |

Both providers' free tiers allow multiple logical databases inside a single project/cluster. Each service still owns its own logical DB.

### Orchestrator state
The orchestrator holds workflow state in a **plain in-memory `Map`** (`src/state/analysis.state.ts`). It waits for both `weather.fetched` and `soil.analyzed` for the same `submissionId`, then emits `analysis.ready`. This state is **lost on restart** — submissions in-flight during a restart will not complete.

### Service structure convention
Each backend service follows the same layout:
```
src/
  config/       env validation (Zod)
  controllers/  request handlers (Express)
  routes/       Express router mounts
  services/     business logic
  models/       Prisma queries
  events/
    consumers/  Kafka message handlers
    producers/  Kafka publish helpers
  middleware/   auth, error handling
  schemas/      Zod validation schemas
  __tests__/    unit tests (co-located)
```

### Key technology decisions
- **Runtime:** Bun (TypeScript) — all services and the monorepo root use Bun
- **ORM:** Prisma 6.19 (each service has its own `prisma/schema.prisma`; `provider = "postgresql"` for auth/farm, `provider = "mongodb"` for the document services). Pinned to 6.x because Prisma 7 does not yet support MongoDB.
- **Messaging:** KafkaJS connecting to `kafka:29092` (internal Docker network); `localhost:9092` from outside Docker
- **AI model:** Fine-tuned `ft:gpt-4.1-mini-2025-04-14:personal:farm-recommendation:DcEPwNUN` via OpenAI SDK (not Gemini — README is outdated)
- **Weather:** Tomorrow.io API (not OpenWeather — README is outdated)
- **Validation:** Zod used at both HTTP boundary (controllers) and Kafka event boundary (consumers)
- **Frontend:** React 19, Vite 8, TailwindCSS 4, React Hook Form + Zod, Axios, React Router 7

### Ports at a glance
| Service            | Host port |
|--------------------|-----------|
| Frontend           | 5173      |
| API Gateway        | 4000      |
| Auth Service       | 4001      |
| Farm Service       | 4002      |
| Weather Service    | 3003      |
| Soil Service       | 3004      |
| Orchestrator       | 4005 (no host binding) |
| AI Service         | 4006      |
| Notification       | 3006      |
| Analytics          | 4007      |
| Kafka              | 9092      |

### Database credentials

There are no longer any local database credentials — connections are managed by Neon and MongoDB Atlas. Each service reads its own `DATABASE_URL` env var:

| Service       | Env var injected from .env / Secret |
|---------------|-------------------------------------|
| auth          | `NEON_AUTH_DATABASE_URL`            |
| farm          | `NEON_FARM_DATABASE_URL`            |
| weather       | `MONGODB_WEATHER_URL`               |
| soil          | `MONGODB_SOIL_URL`                  |
| ai            | `MONGODB_AI_URL`                    |
| notification  | `MONGODB_NOTIFICATION_URL`          |
| analytics     | `MONGODB_ANALYTICS_URL`             |

Inside each container, the value is exposed simply as `DATABASE_URL`.

## Infrastructure as Code (`iac/`)

### Terraform — provision the VPS (DigitalOcean)

```bash
cd iac/terraform
cp terraform.tfvars.example terraform.tfvars   # fill in your DO token + SSH key
terraform init
terraform plan
terraform apply                                 # creates Droplet + Firewall + optional DNS
terraform output droplet_ip                    # copy into Ansible inventory
```

### Ansible — configure the VPS + deploy K8s

```bash
cd iac/ansible
# 1. Paste VPS IP into inventory.ini
# 2. Fill in vault.yml with Neon + Mongo URIs and API keys, then encrypt:
ansible-vault encrypt group_vars/agrosense_vps/vault.yml

# 3. Run the full playbook (installs Docker, k3s, NGINX, deploys everything)
ansible-playbook -i inventory.ini site.yml --ask-vault-pass
```

Roles in order: `common` → `docker` → `k3s` → `nginx` → `agrosense`

### Kubernetes — direct kubectl commands

```bash
# Deploy everything (two phases — namespace first, then resources)
kubectl apply -f iac/k8s/namespace.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Active --timeout=30s namespace/agrosense
kubectl apply -k iac/k8s/

# Deploy monitoring stack separately (same two-phase pattern)
kubectl apply -f iac/k8s/monitoring/namespace.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Active --timeout=30s namespace/monitoring
kubectl apply -k iac/k8s/monitoring/

# Check rollout status
kubectl rollout status deployment/api-gateway -n agrosense

# Force-pull new :latest images after a Docker Hub push
kubectl rollout restart deployment -n agrosense

# View all pods
kubectl get pods -n agrosense
kubectl get pods -n monitoring
```

### K8s architecture decisions

- **Secrets** (`iac/k8s/secrets.yaml`): Never apply this file directly in production — let Ansible create the secret imperatively from vault values so credentials stay out of git.
- **Orchestrator** runs with `replicas: 1` and `strategy: Recreate` — its in-memory state Map must never have two instances running simultaneously.
- **Databases are external** — no Postgres StatefulSet/PVC anymore. Kafka is the only stateful workload still on-cluster.
- **HPA** scales api-gateway (2–5), auth-service (2–4), ai-service (2–4), and farm-service (2–4) based on CPU. Requires metrics-server (installed by Ansible k3s role).
- **Ingress** routes `/api` → api-gateway and `/` → frontend. NGINX Ingress Controller runs on NodePorts 30080/30443; host Nginx proxies 80/443 to those ports.
- **Monitoring** (namespace `monitoring`): Prometheus scrapes pods via `prometheus.io/scrape: "true"` annotation; Grafana available at `/grafana/` (default login: admin/agrosense_grafana).

## CI/CD

Jenkins pipeline (`Jenkinsfile`): Clone → Install (all 10, parallel) → Typecheck (all, parallel) → Test (5 services, parallel) → Build & Push to Docker Hub (all 10, parallel) → Deploy via SSH to VPS (main branch only).

**Required Jenkins credentials:**

| ID | Kind | Value |
| ---- | ---- | ----- |
| `dockerhub-credentials` | Username + Password | Docker Hub login |
| `agrosense-vps-key` | SSH private key | SSH key for VPS root |
| `agrosense-vps-host` | Secret text | VPS IP address |

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(farm-service): add farm.saved event publisher
fix(api-gateway): reject requests with unknown fields
test(auth): cover expired JWT case
```

Branch naming: `feature/`, `fix/`, `refactor/`, `docs/` prefixes.
