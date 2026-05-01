pipeline {
    agent any

    environment {
        SSH_CREDENTIAL_ID = 'ssh-server-key'
        REMOTE_USER = 'cdt'
        REMOTE_HOST = '192.168.0.105'
        TARGET_DIR  = '/var/www/frontend'
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
                sh 'tar -czf dist.tar.gz dist/'
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent([env.SSH_CREDENTIAL_ID]) {

                    // Tạo thư mục + cấp quyền
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} '
                            sudo mkdir -p ${env.TARGET_DIR} &&
                            sudo chown -R ${env.REMOTE_USER}:${env.REMOTE_USER} ${env.TARGET_DIR}
                        '
                    """

                    // Copy file
                    sh """
                        scp -o StrictHostKeyChecking=no dist.tar.gz \
                        ${env.REMOTE_USER}@${env.REMOTE_HOST}:${env.TARGET_DIR}/
                    """

                    // Deploy
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_USER}@${env.REMOTE_HOST} '
                            cd ${env.TARGET_DIR} &&
                            tar -xzf dist.tar.gz --strip-components=1 &&
                            rm dist.tar.gz &&
                            sudo systemctl reload nginx
                        '
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
            echo 'Deploy Frontend thất bại!'
        }
    }
}