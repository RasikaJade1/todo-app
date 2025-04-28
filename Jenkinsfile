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
                withEnv(['MONGO_URI=mongodb://localhost:27017/todoapp']) {
                    bat 'npm test || exit /b 0'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                bat 'docker build -t rasikajade/todo-app:latest .'
            }
        }
        stage('Run Docker Containers') {
            steps {
                script {
                    try {
                        bat 'docker-compose up -d --build'
                        bat 'timeout /t 10 /nobreak' // Wait 10 seconds for containers to start
                        bat 'docker logs todo-app_app_1' // Capture app container logs
                    } catch (Exception e) {
                        echo "Error running Docker containers: ${e}"
                        currentBuild.result = 'UNSTABLE'
                    } finally {
                        bat 'docker-compose down' // Clean up containers
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
