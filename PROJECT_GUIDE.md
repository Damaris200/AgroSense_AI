# AgroSense AI — Complete Project Guide

A plain-language guide to **what every folder/file is for**, the **DevOps concepts**, and a
**command cheat-sheet** (Docker, kubectl, chaos testing, remote VPS access).

---

## 1. Core concepts (read this first)

| Term | Plain meaning |
|------|---------------|
| **Docker** | A tool that packages an app + everything it needs (code, runtime, libraries) into one box called an **image**, so it runs the same everywhere. |
| **Container** | A *running instance* of a Docker image. Like a lightweight, isolated mini-computer for one app. |
| **Containerization** | The practice of putting each app in its own container so they don't interfere with each other. |
| **Image** | The frozen blueprint (e.g. `damarisateh/agrosense-frontend:v1.0.33`). Containers are started from images. |
| **Registry** | Where images are stored online (you use **Docker Hub**). CI pushes images here; the cluster pulls them. |
| **Kubernetes (k8s)** | The "orchestra conductor". It runs many containers across machines, restarts crashed ones, scales them, and networks them. |
| **k3s** | A lightweight Kubernetes (what runs on your single DigitalOcean droplet). |
| **Orchestration** | Kubernetes automatically managing containers: scheduling, healing, scaling, networking. |
| **Pod** | The smallest k8s unit — wraps one (or few) containers. Your `frontend` pod runs the frontend container. |
| **Deployment** | A k8s object that keeps **N copies (replicas)** of a pod running and rolls out new versions. |
| **ReplicaSet** | The thing a Deployment uses under the hood to maintain the replica count. If a pod dies, it makes a new one. |
| **StatefulSet** | Like a Deployment but for apps that need stable identity/storage (your **Kafka** uses this). |
| **Service** (k8s) | A stable internal address/load-balancer for pods. E.g. `frontend` Service routes to frontend pods. |
| **Namespace** | A folder/grouping inside the cluster. You use `agrosense` (the app) and `monitoring` (Prometheus/Grafana). |
| **ConfigMap** | Stores **non-secret** config (env vars, URLs) separately from code. |
| **Secret** | Stores **sensitive** config (passwords, API keys, DB URLs) base64-encoded. |
| **Ingress** | The "front door" — routes outside HTTP/HTTPS traffic to the right Service by hostname/path. |
| **PVC (PersistentVolumeClaim)** | A request for disk that survives pod restarts (Kafka & Prometheus use one). |
| **Kafka** | A message bus. Services publish/subscribe to "events" instead of calling each other directly. |
| **CI/CD** | Continuous Integration/Delivery — Jenkins automatically tests, builds, and deploys on every push. |
| **IaC (Infrastructure as Code)** | Defining servers/clusters in files (Terraform, Ansible) instead of clicking dashboards. |

### How the app actually works (the event flow)
```
Browser → API Gateway → (Kafka: farm.submitted) → Farm Service → (farm.saved)
       → Weather Service + Soil Service → (weather.fetched / soil.analyzed)
       → Orchestrator (waits for both) → (analysis.ready)
       → AI Service (OpenAI) → (recommendation.generated)
       → Notification Service (email) + Analytics Service (logs)
```
**Key point:** services never call each other over HTTP. They talk through **Kafka events**.
So when the Farm service works, it publishes an event, which triggers the next service, and so
on down the chain to Notifications. That's why "if farm works, the rest follow."

---

## 2. Repository structure — what every folder/file is for

### 2.1 Top level
| Path | Why it's there |
|------|----------------|
| `frontend/` | The React web app (what users see). |
| `services/` | The 9 backend microservices. |
| `iac/` | Infrastructure as Code — how the server & cluster are built/deployed. |
| `scripts/` | Helper shell scripts for local dev. |
| `infrastructure/` | **Legacy/empty** — old self-hosted Postgres schemas. DBs now live on Neon/Atlas. |
| `tests/` | Cross-cutting test helpers. |
| `Jenkinsfile` | The CI/CD pipeline definition (test → build → push → deploy). |
| `docker-compose.yml` | Runs the whole stack locally on one machine for development. |
| `package.json` / `bun.lock` | Root JS dependencies + lockfile (Bun runtime). |
| `sonar-project.properties` | SonarCloud code-quality config (coverage, exclusions). |
| `deploy.js` | Helper script used during deployment. |
| `start-local.ps1` | One-command local startup (PowerShell). |
| `CLAUDE.md` | Project rules/architecture notes. |
| `README.md`, `*.md` | Various docs (handoff, SonarQube, VPS rebuild, etc.). |
| `agrosense_finetune.jsonl` | Training data used to fine-tune the OpenAI model. |

