# Deploy portfolio: từ Jenkins sang GitHub Actions

Tóm tắt: Kiến trúc CI/CD của `portfolio.yamiannephilim.com`, lý do dùng self-hosted runner, danh sách secret/variable, các bước cutover từ Jenkins, deploy Cloudflare Worker, rollback và ghi chú bảo mật.

> **Không bao giờ dán token/mật khẩu vào chat** (kể cả khi nhờ AI hỗ trợ), issue, PR hay commit. Token chỉ được nhập trực tiếp vào ô _Secret_ của GitHub, hoặc vào ô nhập ẩn/biến môi trường trên máy của bạn. Lỡ dán ở đâu thì coi như đã lộ: thu hồi và tạo token mới ngay.

## 1. Kiến trúc

### Hiện tại (Jenkins)

```text
push main ─► Jenkins (trên server 192.168.100.6)
               ├─ docker build -t yamiannephilim/portfolio:latest .   (Dockerfile tự chạy lint + test)
               ├─ docker push  ─► Docker Hub
               └─ docker rm -f portfolio && docker run --name portfolio --network yan ...
                                                     ▲
Internet ─► Cloudflare ─► (thành phần gắn vào network docker "yan") ─► container portfolio:80
```

### Mục tiêu (GitHub Actions)

```text
                          push main / Run workflow
                                    │
                                    ▼
                       GitHub ─ Tynab/yan-portfolio
     ┌──────────────────────────────┼──────────────────────────────────┐
     ▼                              ▼                                  ▼
 ci.yml (GitHub-hosted)     deploy.yml                          deploy-worker.yml (GitHub-hosted)
 lint, test, build,         ① build-push (GitHub-hosted)        test Worker → wrangler 4 deploy
 docker build (không push)     build image → Docker Hub          → smoke test 302
                               :latest + :sha-<7 ký tự>                   │
                                    │                                     ▼
                            ② deploy (self-hosted runner         Cloudflare Worker
                               trên 192.168.100.6)               "yan-failover-redirect"
                               docker pull :sha-xxxxxxx          yamiannephilim.com/* , www
                               chạy lại "yan-portfolio"          probe /healthz:
                               chờ HEALTHCHECK = healthy           server sống → 302 portfolio
                               lỗi → rollback image cũ             server chết → 302 GitHub
                                    │
                            ③ notify (GitHub-hosted) → Telegram

Internet ─► Cloudflare ─► Tunnel (container cloudflare-tunnel-yan, network "yan") ─► http://yan-portfolio:80 (/healthz)
```

- Runner trên server **chủ động** kết nối ra GitHub (HTTPS 443, long-poll) để nhận job — không có kết nối nào từ GitHub vào server.
- Image được deploy theo tag bất biến `sha-<7 ký tự commit>`; `latest` vẫn được push để tương thích Jenkins/thao tác tay.
- Container chạy với `--name yan-portfolio --network yan --restart unless-stopped`, **không** publish port. Tên `yan-portfolio` là bắt buộc: Cloudflare Tunnel (container `cloudflare-tunnel-yan`, cấu hình ingress quản lý trên dashboard Zero Trust) chuyển `portfolio.yamiannephilim.com` tới `http://yan-portfolio:80`. Muốn đổi tên container thì phải sửa ingress của tunnel cùng lúc.
- Lưu ý (kiểm tra trên server ngày 2026-10-02): container đang phục vụ site là `yan-portfolio` chạy image build tay `yan-portfolio:latest`; trên server không có Jenkins, nên container `portfolio` mà `Jenkinsfile` tạo **không** nhận traffic của tunnel.
- `nginx.conf` có `location = /healthz` (200 `ok`, `Cache-Control: no-store`, không ghi access log); `Dockerfile` khai báo `HEALTHCHECK` gọi endpoint này mỗi 30 giây. Cả job deploy lẫn Worker failover đều dựa vào nó.

## 2. Vì sao dùng self-hosted runner

