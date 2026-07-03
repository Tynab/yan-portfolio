# Cloudflare Scheduled Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Cloudflare Worker (code + deploy guide, versioned in-repo) that redirects `www.yamiannephilim.com/*` and `yamiannephilim.com/*` to GitHub at night (23:30–08:30 VN) and back to the portfolio by day, keeping `/wedding-card` on www 24/7.

**Architecture:** One Worker computes minutes-of-day in `Asia/Ho_Chi_Minh` per request and returns a 302 to the matching target; wedding-card is special-cased before the schedule. Two repo files under `cloudflare/`: the worker module (with named exports so its time logic is unit-testable) and a Vietnamese dashboard deploy guide. Boundary logic is covered by a Vitest file that `npm test` picks up automatically.

**Tech Stack:** Cloudflare Workers (ES module `export default { fetch }`), `Intl.DateTimeFormat`, Vitest (already in repo).

## Global Constraints

- Status code **302** everywhere (never 301 — browsers cache 301 permanently, breaking the schedule).
- Night window: minutes `>= 1410` (23:30) **or** `< 510` (08:30); timezone `Asia/Ho_Chi_Minh`.
- Targets: night `https://github.com/Tynab`; day `https://portfolio.yamiannephilim.com`; wedding-card (www only, 24/7) `https://tynab.github.io/Yami-Buzzy`.
- **No path/query passthrough** — every path redirects to the bare target URL (matches old Page Rules).
- Work directly on `develop`. Do NOT touch app code (`src/`), configs, or pipeline files.
- Vietnamese `// Tóm tắt:` + comments per repo convention. Husky/lint-staged will prettify staged files — let it.
- Claude has no Cloudflare access: dashboard steps are documentation for the user, not executed by the implementer.

---

### Task 1: Worker module + boundary tests (TDD)

**Files:**

- Create: `cloudflare/redirect-worker.js`
- Test: `cloudflare/redirect-worker.test.js`

**Interfaces:**

- Produces: `minutesOfDayInVietnam(date?: Date): number` (0–1439) and `isNightInVietnam(minutes: number): boolean` — named exports consumed by the test file; `export default { fetch }` consumed by Cloudflare.

- [ ] **Step 1: Write the failing test** — create `cloudflare/redirect-worker.test.js`:

```js
// Tóm tắt: Test biên cho logic khung giờ của Cloudflare Worker redirect (23:30/08:30 giờ VN).
import { describe, expect, test } from "vitest";
import { isNightInVietnam, minutesOfDayInVietnam } from "./redirect-worker.js";

describe("isNightInVietnam — biên khung đêm 23:30–08:30", () => {
  test("23:29 là ban ngày", () => {
    expect(isNightInVietnam(23 * 60 + 29)).toBe(false);
  });
  test("23:30 là ban đêm (biên trên, inclusive)", () => {
    expect(isNightInVietnam(23 * 60 + 30)).toBe(true);
  });
  test("00:00 là ban đêm (vắt qua nửa đêm)", () => {
    expect(isNightInVietnam(0)).toBe(true);
  });
  test("08:29 là ban đêm", () => {
    expect(isNightInVietnam(8 * 60 + 29)).toBe(true);
  });
  test("08:30 là ban ngày (biên dưới, exclusive với đêm)", () => {
    expect(isNightInVietnam(8 * 60 + 30)).toBe(false);
  });
  test("12:00 là ban ngày", () => {
    expect(isNightInVietnam(12 * 60)).toBe(false);
  });
});

describe("minutesOfDayInVietnam — đổi UTC sang phút-trong-ngày giờ VN (UTC+7)", () => {
  test("16:30 UTC = 23:30 VN", () => {
    expect(minutesOfDayInVietnam(new Date("2026-07-03T16:30:00Z"))).toBe(
      23 * 60 + 30
    );
  });
  test("01:30 UTC = 08:30 VN", () => {
    expect(minutesOfDayInVietnam(new Date("2026-07-03T01:30:00Z"))).toBe(
      8 * 60 + 30
    );
  });
  test("17:00 UTC = 00:00 VN (nửa đêm — chống quirk giờ '24')", () => {
    expect(minutesOfDayInVietnam(new Date("2026-07-03T17:00:00Z"))).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run cloudflare`
Expected: FAIL — cannot resolve import `./redirect-worker.js` (file does not exist yet).

- [ ] **Step 3: Write the worker** — create `cloudflare/redirect-worker.js`:

