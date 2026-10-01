// Tóm tắt: Pipeline Jenkins hiện tại — build image yamiannephilim/portfolio:latest, push Docker Hub rồi chạy lại
// container "portfolio" trên network "yan" của chính server Jenkins, báo Telegram từng bước.
// Sẽ NGỪNG dùng (tắt job rồi xóa file này) sau khi cutover sang GitHub Actions (.github/workflows/deploy.yml)
// theo các bước trong docs/DEPLOY.md. Trước cutover đây vẫn là đường deploy production duy nhất.
pipeline {
    agent any

    environment {
        // Cấu hình Telegram credential dùng để gửi trạng thái pipeline.
        TOKEN = credentials('telegram_token')
        CHAT_ID = credentials('telegram_chatid')

        // Nội dung thông báo build lấy từ commit hiện tại.
        GIT_MESSAGE = sh(returnStdout: true, script: "git log -n 1 --format=%s ${GIT_COMMIT}").trim()
        GIT_AUTHOR = sh(returnStdout: true, script: "git log -n 1 --format=%ae ${GIT_COMMIT}").trim()
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short ${GIT_COMMIT}").trim()
        GIT_INFO = "Branch: ${GIT_BRANCH}\nLast Message: ${GIT_MESSAGE}\nAuthor: ${GIT_AUTHOR}\nCommit: ${GIT_COMMIT_SHORT}"
        TEXT_BREAK = '----------------------------------------'
        TEXT_PRE = "${TEXT_BREAK}\n${GIT_INFO}"
        TEXT_BUILD = "${JOB_NAME} is Building"
        TEXT_PUSH = "${JOB_NAME} is Pushing"
        TEXT_CLEAN = "${JOB_NAME} is Cleaning"
        TEXT_RUN = "${JOB_NAME} is Running"

        // Thông báo kết quả cuối pipeline.
        TEXT_SUCCESS_BUILD = "${JOB_NAME} is Success"
        TEXT_FAILURE_BUILD = "${JOB_NAME} is Failure"
    }

    // Gửi Telegram: chuỗi Groovy nháy ĐƠN => Groovy không nội suy; shell tự đọc TOKEN/CHAT_ID/TEXT_*
    // từ biến môi trường (khối environment ở trên). Commit message có dấu nháy hay $(...) vẫn an toàn,
    // và token không bị chèn vào chuỗi lệnh (Jenkins không cảnh báo lộ secret).
    stages {
        stage('Build') {
            steps {
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_PRE}" --data-urlencode "chat_id=${CHAT_ID}"'
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_BUILD}" --data-urlencode "chat_id=${CHAT_ID}"'
                sh 'docker build -t yamiannephilim/portfolio:latest .'
            }
        }

        stage('Push') {
            steps {
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_PUSH}" --data-urlencode "chat_id=${CHAT_ID}"'

                withDockerRegistry(credentialsId: 'docker_hub', url: 'https://index.docker.io/v1/') {
                    sh 'docker push yamiannephilim/portfolio'
                }
            }
        }

        stage('Clean') {
            steps {
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_CLEAN}" --data-urlencode "chat_id=${CHAT_ID}"'

                script {
                    // Filter "name=" của Docker khớp CHUỖI CON (vd. "portfolio-old" cũng khớp), nhiều ID xuống dòng
                    // sẽ làm hỏng lệnh kế tiếp => neo ^...$ để chỉ khớp đúng container "portfolio".
                    def containerId = sh(returnStdout: true, script: 'docker ps -aq --filter "name=^portfolio$"').trim()
                    if (containerId) {
                        echo "Removing container portfolio (${containerId})"
                        // rm -f = stop + rm, không lỗi nếu container vừa biến mất.
                        sh 'docker rm -f portfolio || true'
                    }
                }
            }
        }

        stage('Run') {
            steps {
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_RUN}" --data-urlencode "chat_id=${CHAT_ID}"'
                sh 'docker network create yan || echo "this network exist"'
                // KHÔNG dùng "docker container prune": lệnh đó xóa MỌI container đang dừng trên server, không chỉ portfolio.
                // Chỉ xóa đúng container "portfolio" (phòng trường hợp nó được tạo lại sau stage Clean).
                sh 'docker rm -f portfolio || true'
                sh 'docker run --name portfolio --network yan --restart=unless-stopped -d yamiannephilim/portfolio:latest'
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            script {
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_SUCCESS_BUILD}" --data-urlencode "chat_id=${CHAT_ID}"'
            }
        }

        failure {
            script {
                sh 'curl -sS -o /dev/null --request POST "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "text=${TEXT_FAILURE_BUILD}" --data-urlencode "chat_id=${CHAT_ID}"'
            }
        }
    }
}
