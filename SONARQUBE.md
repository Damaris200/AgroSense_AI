# SonarQube Testing Guide — AgroSense AI

## Overview

This guide covers setting up and running SonarQube static analysis and coverage reporting for all 10 modules of the AgroSense AI platform (9 backend services + frontend). The project uses **Bun** as its runtime and test runner, with **TypeScript** across the board.

---

## 1. Prerequisites

### Tools to install

| Tool             | Version | Purpose                                    |
| ---------------- | ------- | ------------------------------------------ |
| Docker Desktop   | Latest  | Run SonarQube server locally               |
| SonarScanner CLI | 6.x     | Sends analysis to SonarQube                |
| Bun              | 1.x     | Already installed — runs tests + coverage |
| Java 17+         | 17 LTS  | Required by SonarScanner CLI               |

### Install SonarScanner CLI (Windows)

```powershell
# Option A — via Scoop (recommended)
scoop install sonar-scanner

# Option B — manual
# Download from https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/
# Extract to C:\sonar-scanner and add C:\sonar-scanner\bin to PATH
```

Verify:

```powershell
sonar-scanner --version
```

---

## 2. Run a Local SonarQube Server (Docker)

The easiest way to run SonarQube locally without paying for SonarCloud.

```bash
# Start SonarQube (community edition — free)
docker run -d --name sonarqube -p 9000:9000 -v sonarqube_data:/opt/sonarqube/data -v sonarqube_extensions:/opt/sonarqube/extensions -v sonarqube_logs:/opt/sonarqube/logs sonarqube:community


# Wait ~60 seconds for startup, then open:
# http://localhost:9000
# Default login: admin / admin  (you will be asked to change on first login)
```

### Create a project in SonarQube UI

1. Log in at `http://localhost:9000`
2. Click **Create Project** → **Manually**
3. Set:
   - **Project key**: `agrosense-ai`
   - **Display name**: `AgroSense AI`
4. Choose **Locally** as your analysis method
5. Generate a **Project Token** — copy it; you will use it as `SONAR_TOKEN`

---

## 3. Generate Coverage Reports (Bun → LCOV)

SonarQube reads coverage in **LCOV** format. Bun generates this natively.

### Run tests with coverage for each service

```bash
# From the repo root — run for each service that has tests
cd services/auth-service       && bun test --coverage && cd ../..
cd services/api-gateway        && bun test --coverage && cd ../..
cd services/farm-service       && bun test --coverage && cd ../..
cd services/weather-service    && bun test --coverage && cd ../..
cd services/soil-service       && bun test --coverage && cd ../..
cd services/notification-service && bun test --coverage && cd ../..
```

Bun writes coverage to `coverage/lcov.info` inside each service directory.

### One-shot script (run from repo root)

Save this as `scripts/generate-coverage.ps1`:

```powershell
$services = @(
    "services/auth-service",
    "services/api-gateway",
    "services/farm-service",
    "services/weather-service",
    "services/soil-service",
    "services/notification-service"
)

foreach ($svc in $services) {
    Write-Host "Running tests for $svc..."
    Push-Location $svc
    bun test --coverage
    Pop-Location
}
```

Run it:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-coverage.ps1
```

---

## 4. Create `sonar-project.properties` (Root)

Create this file at the **repo root** (`AgroSense_AI/sonar-project.properties`):

```properties
# ── Project identity ──────────────────────────────────────────────────────────
sonar.projectKey=agrosense-ai
sonar.projectName=AgroSense AI
sonar.projectVersion=1.0

# ── SonarQube server ─────────────────────────────────────────────────────────
# Set SONAR_HOST_URL and SONAR_TOKEN as environment variables instead of
# hardcoding them here. Leave these as-is.
# sonar.host.url=http://localhost:9000
# sonar.token=<your-token>

# ── Source encoding ───────────────────────────────────────────────────────────
sonar.sourceEncoding=UTF-8

# ── Multi-module setup ────────────────────────────────────────────────────────
sonar.modules=auth-service,api-gateway,farm-service,weather-service,soil-service,orchestrator-service,ai-service,notification-service,analytics-service,frontend

# ── Per-module configuration ──────────────────────────────────────────────────

