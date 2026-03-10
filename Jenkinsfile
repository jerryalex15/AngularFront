pipeline {
    agent none

    environment {
        APP_NAME      = 'frontend-ang'
        SONAR_PROJECT = 'jerryalex15_AngularFront'
        SONAR_ORG     = 'jerryalex15'
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

        stage('Build') {
            agent { label 'local-machine-agent' }
            steps {
                sh 'npm run build -- --configuration production'
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