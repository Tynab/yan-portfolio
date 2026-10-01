#!/usr/bin/env bash
# Tóm tắt: Chạy MỘT LẦN trên máy của chủ repo (cùng LAN với server 192.168.100.6) để cài GitHub Actions
# self-hosted runner lên server mà không phải gõ mật khẩu: đọc mật khẩu SSH/sudo từ AWS Secrets Manager
# (AWS CLI profile "yami"), xin registration token của repo bằng GH_PAT, copy install-runner.sh lên server
# rồi chạy nó bằng sudo. Mật khẩu sudo và token chỉ đi qua stdin của SSH — không nằm trên dòng lệnh,
# biến môi trường phía server hay log.
#
# Cần: bash 4+, aws (AWS CLI v2), sshpass, ssh/scp (OpenSSH >= 7.6), jq, curl.
#
# Dùng:
#   SSH_SECRET_ID=<tên-hoặc-ARN-secret> ./scripts/server/bootstrap-runner.sh --dry-run   # xem kế hoạch
#   SSH_SECRET_ID=<tên-hoặc-ARN-secret> ./scripts/server/bootstrap-runner.sh             # chạy thật
# GH_PAT không đặt sẵn thì script hỏi ẩn (khuyên dùng — tránh lưu token vào shell history).
#
# Biến môi trường (mặc định trong ngoặc):
#   SERVER_HOST (192.168.100.6)   SERVER_PORT (22)
#   AWS_PROFILE_NAME (yami)       AWS_REGION (theo profile)
#   SSH_SECRET_ID (bắt buộc)      SUDO_SECRET_ID (= SSH_SECRET_ID)
#   SSH_USER_KEY (username)       SSH_PASS_KEY (password)        SUDO_PASS_KEY (password)
#   SSH_USER (bắt buộc nếu secret là chuỗi thuần, hoặc JSON không có key SSH_USER_KEY)
#   GH_REPO (Tynab/yan-portfolio) RUNNER_LABELS (portfolio)
#   GH_PAT (bắt buộc) — fine-grained PAT chỉ cho repo GH_REPO, quyền "Administration: Read and write",
#                       chỉ dùng để xin runner registration token; xóa/rotate ngay sau khi bootstrap.

set -euo pipefail
set +x
umask 077

SERVER_HOST="${SERVER_HOST:-192.168.100.6}"
SERVER_PORT="${SERVER_PORT:-22}"
AWS_PROFILE_NAME="${AWS_PROFILE_NAME:-yami}"
AWS_REGION="${AWS_REGION:-}"
SSH_SECRET_ID="${SSH_SECRET_ID:-}"
SUDO_SECRET_ID="${SUDO_SECRET_ID:-${SSH_SECRET_ID}}"
SSH_USER_KEY="${SSH_USER_KEY:-username}"
SSH_PASS_KEY="${SSH_PASS_KEY:-password}"
SUDO_PASS_KEY="${SUDO_PASS_KEY:-password}"
SSH_USER="${SSH_USER:-}"
GH_REPO="${GH_REPO:-Tynab/yan-portfolio}"
RUNNER_LABELS="${RUNNER_LABELS:-portfolio}"
GH_PAT="${GH_PAT:-}"

DRY_RUN=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALLER="${SCRIPT_DIR}/install-runner.sh"

# Biến chứa bí mật — luôn được xóa khi script kết thúc (kể cả lỗi/Ctrl+C).
ssh_secret=""
sudo_secret=""
ssh_pass=""
sudo_pass=""
reg_token=""
remote_dir=""

log() { printf '[bootstrap] %s\n' "$*" >&2; }
die() {
  printf '[bootstrap] LỖI: %s\n' "$*" >&2
  exit 1
}

usage() {
  sed -n '2,/^$/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    -h | --help)
      usage
      exit 0
      ;;
    *) die "Tham số không hợp lệ: $1 (dùng --dry-run hoặc --help)" ;;
  esac
  shift
done

