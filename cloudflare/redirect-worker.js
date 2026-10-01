// Tóm tắt: Cloudflare Worker chuyển hướng yamiannephilim.com theo tình trạng server portfolio —
// server còn trả lời → portfolio; server không kết nối được hoặc Cloudflare báo Bad Gateway
// (502/503/504, 52x, 530) → GitHub. Riêng www/wedding-card luôn trỏ Yami-Buzzy (không probe).
// Deploy: dán toàn bộ file này vào Cloudflare dashboard hoặc dùng wrangler (cloudflare/wrangler.toml),
// xem cloudflare/README.md.

// ===== Cấu hình (chỉ sửa ở đây) =====
const PORTFOLIO_TARGET = "https://portfolio.yamiannephilim.com";
const FALLBACK_TARGET = "https://github.com/Tynab";
const WEDDING_CARD_TARGET = "https://tynab.github.io/Yami-Buzzy";
// Endpoint health check của nginx (trả 200 "ok", no-store). Kể cả khi bản nginx có /healthz chưa
// được deploy, SPA fallback (try_files ... /index.html) vẫn trả 200 cho đường dẫn này nên probe vẫn đúng.
const PORTFOLIO_HEALTH_URL = "https://portfolio.yamiannephilim.com/healthz";
const HEALTH_TIMEOUT_MS = 3000; // Quá 3 giây chưa có phản hồi ⇒ coi như server chết.
const HEALTH_CACHE_MS = 30000; // Nhớ kết quả probe 30 giây trong mỗi isolate, tránh probe mọi request.
// Status nghĩa là "không tới được origin": reverse proxy/Cloudflare báo 502 Bad Gateway, 503, 504;
// Cloudflare báo 520–526 (origin từ chối/timeout/lỗi SSL) và 530 (tunnel/DNS origin lỗi).
// Mọi status khác (2xx/3xx/4xx/500...) nghĩa là server vẫn trả lời ⇒ vẫn hiện portfolio.
const ORIGIN_DOWN_STATUSES = new Set([
  502,
  503,
  504,
  520,
  521,
  522,
  523,
  524,
  525,
  526,
  530,
]);
// 302 bắt buộc: 301 bị browser cache vĩnh viễn nên sẽ "kẹt" ở GitHub dù server đã sống lại.
const STATUS_CODE = 302;

// ===== Hằng số suy ra (không cần sửa) =====
const PORTFOLIO_HOST = new URL(PORTFOLIO_TARGET).hostname;
// Probe tự abort sau HEALTH_TIMEOUT_MS nên không thể "đang chạy" lâu hơn mốc này. Quá mốc ⇒ coi là
// probe mồ côi (vd. request khởi tạo nó bị hủy giữa chừng) và probe lại, tránh treo các request khác.
const PROBE_ORPHAN_MS = HEALTH_TIMEOUT_MS * 2;

// Server có bị coi là "chết" với status này không.
function isOriginDownStatus(status) {
  return ORIGIN_DOWN_STATUSES.has(status);
}

// Request là điều hướng trang (người dùng mở trang) chứ không phải asset/API.
function isPageNavigation(request) {
  if (request.method !== "GET") return false;
  const mode = request.headers.get("Sec-Fetch-Mode") || "";
  const accept = request.headers.get("Accept") || "";
  return mode === "navigate" || accept.includes("text/html");
}

// Redirect 302 kèm no-store để cả browser lẫn CDN không cache quyết định (server sống lại là đổi ngay).
function redirect(target) {
  return new Response(null, {
    status: STATUS_CODE,
    headers: { Location: target, "Cache-Control": "no-store" },
  });
}

// Không cần nội dung response ⇒ hủy body để giải phóng kết nối subrequest.
function discardBody(response) {
  try {
    if (response.body) response.body.cancel().catch(() => {});
  } catch {
    // Body đã bị khóa/đọc — bỏ qua.
  }
}

// Mô tả ngắn lỗi fetch cho log (không log header/body).
function describeError(error) {
  return error && error.name
    ? `${error.name}: ${error.message}`
    : String(error);
}