### 2.2 `frontend/`
| Path | Why |
|------|-----|
| `frontend/Dockerfile` | Recipe to build the frontend image (Vite build → served by nginx). |
| `frontend/nginx.conf` | Web server config: proxies `/api` to the gateway, serves the SPA, sets cache headers. |
| `frontend/vite.config.ts` | Vite build/test configuration. |
| `frontend/index.html` | The single HTML page React mounts into. |
| `frontend/src/main.tsx` | App entry point — boots React. |
| `frontend/src/App.tsx` | Top-level component + route definitions. |
| `frontend/src/index.css` | Global styles (Tailwind). |
| `frontend/src/components/` | Reusable UI pieces. Subfolders: `home/` (landing page), `dashboard/` (StatCard, PageHeader, DashboardLayout), `auth/` (ProtectedRoute, PasswordStrength), `layout/`, `LanguageToggle.tsx`. |
| `frontend/src/pages/` | Full pages. `dashboard/` (farmer pages), `admin/` (admin pages), plus `HomePage`, `LoginPage`, `RegisterPage`. |
| `frontend/src/context/` | React context providers: `AuthContext` (who's logged in), `ThemeContext` (light/dark). |
| `frontend/src/hooks/` | Custom React hooks (`useLoginForm`, `useRegisterForm`). |
| `frontend/src/services/` | API client functions (axios calls to the gateway). |
| `frontend/src/i18n/` | Internationalization — English/French translation files. |
| `frontend/src/types/` | Shared TypeScript types. |
| `frontend/src/utils/` | Small helpers (passkey, route helpers). |
| `frontend/src/__tests__/` | Frontend unit tests (Vitest). |

### 2.3 `services/` — each microservice
There are **9 services**, each with the **same internal layout**:
`auth-service`, `farm-service`, `weather-service`, `soil-service`, `ai-service`,
`notification-service`, `analytics-service`, `api-gateway`, `orchestrator-service`.

What each service does:
| Service | Job |
|---------|-----|
| **api-gateway** | The ONLY public HTTP entry point. Validates requests, forwards to services/Kafka. Port 4000. |
| **auth-service** | Login/register, JWT tokens, user roles. Uses **Neon Postgres**. Port 4001. |
| **farm-service** | Stores farm submissions, publishes `farm.saved`. Neon Postgres. Port 4002. |
| **weather-service** | Fetches weather (Tomorrow.io) on `farm.saved` → `weather.fetched`. MongoDB. Port 3003. |
| **soil-service** | Produces soil data → `soil.analyzed`. MongoDB. Port 3004. |
| **orchestrator-service** | Waits for BOTH weather + soil, then emits `analysis.ready`. In-memory state. Port 4005. |
| **ai-service** | Calls fine-tuned OpenAI model → `recommendation.generated`. MongoDB. Port 4006. |
| **notification-service** | Emails the recommendation to the user. MongoDB. Port 3006. |
| **analytics-service** | Logs every event for analytics. MongoDB. Port 4007. |

Inside **each** service's `src/` (taking `farm-service` as the example):
| Folder/File | Why |
|-------------|-----|
| `index.ts` | Service entry point — starts the Express server + Kafka connections. |
| `Dockerfile` | Recipe to build this service's image. |
| `package.json` / `bun.lock` | This service's dependencies. |
| `tsconfig.json` | TypeScript compiler settings. |
| `prisma/` | Database schema (`schema.prisma`) + Prisma client config. |
| `src/config/` | Environment-variable validation (Zod) — fails fast if a var is missing. |
| `src/controllers/` | HTTP request handlers (the functions that run per route). |
| `src/routes/` | Maps URLs → controllers (Express routers). |
| `src/services/` | Business logic (the actual work, separate from HTTP). |
| `src/models/` | Database queries (Prisma). |
| `src/events/consumers/` | Kafka **listeners** — react to incoming events. |
| `src/events/producers/` | Kafka **publishers** — send out events. |
| `src/middleware/` | Cross-cutting request logic (auth checks, error handling). |
| `src/schemas/` | Zod validation schemas for request bodies AND Kafka event payloads. |
| `src/__tests__/` | Unit tests for this service. |
| `coverage/` | Auto-generated test-coverage reports (git-ignored). |

### 2.4 `iac/` — Infrastructure as Code
| Path | Why |
|------|-----|
| `iac/terraform/` | Creates the cloud server: DigitalOcean Droplet + firewall + DNS. Files: `main.tf` (resources), `variables.tf` (inputs), `outputs.tf` (results like the IP), `providers.tf` (DO provider), `terraform.tfvars.example` (sample config to copy). |
| `iac/ansible/` | Configures the server after Terraform creates it: installs Docker, k3s, deploys the app. `site.yml` (main playbook), `inventory.ini` (server list), `roles/` (common, docker, k3s, nginx, agrosense), `group_vars/.../vault.yml` (encrypted secrets). |
| `iac/k8s/` | All Kubernetes manifests (the desired cluster state). One YAML per service + `kafka/`, `monitoring/`, `ingress.yaml`, `configmap.yaml`, `secrets.yaml`, `hpa.yaml` (autoscaling), `namespace.yaml`, `kustomization.yaml` (ties them together). |
| `iac/docker/jenkins/` | Custom Jenkins image (with Docker + kubectl baked in) for the CI server. |
| `iac/scripts/setup-vps.sh` | One-shot VPS bootstrap script. |

### 2.5 `scripts/`
| File | Why |
|------|-----|
| `scripts/check-schemas.sh` | Validates Prisma schemas are consistent. |
| `scripts/install-hooks.sh` | Installs git pre-commit hooks. |

### 2.6 `infrastructure/postgres/schemas/` — **safe to delete**
This is **empty** and **legacy**. When the project used self-hosted Postgres, SQL schema
files lived here. Now relational data is on **Neon** (managed) and schema is handled by
**Prisma** in each service. ✅ **Yes, you can delete `infrastructure/`** — nothing references it.

---

## 3. Remote VPS access (from any laptop — PowerShell or Git Bash)

Goal: get onto your droplet `167.99.12.201` from someone else's machine and have the tools.

### Step 1 — Get the SSH key onto the laptop
SSH uses a **private key**. You need YOUR key file (the one paired with the droplet).
- Copy your private key (e.g. `id_rsa` or the DO key) to the new laptop, into `~/.ssh/`.
- **Git Bash:** `~/.ssh/id_rsa` → run `chmod 600 ~/.ssh/id_rsa`
- **PowerShell:** `C:\Users\<you>\.ssh\id_rsa`

> If you don't have the key, you can't SSH in. Either copy it from your main laptop, or add a
> new public key to the droplet via the DigitalOcean console (Droplet → Access → reset/add key).

### Step 2 — SSH into the droplet
```bash
ssh root@167.99.12.201
```
(Works the same in PowerShell and Git Bash.)

### Step 3 — Install the tools (run ON the droplet — they're already there, but to reinstall)
```bash
# kubectl is already on the droplet via k3s. To use it:
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes

# Docker (already installed). Verify:
docker ps
```

### Step 4 — Manage the cluster FROM the laptop (without SSHing each time)
Copy the droplet's kubeconfig to your laptop, then point kubectl at it:
```bash
# On the laptop (Git Bash):
mkdir -p ~/.kube
scp root@167.99.12.201:/etc/rancher/k3s/k3s.yaml ~/.kube/agrosense.yaml
# edit that file: change 'server: https://127.0.0.1:6443' to 'server: https://167.99.12.201:6443'
export KUBECONFIG=~/.kube/agrosense.yaml
kubectl get pods -n agrosense
```
Install kubectl on the laptop if missing:
- **Windows (PowerShell, as admin):** `choco install kubernetes-cli` (needs Chocolatey)
- Or download from https://kubernetes.io/docs/tasks/tools/

### Step 5 — If you want to rebuild the WHOLE VPS from scratch (Terraform + Ansible)
On the laptop, install Terraform + Ansible, then:
```bash
# 1. Provision the server
cd iac/terraform
cp terraform.tfvars.example terraform.tfvars   # fill in DO token + SSH fingerprint
terraform init
terraform apply                                 # creates droplet, prints its IP

# 2. Configure it + deploy everything
cd ../ansible
# put the droplet IP in inventory.ini
ansible-playbook -i inventory.ini site.yml --ask-vault-pass
```

---

## 4. Docker commands (with what each does)

```bash
docker ps                      # list RUNNING containers
docker ps -a                   # list ALL containers (incl. stopped)
docker images                  # list images on this machine
docker build -t myapp:1.0 .    # build an image from the Dockerfile in current dir
docker run -p 8080:80 myapp    # run a container, map host port 8080 → container 80
docker logs <container>        # view a container's logs
docker logs -f <container>     # follow logs live
docker exec -it <container> sh # open a shell INSIDE a running container
docker stop <container>        # stop a container gracefully
docker rm <container>          # delete a stopped container
docker rmi <image>             # delete an image
docker pull <image>            # download an image from a registry
docker push <image>            # upload an image to a registry (Docker Hub)
docker system prune -f         # delete unused containers/images/networks (free disk)
docker stats                   # live CPU/RAM usage per container
docker compose up -d           # start everything in docker-compose.yml (background)
docker compose down            # stop everything from docker-compose.yml
docker compose logs -f <svc>   # follow logs of one compose service
```

---

## 5. kubectl commands (with what each does)

> Always set this first on the droplet: `export KUBECONFIG=/etc/rancher/k3s/k3s.yaml`

### Viewing things
```bash
kubectl get pods -n agrosense              # list app pods + status
kubectl get pods -n agrosense -o wide      # + which node + IP
kubectl get pods -A                        # pods in ALL namespaces
kubectl get svc -n agrosense               # list services (internal addresses)
kubectl get deployments -n agrosense       # list deployments + replica counts
kubectl get namespaces                     # list all namespaces
kubectl get nodes                          # list cluster machines
kubectl get ingress -A                     # list ingress routes
kubectl get pvc -A                         # list persistent disks
kubectl get secret -n agrosense            # list secrets
kubectl get configmap -n agrosense         # list configmaps
kubectl get all -n agrosense               # everything in the namespace
```

### Inspecting / debugging
```bash
kubectl describe pod <pod> -n agrosense     # full details + events (why it failed)
kubectl logs <pod> -n agrosense             # a pod's logs
kubectl logs <pod> -n agrosense --previous  # logs of the PREVIOUS crashed container
kubectl logs deploy/farm-service -n agrosense --tail=50   # last 50 lines of a deployment
kubectl exec -it <pod> -n agrosense -- sh   # shell inside a pod
kubectl top pods -n agrosense               # live CPU/RAM per pod (needs metrics-server)
kubectl get events -n agrosense --sort-by=.lastTimestamp   # recent cluster events
```

### Changing / deploying
```bash
kubectl apply -f file.yaml                  # create/update from one manifest
kubectl apply -k iac/k8s/                   # apply the whole kustomize folder
kubectl set image deployment/frontend frontend=damarisateh/agrosense-frontend:v1.0.33 -n agrosense   # update image
kubectl rollout restart deployment -n agrosense          # restart ALL deployments
kubectl rollout restart deployment/farm-service -n agrosense   # restart one
kubectl rollout status deployment/farm-service -n agrosense    # watch a rollout finish
kubectl scale deployment/frontend --replicas=3 -n agrosense    # change replica count
```

### Deleting (the replica/Deployment will recreate pods automatically)
```bash
kubectl delete pod <pod> -n agrosense       # delete ONE pod → ReplicaSet makes a new one
kubectl delete pod -l app=frontend -n agrosense   # delete all pods with a label
kubectl delete deployment <name> -n agrosense     # delete a deployment (pods go too)
```

---

## 6. Chaos engineering (Chaos Monkey style) — prove the app self-heals

The idea: **kill things on purpose** and watch Kubernetes automatically recreate them, proving
your app is resilient. Because each Deployment has a ReplicaSet, deleting a pod triggers an
instant replacement.

### A. Kill a single random pod and watch it come back
```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
# delete one frontend pod
kubectl delete pod -l app=frontend -n agrosense
# watch a new one appear and go Running
kubectl get pods -n agrosense -w
```

### B. Kill a RANDOM pod every 30s (simple chaos monkey loop)
```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
while true; do
  POD=$(kubectl get pods -n agrosense --no-headers -o custom-columns=":metadata.name" \
        | grep -vE 'kafka|postgres' | shuf -n 1)
  echo "$(date) — killing $POD"
  kubectl delete pod "$POD" -n agrosense
  sleep 30
done
```
(Ctrl+C to stop. It avoids killing Kafka/Postgres which hold state.)

### C. Confirm the app stays up DURING chaos
In another terminal, hammer the site and watch it keep responding:
```bash
while true; do curl -s -o /dev/null -w "%{http_code}\n" https://healthcarebrige.me/; sleep 2; done
```
You should keep seeing `200`/`308` even as pods are killed — because other replicas serve traffic
while killed pods restart. **That's resilience.**

### D. Scale up first so there's always a survivor (recommended before demoing chaos)
```bash
kubectl scale deployment/frontend --replicas=2 -n agrosense
kubectl scale deployment/api-gateway --replicas=2 -n agrosense
```

> Real chaos tools exist (LitmusChaos, Chaos Mesh, kube-monkey) but the loop above is enough to
> demonstrate the concept without installing anything.

---

## 7. Admin login (no signup by design)
1. Register normally in the app (creates a `farmer`).
2. Promote to admin in the **Neon SQL console**:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Log out, log back in → JWT now carries `role: admin` → Admin sidebar appears.

---

## 8. Quick health check (is the whole pipeline working?)
```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get pods -n agrosense        # all should be 1/1 Running
```
Then in the app: submit a farm → within ~1 min you should get a recommendation + email.
That single action exercises the full chain: farm → weather + soil → orchestrator → AI →
notification → analytics. If a pod crashloops, check its logs:
```bash
kubectl logs deploy/<service> -n agrosense --tail=40
```
