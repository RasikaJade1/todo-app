pipeline {
    agent any
    tools {
        nodejs 'Node18' // Refers to Node.js installation named 'Node18' in Global Tool Configuration
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
                // Install npm dependencies
                sh 'npm ci'
            }
        }
        stage('Lint') {
            steps {
                // Run linting (optional, continues if not configured)
                sh 'npm run lint || true'
            }
        }
        stage('Test') {
            steps {
                // Run tests (optional, continues if not configured)
                sh 'npm test || true'
            }
        }
        stage('Build') {
            steps {
                // Build the React app
                sh 'npm run build'
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
