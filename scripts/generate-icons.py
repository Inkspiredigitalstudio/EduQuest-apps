#!/usr/bin/env python3
"""Builds the app/PWA icons from the Inky character image.

    pip install pillow
    python3 scripts/generate-icons.py

Reads  src/assets/characters/inky/inky.png  (the same file the app uses for
Inky) and writes PNGs to public/icons/. When the final Inky artwork replaces
that file, run this again and commit the result.

Why PNG: iOS ignores SVG home-screen icons, and Android wants 192/512 PNGs.
The maskable icon keeps Inky inside the centre safe zone, because Android
crops it to a circle/squircle.
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src/assets/characters/inky/inky.png"
OUT = ROOT / "public/icons"

GOLD_CENTRE = (255, 227, 138)  # #ffe38a
GOLD_EDGE = (253, 147, 53)     # #fd9335 (brand orange)


def background(size: int) -> Image.Image:
    """Soft radial gold glow: light in the middle, brand orange at the edges."""
    inner = Image.new("RGB", (size, size), GOLD_CENTRE)
    outer = Image.new("RGB", (size, size), GOLD_EDGE)
    mask = Image.radial_gradient("L").resize((size, size), Image.BICUBIC).point(lambda v: int(v * 0.7))
    return Image.composite(outer, inner, mask).convert("RGBA")


def compose(size: int, height_ratio: float, bottom_ratio: float) -> Image.Image:
    """Inky on the gold background; `height_ratio` of the icon tall, standing
    `bottom_ratio` of the icon above the bottom edge, with a soft shadow."""
    canvas = background(size)
    art = Image.open(SOURCE).convert("RGBA")
    art = art.crop(art.getbbox())
    scale = size * height_ratio / art.height
    art = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
    art = art.filter(ImageFilter.UnsharpMask(1.2, 60, 2))

    x = (size - art.width) // 2
    y = size - art.height - round(size * bottom_ratio)

    shadow = Image.new("RGBA", art.size, (0, 0, 0, 255))
    shadow.putalpha(art.getchannel("A").point(lambda v: int(v * 0.28)))
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    layer.paste(shadow, (x, y + round(size * 0.012)), shadow)
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(size * 0.012)))
    canvas.alpha_composite(art, (x, y))
    return canvas.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Compose big, then downscale: crisper small icons than composing small.
    any_icon = compose(1024, height_ratio=0.74, bottom_ratio=0.09)
    maskable = compose(1024, height_ratio=0.58, bottom_ratio=0.17)

    outputs = {
        "icon-512.png": (any_icon, 512),
        "icon-192.png": (any_icon, 192),
        "icon-maskable-512.png": (maskable, 512),
        "apple-touch-icon.png": (any_icon, 180),
        "favicon-48.png": (any_icon, 48),
    }
    for name, (image, size) in outputs.items():
        image.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
        print(f"wrote public/icons/{name} ({size}x{size})")


if __name__ == "__main__":
    main()
