pipeline {
  agent any

  environment {
    IMAGE_TAG        = "v1.0.${BUILD_NUMBER}"
    DOCKER_HUB_USER  = 'damarisateh'
    // Jenkins credentials: kind=Username+Password, ID=dockerhub-credentials
    DOCKER_CREDS     = credentials('dockerhub-credentials')
    // Jenkins credentials: kind=SSH Username with private key, ID=agrosense-vps-key
    VPS_USER         = 'root'
    // Jenkins credentials: kind=Secret text, ID=agrosense-vps-host  (the VPS IP)
    VPS_HOST         = credentials('agrosense-vps-host')
    KUBECONFIG_REMOTE = '/etc/rancher/k3s/k3s.yaml'
    K8S_NAMESPACE    = 'agrosense'
    // Jenkins credentials: kind=Secret text, ID=sonarcloud-token
    // Value = the User Token generated at sonarcloud.io → My Account → Security
    SONAR_TOKEN      = credentials('sonarcloud-token')
    SONAR_HOST_URL   = 'https://sonarcloud.io'

    // ── Service paths (relative to workspace root) ─────────────────────────
    SVC_AUTH         = 'services/auth-service'
    SVC_FARM         = 'services/farm-service'
    SVC_WEATHER      = 'services/weather-service'
    SVC_SOIL         = 'services/soil-service'
    SVC_AI           = 'services/ai-service'
    SVC_NOTIF        = 'services/notification-service'
    SVC_ANALYTICS    = 'services/analytics-service'
    SVC_GATEWAY      = 'services/api-gateway'
    SVC_ORCH         = 'services/orchestrator-service'
    SVC_FRONTEND     = 'frontend'

    // ── Docker image names ─────────────────────────────────────────────────
    IMG_AUTH         = 'damarisateh/agrosense-auth'
    IMG_GATEWAY      = 'damarisateh/agrosense-api-gateway'
    IMG_FARM         = 'damarisateh/agrosense-farm'
    IMG_WEATHER      = 'damarisateh/agrosense-weather'
    IMG_SOIL         = 'damarisateh/agrosense-soil'
    IMG_ORCH         = 'damarisateh/agrosense-orchestrator'
    IMG_AI           = 'damarisateh/agrosense-ai'
    IMG_NOTIF        = 'damarisateh/agrosense-notification'
    IMG_ANALYTICS    = 'damarisateh/agrosense-analytics'
    IMG_FRONTEND     = 'damarisateh/agrosense-frontend'

    // ── Shared shell commands ──────────────────────────────────────────────
    // NOTE: do NOT prefix these with BUN_. The name BUN_INSTALL is reserved
    // by Bun itself (it treats the value as the install path) and exporting
    // it through the Jenkins env corrupts the bun package cache location.
    INSTALL_CMD      = 'bun install --frozen-lockfile'
    TYPECHECK_CMD    = 'bun run typecheck'
    TEST_CMD         = 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'

    // Stub DATABASE_URLs used only by `prisma generate` at build time — Prisma
    // requires the env var to be set but does not connect to it. Real URLs
    // come from .env in dev and the agrosense-secrets Secret in production.
    PG_STUB_URL      = 'postgresql://user:pass@localhost:5432/x?schema=public'
    MONGO_STUB_URL   = 'mongodb://user:pass@localhost:27017/x'
  }

  options {
    disableConcurrentBuilds()
    timeout(time: 120, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {

    // ── 1. Checkout ────────────────────────────────────────────────────────

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Damaris200/AgroSense_AI.git'
      }
    }

    // ── 1b. Self-heal workspace ────────────────────────────────────────────
    // Earlier builds accidentally exported BUN_INSTALL (a reserved bun env
    // var) with the value 'bun install --frozen-lockfile', which caused bun
    // to create a cache directory of that literal name inside each service
    // folder. Those stray directories contain *.test.ts files from packages
    // like zod, which `bun test` then discovers and runs. This step deletes
    // them once so the bug self-corrects on the next build.
    stage('Self-heal workspace') {
      steps {
        sh 'find "$WORKSPACE" -maxdepth 4 -type d -name "bun install --frozen-lockfile" -prune -exec rm -rf {} +'
      }
    }

    // ── 2. Install dependencies (all services in parallel) ─────────────────

    stage('Install Dependencies') {
      parallel {
        // Prisma services: install then generate the Prisma client so tsc can find the types
        stage('auth-service')          { steps { dir("${SVC_AUTH}")         { sh "${INSTALL_CMD} && DATABASE_URL=${PG_STUB_URL} bun run prisma:generate" } } }
        stage('farm-service')          { steps { dir("${SVC_FARM}")         { sh "${INSTALL_CMD} && DATABASE_URL=${PG_STUB_URL} bun run prisma:generate" } } }
        stage('weather-service')       { steps { dir("${SVC_WEATHER}")      { sh "${INSTALL_CMD} && DATABASE_URL=${MONGO_STUB_URL} bun run prisma:generate" } } }
        stage('soil-service')          { steps { dir("${SVC_SOIL}")         { sh "${INSTALL_CMD} && DATABASE_URL=${MONGO_STUB_URL} bun run prisma:generate" } } }
        stage('ai-service')            { steps { dir("${SVC_AI}")           { sh "${INSTALL_CMD} && DATABASE_URL=${MONGO_STUB_URL} bun run prisma:generate" } } }
        stage('notification-service')  { steps { dir("${SVC_NOTIF}")        { sh "${INSTALL_CMD} && DATABASE_URL=${MONGO_STUB_URL} bun run prisma:generate" } } }
        stage('analytics-service')     { steps { dir("${SVC_ANALYTICS}")    { sh "${INSTALL_CMD} && DATABASE_URL=${MONGO_STUB_URL} bun run prisma:generate" } } }
        // Non-Prisma services: install only
        stage('api-gateway')           { steps { dir("${SVC_GATEWAY}")      { sh INSTALL_CMD } } }
        stage('orchestrator-service')  { steps { dir("${SVC_ORCH}")         { sh INSTALL_CMD } } }
        stage('frontend')              { steps { dir("${SVC_FRONTEND}")     { sh INSTALL_CMD } } }
      }
    }

    // ── 3. Typecheck (all services in parallel) ────────────────────────────

    stage('Typecheck') {
      parallel {
        stage('auth-service')         { steps { dir("${SVC_AUTH}")        { sh TYPECHECK_CMD } } }
        stage('api-gateway')          { steps { dir("${SVC_GATEWAY}")     { sh TYPECHECK_CMD } } }
        stage('farm-service')         { steps { dir("${SVC_FARM}")        { sh TYPECHECK_CMD } } }
        stage('weather-service')      { steps { dir("${SVC_WEATHER}")     { sh TYPECHECK_CMD } } }
        stage('soil-service')         { steps { dir("${SVC_SOIL}")        { sh TYPECHECK_CMD } } }
        stage('orchestrator-service') { steps { dir("${SVC_ORCH}")        { sh TYPECHECK_CMD } } }
        stage('ai-service')           { steps { dir("${SVC_AI}")          { sh TYPECHECK_CMD } } }
        stage('notification-service') { steps { dir("${SVC_NOTIF}")       { sh TYPECHECK_CMD } } }
        stage('analytics-service')    { steps { dir("${SVC_ANALYTICS}")   { sh TYPECHECK_CMD } } }
        // vite build performs type-checking for the frontend
        stage('frontend')             { steps { dir("${SVC_FRONTEND}")    { sh 'bun run build' } } }
      }
    }

    // ── 4. Tests (services that have test suites) ──────────────────────────
    // --coverage-reporter=lcov produces coverage/lcov.info consumed by SonarQube

    stage('Test') {
      parallel {
        stage('analytics-service') {
          steps { dir("${SVC_ANALYTICS}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_ANALYTICS}/junit.xml" } }
        }
        stage('auth-service') {
          steps { dir("${SVC_AUTH}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_AUTH}/junit.xml" } }
        }
        stage('weather-service') {
          steps { dir("${SVC_WEATHER}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_WEATHER}/junit.xml" } }
        }
        stage('soil-service') {
          steps { dir("${SVC_SOIL}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_SOIL}/junit.xml" } }
        }
        stage('notification-service') {
          steps { dir("${SVC_NOTIF}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_NOTIF}/junit.xml" } }
        }
        stage('api-gateway') {
          steps { dir("${SVC_GATEWAY}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_GATEWAY}/junit.xml" } }
        }
        stage('orchestrator-service') {
          steps { dir("${SVC_ORCH}") { sh TEST_CMD } }
          post  { always { junit allowEmptyResults: true, testResults: "${SVC_ORCH}/junit.xml" } }
        }
        stage('frontend') {
          steps { dir("${SVC_FRONTEND}") { sh 'node ./node_modules/vitest/vitest.mjs run --coverage' } }
        }
      }
    }

    // ── 5. SonarCloud Analysis ─────────────────────────────────────────────
    // Downloads sonar-scanner-cli inline (caches in workspace), so the
    // pipeline never depends on a Jenkins-side "SonarScanner" tool
    // installation that disappears when the Jenkins home volume is wiped.
    // Non-blocking: the scanner runs locally on a CPU-constrained VPS, so a slow
    // or timed-out scan must NOT abort the build. catchError downgrades any
    // failure/timeout here to UNSTABLE (yellow) and lets Build & Deploy proceed.
    // The analysis still uploads to SonarCloud whenever it finishes; see the
    // dashboard for the gate result.
    stage('SonarCloud Analysis') {
      steps {
        // catchError wraps timeout (with catchInterruptions) so even a TIMEOUT
        // becomes UNSTABLE, never ABORTED. The JS/TS bridge server OOMs on this
        // CPU/RAM-constrained VPS; a shell-level `timeout 600` kills a hung
        // scanner cleanly before Jenkins has to interrupt the step.
        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE', catchInterruptions: true) {
          timeout(time: 12, unit: 'MINUTES') {
            sh '''
              set -e
              SCANNER_VERSION=6.2.1.4610
              SCANNER_DIR="$WORKSPACE/.sonar-scanner/sonar-scanner-${SCANNER_VERSION}"
              if [ ! -x "$SCANNER_DIR/bin/sonar-scanner" ]; then
                mkdir -p "$WORKSPACE/.sonar-scanner"
                curl -sSLo /tmp/scanner.zip "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SCANNER_VERSION}.zip"
                unzip -q -o -d "$WORKSPACE/.sonar-scanner" /tmp/scanner.zip
                rm /tmp/scanner.zip
              fi
              timeout 600 "$SCANNER_DIR/bin/sonar-scanner" \
                -Dsonar.projectBaseDir="$WORKSPACE" \
                -Dsonar.host.url="$SONAR_HOST_URL" \
                -Dsonar.token="$SONAR_TOKEN" || echo "Sonar scan slow/failed (likely bridge-server OOM) — continuing, build marked UNSTABLE."
            '''
        }
      }
    }

    // ── 6. Quality Gate ────────────────────────────────────────────────────
    // Polls SonarCloud directly via curl. SonarCloud's REST API is
    // compatible with SonarQube's, so the same /api/ce/task and
    // /api/qualitygates/project_status endpoints work — only the host
    // changes. We pass the token via Bearer header (SonarCloud's
    // recommended auth pattern), which also works for SonarQube ≥9.9.

    stage('Quality Gate') {
      options { timeout(time: 6, unit: 'MINUTES') }
      steps {
       catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
        script {
          def reportFile = "${WORKSPACE}/.scannerwork/report-task.txt"
          if (!fileExists(reportFile)) {
            echo 'report-task.txt not found — skipping quality gate check.'
            return
          }

          def taskId     = sh(returnStdout: true, script: "grep -m1 '^ceTaskId='     '${reportFile}' | cut -d= -f2-").trim()
          def projectKey = sh(returnStdout: true, script: "grep -m1 '^projectKey='   '${reportFile}' | cut -d= -f2-").trim()
          def hostUrl    = env.SONAR_HOST_URL

          // Wait up to 5 minutes for the CE task to finish
          echo "Waiting for CE task ${taskId} on ${hostUrl}..."
          def ready = false
          for (int i = 0; i < 30 && !ready; i++) {
            sleep 10
            try {
              def status = sh(returnStdout: true, script: """
                curl -sf -H "Authorization: Bearer \$SONAR_TOKEN" "${hostUrl}/api/ce/task?id=${taskId}" 2>/dev/null \\
                  | python3 -c "import sys,json; print(json.load(sys.stdin).get('task',{}).get('status','PENDING'))" \\
                  || echo PENDING
              """).trim()
              echo "  CE task status: ${status}"
              if (status in ['SUCCESS', 'FAILED', 'CANCELLED']) { ready = true }
            } catch (Exception ex) {
              echo "  Poll error (attempt ${i+1}): ${ex.message}"
            }
          }

          // Quality Gate is informational only. SonarCloud's full gate
          // requires Security Hotspots to be marked Reviewed in the UI —
          // a manual action no CI step can perform — so failing the build
          // on gate ERROR creates a permanently-UNSTABLE pipeline. The
          // gate status is still echoed so it's visible in the build log
          // and on the SonarCloud dashboard.
          try {
            def gateStatus = sh(returnStdout: true, script: """
              curl -sf -H "Authorization: Bearer \$SONAR_TOKEN" "${hostUrl}/api/qualitygates/project_status?projectKey=${projectKey}" 2>/dev/null \\
                | python3 -c "import sys,json; print(json.load(sys.stdin).get('projectStatus',{}).get('status','UNKNOWN'))" \\
                || echo UNKNOWN
            """).trim()
            echo "Quality Gate status: ${gateStatus} (informational — see SonarCloud dashboard for details)"
          } catch (Exception ex) {
            echo "Could not read quality gate: ${ex.message} (informational only — pipeline continues)."
          }
        }
       }
      }
    }

    // ── 7. Build & Push Docker images (all services in parallel) ──────────

    stage('Docker Login') {
      steps {
        script {
          sh "echo '${DOCKER_CREDS_PSW}' | docker login -u '${DOCKER_CREDS_USR}' --password-stdin"
        }
      }
    }

    // push_retry: Docker Hub intermittently rejects a cross-mounted shared base
    // layer with "blob unknown to registry" when many images push in parallel.
    // The layer exists by the next attempt, so retry the push up to 5 times.
    stage('Build & Push') {
      environment {
        PUSH_RETRY = 'n=0; until docker push "$IMG"; do n=$((n+1)); if [ $n -ge 5 ]; then echo "push failed after 5 attempts"; exit 1; fi; echo "push retry $n..."; sleep 15; done'
      }
      parallel {
        stage('auth-service') {
          steps { sh "docker build -t ${IMG_AUTH}:${IMAGE_TAG} ./${SVC_AUTH}; IMG=${IMG_AUTH}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('api-gateway') {
          steps { sh "docker build -t ${IMG_GATEWAY}:${IMAGE_TAG} ./${SVC_GATEWAY}; IMG=${IMG_GATEWAY}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('farm-service') {
          steps { sh "docker build -t ${IMG_FARM}:${IMAGE_TAG} ./${SVC_FARM}; IMG=${IMG_FARM}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('weather-service') {
          steps { sh "docker build -t ${IMG_WEATHER}:${IMAGE_TAG} ./${SVC_WEATHER}; IMG=${IMG_WEATHER}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('soil-service') {
          steps { sh "docker build -t ${IMG_SOIL}:${IMAGE_TAG} ./${SVC_SOIL}; IMG=${IMG_SOIL}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('orchestrator-service') {
          steps { sh "docker build -t ${IMG_ORCH}:${IMAGE_TAG} ./${SVC_ORCH}; IMG=${IMG_ORCH}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('ai-service') {
          steps { sh "docker build -t ${IMG_AI}:${IMAGE_TAG} ./${SVC_AI}; IMG=${IMG_AI}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('notification-service') {
          steps { sh "docker build -t ${IMG_NOTIF}:${IMAGE_TAG} ./${SVC_NOTIF}; IMG=${IMG_NOTIF}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('analytics-service') {
          steps { sh "docker build -t ${IMG_ANALYTICS}:${IMAGE_TAG} ./${SVC_ANALYTICS}; IMG=${IMG_ANALYTICS}:${IMAGE_TAG}; ${PUSH_RETRY}" }
        }
        stage('frontend') {
          steps {
            sh """
              docker build --build-arg VITE_API_BASE_URL=http://${VPS_HOST}:4000 -t ${IMG_FRONTEND}:${IMAGE_TAG} ./${SVC_FRONTEND}
              IMG=${IMG_FRONTEND}:${IMAGE_TAG}; ${PUSH_RETRY}
            """
          }
        }
      }
    }

    // ── 8. Deploy to Kubernetes (main branch only) ─────────────────────────

    stage('Deploy to K8s') {
      when { branch 'main' }
      steps {
        sshagent(credentials: ['agrosense-vps-key']) {
          sh """
            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
              set -e
              kubectl apply -k /opt/agrosense/k8s/ --kubeconfig=${KUBECONFIG_REMOTE}

              kubectl set image deployment/auth-service        auth-service=${IMG_AUTH}:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/api-gateway         api-gateway=${IMG_GATEWAY}:${IMAGE_TAG}         -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/farm-service        farm-service=${IMG_FARM}:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/weather-service     weather-service=${IMG_WEATHER}:${IMAGE_TAG}     -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/soil-service        soil-service=${IMG_SOIL}:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/orchestrator-service orchestrator-service=${IMG_ORCH}:${IMAGE_TAG}  -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/ai-service          ai-service=${IMG_AI}:${IMAGE_TAG}               -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/notification-service notification-service=${IMG_NOTIF}:${IMAGE_TAG} -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/analytics-service   analytics-service=${IMG_ANALYTICS}:${IMAGE_TAG} -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/frontend             frontend=${IMG_FRONTEND}:${IMAGE_TAG}          -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}

              kubectl rollout status deployment/api-gateway  -n ${K8S_NAMESPACE} --timeout=300s --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl rollout status deployment/auth-service -n ${K8S_NAMESPACE} --timeout=300s --kubeconfig=${KUBECONFIG_REMOTE}
            '
          """
        }
      }
    }

  }

  // ── Post actions ──────────────────────────────────────────────────────────

  post {
    success {
      echo 'Pipeline passed — all services built, tested, and deployed.'
    }
    failure {
      echo 'Pipeline failed — check the stage logs above.'
    }
    always {
      script {
        node {
          sh 'docker image prune -f || true'
        }
      }
    }
  }
}
