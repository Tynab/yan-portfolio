#!/usr/bin/env bash
# Tóm tắt: Cài (hoặc kiểm tra lại) GitHub Actions self-hosted runner trên server deploy, chạy dưới dạng
# service systemd bằng user hệ thống "gha-runner". Thường được bootstrap-runner.sh copy lên và chạy bằng sudo;
# cũng có thể chạy tay:  sudo bash install-runner.sh --repo Tynab/yan-portfolio --labels portfolio
# rồi dán registration token khi được hỏi (Settings > Actions > Runners > New self-hosted runner).
#
# Token đọc từ stdin, không bao giờ từ tham số/biến môi trường của người gọi:
#   - dòng có tiền tố "RUNNER_TOKEN=" (bootstrap gửi dòng mật khẩu sudo trước, sudo đã đọc dòng đó;
#     nếu sudo không cần mật khẩu thì dòng đó bị bỏ qua, không in ra), hoặc
#   - đúng một dòng chỉ chứa token (chạy tay), hoặc nhập ẩn nếu stdin là terminal.
# Idempotent: runner đã cấu hình thì chỉ đảm bảo service đang chạy (không cần token).
#
# Biến môi trường tùy chọn: RUNNER_DIR (/opt/actions-runner), RUNNER_USER (gha-runner),
#   RUNNER_VERSION (vd. 2.337.0 — chỉ dùng khi không hỏi được GitHub API bản mới nhất).

set -euo pipefail
set +x
umask 022

GH_REPO="Tynab/yan-portfolio"
RUNNER_LABELS="portfolio"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
RUNNER_USER="${RUNNER_USER:-gha-runner}"
RUNNER_VERSION="${RUNNER_VERSION:-}"

log() { printf '[install-runner] %s\n' "$*" >&2; }
die() {
  printf '[install-runner] LỖI: %s\n' "$*" >&2
  exit 1
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --repo)
      GH_REPO="${2:-}"
      shift
      ;;
    --labels)
      RUNNER_LABELS="${2:-}"
      shift
      ;;
    *) die "Tham số không hợp lệ: $1" ;;
  esac
  shift
done