- **Server nằm ở IP private** `192.168.100.6`: runner GitHub-hosted (ngoài Internet) không thể SSH hay gọi Docker trên server.
- **Không phải mở cổng vào**: không expose SSH/Docker API ra Internet, không cần VPN/Tunnel cho CI, không phải lưu SSH key hay mật khẩu server trong GitHub.
- **Mật khẩu SSH/sudo chỉ dùng một lần** để bootstrap runner (đọc từ AWS Secrets Manager trên máy của bạn). Sau đó GitHub chỉ nói chuyện với runner, không bao giờ cầm mật khẩu server.
- Phương án khác đã cân nhắc: SSH qua Cloudflare Tunnel/Tailscale (phải lưu SSH key trong GitHub, thêm hạ tầng), Watchtower tự kéo `latest` (không gắn với commit, không có health check/rollback/thông báo theo từng lần deploy).

## 3. Các workflow

| File                                  | Trigger                                                                   | Runner                                   | Việc làm                                                                                                                                                                      | Gate                                                               |
| ------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `.github/workflows/ci.yml`            | push `main`/`develop`, mọi pull request                                   | GitHub-hosted                            | `npm ci`, verify asset, lint, test, build; build thử Docker image (không push)                                                                                                | Không — luôn chạy, không có secret                                 |
| `.github/workflows/deploy.yml`        | push `main`, Run workflow (tùy chọn `image_tag`)                          | GitHub-hosted + **self-hosted** (deploy) | build & push Docker Hub → deploy lên server, chờ healthy, rollback nếu lỗi, dọn image cũ (giữ 3 bản) → Telegram                                                               | `vars.DEPLOY_ENABLED == 'true'` và ref là `refs/heads/main`        |
| `.github/workflows/deploy-worker.yml` | push `main` có đổi `cloudflare/**` hoặc chính file workflow, Run workflow | GitHub-hosted                            | `npx vitest run cloudflare` → `npx wrangler@4 deploy --config cloudflare/wrangler.toml` → xác nhận version qua API → smoke test `https://yamiannephilim.com` 302 + `no-store` | `vars.WORKER_DEPLOY_ENABLED == 'true'` và ref là `refs/heads/main` |

Khi biến gate chưa đặt, workflow hiện trạng thái _skipped_ — merge các file này trước khi có secret/runner là an toàn.

## 4. Secret và variable

Tạo tại **GitHub → repo `Tynab/yan-portfolio` → Settings → Secrets and variables → Actions**: tab **Secrets** → _New repository secret_; tab **Variables** → _New repository variable_. Dùng secret cấp **repository** (không phải environment) để cả job build lẫn job deploy đều đọc được.

