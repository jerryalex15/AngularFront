pipeline {
    agent none

    environment {
        APP_NAME      = 'frontend-ang'
        SONAR_PROJECT = 'jerryalex15_AngularFront'
        SONAR_ORG     = 'jerryalex15'
        DOCKER_IMAGE  = "nandraina/${APP_NAME}"
    }

    stages {

        stage('Checkout') {
            agent { label 'local-machine-agent' }
            steps {
                git branch: 'develop',
                    credentialsId: 'github-credential-ci',
                    url: 'https://github.com/jerryalex15/AngularFront.git'
            }
        }

        stage('Install') {
            agent { label 'local-machine-agent' }
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            agent { label 'local-machine-agent' }
            steps {
                sh '''
                    npm run test -- \
                        --watch=false \
                        --browsers=ChromeHeadlessNoSandbox \
                        --code-coverage
                '''
            }
            post {
                always {
                    junit testResults: 'test-results/test-results.xml',
                          allowEmptyResults: true                        
                }
            }
        }

        stage('SonarCloud') {
            agent { label 'local-machine-agent' }
            tools {
                'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
            }
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                        /Users/razafindraibenandrainajerryalex/jenkins-agent/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT} \
                            -Dsonar.organization=${SONAR_ORG} \
                            -Dsonar.host.url=https://sonarcloud.io \
                            -Dsonar.branch.name=develop \
                            -Dsonar.sources=src \
                            -Dsonar.exclusions=**/node_modules/**,**/*.spec.ts \
                            -Dsonar.tests=src \
                            -Dsonar.test.inclusions=**/*.spec.ts \
                            -Dsonar.javascript.lcov.reportPaths=coverage/${APP_NAME}/lcov.info \
                            -Dsonar.junit.reportPaths=test-results/test-results.xml
                    '''
                }
            }
        }

        stage('Quality Gate') {
            agent { label 'local-machine-agent' }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build & Push') {
            agent { label 'local-machine-agent' }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Jenkins-ci-docker-hub-credential',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker buildx build \
                            --platform linux/amd64 \
                            -t $DOCKER_IMAGE:$BUILD_NUMBER \
                            -t $DOCKER_IMAGE:latest \
                            --push .
                        docker logout
                    '''
                }
            }
        }
        stage('Deploy to Oracle VM') {
            agent { label 'local-machine-agent' }
            steps {
                withCredentials([
                    string(credentialsId: 'oracle-vm-ip', variable: 'VM_IP'),
                    sshUserPrivateKey(
                        credentialsId: 'oracle-vm-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    ),
                    usernamePassword(
                        credentialsId: 'Jenkins-ci-docker-hub-credential',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        # Copier la clé dans un fichier temporaire avec les bons droits
                        TEMP_KEY=$(mktemp)
                        cp "$SSH_KEY" "$TEMP_KEY"
                        chmod 600 "$TEMP_KEY"
        
                        ssh -i "$TEMP_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o BatchMode=yes \
                            -o ConnectTimeout=30 \
                            "$SSH_USER@$VM_IP" \
                            "echo '$DOCKER_PASS' | docker login -u '$DOCKER_USER' --password-stdin && \
                                docker pull $DOCKER_IMAGE:$BUILD_NUMBER && \
                                docker stop angular-front || true && \
                                docker rm angular-front || true && \
                                docker run -d \
                                    --name angular-front \
                                    --restart always \
                                    -p 80:80 \
                                    $DOCKER_IMAGE:$BUILD_NUMBER && \
                                docker logout"
        
                        rm -f "$TEMP_KEY"
                    '''
                }
            }
        }
        stage('Cleanup Old Docker Hub Tags') {
            agent { label 'local-machine-agent' }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Jenkins-ci-docker-hub-credential',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        OLD_BUILD=$((BUILD_NUMBER - 5))
                        if [ $OLD_BUILD -gt 0 ]; then
                            TOKEN=$(curl -s -X POST \
                                -H "Content-Type: application/json" \
                                -d "{\\"username\\": \\"$DOCKER_USER\\", \\"password\\": \\"$DOCKER_PASS\\"}" \
                                "https://hub.docker.com/v2/users/login" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
                            curl -s -X DELETE \
                                -H "Authorization: JWT $TOKEN" \
                                "https://hub.docker.com/v2/repositories/${DOCKER_IMAGE}/tags/${OLD_BUILD}/"
                            
                            echo "Tag ${OLD_BUILD} supprimé"
                        else
                            echo "Pas de tag à supprimer (build trop récent)"
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            node('local-machine-agent') {
                cleanWs()
            }
        }
    }
}