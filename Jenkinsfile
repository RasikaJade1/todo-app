pipeline {
    agent any
    tools {
        nodejs 'Node 22'
    }
    environment {
        DOCKER_HOST = 'npipe:////./pipe/docker_engine'
        MONGO_URI = 'mongodb://localhost:27017/testdb'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/RasikaJade1/todo-app.git', branch: 'main'
            }
            post {
                always {
                    bat 'dir > checkout_files.log 2>&1'
                    archiveArtifacts artifacts: 'checkout_files.log', allowEmptyArchive: true
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }
        stage('Start MongoDB') {
            steps {
                script {
                    try {
                        // Verify workspace permissions
                        bat 'dir > workspace_check.log 2>&1 || exit 1'
                        // Verify Docker and Docker Compose
                        bat 'docker info || exit 1'
                        bat 'docker-compose --version || exit 1'
                        // Validate docker-compose.yml
                        bat 'docker-compose -p todo-app config || exit 1'
                        // Pull MongoDB image with Docker Hub login
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            bat 'echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin'
                            bat 'docker pull mongo:latest || exit 1'
                        }
                        // Stop existing services
                        bat 'docker-compose -p todo-app down || exit /b 0'
                        // Clear port 27017
                        bat 'netstat -aon | findstr :27017 > nul && (for /f "tokens=5" %%a in (\'netstat -aon ^| findstr :27017\') do taskkill /PID %%a /F) || echo No process on port 27017'
                        // Start MongoDB and capture output
                        bat 'docker-compose -p todo-app up -d mongo > mongo_start.log 2>&1 || type mongo_start.log && exit 1'
                        // Wait for container to initialize
                        bat 'ping 127.0.0.1 -n 16 > nul'
                        // Check running containers
                        bat 'docker ps -a'
                        // Log MongoDB container
                        bat 'docker logs todo-app-mongo || exit /b 0'
                        // Archive log files
                        archiveArtifacts artifacts: 'workspace_check.log,mongo_start.log', allowEmptyArchive: true
                    } catch (Exception e) {
                        echo "Error starting MongoDB: ${e}"
                        bat 'type mongo_start.log || echo No mongo_start.log created'
                        bat 'type workspace_check.log || echo No workspace_check.log created'
                        bat 'docker-compose -p todo-app logs mongo || exit /b 0'
                        bat 'docker ps -a'
                        archiveArtifacts artifacts: 'workspace_check.log,mongo_start.log', allowEmptyArchive: true
                        throw e
                    }
                }
            }
        }
        stage('Test') {
            steps {
                bat 'npm test'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                bat 'docker --version'
                bat 'docker build -t rasika23/todo-app:latest .'
            }
        }
        stage('Run Docker Containers') {
            steps {
                script {
                    try {
                        // Clear port 3000
                        bat 'netstat -aon | findstr :3000 > nul && (for /f "tokens=5" %%a in (\'netstat -aon ^| findstr :3000\') do taskkill /PID %%a /F) || echo No process on port 3000'
                        // Start all services
                        bat 'docker-compose -p todo-app up -d --build > app_start.log 2>&1 || type app_start.log && exit 1'
                        // Wait for containers
                        bat 'ping 127.0.0.1 -n 16 > nul'
                        // Check running containers
                        bat 'docker ps'
                        // Log app container
                        bat 'docker logs todo-app || exit /b 0'
                        // Verify app is running
                        bat 'curl http://localhost:3000 || exit /b 0'
                        // Save logs
                        bat 'docker logs todo-app > app_logs.txt'
                        bat 'docker logs todo-app'
                        // Archive log file
                        archiveArtifacts artifacts: 'app_start.log', allowEmptyArchive: true
                    } catch (Exception e) {
                        echo "Error running Docker containers: ${e}"
                        bat 'type app_start.log || echo No app_start.log created'
                        bat 'docker-compose -p todo-app logs'
                        archiveArtifacts artifacts: 'app_start.log', allowEmptyArchive: true
                        currentBuild.result = 'UNSTABLE'
                    } finally {
                        bat 'docker-compose -p todo-app down || exit /b 0'
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'app_logs.txt', allowEmptyArchive: true
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    bat 'echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin'
                    bat 'docker push rasika23/todo-app:latest'
                }
            }
        }
    }
    post {
        always {
            bat 'docker-compose -p todo-app down || exit /b 0'
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