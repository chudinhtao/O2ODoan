pipeline {
    agent any

    environment {
        // Thay đổi các thông tin này cho đúng với server của bạn
        SSH_CREDENTIAL_ID = 'ssh-server-key' // ID của credential SSH trong Jenkins
        REMOTE_USER = 'root'                // User SSH
        REMOTE_HOST = 'your-server-ip'      // IP của server Nginx
        TARGET_DIR  = '/var/www/frontend'  // Thư mục chứa code trên server Nginx
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Prepare Artifact') {
            steps {
                // Nén folder dist để truyền đi nhanh hơn
                sh 'tar -czf dist.tar.gz dist/'
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent([env.SSH_CREDENTIAL_ID]) {
                    // 1. Tạo thư mục nếu chưa có
                    sh "ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} 'mkdir -p ${env.TARGET_DIR}'"
                    
                    // 2. Đẩy file nén lên server
                    sh "scp -o StrictHostKeyChecking=no dist.tar.gz ${env.REMOTE_USER}@${env.REMOTE_HOST}:${env.TARGET_DIR}/"
                    
                    // 3. Giải nén và dọn dẹp
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} '
                            cd ${env.TARGET_DIR} && \
                            tar -xzf dist.tar.gz --strip-components=1 && \
                            rm dist.tar.gz
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            // Dọn dẹp file nén tại máy Jenkins sau khi deploy
            sh 'rm -f dist.tar.gz'
        }
        success {
            echo 'Deploy Frontend thành công!'
        }
        failure {
            echo 'Deploy Frontend thất bại, vui lòng kiểm tra log.'
        }
    }
}
