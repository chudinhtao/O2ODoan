pipeline {
    agent any

    environment {
        SSH_CREDENTIAL_ID = 'ssh-server-key'
        REMOTE_USER = 'cdt'
        REMOTE_HOST = '192.168.0.105'
        TARGET_DIR  = '/var/www/frontend'
        // Sử dụng image node để build
        NODE_IMAGE  = 'node:20-alpine' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                // Sử dụng Docker để chạy npm install và build
                // Lệnh này giúp bạn không cần cài node/npm lên server Jenkins
                sh """
                    docker run --rm \
                        -v ${WORKSPACE}:/app \
                        -w /app \
                        ${env.NODE_IMAGE} \
                        sh -c "npm install && npm run build"
                """
            }
        }

        stage('Prepare Artifact') {
            steps {
                sh 'tar -czf dist.tar.gz -C dist .'
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent([env.SSH_CREDENTIAL_ID]) {
                    // 1. Tạo thư mục và cấp quyền (Gộp lệnh cho gọn)
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} "
                            sudo mkdir -p ${env.TARGET_DIR} &&
                            sudo chown -R ${env.REMOTE_USER}:${env.REMOTE_USER} ${env.TARGET_DIR}
                        "
                    """

                    // 2. Copy file lên server
                    sh """
                        scp -o StrictHostKeyChecking=no dist.tar.gz \
                        ${env.REMOTE_USER}@${env.REMOTE_HOST}:${env.TARGET_DIR}/
                    """

                    // 3. Giải nén và dọn dẹp
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} "
                            cd ${env.TARGET_DIR} &&
                            tar -xzf dist.tar.gz &&
                            rm dist.tar.gz &&
                            sudo systemctl reload nginx
                        "
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f dist.tar.gz'
        }
        success {
            echo 'Deploy Frontend thành công!'
        }
        failure {
            echo 'Deploy Frontend thất bại! Kiểm tra lại kết nối SSH hoặc lỗi Build.'
        }
    }
}