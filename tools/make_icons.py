"""Draw the Home Screen icons (a crosshair on a dark square) with the standard library only.

Usage: python tools/make_icons.py    (writes icons/icon-180.png, icon-192.png, icon-512.png)
"""
import math
import os
import struct
import zlib

BACKGROUND = (29, 42, 69)
RING = (241, 239, 232)
DOT = (226, 87, 76)


def pixel(x, y, size):
    c = (size - 1) / 2
    dx, dy = x - c, y - c
    r = math.hypot(dx, dy)
    s = size
    if r < 0.05 * s:
        return DOT
    if abs(r - 0.31 * s) < 0.03 * s:
        return RING
    on_cross = (abs(dx) < 0.02 * s or abs(dy) < 0.02 * s) and 0.12 * s < r < 0.42 * s
    return RING if on_cross else BACKGROUND


def png(size):
    rows = b"".join(
        b"\x00" + b"".join(bytes(pixel(x, y, size)) + b"\xff" for x in range(size)) for y in range(size)
    )

    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(rows, 9)) + chunk(b"IEND", b"")


def main():
    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")
    os.makedirs(out, exist_ok=True)
    for size in (180, 192, 512):
        with open(os.path.join(out, f"icon-{size}.png"), "wb") as f:
            f.write(png(size))
        print(f"icons/icon-{size}.png")


if __name__ == "__main__":
    main()
