# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Infrastructure
```bash
# Start only infra (Postgres, Kafka, Zookeeper)
docker compose up -d postgres kafka zookeeper

# Start everything
docker compose up -d

# Reset everything — wipes volumes so Postgres init scripts re-run
docker compose down -v && docker compose up -d

# Verify all 7 databases were created
docker exec agrosense-postgres psql -U agrosense -c "\l"
```

> **Critical:** Postgres init scripts (`infrastructure/postgres/init/`) only run on an **empty** volume. If you change them, you must `down -v` first.

### Service development (run from inside each service directory)
```bash
bun run dev          # hot-reload dev server
bun run typecheck    # TypeScript check without emit
bun test             # run tests with coverage
bun test --coverage  # explicit coverage report
```

### Prisma (per service)
```bash
bun run prisma:migrate          # create + apply a new migration (dev)
bun run prisma:migrate:deploy   # apply existing migrations (prod/docker)
bun run prisma:generate         # regenerate Prisma client
bun run prisma:studio           # open Prisma Studio GUI
```

### Frontend (from `frontend/`)
```bash
bun run dev     # Vite dev server (port 5173)
bun run build   # production build
bun run lint    # ESLint
```

### Cross-service infra tests (requires Docker running)
```bash
RUN_INFRA_TESTS=1 bun test tests/infrastructure
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
2. **No service reads another service's database.** Each service owns exactly one Postgres database.
3. **New Kafka events must be schema-defined first** — add to `docs/EVENTS.md` and `shared/types/` before writing producer/consumer code.

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
- **ORM:** Prisma with `@prisma/adapter-pg` (each service has its own `prisma/` folder)
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
| Postgres           | **5433** (maps to internal 5432) |
| Kafka              | 9092      |

### Postgres credentials (local/Docker)
```
host: localhost:5433
user: agrosense
password: agrosense_dev
databases: auth_db, farm_db, weather_db, soil_db, ai_db, notification_db, analytics_db
```

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
# 2. Fill in vault.yml with real API keys, then encrypt:
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
- **Kafka + Postgres** use StatefulSets with PVCs for persistent storage; Zookeeper uses a Deployment.
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