[ "$(id -u)" -eq 0 ] || die "Phải chạy bằng root (sudo bash $0 ...)."
[[ "${GH_REPO}" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || die "--repo phải có dạng owner/repo."
[[ "${RUNNER_LABELS}" =~ ^[A-Za-z0-9_.-]+(,[A-Za-z0-9_.-]+)*$ ]] || die "--labels không hợp lệ."
[[ "${RUNNER_USER}" =~ ^[a-z_][a-z0-9_-]*$ ]] || die "RUNNER_USER không hợp lệ."
case "${RUNNER_DIR}" in
  /*) ;;
  *) die "RUNNER_DIR phải là đường dẫn tuyệt đối." ;;
esac

# ---------- Đọc token từ stdin ----------
token=""
if [ -t 0 ]; then
  if [ ! -f "${RUNNER_DIR}/.runner" ]; then
    read -r -s -p "Runner registration token (nhập ẩn): " token
    echo >&2
  fi
else
  first_line=""
  line_count=0
  while [ "${line_count}" -lt 2 ]; do
    line=""
    IFS= read -r line || [ -n "${line}" ] || break
    line="${line%$'\r'}"
    line_count=$((line_count + 1))
    case "${line}" in
      RUNNER_TOKEN=*)
        token="${line#RUNNER_TOKEN=}"
        break
        ;;
      *) [ "${line_count}" -eq 1 ] && first_line="${line}" ;;
    esac
  done
  # Đúng một dòng không tiền tố => token (chạy tay). Hai dòng không tiền tố => không đoán, bỏ qua.
  if [ -z "${token}" ] && [ "${line_count}" -eq 1 ]; then
    token="${first_line}"
  fi
  # first_line có thể là mật khẩu sudo (khi sudo không đọc nó) => xóa ngay, không bao giờ in.
  first_line=""
  line=""
fi
if [ -n "${token}" ] && ! [[ "${token}" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  die "Token có ký tự không hợp lệ (có thể dòng đầu là mật khẩu sudo bị lệch thứ tự?)."
fi

# ---------- Kiến trúc ----------
case "$(uname -m)" in
  x86_64 | amd64) arch="x64" ;;
  aarch64 | arm64) arch="arm64" ;;
  *) die "Kiến trúc $(uname -m) chưa hỗ trợ (chỉ x64/arm64)." ;;
esac

command -v curl >/dev/null 2>&1 || die "Thiếu curl."
command -v systemctl >/dev/null 2>&1 || die "Thiếu systemd (svc.sh cần systemctl)."

# ---------- User hệ thống + group docker ----------
if ! id -u "${RUNNER_USER}" >/dev/null 2>&1; then
  log "Tạo user hệ thống ${RUNNER_USER}..."
  useradd --system --create-home --home-dir "/home/${RUNNER_USER}" --shell /bin/bash "${RUNNER_USER}"
fi
getent group docker >/dev/null 2>&1 || die "Chưa có group docker — cài Docker Engine trước."
# CẢNH BÁO: group docker tương đương quyền root trên máy này (điều khiển được Docker daemon => mount /
# vào container). Chấp nhận được vì runner CHỈ chạy workflow Deploy từ branch main của repo (xem
# .github/workflows/deploy.yml); không được dùng runner này cho workflow pull_request.
group_added=0
if ! id -nG "${RUNNER_USER}" | tr ' ' '\n' | grep -qx docker; then
  usermod -aG docker "${RUNNER_USER}"
  group_added=1
fi
runner_group="$(id -gn "${RUNNER_USER}")"

install -d -o "${RUNNER_USER}" -g "${runner_group}" -m 750 "${RUNNER_DIR}"
cd "${RUNNER_DIR}"

ensure_service() {
  if [ ! -f .service ]; then
    log "Cài service systemd (chạy bằng ${RUNNER_USER})..."
    ./svc.sh install "${RUNNER_USER}" </dev/null
  fi
  local unit
  unit="$(cat .service)"
  if [ "${group_added}" -eq 1 ] && systemctl is-active --quiet "${unit}"; then
    # Service đang chạy từ trước khi user vào group docker => restart để tiến trình nhận group mới.
    log "Restart service để nhận group docker..."
    systemctl restart "${unit}"
  else
    log "Đảm bảo service đang chạy..."
    systemctl start "${unit}"
  fi
  systemctl is-active --quiet "${unit}" || die "Service ${unit} không chạy — xem: journalctl -u ${unit}"
  log "Service ${unit}: active."
}

# ---------- Đã cấu hình: chỉ đảm bảo service chạy ----------
if [ -f .runner ]; then
  if ! grep -qF "github.com/${GH_REPO}\"" .runner; then
    die "${RUNNER_DIR} đã cấu hình cho repo khác (xem ${RUNNER_DIR}/.runner). Gỡ runner cũ trước."
  fi
  log "Runner đã cấu hình cho ${GH_REPO} — chỉ kiểm tra service."
  ensure_service
  exit 0
fi

[ -n "${token}" ] || die "Chưa có registration token."

# ---------- Chọn phiên bản runner ----------
api="https://api.github.com/repos/actions/runner/releases"
release_json="$(curl -fsSL --max-time 30 -H "Accept: application/vnd.github+json" "${api}/latest" 2>/dev/null || true)"
version="$(printf '%s' "${release_json}" | grep -o '"tag_name": *"v[^"]*"' | head -n 1 | sed -E 's/.*"v([^"]+)"$/\1/' || true)"
if [ -z "${version}" ]; then
  [ -n "${RUNNER_VERSION}" ] || die "Không hỏi được bản runner mới nhất từ GitHub API; đặt RUNNER_VERSION (vd. 2.337.0) rồi chạy lại."
  version="${RUNNER_VERSION#v}"
  log "GitHub API không trả bản mới nhất — dùng RUNNER_VERSION=${version}."
  release_json="$(curl -fsSL --max-time 30 -H "Accept: application/vnd.github+json" "${api}/tags/v${version}" 2>/dev/null || true)"
fi
[[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "Phiên bản runner không hợp lệ: ${version}"
package="actions-runner-linux-${arch}-${version}.tar.gz"
log "Runner ${version} (linux-${arch})."

# ---------- Tải + kiểm tra checksum ----------
# Release note của actions/runner ghi SHA-256 từng gói dạng
#   <!-- BEGIN SHA linux-x64 -->HASH<!-- END SHA linux-x64 -->
# Có thì bắt buộc khớp; không có (release không ghi / không gọi được API) thì chỉ cảnh báo — gói vẫn tải
# qua HTTPS trực tiếp từ github.com nên vẫn được TLS bảo vệ, checksum là lớp phòng thủ thêm.
expected_sha="$(printf '%s' "${release_json}" |
  sed -e 's/\\u003c/</g' -e 's/\\u003e/>/g' |
  grep -o "BEGIN SHA linux-${arch} -->[0-9a-f]\{64\}" | head -n 1 | grep -o '[0-9a-f]\{64\}$' || true)"

workdir="$(mktemp -d)"
trap 'rm -rf "${workdir}"' EXIT
log "Tải ${package}..."
curl -fsSL --max-time 600 -o "${workdir}/${package}" \
  "https://github.com/actions/runner/releases/download/v${version}/${package}"
if [ -n "${expected_sha}" ]; then
  echo "${expected_sha}  ${workdir}/${package}" | sha256sum -c --status - || die "SHA-256 của ${package} KHÔNG khớp release note — dừng."
  log "SHA-256 khớp release note."
else
  log "CẢNH BÁO: không tìm thấy SHA-256 trong release note — bỏ qua bước kiểm tra checksum."
fi

tar -xzf "${workdir}/${package}" -C "${RUNNER_DIR}"
chown -R "${RUNNER_USER}:${runner_group}" "${RUNNER_DIR}"

log "Cài thư viện hệ thống runner cần (ICU, OpenSSL...)..."
./bin/installdependencies.sh </dev/null || log "CẢNH BÁO: installdependencies.sh lỗi — nếu config.sh báo thiếu thư viện thì cài tay."

# ---------- Đăng ký runner ----------
runner_name="portfolio-$(hostname -s 2>/dev/null || hostname)"
log "Đăng ký runner ${runner_name} (labels: ${RUNNER_LABELS}) cho https://github.com/${GH_REPO}..."
# Token đưa qua biến ACTIONS_RUNNER_INPUT_TOKEN (runner tự đọc, che trong log và xóa khỏi env) thay vì
# "--token <token>" để không lộ trên dòng lệnh (ps) của server.
ACTIONS_RUNNER_INPUT_TOKEN="${token}" sudo -u "${RUNNER_USER}" -H \
  --preserve-env=ACTIONS_RUNNER_INPUT_TOKEN \
  ./config.sh --unattended \
  --url "https://github.com/${GH_REPO}" \
  --name "${runner_name}" \
  --labels "${RUNNER_LABELS}" \
  --work _work \
  --replace </dev/null
token=""

ensure_service
log "Hoàn tất. Runner sẽ hiện Idle trong Settings > Actions > Runners của ${GH_REPO}."
