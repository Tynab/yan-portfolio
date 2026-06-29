const fs = require("fs");
const path = require("path");

const assetRoots = ["public", path.join("src", "assests")];
const binaryExtensions = new Set([
  ".eot",
  ".gif",
  ".ico",
  ".jpg",
  ".jpeg",
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
    "Git LFS assets are not resolved. Run `git lfs install` and `git lfs pull` before building Docker."
  );
  unresolvedAssets
    .slice(0, 20)
    .forEach((filePath) => console.error(`- ${filePath}`));
  if (unresolvedAssets.length > 20) {
    console.error(`...and ${unresolvedAssets.length - 20} more files.`);
  }
  process.exit(1);
}

console.log("Git LFS asset check passed.");
