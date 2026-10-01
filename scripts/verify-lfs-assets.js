// Tóm tắt: Chặn build (Docker/CI) nếu asset nhị phân trong public/ hoặc src/assests/ là file con trỏ Git LFS.
// Repo không còn dùng Git LFS (hạn mức tài khoản đã hết, mọi asset đều nhỏ và lưu dạng blob Git thường),
// nên gặp con trỏ LFS nghĩa là checkout hỏng/cũ (từ commit trước khi bỏ LFS), không phải do thiếu `git lfs pull`.
const fs = require("fs");
const path = require("path");

const assetRoots = ["public", path.join("src", "assests")];
const binaryExtensions = new Set([
  ".eot",
  ".gif",
  ".ico",
  ".jpg",
  ".jpeg",
  ".otf",
  ".pdf",
  ".png",
  ".svg",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2",
]);
const lfsPointerMarker = "version https://git-lfs.github.com/spec/v1";

function walkFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const currentPath = path.join(root, entry.name);
    return entry.isDirectory() ? walkFiles(currentPath) : [currentPath];
  });
}

const unresolvedAssets = assetRoots
  .flatMap(walkFiles)
  .filter((filePath) =>
    binaryExtensions.has(path.extname(filePath).toLowerCase())
  )
  .filter((filePath) => {
    const handle = fs.openSync(filePath, "r");
    try {
      const buffer = Buffer.alloc(lfsPointerMarker.length);
      fs.readSync(handle, buffer, 0, buffer.length, 0);
      return buffer.toString("utf8") === lfsPointerMarker;
    } finally {
      fs.closeSync(handle);
    }
  });

if (unresolvedAssets.length > 0) {
  console.error(
    "Found Git LFS pointer files instead of real assets. This repo no longer uses Git LFS (all binaries are plain Git blobs), so the checkout is broken or predates the LFS removal: check out a current commit again."
  );
  unresolvedAssets
    .slice(0, 20)
    .forEach((filePath) => console.error(`- ${filePath}`));
  if (unresolvedAssets.length > 20) {
    console.error(`...and ${unresolvedAssets.length - 20} more files.`);
  }
  process.exit(1);
}

console.log("Asset check passed: no Git LFS pointer files.");
