// Tóm tắt: Test biên cho logic khung giờ của Cloudflare Worker redirect (23:30/08:30 giờ VN)
// và test end-to-end handler fetch mặc định (mock giờ bằng vitest fake timers).
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import worker, {
  isNightInVietnam,
  minutesOfDayInVietnam,
} from "./redirect-worker.js";

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

describe("worker.fetch — end-to-end với thời gian giả lập (vitest fake timers)", () => {
  const DAY_TIME = new Date("2026-07-03T05:00:00Z"); // 12:00 VN — ban ngày
  const NIGHT_TIME = new Date("2026-07-03T16:30:00Z"); // 23:30 VN — ban đêm

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("wedding-card trên www lúc ban ngày → luôn về Yami-Buzzy", async () => {
    vi.setSystemTime(DAY_TIME);
    const res = await worker.fetch(
      new Request("https://www.yamiannephilim.com/wedding-card")
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://tynab.github.io/Yami-Buzzy"
    );
  });

  test("wedding-card trên www lúc ban đêm → vẫn về Yami-Buzzy (24/7)", async () => {
    vi.setSystemTime(NIGHT_TIME);
    const res = await worker.fetch(
      new Request("https://www.yamiannephilim.com/wedding-card")
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://tynab.github.io/Yami-Buzzy"
    );
  });

  // DAY_TARGET là origin trần (không có path) nên URL/Response.redirect chuẩn hóa
  // thêm "/" ở cuối theo spec WHATWG — hành vi này giống hệt trên Cloudflare thật.
  test("www trang chủ lúc ban ngày → portfolio", async () => {
    vi.setSystemTime(DAY_TIME);
    const res = await worker.fetch(
      new Request("https://www.yamiannephilim.com/")
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://portfolio.yamiannephilim.com/"
    );
  });

  test("apex kèm path/query lúc ban ngày → portfolio, không mang theo path/query", async () => {
    vi.setSystemTime(DAY_TIME);
    const res = await worker.fetch(
      new Request("https://yamiannephilim.com/any/path?q=1")
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://portfolio.yamiannephilim.com/"
    );
  });

  test("apex trang chủ lúc ban đêm (23:30 VN) → GitHub", async () => {
    vi.setSystemTime(NIGHT_TIME);
    const res = await worker.fetch(new Request("https://yamiannephilim.com/"));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://github.com/Tynab");
  });

  test("wedding-card trên apex (không phải www) lúc ban ngày → không áp dụng ngoại lệ, về portfolio", async () => {
    vi.setSystemTime(DAY_TIME);
    const res = await worker.fetch(
      new Request("https://yamiannephilim.com/wedding-card")
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://portfolio.yamiannephilim.com/"
    );
  });
});
