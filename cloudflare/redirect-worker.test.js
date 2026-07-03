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