# Các giá trị không bí mật nhưng sẽ ghép vào lệnh chạy ở server => chỉ cho phép ký tự an toàn.
[[ "${GH_REPO}" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || die "GH_REPO phải có dạng owner/repo."
[[ "${RUNNER_LABELS}" =~ ^[A-Za-z0-9_.-]+(,[A-Za-z0-9_.-]+)*$ ]] || die "RUNNER_LABELS chỉ gồm chữ, số, '_', '.', '-', phân cách bằng dấu phẩy."
[[ "${SERVER_HOST}" =~ ^[A-Za-z0-9_.:-]+$ ]] || die "SERVER_HOST không hợp lệ."
[[ "${SERVER_PORT}" =~ ^[0-9]+$ ]] || die "SERVER_PORT phải là số."
[ -f "${INSTALLER}" ] || die "Không thấy ${INSTALLER}."

ssh_opts=(
  -o "Port=${SERVER_PORT}"
  -o StrictHostKeyChecking=accept-new
  -o ConnectTimeout=15
  -o "PreferredAuthentications=password,keyboard-interactive"
  -o PubkeyAuthentication=no
  -o NumberOfPasswordPrompts=1
)

if [ "${DRY_RUN}" -eq 1 ]; then
  cat <<EOF
[dry-run] Không gọi AWS, GitHub hay server. Kế hoạch:
  1. Đọc secret SSH  : aws --profile ${AWS_PROFILE_NAME}${AWS_REGION:+ --region ${AWS_REGION}} secretsmanager get-secret-value --secret-id ${SSH_SECRET_ID:-<SSH_SECRET_ID chưa đặt — BẮT BUỘC>} --query SecretString --output text
     -> user = JSON[.${SSH_USER_KEY}] hoặc SSH_USER (${SSH_USER:-chưa đặt}), mật khẩu = JSON[.${SSH_PASS_KEY}] hoặc cả chuỗi
  2. Đọc secret sudo : ${SUDO_SECRET_ID:-<SUDO_SECRET_ID>} (trùng secret SSH thì dùng lại), mật khẩu = JSON[.${SUDO_PASS_KEY}] hoặc cả chuỗi
  3. Xin token       : POST https://api.github.com/repos/${GH_REPO}/actions/runners/registration-token
     (GH_PAT: $([ -n "${GH_PAT}" ] && echo "đã đặt" || echo "chưa đặt — sẽ hỏi ẩn khi chạy thật"))
  4. Tạo thư mục tạm : ssh ${SERVER_HOST} 'mktemp -d /tmp/gha-bootstrap.XXXXXXXX'   (sshpass -e, StrictHostKeyChecking=accept-new)
  4b. Kiểm tra sudo: ssh ${SERVER_HOST} "sudo -S -k -p '' -v"   (stdin chỉ có mật khẩu sudo)
  5. Copy installer  : scp ${INSTALLER} -> <thư mục tạm>/install-runner.sh
  6. Chạy            : ssh ${SERVER_HOST} "sudo -S -k -p '' bash <thư mục tạm>/install-runner.sh --repo ${GH_REPO} --labels ${RUNNER_LABELS}"
     stdin dòng 1 = mật khẩu sudo, dòng 2 = RUNNER_TOKEN=<token>  (không lộ trên dòng lệnh / env)
  7. Dọn             : ssh ${SERVER_HOST} 'rm -rf <thư mục tạm>'; xóa mọi biến bí mật ở máy local
EOF
  exit 0
fi

for cmd in aws sshpass ssh scp jq curl; do
  command -v "${cmd}" >/dev/null 2>&1 || die "Thiếu lệnh '${cmd}'. Cài nó rồi chạy lại."
done
[ -n "${SSH_SECRET_ID}" ] || die "Chưa đặt SSH_SECRET_ID (tên hoặc ARN secret chứa mật khẩu SSH)."

# Chạy lệnh trên server; mật khẩu SSH đi qua biến SSHPASS của riêng tiến trình sshpass (-e), không qua -p.
remote() {
  SSHPASS="${ssh_pass}" sshpass -e ssh -T "${ssh_opts[@]}" "${SSH_USER}@${SERVER_HOST}" "$@"
}

cleanup() {
  local code=$?
  set +e
  if [ -n "${remote_dir}" ] && [ -n "${ssh_pass}" ]; then
    remote "rm -rf -- '${remote_dir}'" </dev/null >/dev/null 2>&1 &&
      log "Đã xóa ${remote_dir} trên server."
  fi
  unset ssh_secret sudo_secret ssh_pass sudo_pass reg_token GH_PAT SSHPASS
  exit "${code}"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

# Đọc SecretString; giá trị chỉ nằm trong biến, không in ra.
read_secret() {
  local args=(--profile "${AWS_PROFILE_NAME}")
  if [ -n "${AWS_REGION}" ]; then
    args+=(--region "${AWS_REGION}")
  fi
  aws "${args[@]}" secretsmanager get-secret-value --secret-id "$1" --query SecretString --output text
}

# Lấy field $2 nếu secret $1 là JSON object; secret là chuỗi thuần thì in nguyên chuỗi.
# Secret đi vào jq qua stdin (printf là builtin) => không xuất hiện trong danh sách tiến trình.
secret_field() {
  if printf '%s' "$1" | jq -e 'type == "object"' >/dev/null 2>&1; then
    printf '%s' "$1" | jq -r --arg k "$2" '.[$k] // empty'
  else
    printf '%s' "$1"
  fi
}

# Hỏi PAT trước khi đụng tới AWS/server để lỗi thiếu PAT dừng sớm.
if [ -z "${GH_PAT}" ]; then
  [ -t 0 ] || die "Chưa đặt GH_PAT (và stdin không phải terminal để hỏi)."
  read -r -s -p "GH_PAT (fine-grained, Administration: Read and write — nhập ẩn): " GH_PAT
  echo >&2
  [ -n "${GH_PAT}" ] || die "GH_PAT rỗng."
fi
# PAT của GitHub chỉ gồm chữ, số, '_' (ghp_..., github_pat_...) — chặn ký tự lạ lọt vào config curl.
[[ "${GH_PAT}" =~ ^[A-Za-z0-9_]+$ ]] || die "GH_PAT có ký tự không hợp lệ (dán thừa khoảng trắng/dấu nháy?)."

log "Đọc secret SSH từ AWS Secrets Manager (profile ${AWS_PROFILE_NAME})..."
ssh_secret="$(read_secret "${SSH_SECRET_ID}")" || die "Không đọc được secret SSH_SECRET_ID."
ssh_pass="$(secret_field "${ssh_secret}" "${SSH_PASS_KEY}")"
if [ -z "${SSH_USER}" ] && printf '%s' "${ssh_secret}" | jq -e 'type == "object"' >/dev/null 2>&1; then
  SSH_USER="$(printf '%s' "${ssh_secret}" | jq -r --arg k "${SSH_USER_KEY}" '.[$k] // empty')"
fi
[ -n "${SSH_USER}" ] || die "Không xác định được user SSH: đặt SSH_USER, hoặc thêm key '${SSH_USER_KEY}' vào secret JSON."
[[ "${SSH_USER}" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]] || die "SSH_USER không hợp lệ."
[ -n "${ssh_pass}" ] || die "Secret SSH không có mật khẩu (key '${SSH_PASS_KEY}')."

if [ "${SUDO_SECRET_ID}" = "${SSH_SECRET_ID}" ]; then
  sudo_secret="${ssh_secret}"
else
  log "Đọc secret sudo..."
  sudo_secret="$(read_secret "${SUDO_SECRET_ID}")" || die "Không đọc được secret SUDO_SECRET_ID."
fi
sudo_pass="$(secret_field "${sudo_secret}" "${SUDO_PASS_KEY}")"
[ -n "${sudo_pass}" ] || die "Secret sudo không có mật khẩu (key '${SUDO_PASS_KEY}')."
# Mật khẩu sudo được gửi thành MỘT dòng stdin => không được chứa xuống dòng.
case "${sudo_pass}" in
  *$'\n'*) die "Mật khẩu sudo chứa ký tự xuống dòng — không hỗ trợ." ;;
esac
ssh_secret=""
sudo_secret=""

log "Xin runner registration token cho ${GH_REPO}..."
# Header Authorization đưa qua config đọc từ stdin (-K -) để PAT không nằm trên dòng lệnh curl.
reg_token="$(
  printf 'header = "Authorization: Bearer %s"\n' "${GH_PAT}" |
    curl -fsS --max-time 30 -K - -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/${GH_REPO}/actions/runners/registration-token" |
    jq -r '.token // empty'
)" || die "GitHub từ chối cấp token (PAT sai/hết hạn, thiếu quyền Administration: Read and write, hoặc sai GH_REPO)."
[ -n "${reg_token}" ] || die "GitHub không trả token."
GH_PAT=""
log "Đã có registration token (hết hạn sau 1 giờ)."

log "Kết nối ${SSH_USER}@${SERVER_HOST}:${SERVER_PORT} và tạo thư mục tạm..."
remote_dir="$(remote 'umask 077; mktemp -d /tmp/gha-bootstrap.XXXXXXXX' </dev/null)" || {
  rc=$?
  remote_dir=""
  case "${rc}" in
    5) die "SSH: sai mật khẩu (sshpass exit 5)." ;;
    6) die "SSH: host key chưa biết (sshpass exit 6)." ;;
    *) die "SSH tới ${SERVER_HOST} thất bại (exit ${rc}). Máy này có cùng LAN với server không?" ;;
  esac
}
[[ "${remote_dir}" =~ ^/tmp/gha-bootstrap\.[A-Za-z0-9]+$ ]] || {
  remote_dir=""
  die "Server trả đường dẫn tạm không hợp lệ."
}

