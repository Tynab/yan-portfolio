#!/usr/bin/env python3
# Tóm tắt: Sinh toàn bộ icon của site (favicon, apple-touch, android/manifest, ms-tile) từ một ảnh
# nguồn (ảnh cá nhân của chủ site), mặc định ghi vào public/icons/.
r"""Sinh bộ icon của portfolio từ MỘT ảnh nguồn (ảnh cá nhân của chủ site, ví dụ avatar.jpg).

Yêu cầu: Python 3.8+ và Pillow >= 9.1 (`pip install Pillow`).

Cách dùng:
    python3 scripts/generate-icons.py <ảnh-nguồn> [--out public/icons] [--focus x,y] [--zoom Z]
                                       [--background "#ffffff"] [--only tên1,tên2,...]

Ví dụ:
    # Linux/macOS, chạy ở thư mục gốc repo:
    python3 scripts/generate-icons.py ~/Pictures/avatar.jpg
    # Windows (PowerShell), ảnh nằm ở C:\Users\Tynab\Pictures\avatar.jpg:
    py scripts\generate-icons.py C:\Users\Tynab\Pictures\avatar.jpg
    # Khuôn mặt nằm hơi cao trong ảnh dọc: dời tâm cắt lên và phóng to 1.3 lần:
    python3 scripts/generate-icons.py avatar.jpg --focus 0.5,0.38 --zoom 1.3
    # Thử trước vào thư mục nháp, xem kết quả rồi mới ghi đè public/icons:
    python3 scripts/generate-icons.py avatar.jpg --out /tmp/icons-preview
    # Chỉ sinh lại một vài file:
    python3 scripts/generate-icons.py avatar.jpg --only android-icon-512x512.png,favicon.ico

Tham số:
    <ảnh-nguồn>    Ảnh bất kỳ Pillow đọc được (JPG, PNG, WebP...). Nên vuông hoặc gần vuông và
                   cạnh ngắn >= 512px; nhỏ hơn vẫn chạy nhưng các size lớn bị phóng to (có cảnh báo).
    --out          Thư mục ghi icon (mặc định: public/icons của repo chứa script).
    --focus x,y    Tâm vùng cắt vuông, tính theo tỉ lệ 0..1 của chiều rộng/cao ảnh (mặc định 0.5,0.5 =
                   cắt giữa). Vùng cắt luôn được giữ trong ảnh, nên tâm sát mép sẽ bị đẩy vào trong.
    --zoom Z       Phóng to vùng cắt (Z >= 1): cạnh vùng cắt = cạnh ngắn của ảnh / Z. Mặc định 1
                   (lấy hình vuông lớn nhất). Ảnh chân dung nên dùng 1.2-1.6 để khuôn mặt rõ ở 16-32px.
    --background   Màu nền dùng để làm phẳng ảnh có alpha cho icon Apple (iOS không hỗ trợ trong suốt,
                   phần trong suốt sẽ thành đen). Mặc định #ffffff. Ảnh JPG không có alpha nên không ảnh hưởng.
    --only         Chỉ sinh các file được liệt kê (tên file, cách nhau bởi dấu phẩy).

Xử lý ảnh:
    - Xoay theo EXIF Orientation (ảnh chụp điện thoại), chuyển về sRGB nếu ảnh có ICC profile
      (vd. Display P3 của iPhone), rồi cắt vuông theo --focus/--zoom.
    - Mỗi size được thu nhỏ TRỰC TIẾP từ ảnh gốc bằng Lanczos (không thu nhỏ dây chuyền), PNG được ghi
      với optimize=True; favicon.ico chứa 3 khung 16, 32, 48 được render riêng.
    - KHÔNG chép metadata (EXIF, GPS, ICC) sang icon: ảnh cá nhân thường chứa vị trí chụp.

Danh sách file sinh ra khớp với index.html và public/manifest.json (tên cố định, xem ICON_SPECS).
Cuối mỗi lần chạy, script đối chiếu các đường dẫn /icons/... trong index.html và manifest.json với
danh sách này và cảnh báo nếu có file được tham chiếu mà script không sinh.
"""

import argparse
import io
import json
import os
import re
import sys

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover - chỉ chạy khi thiếu Pillow
    sys.exit("Thiếu Pillow. Cài bằng: pip install Pillow")

try:
    from PIL import ImageCms
except ImportError:  # Pillow build không có LittleCMS: bỏ qua bước chuyển sRGB.
    ImageCms = None

LANCZOS = getattr(Image, "Resampling", Image).LANCZOS
# Intent.PERCEPTUAL (Pillow >= 10) hoặc hằng số cũ; giá trị đều là 0.
PERCEPTUAL = getattr(getattr(ImageCms, "Intent", None), "PERCEPTUAL", 0)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_OUT = os.path.join(REPO_ROOT, "public", "icons")

