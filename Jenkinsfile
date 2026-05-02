pipeline {
    agent any

    environment {
        // ID credentials đã lưu trong Jenkins (Username/Password)
        DOCKER_CREDS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = "${DOCKER_CREDS_USR}"
        
        IMAGE_NAME = "fnb-frontend"
        TAG = "latest"

        // Thông tin server deploy
        SSH_CREDENTIAL_ID = 'ssh-server-key'
        REMOTE_USER = 'cdt'
        REMOTE_HOST = '192.168.0.107'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
            }
        }

        stage('Build & Push Frontend Image') {
            steps {
                script {
                    def fullImageName = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"
                    echo "🚀 BUILDING FRONTEND IMAGE: ${fullImageName}"
                    
                    // Build từ thư mục hiện tại (giả định Jenkins đã đứng trong folder frontend)
                    sh "docker build -t ${fullImageName} ."
                    
                    echo "📤 PUSHING IMAGE TO DOCKER HUB"
                    sh "docker push ${fullImageName}"
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    sshagent([env.SSH_CREDENTIAL_ID]) {
                        def fullImageName = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"
                        
                        sh """
                            ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} "
                                echo '📥 Pulling new image...'
                                docker pull ${fullImageName}

                                echo '🛑 Stopping and removing old container...'
                                docker stop ${IMAGE_NAME} || true
                                docker rm ${IMAGE_NAME} || true

                                echo '🚀 Starting new container...'
                                docker run -d \
                                    --name ${IMAGE_NAME} \
                                    --restart always \
                                    -p 3000:80 \
                                    ${fullImageName}
                                
                                echo '✨ Clean up old images...'
                                docker image prune -f
                            "
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            echo "🧹 Cleaned Docker session"
        }
        success {
            echo "✅ Frontend Build & Deploy thành công!"
        }
        failure {
            echo "❌ Pipeline Frontend thất bại!"
        }
    }
}