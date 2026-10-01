// Tóm tắt: Test Cloudflare Worker failover — wedding-card không probe, probe /healthz (status sống/chết,
// lỗi kết nối, timeout, 3xx), header redirect no-store, memo 30 giây, gộp probe đồng thời, probe treo,
// pass-through host portfolio và lỗi bất ngờ. fetch toàn cục được mock bằng vi.stubGlobal.
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import worker, {
  createWorker,
  isOriginDownStatus,
  isPageNavigation,
} from "./redirect-worker.js";

const PORTFOLIO = "https://portfolio.yamiannephilim.com";
const GITHUB = "https://github.com/Tynab";
const WEDDING_CARD = "https://tynab.github.io/Yami-Buzzy";
const HEALTH_URL = "https://portfolio.yamiannephilim.com/healthz";
const DOWN_STATUSES = [502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 530];

let fetchMock;
let logSpy;
let clock;
// Worker mới cho mỗi test (state memo riêng) với đồng hồ giả điều khiển bằng biến `clock`.
let freshWorker;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  // Worker log kết quả probe ra Workers Logs — tắt tiếng trong test, vẫn kiểm tra được nội dung.
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  clock = 1_000_000;
  freshWorker = createWorker({ now: () => clock });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// Probe trả về status cho trước (body rỗng hợp lệ với mọi status).
function probeReturns(status) {
  fetchMock.mockImplementation(async () => new Response(null, { status }));
}

// Promise điều khiển tay để giữ probe "đang chạy".
function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function expectRedirect(res, location) {
  expect(res.status).toBe(302);
  expect(res.headers.get("location")).toBe(location);
  expect(res.headers.get("cache-control")).toBe("no-store");
  expect(res.body).toBeNull();
}