# (tên file, cạnh px, nhóm). Nhóm "apple" được làm phẳng alpha lên --background.
ICON_SPECS = (
    [(f"apple-icon-{n}x{n}.png", n, "apple") for n in (57, 60, 72, 76, 114, 120, 144, 152, 180)]
    + [("apple-icon.png", 192, "apple"), ("apple-icon-precomposed.png", 192, "apple")]
    + [(f"android-icon-{n}x{n}.png", n, "android") for n in (36, 48, 72, 96, 144, 192, 512)]
    + [(f"favicon-{n}x{n}.png", n, "favicon") for n in (16, 32, 96)]
    + [(f"ms-icon-{n}x{n}.png", n, "ms") for n in (70, 144, 150, 310)]
)
ICO_NAME = "favicon.ico"
ICO_SIZES = (16, 32, 48)
ALL_NAMES = [name for name, _, _ in ICON_SPECS] + [ICO_NAME]


def parse_focus(value):
    """Đọc chuỗi "x,y" (0..1) thành tuple float."""
    try:
        x, y = (float(part) for part in value.split(","))
    except ValueError:
        raise argparse.ArgumentTypeError("--focus phải có dạng x,y, ví dụ 0.5,0.4")
    if not (0 <= x <= 1 and 0 <= y <= 1):
        raise argparse.ArgumentTypeError("--focus: x và y phải nằm trong 0..1")
    return x, y


def parse_zoom(value):
    """Đọc hệ số phóng (>= 1)."""
    zoom = float(value)
    if zoom < 1:
        raise argparse.ArgumentTypeError("--zoom phải >= 1")
    return zoom


def parse_color(value):
    """Đọc màu #rgb/#rrggbb thành tuple RGB."""
    match = re.fullmatch(r"#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", value.strip())
    if not match:
        raise argparse.ArgumentTypeError("--background phải là mã màu hex, ví dụ #ffffff")
    hex_value = match.group(1)
    if len(hex_value) == 3:
        hex_value = "".join(ch * 2 for ch in hex_value)
    return tuple(int(hex_value[i : i + 2], 16) for i in (0, 2, 4))


def to_srgb(image):
    """Chuẩn hoá mode (RGB/RGBA) và chuyển màu về sRGB nếu ảnh có ICC profile."""
    has_alpha = image.mode in ("RGBA", "LA", "PA", "La", "RGBa") or "transparency" in image.info
    icc = image.info.get("icc_profile")
    alpha = image.convert("RGBA").getchannel("A") if has_alpha else None

    if icc and ImageCms is not None:
        try:
            source = image if image.mode in ("RGB", "CMYK", "L") else image.convert("RGB")
            source_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            srgb_profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))
            rgb = ImageCms.profileToProfile(
                source,
                source_profile,
                srgb_profile,
                renderingIntent=PERCEPTUAL,
                outputMode="RGB",
            )
        except (ImageCms.PyCMSError, OSError, ValueError) as error:
            print(f"Cảnh báo: không áp dụng được ICC profile ({error}); dùng màu gốc.", file=sys.stderr)
            rgb = image.convert("RGB")
    else:
        if icc and ImageCms is None:
            print("Cảnh báo: Pillow không có ImageCms, bỏ qua chuyển đổi sRGB.", file=sys.stderr)
        rgb = image.convert("RGB")

    if alpha is not None and alpha.getextrema() != (255, 255):
        rgb.putalpha(alpha)
    # Bỏ toàn bộ metadata (EXIF/GPS, ICC đã áp dụng...) để không bị chép sang icon.
    rgb.info = {}
    return rgb


def square_box(width, height, focus, zoom):
    """Tính hộp cắt vuông (float) quanh tâm focus, luôn nằm trong ảnh."""
    side = min(width, height) / zoom
    center_x, center_y = focus[0] * width, focus[1] * height
    left = min(max(center_x - side / 2, 0), width - side)
    top = min(max(center_y - side / 2, 0), height - side)
    return (left, top, left + side, top + side), side


def render(image, box, size, background=None):
    """Thu nhỏ/phóng vùng box về size x size bằng Lanczos; làm phẳng alpha nếu có background."""
    # resize(box=...) cắt và co giãn trong một bước, giữ độ chính xác sub-pixel của hộp cắt.
    out = image.resize((size, size), LANCZOS, box=box)
    if background is not None and out.mode == "RGBA":
        flat = Image.new("RGB", out.size, background)
        flat.paste(out, mask=out.getchannel("A"))
        out = flat
    return out


