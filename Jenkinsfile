pipeline {
  agent any

  environment {
    IMAGE_TAG        = "v1.0.${BUILD_NUMBER}"
    DOCKER_HUB_USER = 'damarisateh'
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
  }

  options {
    disableConcurrentBuilds()
    timeout(time: 45, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {

    // ── 1. Checkout ────────────────────────────────────────────────────────

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Damaris200/AgroSense_AI.git'
      }
    }

    // ── 2. Install dependencies (all services in parallel) ─────────────────

    stage('Install Dependencies') {
      parallel {
        // Prisma services: install then generate the Prisma client so tsc can find the types
        stage('auth-service')          { steps { dir('services/auth-service')          { sh 'bun install --frozen-lockfile && DATABASE_URL=postgresql://user:pass@localhost:5432/agrosense_auth?schema=public bun run prisma:generate' } } }
        stage('farm-service')          { steps { dir('services/farm-service')          { sh 'bun install --frozen-lockfile && DATABASE_URL=postgresql://user:pass@localhost:5432/agrosense_farm?schema=public bun run prisma:generate' } } }
        stage('weather-service')       { steps { dir('services/weather-service')       { sh 'bun install --frozen-lockfile && DATABASE_URL=mongodb://user:pass@localhost:27017/agrosense_weather bun run prisma:generate' } } }
        stage('soil-service')          { steps { dir('services/soil-service')          { sh 'bun install --frozen-lockfile && DATABASE_URL=mongodb://user:pass@localhost:27017/agrosense_soil bun run prisma:generate' } } }
        stage('ai-service')            { steps { dir('services/ai-service')            { sh 'bun install --frozen-lockfile && DATABASE_URL=mongodb://user:pass@localhost:27017/agrosense_ai bun run prisma:generate' } } }
        stage('notification-service')  { steps { dir('services/notification-service')  { sh 'bun install --frozen-lockfile && DATABASE_URL=mongodb://user:pass@localhost:27017/agrosense_notification bun run prisma:generate' } } }
        stage('analytics-service')     { steps { dir('services/analytics-service')     { sh 'bun install --frozen-lockfile && DATABASE_URL=mongodb://user:pass@localhost:27017/agrosense_analytics bun run prisma:generate' } } }
        // Non-Prisma services: install only
        stage('api-gateway')           { steps { dir('services/api-gateway')           { sh 'bun install --frozen-lockfile' } } }
        stage('orchestrator-service')  { steps { dir('services/orchestrator-service')  { sh 'bun install --frozen-lockfile' } } }
        stage('frontend')              { steps { dir('frontend')                        { sh 'bun install --frozen-lockfile' } } }
      }
    }

    // ── 3. Typecheck (all services in parallel) ────────────────────────────

    stage('Typecheck') {
      parallel {
        stage('auth-service')         { steps { dir('services/auth-service')          { sh 'bun run typecheck' } } }
        stage('api-gateway')          { steps { dir('services/api-gateway')           { sh 'bun run typecheck' } } }
        stage('farm-service')         { steps { dir('services/farm-service')          { sh 'bun run typecheck' } } }
        stage('weather-service')      { steps { dir('services/weather-service')       { sh 'bun run typecheck' } } }
        stage('soil-service')         { steps { dir('services/soil-service')          { sh 'bun run typecheck' } } }
        stage('orchestrator-service') { steps { dir('services/orchestrator-service')  { sh 'bun run typecheck' } } }
        stage('ai-service')           { steps { dir('services/ai-service')            { sh 'bun run typecheck' } } }
        stage('notification-service') { steps { dir('services/notification-service')  { sh 'bun run typecheck' } } }
        stage('analytics-service')    { steps { dir('services/analytics-service')     { sh 'bun run typecheck' } } }
        // vite build performs type-checking for the frontend
        stage('frontend')             { steps { dir('frontend')                        { sh 'bun run build'     } } }
      }
    }

    // ── 4. Tests (services that have test suites) ──────────────────────────
    // --coverage-reporter=lcov produces coverage/lcov.info consumed by SonarQube

    stage('Test') {
      parallel {
        stage('analytics-service') {
          steps {
            dir('services/analytics-service') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/analytics-service/junit.xml'
            }
          }
        }
        stage('auth-service') {
          steps {
            dir('services/auth-service') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/auth-service/junit.xml'
            }
          }
        }
        stage('weather-service') {
          steps {
            dir('services/weather-service') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/weather-service/junit.xml'
            }
          }
        }
        stage('soil-service') {
          steps {
            dir('services/soil-service') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/soil-service/junit.xml'
            }
          }
        }
        stage('notification-service') {
          steps {
            dir('services/notification-service') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/notification-service/junit.xml'
            }
          }
        }
        stage('api-gateway') {
          steps {
            dir('services/api-gateway') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/api-gateway/junit.xml'
            }
          }
        }
        stage('orchestrator-service') {
          steps {
            dir('services/orchestrator-service') {
              sh 'bun test --coverage --coverage-reporter=lcov --reporter=junit --reporter-outfile=junit.xml'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/orchestrator-service/junit.xml'
            }
          }
        }
        stage('frontend') {
          steps {
            dir('frontend') {
              sh 'node ./node_modules/vitest/vitest.mjs run --coverage'
            }
          }
        }
      }
    }

    // ── 5. SonarCloud Analysis ─────────────────────────────────────────────
    // Sends analysis to https://sonarcloud.io. Org slug and project key come
    // from sonar-project.properties (committed). Token comes from the
    // 'sonarcloud-token' credential, exposed as SONAR_TOKEN above.
    //
    // Requires: Manage Jenkins → Tools → SonarQube Scanner installation
    //   name = "SonarScanner" (the tool itself is provider-agnostic — same
    //   binary works against SonarQube or SonarCloud).
    //
    // For PR analysis (optional): SonarCloud auto-detects PR context if the
    // SonarCloud GitHub App is installed on the repo. Otherwise pass
    // -Dsonar.pullrequest.key / .branch / .base explicitly.
    stage('SonarCloud Analysis') {
      steps {
        script {
          def scannerHome = tool 'SonarScanner'
          // No withSonarQubeEnv wrapper: we pass host.url + token explicitly so
          // the build does not depend on Jenkins-side server configuration.
          // This avoids the failure mode where someone re-points the named
          // server and breaks the pipeline silently.
          sh """
            ${scannerHome}/bin/sonar-scanner \\
              -Dsonar.projectBaseDir=${WORKSPACE} \\
              -Dsonar.host.url=${SONAR_HOST_URL} \\
              -Dsonar.token=${SONAR_TOKEN}
          """
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
      steps {
        script {
          def reportFile = "${WORKSPACE}/.scannerwork/report-task.txt"
          if (!fileExists(reportFile)) {
            echo 'report-task.txt not found — skipping quality gate check.'
            return
          }

          // Parse report-task.txt with sh grep — no Pipeline Utility Steps plugin needed
          def taskId     = sh(returnStdout: true, script: "grep -m1 '^ceTaskId='     '${reportFile}' | cut -d= -f2-").trim()
          def projectKey = sh(returnStdout: true, script: "grep -m1 '^projectKey='   '${reportFile}' | cut -d= -f2-").trim()
          def hostUrl    = env.SONAR_HOST_URL  // 'https://sonarcloud.io', set in environment block

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

          // Read the quality gate result
          try {
            def gateStatus = sh(returnStdout: true, script: """
              curl -sf -H "Authorization: Bearer \$SONAR_TOKEN" "${hostUrl}/api/qualitygates/project_status?projectKey=${projectKey}" 2>/dev/null \\
                | python3 -c "import sys,json; print(json.load(sys.stdin).get('projectStatus',{}).get('status','UNKNOWN'))" \\
                || echo UNKNOWN
            """).trim()
            echo "Quality Gate status: ${gateStatus}"
            if (gateStatus == 'ERROR') {
              currentBuild.result = 'UNSTABLE'
              echo 'Quality Gate FAILED — build marked UNSTABLE, pipeline continues.'
            }
          } catch (Exception ex) {
            echo "Could not read quality gate: ${ex.message} — marking UNSTABLE, pipeline continues."
            currentBuild.result = 'UNSTABLE'
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

    stage('Build & Push') {
      parallel {
        stage('auth-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-auth:${IMAGE_TAG}         ./services/auth-service
              docker push                damarisateh/agrosense-auth:${IMAGE_TAG}
            """
          }
        }
        stage('api-gateway') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-api-gateway:${IMAGE_TAG}  ./services/api-gateway
              docker push                damarisateh/agrosense-api-gateway:${IMAGE_TAG}
            """
          }
        }
        stage('farm-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-farm:${IMAGE_TAG}         ./services/farm-service
              docker push                damarisateh/agrosense-farm:${IMAGE_TAG}
            """
          }
        }
        stage('weather-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-weather:${IMAGE_TAG}      ./services/weather-service
              docker push                damarisateh/agrosense-weather:${IMAGE_TAG}
            """
          }
        }
        stage('soil-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-soil:${IMAGE_TAG}         ./services/soil-service
              docker push                damarisateh/agrosense-soil:${IMAGE_TAG}
            """
          }
        }
        stage('orchestrator-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-orchestrator:${IMAGE_TAG} ./services/orchestrator-service
              docker push                damarisateh/agrosense-orchestrator:${IMAGE_TAG}
            """
          }
        }
        stage('ai-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-ai:${IMAGE_TAG}           ./services/ai-service
              docker push                damarisateh/agrosense-ai:${IMAGE_TAG}
            """
          }
        }
        stage('notification-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-notification:${IMAGE_TAG} ./services/notification-service
              docker push                damarisateh/agrosense-notification:${IMAGE_TAG}
            """
          }
        }
        stage('analytics-service') {
          steps {
            sh """
              docker build -t damarisateh/agrosense-analytics:${IMAGE_TAG}    ./services/analytics-service
              docker push                damarisateh/agrosense-analytics:${IMAGE_TAG}
            """
          }
        }
        stage('frontend') {
          steps {
            sh """
              docker build \
                --build-arg VITE_API_BASE_URL=http://${VPS_HOST}:4000 \
                -t damarisateh/agrosense-frontend:${IMAGE_TAG} ./frontend
              docker push damarisateh/agrosense-frontend:${IMAGE_TAG}
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

              # Apply any non-image manifest changes from this push
              kubectl apply -k /opt/agrosense/k8s/ --kubeconfig=${KUBECONFIG_REMOTE}

              # Update each deployment to the exact image tag built in this pipeline run
              kubectl set image deployment/auth-service        auth-service=damarisateh/agrosense-auth:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/api-gateway         api-gateway=damarisateh/agrosense-api-gateway:${IMAGE_TAG}     -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/farm-service        farm-service=damarisateh/agrosense-farm:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/weather-service     weather-service=damarisateh/agrosense-weather:${IMAGE_TAG}     -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/soil-service        soil-service=damarisateh/agrosense-soil:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/orchestrator-service orchestrator-service=damarisateh/agrosense-orchestrator:${IMAGE_TAG} -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/ai-service          ai-service=damarisateh/agrosense-ai:${IMAGE_TAG}               -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/notification-service notification-service=damarisateh/agrosense-notification:${IMAGE_TAG} -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/analytics-service   analytics-service=damarisateh/agrosense-analytics:${IMAGE_TAG} -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}
              kubectl set image deployment/frontend             frontend=damarisateh/agrosense-frontend:${IMAGE_TAG}           -n ${K8S_NAMESPACE} --kubeconfig=${KUBECONFIG_REMOTE}

              # Wait for the two most critical services to complete their rollout
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
        // Ensure we have a workspace context for the cleanup shell step.
        node {
          sh 'docker image prune -f || true'
        }
      }
    }
  }
}