| Tên                     | Loại     | Bắt buộc          | Dùng ở                                           | Tạo/lấy ở đâu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | -------- | ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEPLOY_ENABLED`        | Variable | Có (để bật)       | `deploy.yml`                                     | Đặt giá trị `true` khi runner + secret đã sẵn sàng. Đổi thành `false` (hoặc xóa) để tạm dừng deploy.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `DOCKERHUB_USERNAME`    | Secret   | Có                | `deploy.yml` (build-push, deploy)                | Tên tài khoản Docker Hub sở hữu repo `yamiannephilim/portfolio`.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `DOCKERHUB_TOKEN`       | Secret   | Có                | `deploy.yml` (build-push, deploy)                | Docker Hub → **Account settings → Personal access tokens → Generate new token**, quyền **Read & Write**, đặt ngày hết hạn. Không dùng mật khẩu tài khoản.                                                                                                                                                                                                                                                                                                                                                       |
| `TELEGRAM_TOKEN`        | Secret   | Không             | `deploy.yml` (notify)                            | Bot token từ @BotFather (giống credential `telegram_token` của Jenkins). Thiếu thì bỏ qua thông báo.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `TELEGRAM_CHAT_ID`      | Secret   | Không             | `deploy.yml` (notify)                            | Chat ID nhận thông báo (giống credential `telegram_chatid` của Jenkins).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `WORKER_DEPLOY_ENABLED` | Variable | Có (để bật)       | `deploy-worker.yml`                              | Đặt `true` khi đã có 2 secret Cloudflare và `cloudflare/wrangler.toml`.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `CLOUDFLARE_API_TOKEN`  | Secret   | Có (cho Worker)   | `deploy-worker.yml`                              | Cloudflare → **My Profile → API Tokens → Create Token** → template **"Edit Cloudflare Workers"**, hoặc **Create Custom Token** với quyền Account: _Workers Scripts_ Edit, _Account Settings_ Read, _Workers Tail_ Read (tuỳ chọn); Zone: _Workers Routes_ Edit; User: _User Details_ Read, _Memberships_ Read → _Account Resources_: Include đúng account của bạn; _Zone Resources_: Include → Specific zone → `yamiannephilim.com`; Client IP filtering để trống (runner GitHub không có IP cố định); đặt TTL. |
| `CLOUDFLARE_ACCOUNT_ID` | Secret   | Có (cho Worker)   | `deploy-worker.yml`                              | Cloudflare dashboard → chọn account → **Workers & Pages** (hoặc trang Overview của zone `yamiannephilim.com`) → ô **Account ID** ở cột phải → Copy.                                                                                                                                                                                                                                                                                                                                                             |
| `GH_PAT`                | —        | Chỉ lúc bootstrap | `scripts/server/bootstrap-runner.sh` (máy local) | **Không lưu vào GitHub.** GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate: _Repository access_ = Only select repositories → `Tynab/yan-portfolio`; _Repository permissions_ → **Administration: Read and write**; hết hạn 1–7 ngày. Xóa ngay sau bootstrap.                                                                                                                                                                                                                         |

Biến môi trường của `bootstrap-runner.sh` (chỉ trên máy bạn, không phải secret GitHub): `SSH_SECRET_ID` (bắt buộc — tên/ARN secret AWS chứa mật khẩu SSH), `SUDO_SECRET_ID` (mặc định = `SSH_SECRET_ID`), `SSH_USER_KEY`/`SSH_PASS_KEY`/`SUDO_PASS_KEY` (mặc định `username`/`password`/`password`), `SSH_USER` (bắt buộc nếu secret là chuỗi thuần), `SERVER_HOST` (`192.168.100.6`), `SERVER_PORT` (`22`), `AWS_PROFILE_NAME` (`yami`), `AWS_REGION`, `GH_REPO` (`Tynab/yan-portfolio`), `RUNNER_LABELS` (`portfolio`). Xem đầy đủ: `./scripts/server/bootstrap-runner.sh --help`.

## 5. Cutover từng bước (Jenkins → GitHub Actions)

0. **Merge** thay đổi này vào `main`. Workflow `CI` chạy; `Deploy`/`Deploy Worker` _skipped_ vì chưa đặt biến. Jenkins vẫn deploy như cũ (Jenkinsfile đã bỏ `docker container prune` và lọc đúng tên container).

0.5. **BẮT BUỘC trước khi cài runner** — Settings → Actions → General → _Approval for running fork pull request workflows from contributors_ → chọn **Require approval for all external contributors** (giao diện cũ: _Require approval for all outside collaborators_). Lý do: repo public, PR từ fork có thể **tự thêm một workflow mới** nhắm vào label `portfolio`; bấm "Approve and run" cho PR đó nghĩa là chạy code lạ trên `192.168.100.6`. **Không bao giờ approve** run của fork PR có thay đổi trong `.github/`. (Lớp chặn thứ hai: hook trên runner — xem mục 8.)

1. **Bootstrap runner** từ một máy **cùng LAN** với `192.168.100.6` (Linux/macOS, hoặc **WSL Ubuntu** trên Windows — Git Bash không có `sshpass`):

   ```bash
   # Công cụ cần có (Ubuntu/WSL): AWS CLI v2 đã cấu hình profile "yami", cộng:
   sudo apt-get install -y sshpass jq curl openssh-client
   aws sts get-caller-identity --profile yami        # kiểm tra profile
   aws secretsmanager list-secrets --profile yami --query 'SecretList[].Name'   # tìm tên secret

   # Xem kế hoạch (không gọi AWS/GitHub/server):
   SSH_SECRET_ID=<tên-secret-ssh> ./scripts/server/bootstrap-runner.sh --dry-run

   # Chạy thật — script hỏi GH_PAT ở ô nhập ẩn (đừng gõ token lên dòng lệnh, sẽ lưu vào history):
   SSH_SECRET_ID=<tên-secret-ssh> ./scripts/server/bootstrap-runner.sh
   # Mật khẩu sudo nằm ở secret khác:  SUDO_SECRET_ID=<tên-secret-sudo> ...
   # Secret là chuỗi thuần (chỉ mật khẩu): SSH_USER=<user> ...
   ```

   Secret AWS dạng JSON `{"username": "...", "password": "..."}` hoặc chuỗi thuần là mật khẩu. Secret dùng chung cho nhiều máy dạng `{"<user>@<host>": "<mật khẩu>", ...}` thì đặt `SSH_USER=<user>` và `SSH_PASS_KEY`/`SUDO_PASS_KEY` = `<user>@<host>`. Script đọc secret bằng `aws --profile yami secretsmanager get-secret-value`, xin _registration token_ của repo bằng `GH_PAT`, `scp` file `install-runner.sh` lên server (qua `sshpass -e`, `StrictHostKeyChecking=accept-new`), chạy nó bằng `sudo -S` — mật khẩu sudo và token chỉ đi qua stdin, rồi xóa bản copy trên server. Trên server, `install-runner.sh`:

   - tạo user hệ thống `gha-runner`, thêm vào group `docker`;
   - tải bản `actions/runner` mới nhất (kiểm tra SHA-256 theo release note nếu có) vào `/opt/actions-runner`;
   - đăng ký runner tên `portfolio-<hostname>`, label `portfolio` (`--replace`), cài service systemd `actions.runner.Tynab-yan-portfolio.portfolio-<hostname>.service` và khởi động.

   Chạy lại script là an toàn (idempotent): runner đã cấu hình thì chỉ đảm bảo service đang chạy.

2. **Kiểm tra runner**: GitHub → Settings → Actions → **Runners** → runner `portfolio-<hostname>` trạng thái **Idle** (online), label `self-hosted`, `Linux`, `X64`, `portfolio`. Sau đó **xóa `GH_PAT`** (Settings → Developer settings → Fine-grained tokens → Delete).

3. **Thêm secret** theo bảng mục 4: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, (tùy chọn) `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`.
   Khuyến nghị thêm: Settings → **Environments** → `production` (tự tạo sau lần deploy đầu, hoặc tạo trước) → _Deployment branches and tags_ → chỉ `main`; có thể bật _Required reviewers_ nếu muốn duyệt tay mỗi lần deploy.

4. **Bật deploy**: tab Variables → `DEPLOY_ENABLED` = `true`.

5. **Deploy lần đầu**: tab **Actions → Deploy → Run workflow** (branch `main`, để trống `image_tag`). Theo dõi 3 job: `Build & push image` → `Deploy to server` → `Telegram notification`. Job deploy mất khoảng 30–40 giây sau khi pull vì HEALTHCHECK probe lần đầu sau 30 giây.

6. **Xác minh**:

   ```bash
   curl -sI https://portfolio.yamiannephilim.com          # HTTP 200, cache-control: no-cache
   curl -s  https://portfolio.yamiannephilim.com/healthz  # ok
   # Trên server:
   docker ps --filter 'name=^yan-portfolio$'              # STATUS ... (healthy)
   docker inspect -f '{{.Config.Image}} {{.State.Health.Status}}' yan-portfolio
   ```

7. **Tắt Jenkins**: Jenkins → job portfolio → **Disable Project** ngay sau bước 6 (nếu không, mỗi push lên `main` sẽ có cả Jenkins lẫn GitHub Actions cùng chạy lại container). Sau vài lần deploy GitHub Actions ổn định: xóa `Jenkinsfile` khỏi repo, xóa credential `telegram_token`/`telegram_chatid`/`docker_hub` trong Jenkins và gỡ job.

## 6. Deploy Cloudflare Worker

Worker `yan-failover-redirect` (code `cloudflare/redirect-worker.js`, cấu hình `cloudflare/wrangler.toml`) chuyển `yamiannephilim.com/*` và `www` sang portfolio khi server sống (probe `/healthz`), sang GitHub khi server chết.

1. Đảm bảo `cloudflare/wrangler.toml` đã có trên `main` (`name = "yan-failover-redirect"`, `main = "redirect-worker.js"`).
2. Thêm secret `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (mục 4), rồi variable `WORKER_DEPLOY_ENABLED` = `true`.
3. Actions → **Deploy Worker → Run workflow** (về sau, mỗi push lên `main` có đổi `cloudflare/**` sẽ tự deploy).
4. Workflow chạy test Worker, `npx --yes wrangler@4 deploy --config cloudflare/wrangler.toml`, xác nhận qua API (`wrangler deployments status --json`) rằng `Current Version ID` vừa deploy đang nhận 100% traffic, rồi smoke test: `https://yamiannephilim.com` phải trả **302** với `Location` đúng bằng `https://portfolio.yamiannephilim.com` hoặc `https://github.com/Tynab` và `Cache-Control: no-store` (Redirect Rule/Page Rule tĩnh chặn trước Worker không có no-store nên sẽ bị phát hiện). Nếu bảo vệ bot của Cloudflare chặn IP datacenter của runner (`403` không có `Location`, 3 lần liên tiếp), smoke test chỉ cảnh báo: bước API chỉ xác nhận version, Page Rules/Redirect Rules chưa được kiểm tra — **bắt buộc** chạy tay `curl -sI https://yamiannephilim.com` từ máy nhà (kỳ vọng `302` + `no-store`).

Chọn `npx wrangler@4` thay vì `cloudflare/wrangler-action`: cùng lệnh với khi deploy tay, không thêm action bên thứ ba nào cầm Cloudflare token, vẫn ghim major version 4.

Deploy tay từ máy local (khi cần): `npx --yes wrangler@4 login` (đăng nhập OAuth trên trình duyệt, không cần dán token) rồi `npx --yes wrangler@4 deploy --config cloudflare/wrangler.toml`.

Rollback Worker: Cloudflare dashboard → Workers & Pages → `yan-failover-redirect` → **Deployments** → chọn bản trước → _Rollback_ (hoặc `npx --yes wrangler@4 rollback --config cloudflare/wrangler.toml`). Muốn gỡ hẳn Worker: đặt `WORKER_DEPLOY_ENABLED` = `false` **trước**, rồi làm theo mục _Rollback_ trong `cloudflare/README.md` — nếu không, lần deploy CI sau sẽ gắn route trở lại.

## 7. Rollback portfolio

- **Tự động**: nếu container mới không `healthy` trong ~90 giây (hoặc crash/restart), job deploy in log container, chạy lại **image ID cũ** với đúng cờ cũ rồi báo job thất bại (Telegram báo _Failure_).
- **Qua giao diện**: Actions → **Deploy → Run workflow** → `image_tag` = `sha-<7 ký tự>` của commit tốt (xem tag trên Docker Hub hoặc lịch sử commit). Workflow bỏ qua bước build, deploy thẳng tag đó (vẫn có health check + rollback). Server giữ sẵn 3 image `yamiannephilim/portfolio` mới nhất.
- **Khẩn cấp trên server** (runner hỏng, GitHub sự cố):

  ```bash
  docker image ls yamiannephilim/portfolio
  docker rm -f yan-portfolio
  docker run -d --name yan-portfolio --network yan --restart unless-stopped yamiannephilim/portfolio:sha-xxxxxxx
  docker inspect -f '{{.State.Health.Status}}' yan-portfolio   # chờ "healthy" (~30 giây)
  ```

- **Quay lại Jenkins** (trước khi xóa Jenkinsfile): đặt `DEPLOY_ENABLED` = `false`, bật lại job Jenkins rồi _Build Now_.

## 8. Ghi chú bảo mật

- **Repo public + self-hosted runner**: chỉ `deploy.yml` dùng runner trên server; workflow này chỉ chạy khi push `main` hoặc Run workflow, mọi job đều kiểm tra `github.ref == 'refs/heads/main'`. **Không bao giờ** thêm `pull_request`/`pull_request_target` vào `deploy.yml`, và không dùng label `portfolio`/`self-hosted` trong workflow nào chạy theo pull request — code từ fork sẽ chạy trên server nhà.
- **Approval cho fork PR là bắt buộc** (bước 0.5 mục 5): Settings → Actions → General → **Require approval for all external contributors**. Một PR có thể mang theo workflow mới của chính nó, nên approve = chạy code của người lạ trên server. Không approve run nào của fork PR đụng tới `.github/`.
- **Hook chặn trên runner** (do `install-runner.sh` cài, PR không sửa được): `/usr/local/libexec/gha-runner-guard.sh` (thuộc root) được runner gọi trước mọi job qua `ACTIONS_RUNNER_HOOK_JOB_STARTED` trong `/opt/actions-runner/.env`; job bị fail ngay nếu không phải `push`/`workflow_dispatch` trên `refs/heads/main` của `Tynab/yan-portfolio` (và workflow khác `deploy.yml`). Chạy lại bootstrap trên runner đã cài cũng sẽ gắn hook này.
- Bảo vệ nhánh `main` (Settings → Rules/Branches): bắt buộc PR + check `CI` xanh, vì ai push được lên `main` là chạy được code trên server.
- Runner chạy bằng user `gha-runner` (không mật khẩu) trong group `docker` — **tương đương root** trên server. Chỉ đăng ký runner cho repo này, không thêm label khác, không dùng chung cho repo/workflow khác.
- Job deploy trên server không checkout code, không chạy action bên thứ ba; đăng nhập Docker Hub bằng `--password-stdin` vào thư mục cấu hình tạm của job và logout khi xong.
- `GH_PAT`: fine-grained, một repo, chỉ _Administration: Read and write_, hạn ngắn, **xóa/rotate ngay sau bootstrap**; không lưu trong GitHub.
- Docker Hub token chỉ _Read & Write_ và có hạn; Cloudflare token (template _Edit Cloudflare Workers_ hoặc custom token với đúng các quyền ở mục 4), giới hạn đúng account và zone `yamiannephilim.com`. Rotate định kỳ và ngay khi nghi lộ.
- Không echo secret trong workflow; GitHub tự che secret trong log nhưng đừng dựa vào đó. Không dán token vào chat/issue/PR/commit.
- Nên ghim action theo commit SHA và bật Dependabot cho `github-actions` để nhận bản cập nhật bảo mật.

## 9. Xử lý sự cố

- **Job deploy "Queued" mãi**: runner offline → trên server `systemctl status 'actions.runner.*'`, `journalctl -u 'actions.runner.*' -n 100`. Chạy lại bootstrap cũng giúp khởi động lại service.
- **`permission denied ... docker.sock`**: service chưa nhận group `docker` → chạy lại bootstrap (script tự restart service khi vừa thêm group) hoặc `sudo systemctl restart 'actions.runner.*'`.
- **Bootstrap báo `sudo: a terminal is required`/`requiretty`**: bỏ `Defaults requiretty` cho user đó trong sudoers.
- **Xem health check**: `docker inspect --format '{{json .State.Health}}' yan-portfolio | jq`.
- **Gỡ runner**: trên server `cd /opt/actions-runner && sudo ./svc.sh stop && sudo ./svc.sh uninstall`, rồi Settings → Actions → Runners → runner → _Remove_ (lấy lệnh `config.sh remove --token ...` hiển thị ở đó, chạy bằng `sudo -u gha-runner`).

## 10. Chính sách cache của nginx

| Đường dẫn                             | Cache-Control                         |
| ------------------------------------- | ------------------------------------- |
| `/`, `index.html`, deep link SPA      | `no-cache`                            |
| `/healthz`                            | `no-store` (không ghi access log)     |
| `/manifest.json`, `/robots.txt`       | `no-cache`                            |
| `/assets/*` (tên có hash)             | `public, max-age=31536000, immutable` |
| `/skills/*` (PNG/WebP, gọi kèm `?v=`) | `public, max-age=31536000, immutable` |
| Asset tĩnh khác (`/icons/*`...)       | `public, max-age=604800`              |