```js
// Tóm tắt: Cloudflare Worker chuyển hướng theo khung giờ VN — đêm (23:30–08:30) trỏ GitHub,
// ngày trỏ portfolio; riêng www/wedding-card luôn trỏ Yami-Buzzy 24/7.
// Deploy: dán toàn bộ file này vào Cloudflare dashboard theo cloudflare/README.md.

// ===== Cấu hình (chỉ sửa ở đây) =====
const NIGHT_START_MINUTES = 23 * 60 + 30; // 23:30 giờ VN — bắt đầu khung đêm
const DAY_START_MINUTES = 8 * 60 + 30; // 08:30 giờ VN — bắt đầu khung ngày
const NIGHT_TARGET = "https://github.com/Tynab";
const DAY_TARGET = "https://portfolio.yamiannephilim.com";
const WEDDING_CARD_TARGET = "https://tynab.github.io/Yami-Buzzy";
// 302 bắt buộc: 301 bị browser cache vĩnh viễn nên sẽ phá lịch chuyển theo giờ.
const STATUS_CODE = 302;

// Quy thời điểm hiện tại về phút-trong-ngày (0–1439) theo múi giờ VN (không có DST).
function minutesOfDayInVietnam(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // Một số runtime trả "24" cho nửa đêm khi hour12: false — quy về 0 bằng % 24.
  return (Number(map.hour) % 24) * 60 + Number(map.minute);
}

// Đêm ⇔ phút >= 23:30 hoặc < 08:30 (khung giờ vắt qua nửa đêm nên dùng OR).
function isNightInVietnam(minutes) {
  return minutes >= NIGHT_START_MINUTES || minutes < DAY_START_MINUTES;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Giữ nguyên hành vi Page Rule #1 cũ: chỉ trên www, mọi khung giờ.
    if (
      url.hostname === "www.yamiannephilim.com" &&
      url.pathname === "/wedding-card"
    ) {
      return Response.redirect(WEDDING_CARD_TARGET, STATUS_CODE);
    }

    // Không truyền path/query sang đích — giống hệt 2 Page Rules forwarding cũ.
    const target = isNightInVietnam(minutesOfDayInVietnam())
      ? NIGHT_TARGET
      : DAY_TARGET;
    return Response.redirect(target, STATUS_CODE);
  },
};

// Xuất riêng cho unit test (Vitest); Cloudflare bỏ qua các named export này.
export { minutesOfDayInVietnam, isNightInVietnam };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run cloudflare`
Expected: 9 passed (6 boundary + 3 timezone).

- [ ] **Step 5: Confirm the app suite still passes and picks the new file up**

Run: `npm test`
Expected: 2 test files (src/App.test.js + cloudflare/redirect-worker.test.js), all passing.

- [ ] **Step 6: Commit**

```bash
git add cloudflare/redirect-worker.js cloudflare/redirect-worker.test.js
git commit -m "feat: add Cloudflare worker for time-scheduled domain redirect"
```

### Task 2: Deploy guide (Vietnamese)

**Files:**

- Create: `cloudflare/README.md`

**Interfaces:**

- Consumes: file name `redirect-worker.js`, constant names `NIGHT_START_MINUTES` etc. from Task 1 (referenced in instructions).

- [ ] **Step 1: Write `cloudflare/README.md`** with exactly this content:

````markdown
# Cloudflare Worker: Redirect theo khung giờ

Tóm tắt: Hướng dẫn deploy Worker chuyển hướng `yamiannephilim.com` theo giờ Việt Nam lên Cloudflare dashboard.

## Hành vi

| Giờ VN              | `www.yamiannephilim.com/*` và `yamiannephilim.com/*` | `www.yamiannephilim.com/wedding-card`      |
| ------------------- | ---------------------------------------------------- | ------------------------------------------ |
| 08:30:00 – 23:29:59 | `302` → https://portfolio.yamiannephilim.com         | `302` → https://tynab.github.io/Yami-Buzzy |
| 23:30:00 – 08:29:59 | `302` → https://github.com/Tynab                     | `302` → https://tynab.github.io/Yami-Buzzy |

- Dùng **302** (không dùng 301 — browser cache 301 vĩnh viễn sẽ phá lịch theo giờ).
- Không truyền path/query sang đích (giống 2 Page Rules forwarding cũ).
- Muốn đổi giờ/URL: sửa các hằng số đầu file `redirect-worker.js` (`NIGHT_START_MINUTES`, `DAY_START_MINUTES`, `NIGHT_TARGET`, `DAY_TARGET`, `WEDDING_CARD_TARGET`) rồi Deploy lại.

## Deploy (Cloudflare dashboard)

