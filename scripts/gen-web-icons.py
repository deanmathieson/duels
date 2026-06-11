"""
gen-web-icons.py — derive the site's web icons + social image from card art.

Source: public/assets/treasures/tr_jp_great_waking.jpg (The Great Waking).
Outputs (public/):
  og-image.jpg        1200x630  (og:/twitter: card)
  icon-512.png        512x512   (PWA manifest)
  icon-192.png        192x192   (PWA manifest)
  apple-touch-icon.png 180x180
  favicon.png         48x48

Run with the art venv python:  python scripts/gen-web-icons.py
"""

from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
SRC = PUB / "assets" / "treasures" / "tr_jp_great_waking.jpg"


def cover_crop(img: Image.Image, w: int, h: int) -> Image.Image:
    """Scale-to-cover then center-crop to exactly w x h."""
    scale = max(w / img.width, h / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (resized.width - w) // 2
    top = (resized.height - h) // 2
    return resized.crop((left, top, left + w, top + h))


def main() -> None:
    src = Image.open(SRC).convert("RGB")

    # Social card: a cinematic 1200x630 band, slightly punched up.
    og = cover_crop(src, 1200, 630)
    og = ImageEnhance.Contrast(og).enhance(1.06)
    og.save(PUB / "og-image.jpg", quality=88)

    # Square icons at the standard sizes.
    square = cover_crop(src, 512, 512)
    square.save(PUB / "icon-512.png")
    square.resize((192, 192), Image.LANCZOS).save(PUB / "icon-192.png")
    square.resize((180, 180), Image.LANCZOS).save(PUB / "apple-touch-icon.png")
    square.resize((48, 48), Image.LANCZOS).save(PUB / "favicon.png")

    print("wrote og-image.jpg, icon-512/192, apple-touch-icon, favicon")


if __name__ == "__main__":
    main()
