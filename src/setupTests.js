// Tóm tắt: Nạp matcher jest-dom cho Vitest + mock IntersectionObserver cho react-awesome-reveal trong jsdom.
import "@testing-library/jest-dom";

// jsdom không có IntersectionObserver mà react-awesome-reveal (react-intersection-observer) cần.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserver;
  globalThis.IntersectionObserverEntry = function () {};
}