def referenced_icons():
    """Tên file icon được index.html và public/manifest.json tham chiếu (/icons/<tên>)."""
    names = set()
    index_path = os.path.join(REPO_ROOT, "index.html")
    if os.path.exists(index_path):
        with open(index_path, encoding="utf-8") as handle:
            # Bắt mọi tham chiếu /icons/... (tương đối hay URL tuyệt đối); og:image giờ là /og-image.png, không thuộc icons.
            names.update(re.findall(r"/icons/([A-Za-z0-9._-]+)", handle.read()))
    manifest_path = os.path.join(REPO_ROOT, "public", "manifest.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as handle:
            for icon in json.load(handle).get("icons", []):
                src = icon.get("src", "")
                if "/icons/" in src:
                    names.add(src.rsplit("/icons/", 1)[1])
    return names


def main(argv=None):
    # Console/pipe trên Windows có thể không phải UTF-8: thay ký tự không in được thay vì crash.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(errors="replace")

    parser = argparse.ArgumentParser(
        description="Sinh toàn bộ icon site (favicon, apple-touch, android, ms-tile) từ một ảnh nguồn."
    )
    parser.add_argument("source", help="Ảnh nguồn, ví dụ avatar.jpg")
    parser.add_argument("--out", default=DEFAULT_OUT, help="Thư mục ghi icon (mặc định public/icons)")
    parser.add_argument("--focus", type=parse_focus, default=(0.5, 0.5), help="Tâm vùng cắt x,y trong 0..1")
    parser.add_argument("--zoom", type=parse_zoom, default=1.0, help="Phóng vùng cắt (>= 1)")
    parser.add_argument(
        "--background", type=parse_color, default=(255, 255, 255), help="Nền cho icon Apple (#rrggbb)"
    )
    parser.add_argument("--only", help="Chỉ sinh các file này (cách nhau bởi dấu phẩy)")
    args = parser.parse_args(argv)

    wanted = set(ALL_NAMES)
    if args.only:
        wanted = {name.strip() for name in args.only.split(",") if name.strip()}
        unknown = sorted(wanted - set(ALL_NAMES))
        if unknown:
            parser.error(f"--only có tên không hỗ trợ: {', '.join(unknown)}. Hỗ trợ: {', '.join(ALL_NAMES)}")

    try:
        with Image.open(args.source) as opened:
            opened.load()
            image = ImageOps.exif_transpose(opened)
            if "icc_profile" in opened.info and "icc_profile" not in image.info:
                image.info["icc_profile"] = opened.info["icc_profile"]
    except (OSError, ValueError) as error:
        sys.exit(f"Không đọc được ảnh nguồn '{args.source}': {error}")

    image = to_srgb(image)
    box, side = square_box(image.width, image.height, args.focus, args.zoom)
    print(
        f"Nguồn: {args.source} ({image.width}x{image.height}, {image.mode}); "
        f"vùng cắt vuông {side:.0f}px tại ({box[0]:.0f},{box[1]:.0f})."
    )

    os.makedirs(args.out, exist_ok=True)
    upscaled = []
    written = []

    for name, size, group in ICON_SPECS:
        if name not in wanted:
            continue
        if size > side:
            upscaled.append(name)
        icon = render(image, box, size, args.background if group == "apple" else None)
        path = os.path.join(args.out, name)
        icon.save(path, "PNG", optimize=True, icc_profile=None)
        written.append((name, f"{size}x{size}", os.path.getsize(path)))

    if ICO_NAME in wanted:
        frames = {size: render(image, box, size) for size in ICO_SIZES}
        largest = max(ICO_SIZES)
        path = os.path.join(args.out, ICO_NAME)
        # Khung lớn nhất làm ảnh chính; các khung nhỏ truyền qua append_images để Pillow dùng đúng
        # bản đã render bằng Lanczos thay vì tự thumbnail lại.
        frames[largest].save(
            path,
            "ICO",
            sizes=[(size, size) for size in ICO_SIZES],
            append_images=[frames[size] for size in ICO_SIZES if size != largest],
        )
        with Image.open(path) as check:
            got = sorted(check.info.get("sizes", set()))
        if got != [(size, size) for size in ICO_SIZES]:
            sys.exit(f"favicon.ico sinh ra thiếu khung: {got}")
        written.append((ICO_NAME, "+".join(str(size) for size in ICO_SIZES), os.path.getsize(path)))

    for name, dims, size_bytes in written:
        print(f"  {name:32s} {dims:>9s} {size_bytes:>8d} B")
    print(f"Đã ghi {len(written)} file vào {args.out}")

    if upscaled:
        print(
            f"Cảnh báo: vùng cắt chỉ {side:.0f}px nên {len(upscaled)} file bị phóng to (mờ hơn): "
            f"{', '.join(upscaled)}. Nên dùng ảnh nguồn có cạnh ngắn >= 512px (sau khi chia --zoom).",
            file=sys.stderr,
        )

    missing = sorted(referenced_icons() - set(ALL_NAMES))
    if missing:
        print(
            "Cảnh báo: index.html/manifest.json tham chiếu icon mà script không sinh: " + ", ".join(missing),
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
