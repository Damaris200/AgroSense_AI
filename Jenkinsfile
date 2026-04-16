pipeline {
  agent any

  environment {
    COMPOSE = 'docker-compose'
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Damaris200/AgroSense_AI.git'
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('auth-service') {
          steps {
            dir('services/auth-service') {
              sh 'bun install --frozen-lockfile'
            }
          }
        }
        stage('frontend') {
          steps {
            dir('frontend') {
              sh 'bun install --frozen-lockfile'
            }
          }
        }
      }
    }

    stage('Typecheck') {
      parallel {
        stage('auth-service types') {
          steps {
            dir('services/auth-service') {
              sh 'bun run typecheck'
            }
          }
        }
        stage('frontend types') {
          steps {
            dir('frontend') {
              sh 'bun run build'
            }
          }
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('services/auth-service') {
          sh 'bun test --coverage'
        }
      }
      post {
        always {
          // Publish test results if you add a reporter later
          echo 'Tests complete — check coverage above.'
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh "${COMPOSE} build auth-service frontend"
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        sh "${COMPOSE} up -d --remove-orphans"
      }
    }

  }

  post {
    success {
      echo 'Pipeline passed — system is live.'
    }
    failure {
      echo 'Pipeline failed — check logs above.'
    }
  }
}
