pipeline {
    agent any

    environment {
        SSH_CREDENTIAL_ID = 'ssh-server-key'
        REMOTE_USER       = 'cdt'
        REMOTE_HOST       = '192.168.0.107'
        TARGET_DIR        = '/var/www/frontend'
        NODE_IMAGE        = 'node:20-alpine' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                // Sử dụng --user để tránh lỗi quyền Root và -e HOME để npm có chỗ lưu cache
                sh """
                    docker run --rm \
                        --user \$(id -u):\$(id -g) \
                        -v ${WORKSPACE}:/app \
                        -w /app \
                        -e HOME=/tmp \
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
                    // 1. Tạo thư mục và phân quyền
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} "
                            sudo mkdir -p ${env.TARGET_DIR} &&
                            sudo chown -R ${env.REMOTE_USER}:${env.REMOTE_USER} ${env.TARGET_DIR}
                        "
                    """

                    // 2. Đẩy file
                    sh """
                        scp -o StrictHostKeyChecking=no dist.tar.gz \
                        ${env.REMOTE_USER}@${env.REMOTE_HOST}:${env.TARGET_DIR}/
                    """

                    // 3. Giải nén và reload Nginx
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
            echo "Deploy thành công tới ${env.REMOTE_HOST}!"
        }
        failure {
            echo "Lỗi build hoặc deploy. Kiểm tra lại log!"
        }
    }
}