#!/usr/bin/env python3
"""Builds the app/PWA icons from an Inky pose image.

    pip install pillow
    python3 scripts/generate-icons.py              # default pose: book
    python3 scripts/generate-icons.py --pose fly   # the flying pose

Poses live in scripts/icon-source/ (transparent PNGs cut from the Inky
character sheet). To use final artwork later, drop a transparent PNG there,
pass it with --source, and commit the regenerated public/icons/.

Why PNG: iOS ignores SVG home-screen icons, and Android wants 192/512 PNGs.
The maskable icon keeps Inky inside the centre safe zone, because Android
crops it to a circle or squircle.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
POSES = {
    "book": ROOT / "scripts/icon-source/inky-book.png",
    "fly": ROOT / "scripts/icon-source/inky-fly.png",
}

GOLD_CENTRE = (255, 227, 138)  # #ffe38a
GOLD_EDGE = (253, 147, 53)     # #fd9335 (brand orange)


def background(size: int) -> Image.Image:
    """Soft radial gold glow: light in the middle, brand orange at the edges."""
    inner = Image.new("RGB", (size, size), GOLD_CENTRE)
    outer = Image.new("RGB", (size, size), GOLD_EDGE)
    mask = Image.radial_gradient("L").resize((size, size), Image.BICUBIC).point(lambda v: int(v * 0.7))
    return Image.composite(outer, inner, mask).convert("RGBA")


def compose(source: Path, size: int, max_w: float, max_h: float, drop: float) -> Image.Image:
    """Inky fitted inside max_w x max_h (fractions of the icon), centred, then
    moved down by `drop` of the icon, with a soft shadow. Each size is composed
    from the source directly so small icons stay crisp."""
    canvas = background(size)
    art = Image.open(source).convert("RGBA")
    art = art.crop(art.getbbox())
    scale = min(size * max_w / art.width, size * max_h / art.height)
    art = art.resize((max(1, round(art.width * scale)), max(1, round(art.height * scale))), Image.LANCZOS)
    if scale > 1:
        art = art.filter(ImageFilter.UnsharpMask(1.2, 60, 2))

    x = (size - art.width) // 2
    y = (size - art.height) // 2 + round(size * drop)

    shadow = Image.new("RGBA", art.size, (0, 0, 0, 255))
    shadow.putalpha(art.getchannel("A").point(lambda v: int(v * 0.25)))
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    layer.paste(shadow, (x, y + round(size * 0.015)), shadow)
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(max(1, size * 0.012))))
    canvas.alpha_composite(art, (x, y))
    return canvas.convert("RGB")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pose", choices=sorted(POSES), default="book")
    parser.add_argument("--source", type=Path, help="transparent PNG to use instead of a built-in pose")
    parser.add_argument("--out", type=Path, default=ROOT / "public/icons")
    args = parser.parse_args()

    source = args.source or POSES[args.pose]
    args.out.mkdir(parents=True, exist_ok=True)

    # (file, pixel size, max width, max height, vertical drop) as fractions of the icon.
    # Maskable: everything stays well inside the 80% centre circle.
    outputs = [
        ("icon-512.png", 512, 0.80, 0.80, 0.02),
        ("icon-192.png", 192, 0.80, 0.80, 0.02),
        ("icon-maskable-512.png", 512, 0.56, 0.56, 0.0),
        ("apple-touch-icon.png", 180, 0.80, 0.80, 0.02),
        ("favicon-48.png", 48, 0.86, 0.86, 0.02),
    ]
    for name, size, max_w, max_h, drop in outputs:
        compose(source, size, max_w, max_h, drop).save(args.out / name, optimize=True)
        print(f"wrote {args.out / name} ({size}x{size})")


if __name__ == "__main__":
    main()
