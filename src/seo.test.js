// Tóm tắt: Chốt domain production là apex yamiannephilim.com — SEO tĩnh trong index.html, seo.og.url
// (nguồn JSON-LD Person.url) và template ảnh chia sẻ phải cùng một domain, không còn portfolio.*.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { seo } from "./portfolio";

const APEX = "https://yamiannephilim.com/";
const OLD_HOST = "portfolio.yamiannephilim.com";

function read(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf-8");
}

describe("SEO production domain", () => {
  it("uses the apex in seo.og.url", () => {
    expect(seo.og.url).toBe(APEX);
  });

  it("uses the apex for canonical and Open Graph URLs in index.html", () => {
    const html = read("index.html");

    expect(html).toContain(`<link rel="canonical" href="${APEX}" />`);
    expect(html).toContain(`<meta property="og:url" content="${APEX}" />`);
    expect(html).toContain(
      `<meta property="og:image" content="${APEX}og-image.png" />`
    );
    expect(html).not.toContain(OLD_HOST);
  });

  it("prints the apex domain on the share-card template", () => {
    const template = read("assets-src/og-image.html");

    expect(template).toContain("yamiannephilim.com");
    expect(template).not.toContain(OLD_HOST);
  });

  it("does not reference the retired portfolio subdomain in production sources", () => {
    for (const file of [
      "src/portfolio.js",
      "public/manifest.json",
      "public/robots.txt",
    ]) {
      expect(read(file)).not.toContain(OLD_HOST);
    }
  });
});
