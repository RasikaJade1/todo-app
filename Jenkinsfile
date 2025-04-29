pipeline {
    agent any
    tools {
        nodejs 'Node 22'
    }
    environment {
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
        stage('Check Docker Daemon') {
            steps {
                script {
                    bat 'docker info || exit /b 1'
                    echo "Docker daemon is running."
                }
            }
        }
        stage('Start MongoDB') {
            steps {
                script {
                    try {
                        bat 'docker-compose -p todo-app down > mongo_down.log 2>&1 || exit /b 0'
                        bat 'for /f "tokens=5" %%a in (\'netstat -aon ^| findstr :27017 ^| findstr /V "^0"\') do taskkill /PID %%a /F 2>nul || echo No process on port 27017'
                        bat 'docker-compose -p todo-app up -d mongo > mongo_start.log 2>&1 || exit /b 1'
                        bat 'ping 127.0.0.1 -n 10 > nul'
                        bat 'docker ps > docker_ps.log 2>&1'
                        bat 'docker logs todo-app-mongo > mongo_logs.log 2>&1 || exit /b 0'
                        bat 'if not exist mongo_logs.log exit /b 1'
                    } catch (Exception e) {
                        echo "Error starting MongoDB: ${e}"
                        bat 'type mongo_start.log || echo No mongo_start.log created'
                        bat 'type mongo_down.log || echo No mongo_down.log created'
                        bat 'type mongo_logs.log || echo No mongo_logs.log created'
                        bat 'type docker_ps.log || echo No docker_ps.log created'
                        bat 'docker-compose -p todo-app logs mongo || exit /b 0'
                        throw e
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
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
                        bat 'netstat -aon | findstr :3000 > nul && (for /f "tokens=5" %%a in (\'netstat -aon ^| findstr :3000\') do taskkill /PID %%a /F) || echo No process on port 3000'
                        bat 'docker-compose -p todo-app up -d --build > app_start.log 2>&1 || exit /b 1'
                        bat 'ping 127.0.0.1 -n 15 > nul'
                        bat 'docker ps > docker_ps.log 2>&1'
                        bat 'docker logs todo-app > app_logs.txt 2>&1 || exit /b 0'
                        bat 'curl http://localhost:3000 || exit /b 0'
                        bat 'docker logs todo-app'
                    } catch (Exception e) {
                        echo "Error running Docker containers: ${e}"
                        bat 'type app_start.log || echo No app_start.log created'
                        bat 'docker-compose -p todo-app logs'
                        currentBuild.result = 'UNSTABLE'
                    } finally {
                        bat 'docker-compose -p todo-app down > app_down.log 2>&1 || exit /b 0'
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'app_logs.txt, *.log', allowEmptyArchive: true
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
            bat 'docker-compose -p todo-app down > final_down.log 2>&1 || exit /b 0'
            script {
                try {
                    cleanWs()
                } catch (Exception e) {
                    echo "Workspace cleanup failed: ${e}. Attempting manual cleanup."
                    bat 'taskkill /IM node.exe /F || exit /b 0'
                    bat 'taskkill /IM docker.exe /F || exit /b 0'
                    bat 'rmdir /S /Q node_modules || exit /b 0'
                    bat 'docker volume rm todo-app_mongo-data || exit /b 0'
                    cleanWs()
                }
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}
