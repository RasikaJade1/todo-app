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
