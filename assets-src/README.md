# Asset nhị phân: quy ước và cách sinh lại

Tóm tắt: ghi chú cách tạo icon kỹ năng (`public/skills/`) và icon site (`public/icons/`). Repo **không dùng Git LFS** nữa (hạn mức LFS của tài khoản đã hết, mọi asset đều nhỏ): ảnh được commit như blob Git thường, `.gitattributes` chỉ đánh dấu chúng là `binary`. Đừng thêm lại rule `filter=lfs`.

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
- `ms-icon-310x310.png` đồng thời là ảnh `og:image` khi chia sẻ link (Facebook, LinkedIn, Zalo); các nền tảng này cache ảnh preview, có thể cần "scrape lại" sau khi đổi.

**Hiện trạng:** các icon trong `public/icons/` vẫn là bộ cũ. Riêng `android-icon-512x512.png` là bản **tạm** được phóng to từ `ms-icon-310x310.png` (để manifest không trỏ tới file thiếu); chạy script với `avatar.jpg` sẽ thay toàn bộ bộ icon, kể cả file này.
