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
            /* 
               Sử dụng Docker agent giúp môi trường chạy lệnh sh bên dưới 
               nằm hoàn toàn trong container Node 20.
            */
            agent {
                docker {
                    image "${env.NODE_IMAGE}"
                    reuseNode true
                    // Cấp quyền ghi cache để tránh lỗi npm permission
                    args '-v /tmp:/tmp -e HOME=/tmp'
                }
            }
            steps {
                sh 'node -v'
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Prepare Artifact') {
            steps {
                // Nén folder dist sau khi build xong
                sh 'tar -czf dist.tar.gz -C dist .'
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent([env.SSH_CREDENTIAL_ID]) {
                    // 1. Tạo thư mục và phân quyền trên server đích
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} "
                            sudo mkdir -p ${env.TARGET_DIR} &&
                            sudo chown -R ${env.REMOTE_USER}:${env.REMOTE_USER} ${env.TARGET_DIR}
                        "
                    """

                    // 2. Đẩy file nén lên server
                    sh """
                        scp -o StrictHostKeyChecking=no dist.tar.gz \
                        ${env.REMOTE_USER}@${env.REMOTE_HOST}:${env.TARGET_DIR}/
                    """

                    // 3. Giải nén và yêu cầu Nginx đọc lại cấu hình mới
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
            // Dọn dẹp file rác sau khi pipeline kết thúc
            sh 'rm -f dist.tar.gz'
        }
        success {
            echo "Deploy Frontend tới ${env.REMOTE_HOST} thành công!"
        }
        failure {
            echo "Deploy thất bại! Vui lòng kiểm tra log build hoặc kết nối tới ${env.REMOTE_HOST}."
        }
    }
}