# Kiểm tra mật khẩu sudo bằng một lệnh riêng, stdin CHỈ có dòng mật khẩu: sai mật khẩu thì sudo gặp EOF ở
# lần hỏi thứ hai và thoát ngay — không bao giờ lấy dòng RUNNER_TOKEN làm mật khẩu thử lại.
# User NOPASSWD vẫn qua được (-v không hỏi mật khẩu).
log "Kiểm tra quyền sudo trên server..."
if ! printf '%s\n' "${sudo_pass}" | remote "sudo -S -k -p '' -v" 2>/dev/null; then
  die "Sai mật khẩu sudo (SUDO_SECRET_ID/SUDO_PASS_KEY) hoặc user ${SSH_USER} không có quyền sudo trên ${SERVER_HOST}."
fi

log "Copy install-runner.sh lên ${remote_dir}..."
SSHPASS="${ssh_pass}" sshpass -e scp -q "${ssh_opts[@]}" "${INSTALLER}" \
  "${SSH_USER}@${SERVER_HOST}:${remote_dir}/install-runner.sh" </dev/null ||
  die "scp thất bại."

log "Chạy install-runner.sh bằng sudo trên server (có thể mất vài phút)..."
# sudo -S đọc dòng 1 làm mật khẩu (-k: luôn hỏi, bỏ qua credential cache; -p '': không in prompt);
# phần còn lại của stdin là của install-runner.sh. Dòng token có tiền tố RUNNER_TOKEN= nên installer
# vẫn nhận đúng token kể cả khi sudo không đọc dòng mật khẩu (NOPASSWD).
remote_cmd="sudo -S -k -p '' bash '${remote_dir}/install-runner.sh' --repo '${GH_REPO}' --labels '${RUNNER_LABELS}'"
if ! printf '%s\nRUNNER_TOKEN=%s\n' "${sudo_pass}" "${reg_token}" | remote "${remote_cmd}"; then
  die "install-runner.sh thất bại trên server (xem log phía trên)."
fi

log "Xong. Kiểm tra runner 'Idle/Online' tại: https://github.com/${GH_REPO}/settings/actions/runners"
log "Nhớ xóa hoặc rotate GH_PAT vừa dùng (GitHub > Settings > Developer settings > Fine-grained tokens)."
