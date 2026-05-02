pipeline {
    agent any

    environment {
        // Docker Hub credentials
        DOCKER_CREDS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = "${DOCKER_CREDS_USR}"
        
        IMAGE_NAME = "fnb-frontend"
        TAG = "latest"

        // SSH server
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
                    
                    echo "🚀 BUILDING IMAGE: ${fullImageName}"
                    sh "docker build -t ${fullImageName} ."

                    echo "📤 PUSHING IMAGE..."
                    sh "docker push ${fullImageName}"
                }
            }
        }

        // ✅ TEST SSH trước (rất nên giữ)
        stage('Test SSH') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ssh-server-key', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} 'echo ✅ SSH OK'
                    """
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    def fullImageName = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"

                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-server-key', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                            ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
                                echo '📥 Pulling new image...'
                                docker pull ${fullImageName}

                                echo '🛑 Stopping old container...'
                                docker stop ${IMAGE_NAME} || true
                                docker rm ${IMAGE_NAME} || true

                                echo '🚀 Starting new container...'
                                docker run -d \
                                    --name ${IMAGE_NAME} \
                                    --restart always \
                                    -p 3000:80 \
                                    ${fullImageName}

                                echo '🧹 Cleaning unused images...'
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
            echo "❌ Pipeline thất bại! Kiểm tra log từng stage."
        }
    }
}