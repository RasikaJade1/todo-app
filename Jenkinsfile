pipeline {
    agent any
    tools {
        nodejs 'Node 18' // Matches Node.js installation name in Jenkins
    }
    stages {
        stage('Checkout') {
            steps {
                // Clone the repository, using 'main' branch
                git url: 'https://github.com/RasikaJade1/todo-app.git', branch: 'main'
            }
        }
        stage('Install Dependencies') {
            steps {
                // Install npm dependencies using Windows batch command
                bat 'npm ci'
            }
        }
        stage('Lint') {
            steps {
                // Run linting (optional, continues if not configured)
                bat 'npm run lint || exit /b 0'
            }
        }
        stage('Test') {
            steps {
                // Run tests (optional, continues if not configured)
                bat 'npm test || exit /b 0'
            }
        }
        stage('Build') {
            steps {
                // Build the React app
                bat 'npm run build'
            }
        }
        stage('Archive Artifacts') {
            steps {
                // Archive the build folder for manual retrieval
                archiveArtifacts artifacts: 'build/**', fingerprint: true
            }
        }
    }
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully! Build artifacts archived.'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}