// "Ping" server: Workers không gửi được ICMP ping (chỉ có fetch qua HTTP/TCP) nên dùng một request
// HTTP nhẹ tới /healthz. Trả true (sống) / false (chết), không bao giờ throw.
async function probePortfolio() {
  // AbortController + setTimeout chạy được trên mọi compatibility date của Workers.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    // Không dùng option "cache"/cf cache (phụ thuộc compatibility date): /healthz không có đuôi file
    // tĩnh nên Cloudflare không cache mặc định, nginx cũng trả no-store.
    const response = await fetch(PORTFOLIO_HEALTH_URL, {
      method: "GET",
      // manual: 3xx (vd. ép HTTPS/thêm "/") vẫn là server đang trả lời ⇒ sống, không đi theo redirect.
      redirect: "manual",
      signal: controller.signal,
    });
    discardBody(response);
    const up = !isOriginDownStatus(response.status);
    // Log ra Workers Logs (tối đa ~1 dòng/30 giây/isolate nhờ memo) để verify khi giả lập sự cố.
    console.log(`health probe: ${response.status} => ${up ? "up" : "down"}`);
    return up;
  } catch (error) {
    // Lỗi DNS/kết nối, hoặc bị abort vì quá HEALTH_TIMEOUT_MS (AbortError) ⇒ chết.
    console.log(`health probe: ${describeError(error)} => down`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Chờ promise nhưng có hạn chót riêng cho request hiện tại; quá hạn thì chạy onTimeout() thay thế.
function withDeadline(promise, ms, onTimeout) {
  let timer;
  const fallback = new Promise((resolve) => {
    timer = setTimeout(() => resolve(onTimeout()), ms);
  });
  return Promise.race([promise, fallback]).finally(() => clearTimeout(timer));
}

// Tạo handler kèm state riêng (memo + probe đang chạy). Mặc định đồng hồ là Date.now; test truyền
// `now` giả để kiểm tra memo mà không phải chờ thật.
function createWorker({ now = () => Date.now() } = {}) {
  let memo = null; // { up: boolean, at: number } — kết quả gần nhất.
  let inflight = null; // { promise, startedAt } — probe đang chạy, dùng chung cho request đồng thời.

  function remember(up) {
    memo = { up, at: now() };
  }

  function startProbe(ctx) {
    const entry = { startedAt: now() };
    entry.promise = probePortfolio().then((up) => {
      remember(up);
      if (inflight === entry) inflight = null;
      return up;
    });
    inflight = entry;
    // Giữ probe sống tới khi xong dù request khởi tạo nó bị client hủy giữa chừng
    // ⇒ probe dùng chung không bị "mồ côi" và các request đang chờ luôn nhận được kết quả.
    if (ctx && typeof ctx.waitUntil === "function")
      ctx.waitUntil(entry.promise);
    return entry.promise;
  }

  // Server portfolio có sống không: dùng memo nếu còn hạn, nếu không thì probe (gộp các request
  // đồng thời vào cùng một probe).
  function isPortfolioUp(ctx) {
    const startedAt = now();
    if (memo && startedAt - memo.at < HEALTH_CACHE_MS) {
      return Promise.resolve(memo.up);
    }
    if (inflight && startedAt - inflight.startedAt >= PROBE_ORPHAN_MS) {
      inflight = null;
    }
    const shared = inflight ? inflight.promise : startProbe(ctx);
    // Lưới an toàn: nếu probe dùng chung vẫn chưa settle sau PROBE_ORPHAN_MS, bỏ nó và hỏi lại từ đầu
    // qua isPortfolioUp() ⇒ vẫn dùng memo nếu đã có kết quả mới, probe mới chạy trong context của
    // request này (tự abort sau HEALTH_TIMEOUT_MS) và lại có hạn chót riêng — không request nào treo mãi.
    return withDeadline(shared, PROBE_ORPHAN_MS, () => {
      if (inflight && inflight.promise === shared) inflight = null;
      return isPortfolioUp(ctx);
    });
  }

  // Chế độ pass-through cho host portfolio (chỉ chạy khi gắn thêm route portfolio.yamiannephilim.com/*):
  // trả nguyên response của origin; chỉ khi origin chết VÀ là điều hướng trang thì redirect sang GitHub.
  async function passThrough(request) {
    let response = null;
    let failure = "";
    try {
      response = await fetch(request);
    } catch (error) {
      failure = describeError(error);
    }
    const down = !response || isOriginDownStatus(response.status);
    // Cập nhật memo từ chính response vừa thấy ⇒ apex/www phản ứng ngay, không cần chờ probe.
    // "down" luôn được ghi; "up" chỉ ghi từ điều hướng trang (HTML do nginx trả no-cache, Cloudflare không
    // cache) — asset có thể là bản cache ở edge nên không chứng minh được origin còn sống.
    if (down || isPageNavigation(request)) remember(!down);
    if (down) {
      console.log(
        `pass-through: ${response ? response.status : failure} => down`
      );
    }
    if (down && isPageNavigation(request)) {
      if (response) discardBody(response);
      return redirect(FALLBACK_TARGET);
    }
    if (!response) {
      // Asset/API mà không kết nối được origin: trả 502 thật (ảnh/JS không thể "đi theo" trang GitHub).
      return new Response("Bad Gateway", {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    // Giữ nguyên status/header/body thật của origin (asset 502 vẫn là 502).
    return response;
  }

  async function handleFetch(request, env, ctx) {
    let isPortfolioHost = false;
    try {
      const url = new URL(request.url);

      // Giữ nguyên hành vi Page Rule #1 cũ: chỉ trên www, luôn luôn, không cần probe.
      if (
        url.hostname === "www.yamiannephilim.com" &&
        url.pathname === "/wedding-card"
      ) {
        return redirect(WEDDING_CARD_TARGET);
      }

      if (url.hostname === PORTFOLIO_HOST) {
        isPortfolioHost = true;
        return await passThrough(request);
      }

      // Không truyền path/query sang đích — giống hệt 2 Page Rules forwarding cũ.
      const up = await isPortfolioUp(ctx);
      return redirect(up ? PORTFOLIO_TARGET : FALLBACK_TARGET);
    } catch {
      // Lỗi lập trình bất ngờ: thà hiện portfolio còn hơn để Cloudflare trả trang lỗi 1101.
      // Riêng host portfolio thì không redirect về chính nó (tránh vòng lặp) mà trả request cho origin.
      if (isPortfolioHost) return fetch(request);
      return redirect(PORTFOLIO_TARGET);
    }
  }

  return { fetch: handleFetch };
}

// State memo/probe ở cấp module ⇒ dùng chung trong cả isolate của Cloudflare.
export default createWorker();

// Xuất riêng cho unit test (Vitest); Cloudflare bỏ qua các named export này.
export { createWorker, isOriginDownStatus, isPageNavigation };
