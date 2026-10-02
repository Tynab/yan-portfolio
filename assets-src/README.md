# Asset nhị phân: quy ước và cách sinh lại

Tóm tắt: ghi chú cách tạo icon kỹ năng (`public/skills/`), icon site (`public/icons/`) và ảnh Open Graph (`public/og-image.png`). Repo **không dùng Git LFS** nữa (hạn mức LFS của tài khoản đã hết, mọi asset đều nhỏ): ảnh được commit như blob Git thường, `.gitattributes` chỉ đánh dấu chúng là `binary`. Đừng thêm lại rule `filter=lfs`.

## Icon kỹ năng (`public/skills/*.webp`)

- Hiển thị cao 48px (`.skill-image`), nên file lưu ở **WebP cao 96px** (2x cho màn hình retina), giữ tỉ lệ và kênh alpha.
- Nén: WebP lossy `quality=85`, `method=6`; dùng **lossless** khi bản lossless không lớn hơn đáng kể (≤ 1.25 lần hoặc chênh ≤ 1 KB) hoặc khi lossy làm nhoè màu ở viền/chữ (PSNR < 32 dB trên nền trắng và nền site `#EDF9FE`, ví dụ chữ trắng trên nền đỏ/tím, logo có chi tiết nhỏ bão hoà màu).
- Thêm icon mới (cần Python 3 + Pillow), từ ảnh gốc PNG/SVG đã xuất ra PNG lớn:

```bash
python3 -c "
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
im = im.resize((round(im.width * 96 / im.height), 96), Image.LANCZOS)
im.save(dst, 'WEBP', quality=85, method=6)  # hoặc lossless=True nếu thấy nhoè màu
" Ten-goc.png public/skills/Ten.webp
```

- Khai báo `imageSrc: "Ten.webp"` trong `src/portfolio.js`. nginx cache `/skills/` dài hạn (`immutable`): nếu **ghi đè** nội dung một file đã có cùng tên thì phải bump `skillAssetVersion` trong `src/components/softwareSkills/SoftwareSkill.js`.

## Icon site (`public/icons/`)

Toàn bộ favicon, apple-touch-icon, icon Android/manifest và ms-tile được sinh từ **ảnh cá nhân của chủ site** bằng `scripts/generate-icons.py` (Python 3 + Pillow, chi tiết tham số trong docstring của script):

```bash
# Linux/macOS, ở thư mục gốc repo
python3 scripts/generate-icons.py ~/Pictures/avatar.jpg
# Windows (PowerShell)
py scripts\generate-icons.py C:\Users\Tynab\Pictures\avatar.jpg
# Chỉnh vùng cắt: tâm (x,y trong 0..1) và độ phóng để khuôn mặt rõ ở 16-32px
python3 scripts/generate-icons.py avatar.jpg --focus 0.5,0.4 --zoom 1.3 --out /tmp/icons-preview
```

- Script cắt vuông, xoay theo EXIF, chuyển về sRGB, thu nhỏ bằng Lanczos, ghi đúng tên/kích thước mà `index.html` và `public/manifest.json` tham chiếu (kể cả `favicon.ico` 16+32+48 và `android-icon-512x512.png`) và **bỏ toàn bộ metadata** (EXIF/GPS) của ảnh gốc.
- Nên dùng ảnh có cạnh ngắn ≥ 512px; nhỏ hơn thì script vẫn chạy nhưng cảnh báo các size bị phóng to.
- Không cần commit ảnh gốc; nếu muốn lưu lại thì đặt trong thư mục này.
- Ảnh `og:image` khi chia sẻ link **không** còn là icon trong thư mục này mà là `public/og-image.png` (xem mục bên dưới); nó dùng `android-icon-512x512.png` làm ảnh chân dung, nên đổi icon thì nhớ chụp lại ảnh OG.

**Hiện trạng:** toàn bộ icon trong `public/icons/` (kể cả `android-icon-512x512.png` và `favicon.ico` 16/32/48) đã được sinh từ `avatar.jpg` của chủ portfolio với `--focus 0.47,0.33 --zoom 2.2`. Ảnh gốc không được commit; muốn đổi icon thì chạy lại script với ảnh mới.

## Ảnh Open Graph (`public/og-image.png`)

- Ảnh preview 1200×630 khi chia sẻ link (Facebook, LinkedIn, Zalo, X); `index.html` khai báo `og:image` = `https://portfolio.yamiannephilim.com/og-image.png` kèm `og:image:width`/`og:image:height`/`og:image:alt` và `twitter:card` = `summary_large_image`.
- Nguồn là template HTML `assets-src/og-image.html`: màu blueTheme (nền `#EDF9FE`, chữ `#001C55`, nhấn `#0E6BA8`), font Google Sans nạp bằng `@font-face` đường dẫn tương đối tới `src/assests/fonts/*.woff2`, ảnh chân dung `public/icons/android-icon-512x512.png` cắt tròn. Chữ trên ảnh: tên, "Yami An · Technical Leader", phụ đề (phải giống `greeting.subTitle` trong `src/portfolio.js`) và domain `portfolio.yamiannephilim.com`.
- Sửa template xong thì chụp lại bằng Chrome headless (Node + `puppeteer-core`, dùng Chrome đã cài sẵn; viewport 1200×630, `deviceScaleFactor: 1`, chờ `document.fonts.ready`, mở file với cờ `--allow-file-access-from-files` để nạp font/ảnh tương đối). Script chụp dùng khi tạo ảnh hiện tại (đặt ngoài repo, chạy trong thư mục có `puppeteer-core`):

```bash
node shot.js "E:/Project/yan-portfolio/assets-src/og-image.html" "E:/Project/yan-portfolio/public/og-image.png" 1200 630
```

```js
// shot.js — chụp một file HTML cục bộ thành PNG: node shot.js <file.html> <out.png> <rộng> <cao>
const puppeteer = require("puppeteer-core");
const [, , file, out, w, h] = process.argv;
(async () => {
  const b = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--allow-file-access-from-files"],
  });
  const p = await b.newPage();
  await p.setViewport({
    width: Number(w),
    height: Number(h),
    deviceScaleFactor: 1,
  });
  await p.goto("file:///" + file, { waitUntil: "networkidle0" });
  await p.evaluate(async () => {
    await document.fonts.ready;
  });
  await p.screenshot({
    path: out,
    clip: { x: 0, y: 0, width: Number(w), height: Number(h) },
  });
  await b.close();
})();
```

- Các nền tảng mạng xã hội cache ảnh preview: sau khi đổi ảnh có thể cần "scrape lại" (Facebook Sharing Debugger, LinkedIn Post Inspector).