# auth-service
auth-service.sonar.projectName=Auth Service
auth-service.sonar.projectBaseDir=services/auth-service
auth-service.sonar.sources=src
auth-service.sonar.exclusions=src/__tests__/**,node_modules/**,dist/**,coverage/**,prisma/**
auth-service.sonar.tests=src/__tests__
auth-service.sonar.javascript.lcov.reportPaths=coverage/lcov.info

# api-gateway
api-gateway.sonar.projectName=API Gateway
api-gateway.sonar.projectBaseDir=services/api-gateway
api-gateway.sonar.sources=src
api-gateway.sonar.exclusions=src/__tests__/**,node_modules/**,dist/**,coverage/**
api-gateway.sonar.tests=src/__tests__
api-gateway.sonar.javascript.lcov.reportPaths=coverage/lcov.info

# farm-service
farm-service.sonar.projectName=Farm Service
farm-service.sonar.projectBaseDir=services/farm-service
farm-service.sonar.sources=src
farm-service.sonar.exclusions=src/__tests__/**,node_modules/**,dist/**,coverage/**,prisma/**
farm-service.sonar.tests=src/__tests__
farm-service.sonar.javascript.lcov.reportPaths=coverage/lcov.info

# weather-service
weather-service.sonar.projectName=Weather Service
weather-service.sonar.projectBaseDir=services/weather-service
weather-service.sonar.sources=src
weather-service.sonar.exclusions=src/__tests__/**,node_modules/**,dist/**,coverage/**,prisma/**
weather-service.sonar.tests=src/__tests__
weather-service.sonar.javascript.lcov.reportPaths=coverage/lcov.info

# soil-service
soil-service.sonar.projectName=Soil Service
soil-service.sonar.projectBaseDir=services/soil-service
soil-service.sonar.sources=src
soil-service.sonar.exclusions=src/__tests__/**,node_modules/**,dist/**,coverage/**,prisma/**
soil-service.sonar.tests=src/__tests__
soil-service.sonar.javascript.lcov.reportPaths=coverage/lcov.info

# orchestrator-service (no tests currently)
orchestrator-service.sonar.projectName=Orchestrator Service
orchestrator-service.sonar.projectBaseDir=services/orchestrator-service
orchestrator-service.sonar.sources=src
orchestrator-service.sonar.exclusions=node_modules/**,dist/**

# ai-service (no tests currently)
ai-service.sonar.projectName=AI Service
ai-service.sonar.projectBaseDir=services/ai-service
ai-service.sonar.sources=src
ai-service.sonar.exclusions=node_modules/**,dist/**,coverage/**,prisma/**

# notification-service
notification-service.sonar.projectName=Notification Service
notification-service.sonar.projectBaseDir=services/notification-service
notification-service.sonar.sources=src
notification-service.sonar.exclusions=src/__tests__/**,node_modules/**,dist/**,coverage/**,prisma/**
notification-service.sonar.tests=src/__tests__
notification-service.sonar.javascript.lcov.reportPaths=coverage/lcov.info

# analytics-service (no tests currently)
analytics-service.sonar.projectName=Analytics Service
analytics-service.sonar.projectBaseDir=services/analytics-service
analytics-service.sonar.sources=src
analytics-service.sonar.exclusions=node_modules/**,dist/**,coverage/**,prisma/**

# frontend
frontend.sonar.projectName=Frontend (React)
frontend.sonar.projectBaseDir=frontend
frontend.sonar.sources=src
frontend.sonar.exclusions=src/**/*.test.*,node_modules/**,dist/**,coverage/**
frontend.sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

---

## 5. Run SonarQube Analysis Locally

```powershell
# Set your token as an environment variable (never hardcode it)
$env:SONAR_TOKEN = "your-project-token-here"
$env:SONAR_HOST_URL = "http://localhost:9000"

# From repo root — generate coverage first, then scan
powershell -ExecutionPolicy Bypass -File scripts/generate-coverage.ps1

# Run the scanner
sonar-scanner `
  -Dsonar.host.url=$env:SONAR_HOST_URL `
  -Dsonar.token=$env:SONAR_TOKEN
```

After the scan completes, open `http://localhost:9000/dashboard?id=agrosense-ai` to see results.

---

## 6. Jenkins Integration

### Step 1 — Install Jenkins plugins

In Jenkins UI → **Manage Jenkins → Plugins → Available**:

- `SonarQube Scanner`
- `Sonar Quality Gates` (optional — fails build if gate fails)

### Step 2 — Configure SonarQube in Jenkins

**Manage Jenkins → System → SonarQube servers:**

| Field                       | Value                                                              |
| --------------------------- | ------------------------------------------------------------------ |
| Name                        | `SonarQube`                                                      |
| Server URL                  | `http://your-sonar-server:9000`                                  |
| Server authentication token | Add as**Secret text** credential with ID `sonarqube-token` |

**Manage Jenkins → Tools → SonarQube Scanner installations:**

| Field                 | Value            |
| --------------------- | ---------------- |
| Name                  | `SonarScanner` |
| Install automatically | checked          |
| Version               | latest           |

### Step 3 — Add a SonarQube stage to `Jenkinsfile`

Add this stage **after** the Test stage and **before** Build & Push:

```groovy
stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            sh '''
                # Generate coverage for all testable services
                for svc in services/auth-service services/api-gateway services/farm-service \
                            services/weather-service services/soil-service services/notification-service; do
                    echo "Coverage: $svc"
                    cd $svc && bun test --coverage || true
                    cd $WORKSPACE
                done

                # Run scanner
                sonar-scanner
            '''
        }
    }
}

stage('Quality Gate') {
    steps {
        timeout(time: 5, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
        }
    }
}
```

> `abortPipeline: true` means the build **fails** if SonarQube quality gate is not passed. Set to `false` if you want analysis without blocking deployment.

---

## 7. What SonarQube Checks

For this TypeScript/Bun stack, SonarQube will report on:

| Category                    | What it catches                                               |
| --------------------------- | ------------------------------------------------------------- |
| **Bugs**              | Null dereferences, unreachable code, incorrect operator usage |
| **Vulnerabilities**   | Hard-coded credentials, unsafe regex, command injection risks |
| **Security Hotspots** | JWT handling in auth-service, env var usage, HTTP headers     |
| **Code Smells**       | Cognitive complexity, duplicated blocks, unused variables     |
| **Coverage**          | Line/branch coverage % per service from LCOV data             |
| **Duplications**      | Copy-pasted logic across services                             |

### Default Quality Gate (Sonar Way)

A scan passes the quality gate when **new code** meets:

- Coverage ≥ 80%
- 0 new bugs
- 0 new vulnerabilities
- Duplicated lines < 3%
- Security hotspots reviewed: 100%

You can customize this at **SonarQube UI → Quality Gates**.

---

## 8. Exclude Files from Analysis

These are already set in `sonar-project.properties` but documented here for clarity:

```
node_modules/**        — dependencies
dist/**                — compiled output
coverage/**            — test artifacts
prisma/**              — auto-generated Prisma client
src/__tests__/**       — test files excluded from source metrics
```

To add more exclusions globally, edit the `sonar.exclusions` line in the root properties or add per-module exclusions.

---

## 9. SonarCloud Alternative (No Local Server)

If you do not want to maintain a local Docker SonarQube instance, use **SonarCloud** (free for public repos):

1. Sign up at `https://sonarcloud.io` with your GitHub account
2. Import the `AgroSense_AI` repository
3. SonarCloud auto-generates the project key (e.g., `Damaris200_AgroSense_AI`)
4. Replace `sonar.host.url` with `https://sonarcloud.io`
5. Add `sonar.organization=your-org-key` to `sonar-project.properties`

GitHub Actions alternative (for SonarCloud):

```yaml
# .github/workflows/sonar.yml
name: SonarCloud
on: [push, pull_request]
jobs:
  sonar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: oven-sh/setup-bun@v2
      - name: Install & generate coverage
        run: |
          for svc in services/auth-service services/api-gateway services/farm-service \
                     services/weather-service services/soil-service services/notification-service; do
            cd $svc && bun install && bun test --coverage && cd $GITHUB_WORKSPACE
          done
      - uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## 10. Troubleshooting

| Problem                            | Cause                                        | Fix                                                        |
| ---------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| `coverage/lcov.info not found`   | Tests never ran or bun coverage flag missing | Run `bun test --coverage` inside each service dir first  |
| `Project key not found`          | Project not created in UI                    | Create project manually in SonarQube UI before scanning    |
| `JAVA_HOME not set`              | SonarScanner needs Java 17                   | Install JDK 17 and set `$env:JAVA_HOME`                  |
| `401 Unauthorized`               | Wrong or expired token                       | Regenerate token in SonarQube UI → My Account → Security |
| Quality gate:`condition not met` | Coverage below threshold                     | Write more tests or lower the gate threshold for now       |
| Module not analyzed                | `sonar.sources` path wrong                 | Verify paths relative to `sonar.projectBaseDir`          |

---

## 11. Quick Reference

```powershell
# 1. Start SonarQube server
docker start sonarqube

# 2. Generate coverage (from repo root)
powershell -ExecutionPolicy Bypass -File scripts/generate-coverage.ps1

# 3. Run analysis
$env:SONAR_TOKEN = "your-token"
$env:SONAR_HOST_URL = "http://localhost:9000"
sonar-scanner -Dsonar.host.url=$env:SONAR_HOST_URL -Dsonar.token=$env:SONAR_TOKEN

# 4. View results
start "http://localhost:9000/dashboard?id=agrosense-ai"
```
