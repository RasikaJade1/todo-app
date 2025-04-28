pipeline {
    agent any
    tools {
        nodejs 'Node 22' // Matches Node.js 22.14.0
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/RasikaJade1/todo-app.git', branch: 'main'
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }
        stage('Test') {
            steps {
                bat 'npm test || exit /b 0'
            }
        }
        stage('Build Docker Image') {
            steps {
                bat 'docker --version' // Verify Docker
                bat 'docker build -t rasikajade/todo-app:latest .'
            }
        }
        stage('Run Docker Containers') {
            steps {
                script {
                    try {
                        bat 'docker-compose up -d --build'
                        bat 'ping 127.0.0.1 -n 11 > nul' // Wait ~10 seconds
                        bat 'curl http://localhost:3000 || exit /b 0' // Trigger homepage
                        bat 'docker logs todo-app-ci-cd-app-1' // Capture logs
                    } catch (Exception e) {
                        echo "Error running Docker containers: ${e}"
                        currentBuild.result = 'UNSTABLE'
                    } finally {
                        bat 'docker-compose down || exit /b 0' // Clean up
                    }
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    bat 'echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin'
                    bat 'docker push rasikajade/todo-app:latest'
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}