describe("www/wedding-card — luôn về Yami-Buzzy, không probe", () => {
  test("không gọi probe kể cả khi server đang chết", async () => {
    probeReturns(502);
    const res = await freshWorker.fetch(
      new Request("https://www.yamiannephilim.com/wedding-card")
    );
    expectRedirect(res, WEDDING_CARD);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("wedding-card trên apex (không phải www) không áp dụng ngoại lệ → theo probe", async () => {
    probeReturns(200);
    const res = await freshWorker.fetch(
      new Request("https://yamiannephilim.com/wedding-card")
    );
    expectRedirect(res, PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("apex/www — probe /healthz quyết định portfolio hay GitHub", () => {
  test("probe 200 → portfolio, không mang theo path/query", async () => {
    probeReturns(200);
    const res = await freshWorker.fetch(
      new Request("https://yamiannephilim.com/any/path?q=1")
    );
    expectRedirect(res, PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(HEALTH_URL);
    expect(init.method).toBe("GET");
    expect(init.redirect).toBe("manual");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    // Không dùng option cache (phụ thuộc compatibility date của Workers).
    expect(init).not.toHaveProperty("cache");
    expect(init).not.toHaveProperty("cf");
  });

  test("www trang chủ, probe 200 → portfolio", async () => {
    probeReturns(200);
    const res = await freshWorker.fetch(
      new Request("https://www.yamiannephilim.com/")
    );
    expectRedirect(res, PORTFOLIO);
  });

  test.each([404, 500])(
    "probe %i (server vẫn trả lời) → portfolio",
    async (status) => {
      probeReturns(status);
      const res = await freshWorker.fetch(
        new Request("https://yamiannephilim.com/")
      );
      expectRedirect(res, PORTFOLIO);
    }
  );

  test.each([301, 302, 307, 308])(
    "probe %i (redirect: manual, không đi theo) → coi là sống → portfolio",
    async (status) => {
      probeReturns(status);
      const res = await freshWorker.fetch(
        new Request("https://yamiannephilim.com/")
      );
      expectRedirect(res, PORTFOLIO);
    }
  );

  test.each(DOWN_STATUSES)(
    "probe %i (không tới được origin) → GitHub",
    async (status) => {
      probeReturns(status);
      const res = await freshWorker.fetch(
        new Request("https://www.yamiannephilim.com/")
      );
      expectRedirect(res, GITHUB);
      expect(logSpy).toHaveBeenCalledWith(`health probe: ${status} => down`);
    }
  );

  test("probe throw (DNS/kết nối lỗi) → GitHub", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network connection lost."));
    const res = await freshWorker.fetch(
      new Request("https://yamiannephilim.com/")
    );
    expectRedirect(res, GITHUB);
    expect(logSpy).toHaveBeenCalledWith(
      "health probe: TypeError: Network connection lost. => down"
    );
  });

  test("probe không phản hồi quá 3 giây → abort → GitHub", async () => {
    vi.useFakeTimers();
    let signal;
    fetchMock.mockImplementation(
      (url, init) =>
        new Promise((resolve, reject) => {
          signal = init.signal;
          init.signal.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError"))
          );
        })
    );
    let settled = false;
    const pending = createWorker()
      .fetch(new Request("https://yamiannephilim.com/"))
      .then((res) => {
        settled = true;
        return res;
      });

    await vi.advanceTimersByTimeAsync(2999);
    expect(settled).toBe(false);
    expect(signal.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const res = await pending;
    expect(signal.aborted).toBe(true);
    expectRedirect(res, GITHUB);
  });
});

describe("memo kết quả probe 30 giây và gộp probe đồng thời", () => {
  test("trong 30 giây không probe lại; đủ 30 giây thì probe lại", async () => {
    probeReturns(200);
    const req = () => new Request("https://yamiannephilim.com/");

    expectRedirect(await freshWorker.fetch(req()), PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Server chết nhưng memo "sống" còn hạn ⇒ vẫn portfolio, không probe.
    probeReturns(502);
    clock += 29_999;
    expectRedirect(await freshWorker.fetch(req()), PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Hết hạn ⇒ probe lại, thấy 502 ⇒ GitHub.
    clock += 1;
    expectRedirect(await freshWorker.fetch(req()), GITHUB);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("kết quả 'chết' cũng được nhớ 30 giây rồi mới chuyển lại portfolio", async () => {
    probeReturns(503);
    const req = () => new Request("https://www.yamiannephilim.com/");

    expectRedirect(await freshWorker.fetch(req()), GITHUB);
    probeReturns(200);
    clock += 10_000;
    expectRedirect(await freshWorker.fetch(req()), GITHUB);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    clock += 20_000;
    expectRedirect(await freshWorker.fetch(req()), PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("nhiều request đồng thời dùng chung một probe", async () => {
    const gate = deferred();
    fetchMock.mockImplementation(() => gate.promise);

    const pending = [
      freshWorker.fetch(new Request("https://yamiannephilim.com/")),
      freshWorker.fetch(new Request("https://www.yamiannephilim.com/a")),
      freshWorker.fetch(new Request("https://yamiannephilim.com/b?c=d")),
    ];
    // Cho các handler chạy tới chỗ await probe.
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    gate.resolve(new Response("ok", { status: 200 }));
    for (const res of await Promise.all(pending)) {
      expectRedirect(res, PORTFOLIO);
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("probe dùng chung bị treo (không settle) → sau 6 giây request tự probe lại", async () => {
    vi.useFakeTimers();
    // Lần 1: treo vĩnh viễn, bỏ qua cả abort (mô phỏng request khởi tạo probe bị hủy giữa chừng).
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    fetchMock.mockImplementation(
      async () => new Response("ok", { status: 200 })
    );
    const hungWorker = createWorker();
    const pending = hungWorker.fetch(
      new Request("https://yamiannephilim.com/")
    );

    await vi.advanceTimersByTimeAsync(5999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expectRedirect(await pending, PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Probe mới đã cập nhật memo ⇒ request sau không probe nữa.
    expectRedirect(
      await hungWorker.fetch(new Request("https://www.yamiannephilim.com/")),
      PORTFOLIO
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("hết hạn chờ probe treo nhưng memo vừa có kết quả mới → dùng memo, không probe thêm", async () => {
    vi.useFakeTimers();
    let clockNow = 0;
    const w = createWorker({ now: () => clockNow });
    // Probe 1 treo vĩnh viễn; các probe sau trả 200 ngay.
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    fetchMock.mockImplementation(
      async () => new Response("ok", { status: 200 })
    );
    const waiting = w.fetch(new Request("https://yamiannephilim.com/"));
    await vi.advanceTimersByTimeAsync(5000);

    // Request khác tới sau 7 giây (đồng hồ memo): probe 1 bị coi là mồ côi ⇒ probe 2 chạy và ghi memo "up".
    clockNow = 7000;
    expectRedirect(
      await w.fetch(new Request("https://www.yamiannephilim.com/")),
      PORTFOLIO
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Request đầu hết hạn chờ: hỏi lại qua memo (còn hạn) ⇒ không probe lần 3.
    await vi.advanceTimersByTimeAsync(1000);
    expectRedirect(await waiting, PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("probe được giao cho ctx.waitUntil một lần, request đồng thời không đăng ký lại", async () => {
    const gate = deferred();
    fetchMock.mockImplementation(() => gate.promise);
    const ctx = { waitUntil: vi.fn() };
    const first = freshWorker.fetch(
      new Request("https://yamiannephilim.com/"),
      {},
      ctx
    );
    const second = freshWorker.fetch(
      new Request("https://www.yamiannephilim.com/"),
      {},
      ctx
    );
    expect(ctx.waitUntil).toHaveBeenCalledTimes(1);
    expect(ctx.waitUntil.mock.calls[0][0]).toBeInstanceOf(Promise);
    gate.resolve(new Response("ok", { status: 200 }));
    expectRedirect(await first, PORTFOLIO);
    expectRedirect(await second, PORTFOLIO);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("pass-through host portfolio (chỉ khi gắn route portfolio.yamiannephilim.com/*)", () => {
  const page = (headers) =>
    new Request("https://portfolio.yamiannephilim.com/", { headers });

  test("origin 200 → trả nguyên response (status/body/header)", async () => {
    const origin = new Response("<html>portfolio</html>", {
      status: 200,
      headers: { "Content-Type": "text/html", "X-Origin": "nginx" },
    });
    fetchMock.mockResolvedValue(origin);
    const req = page({ Accept: "text/html" });

    const res = await freshWorker.fetch(req);
    expect(fetchMock).toHaveBeenCalledWith(req);
    expect(res).toBe(origin);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-origin")).toBe("nginx");
    expect(await res.text()).toBe("<html>portfolio</html>");
  });

  test("origin 502 + điều hướng trang (Sec-Fetch-Mode: navigate) → redirect GitHub", async () => {
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }));
    const res = await freshWorker.fetch(page({ "Sec-Fetch-Mode": "navigate" }));
    expectRedirect(res, GITHUB);
    expect(logSpy).toHaveBeenCalledWith("pass-through: 502 => down");
  });

  test("origin 530 + Accept text/html → redirect GitHub", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 530 }));
    const res = await freshWorker.fetch(
      page({ Accept: "text/html,application/xhtml+xml,*/*;q=0.8" })
    );
    expectRedirect(res, GITHUB);
  });

  test("origin 502 cho asset (Accept image/png) → trả nguyên 502", async () => {
    const origin = new Response("Bad Gateway", { status: 502 });
    fetchMock.mockResolvedValue(origin);
    const res = await freshWorker.fetch(
      new Request("https://portfolio.yamiannephilim.com/skills/AWS.png", {
        headers: { Accept: "image/png", "Sec-Fetch-Mode": "no-cors" },
      })
    );
    expect(res).toBe(origin);
    expect(res.status).toBe(502);
  });

  test("origin không kết nối được + điều hướng trang → redirect GitHub", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network connection lost."));
    const res = await freshWorker.fetch(page({ "Sec-Fetch-Mode": "navigate" }));
    expectRedirect(res, GITHUB);
    expect(logSpy).toHaveBeenCalledWith(
      "pass-through: TypeError: Network connection lost. => down"
    );
  });

  test("origin không kết nối được + asset → 502 no-store (không redirect)", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network connection lost."));
    const res = await freshWorker.fetch(
      new Request("https://portfolio.yamiannephilim.com/assets/index.js", {
        headers: { Accept: "*/*", "Sec-Fetch-Mode": "no-cors" },
      })
    );
    expect(res.status).toBe(502);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  test("POST bị 502 → trả nguyên 502 (chỉ GET mới redirect)", async () => {
    const origin = new Response(null, { status: 502 });
    fetchMock.mockResolvedValue(origin);
    const res = await freshWorker.fetch(
      new Request("https://portfolio.yamiannephilim.com/", {
        method: "POST",
        headers: { Accept: "text/html" },
      })
    );
    expect(res).toBe(origin);
  });

  test("asset 200 (có thể là bản cache ở edge) không ghi đè memo 'down'", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 502 }));
    await freshWorker.fetch(page({ Accept: "text/html" }));
    fetchMock.mockResolvedValue(new Response("png", { status: 200 }));
    await freshWorker.fetch(page({ Accept: "image/png" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Memo vẫn "down" ⇒ apex về GitHub mà không cần probe.
    expectRedirect(
      await freshWorker.fetch(new Request("https://yamiannephilim.com/")),
      GITHUB
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("kết quả quan sát được cập nhật memo cho apex (không cần probe)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 502 }));
    await freshWorker.fetch(page({ Accept: "text/html" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expectRedirect(
      await freshWorker.fetch(new Request("https://yamiannephilim.com/")),
      GITHUB
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue(new Response("ok", { status: 200 }));
    await freshWorker.fetch(page({ Accept: "text/html" }));
    expectRedirect(
      await freshWorker.fetch(new Request("https://yamiannephilim.com/")),
      PORTFOLIO
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("lỗi bất ngờ và default export", () => {
  test("request hỏng (URL không hợp lệ) → fallback portfolio, không probe", async () => {
    const res = await freshWorker.fetch({
      url: "không phải URL",
      method: "GET",
      headers: new Headers(),
    });
    expectRedirect(res, PORTFOLIO);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("default export là handler có memo cấp module (isolate)", async () => {
    vi.resetModules();
    const { default: isolateWorker } = await import("./redirect-worker.js");
    probeReturns(200);
    expectRedirect(
      await isolateWorker.fetch(new Request("https://yamiannephilim.com/")),
      PORTFOLIO
    );
    expectRedirect(
      await isolateWorker.fetch(new Request("https://www.yamiannephilim.com/")),
      PORTFOLIO
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("default export xử lý wedding-card", async () => {
    const res = await worker.fetch(
      new Request("https://www.yamiannephilim.com/wedding-card")
    );
    expectRedirect(res, WEDDING_CARD);
  });
});

describe("hàm phụ trợ", () => {
  test("isOriginDownStatus chỉ đúng với nhóm status 'không tới được origin'", () => {
    for (const status of DOWN_STATUSES) {
      expect(isOriginDownStatus(status)).toBe(true);
    }
    for (const status of [200, 204, 301, 304, 400, 403, 404, 500, 501, 527]) {
      expect(isOriginDownStatus(status)).toBe(false);
    }
  });

  test("isPageNavigation: navigate hoặc Accept text/html, chỉ với GET", () => {
    const url = "https://portfolio.yamiannephilim.com/";
    expect(
      isPageNavigation(
        new Request(url, { headers: { "Sec-Fetch-Mode": "navigate" } })
      )
    ).toBe(true);
    expect(
      isPageNavigation(new Request(url, { headers: { Accept: "text/html" } }))
    ).toBe(true);
    expect(
      isPageNavigation(new Request(url, { headers: { Accept: "image/png" } }))
    ).toBe(false);
    expect(isPageNavigation(new Request(url))).toBe(false);
    expect(
      isPageNavigation(
        new Request(url, {
          method: "HEAD",
          headers: { "Sec-Fetch-Mode": "navigate" },
        })
      )
    ).toBe(false);
  });
});