1. **Tạo Worker**: Dashboard → `Workers & Pages` → `Create` → `Create Worker` → đặt tên `yan-schedule-redirect` → `Deploy` (bản hello-world mặc định).
2. **Dán code**: mở Worker vừa tạo → `Edit code` → xóa hết code mẫu, dán toàn bộ nội dung file `redirect-worker.js` → `Deploy`.
3. **Gắn route**: Worker → `Settings` → `Domains & Routes` → `Add` → `Route`, chọn zone `yamiannephilim.com`, thêm lần lượt 2 route:
   - `www.yamiannephilim.com/*`
   - `yamiannephilim.com/*`
4. **Kiểm tra (trong khung ngày 08:30–23:30)** — chạy trong PowerShell (`curl.exe`) hoặc Git Bash (`curl`, thay `findstr /i` bằng `grep -i`):

   ```powershell
   curl.exe -sI https://www.yamiannephilim.com | findstr /i "HTTP location"
   curl.exe -sI https://yamiannephilim.com | findstr /i "HTTP location"
   curl.exe -sI https://www.yamiannephilim.com/wedding-card | findstr /i "HTTP location"
   ```

   Kỳ vọng: status `302`; `location: https://portfolio.yamiannephilim.com` cho 2 lệnh đầu, `location: https://tynab.github.io/Yami-Buzzy` cho lệnh cuối.

5. **Giả lập ban đêm (không cần đợi 23:30)**: trong `Edit code`, sửa tạm `NIGHT_START_MINUTES` thành số phút hiện tại theo giờ VN (ví dụ đang 14:00 → `14 * 60`) → `Deploy` → chạy lại lệnh curl đầu tiên, kỳ vọng `location: https://github.com/Tynab` → hoàn lại `23 * 60 + 30` → `Deploy`.
6. **Tắt 3 Page Rules cũ**: Dashboard → zone `yamiannephilim.com` → `Rules` → `Page Rules` → gạt toggle **OFF** cả 3 rule (rule wedding-card + 2 rule forwarding). **Không xóa** — giữ lại để rollback. (Worker route vốn được ưu tiên chạy trước Page Rules, tắt đi cho sạch và tránh nhầm lẫn.)
7. **Verify lại** các lệnh ở bước 4 sau khi tắt rules.

## Rollback

1. Worker → `Settings` → `Domains & Routes` → xóa 2 route vừa gắn.
2. `Rules` → `Page Rules` → bật lại 3 rule. Xong — hành vi cũ khôi phục nguyên vẹn.

## Test cục bộ

`npm test` (Vitest) tự chạy cả `cloudflare/redirect-worker.test.js` — test các mốc biên 23:29/23:30/08:29/08:30 và phép đổi UTC → giờ VN.
````

- [ ] **Step 2: Cross-check the README against reality**

Verify: constant names in the README match `redirect-worker.js` exactly (`NIGHT_START_MINUTES`, `DAY_START_MINUTES`, `NIGHT_TARGET`, `DAY_TARGET`, `WEDDING_CARD_TARGET`); the behavior table matches the spec (`docs/superpowers/specs/2026-07-03-cloudflare-scheduled-redirect-design.md` §3); the 3 curl commands match §5 of the spec.

- [ ] **Step 3: Commit**

```bash
git add cloudflare/README.md
git commit -m "docs: add Cloudflare worker deploy guide (Vietnamese)"
```

### Task 3: Final verification

- [ ] **Step 1: Full repo gates**

Run: `npm test && npm run lint && npm run build`
Expected: test 2 files / 10 tests passing (1 app smoke + 9 worker); lint 0 problems (lint only scans `src/**`, unaffected); build succeeds (worker is outside the app graph).

- [ ] **Step 2: Hand off to user** — deployment itself is manual: user follows `cloudflare/README.md` steps 1–7, then reports the curl outputs back for verification against the expected `Location` values.

## Self-Review (completed by plan author)

- **Spec coverage:** worker + config constants (§3–4 → Task 1); boundary tests incl. 23:29/23:30/08:29/08:30 (§7 Done item 2 → Task 1 Steps 1–4); README with dashboard steps, curl tests, night simulation, rollback (§4–5 → Task 2); commit to develop (§7 Done item 1 → Tasks 1–2); post-deploy curl verification is user-executed (§7 Done item 3 → Task 3 Step 2).
- **Placeholder scan:** none — full code and README content inline.
- **Type consistency:** `minutesOfDayInVietnam`/`isNightInVietnam` names identical in worker, test, and README references.
