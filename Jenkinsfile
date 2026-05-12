pipeline {
  agent any

  environment {
    DOCKER_HUB_USER = 'damarisateh'
    // Jenkins credentials: kind=Username+Password, ID=dockerhub-credentials
    DOCKER_CREDS     = credentials('dockerhub-credentials')
    // Jenkins credentials: kind=SSH Username with private key, ID=agrosense-vps-key
    VPS_USER         = 'root'
    // Jenkins credentials: kind=Secret text, ID=agrosense-vps-host  (the VPS IP)
    VPS_HOST         = credentials('agrosense-vps-host')
    KUBECONFIG_REMOTE = '/etc/rancher/k3s/k3s.yaml'
    K8S_NAMESPACE    = 'agrosense'
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
        stage('auth-service')          { steps { dir('services/auth-service')          { sh 'bun install --frozen-lockfile' } } }
        stage('api-gateway')           { steps { dir('services/api-gateway')           { sh 'bun install --frozen-lockfile' } } }
        stage('farm-service')          { steps { dir('services/farm-service')          { sh 'bun install --frozen-lockfile' } } }
        stage('weather-service')       { steps { dir('services/weather-service')       { sh 'bun install --frozen-lockfile' } } }
        stage('soil-service')          { steps { dir('services/soil-service')          { sh 'bun install --frozen-lockfile' } } }
        stage('orchestrator-service')  { steps { dir('services/orchestrator-service')  { sh 'bun install --frozen-lockfile' } } }
        stage('ai-service')            { steps { dir('services/ai-service')            { sh 'bun install --frozen-lockfile' } } }
        stage('notification-service')  { steps { dir('services/notification-service')  { sh 'bun install --frozen-lockfile' } } }
        stage('analytics-service')     { steps { dir('services/analytics-service')     { sh 'bun install --frozen-lockfile' } } }
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

    stage('Test') {
      parallel {
        stage('auth-service') {
          steps {
            dir('services/auth-service') {
              sh 'bun test --coverage'
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'services/auth-service/coverage/**/*.xml'
            }
          }
        }
        stage('weather-service') {
          steps { dir('services/weather-service') { sh 'bun test --coverage' } }
        }
        stage('soil-service') {
          steps { dir('services/soil-service') { sh 'bun test --coverage' } }
        }
        stage('notification-service') {
          steps { dir('services/notification-service') { sh 'bun test --coverage' } }
        }
        stage('api-gateway') {
          steps { dir('services/api-gateway') { sh 'bun test --coverage' } }
        }
      }
    }

    // ── 5. Build & Push Docker images (all services in parallel) ──────────

    stage('Build & Push') {
      steps {
        script {
          sh "echo '${DOCKER_CREDS_PSW}' | docker login -u '${DOCKER_CREDS_USR}' --password-stdin"
        }
      }
      parallel {
        stage('auth-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-auth:latest         ./services/auth-service
              docker push                damarisateh/agrosense-auth:latest
            '''
          }
        }
        stage('api-gateway') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-api-gateway:latest  ./services/api-gateway
              docker push                damarisateh/agrosense-api-gateway:latest
            '''
          }
        }
        stage('farm-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-farm:latest         ./services/farm-service
              docker push                damarisateh/agrosense-farm:latest
            '''
          }
        }
        stage('weather-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-weather:latest      ./services/weather-service
              docker push                damarisateh/agrosense-weather:latest
            '''
          }
        }
        stage('soil-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-soil:latest         ./services/soil-service
              docker push                damarisateh/agrosense-soil:latest
            '''
          }
        }
        stage('orchestrator-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-orchestrator:latest ./services/orchestrator-service
              docker push                damarisateh/agrosense-orchestrator:latest
            '''
          }
        }
        stage('ai-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-ai:latest           ./services/ai-service
              docker push                damarisateh/agrosense-ai:latest
            '''
          }
        }
        stage('notification-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-notification:latest ./services/notification-service
              docker push                damarisateh/agrosense-notification:latest
            '''
          }
        }
        stage('analytics-service') {
          steps {
            sh '''
              docker build -t damarisateh/agrosense-analytics:latest    ./services/analytics-service
              docker push                damarisateh/agrosense-analytics:latest
            '''
          }
        }
        stage('frontend') {
          steps {
            sh '''
              docker build \
                --build-arg VITE_API_BASE_URL=http://${VPS_HOST}:4000 \
                -t damarisateh/agrosense-frontend:latest ./frontend
              docker push damarisateh/agrosense-frontend:latest
            '''
          }
        }
      }
    }

    // ── 6. Deploy to Kubernetes (main branch only) ─────────────────────────

    stage('Deploy to K8s') {
      when { branch 'main' }
      steps {
        // SSH into VPS, force-pull latest images, rolling-restart all deployments
        sshagent(credentials: ['agrosense-vps-key']) {
          sh """
            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
              set -e

              # Apply any manifest changes from this push
              kubectl apply -k /opt/agrosense/k8s/ --kubeconfig=${KUBECONFIG_REMOTE}

              # Rolling restart forces Kubernetes to pull the new :latest images
              kubectl rollout restart deployment \
                api-gateway auth-service farm-service weather-service \
                soil-service orchestrator-service ai-service \
                notification-service analytics-service frontend \
                -n ${K8S_NAMESPACE} \
                --kubeconfig=${KUBECONFIG_REMOTE}

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
      // Clean up dangling Docker images on the Jenkins agent to save disk space
      sh 'docker image prune -f || true'
    }
  }
}
