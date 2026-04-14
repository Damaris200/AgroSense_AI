pipeline {
  agent any

  environment {
    DOCKER_COMPOSE = 'docker-compose'
  }

  stages {
    stage('Clone Repo') {
      steps {
        git branch: 'main', url: 'https://github.com/Damaris200/AgroSense_AI.git'
      }
    }

    stage('Install — Auth Service') {
      steps {
        dir('services/auth-service') {
          sh 'bun install'
        }
      }
    }

    stage('Install — Frontend') {
      steps {
        dir('frontend') {
          sh 'bun install'
        }
      }
    }

    stage('Typecheck') {
      parallel {
        stage('Auth Service') {
          steps {
            dir('services/auth-service') {
              sh 'bun run typecheck'
            }
          }
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh "${DOCKER_COMPOSE} build auth-service frontend"
      }
    }

    stage('Deploy') {
      steps {
        sh "${DOCKER_COMPOSE} up -d"
      }
    }
  }

  post {
    failure {
      echo 'Build failed — check logs above.'
    }
    success {
      echo 'Deployed successfully.'
    }
  }
}
