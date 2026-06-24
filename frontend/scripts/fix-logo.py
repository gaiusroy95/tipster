"""Remove left spike artifacts on the full logo (sudden left protrusions on the T)."""
from PIL import Image

LOGO = r"E:\Work\my task\Betting-Freelancer\frontend\public\assets\logo.png"


def is_logo_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 8:
        return False
    return g > 20 or r + g + b > 45


def clean_logo(path: str) -> None:
    img = Image.open(path).convert("RGBA")
    px = img.load()
    w, h = img.size
    removed = 0

    row_min_x: dict[int, int] = {}
    for y in range(h):
        xs = [
            x
            for x in range(w)
            if is_logo_pixel(*px[x, y]) and x < w // 2
        ]
        if xs:
            row_min_x[y] = min(xs)

    for y, min_x in row_min_x.items():
        prev_min = row_min_x.get(y - 1)
        if prev_min is None or min_x >= prev_min - 2:
            continue
        boundary = prev_min - 1
        for x in range(boundary):
            r, g, b, a = px[x, y]
            if is_logo_pixel(r, g, b, a):
                px[x, y] = (0, 0, 0, 0)
                removed += 1

    img.save(path, optimize=True)
    print(f"{path}: removed {removed} spike pixels")


if __name__ == "__main__":
    clean_logo(LOGO)
