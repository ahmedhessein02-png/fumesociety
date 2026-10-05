"""Parse the FumeSociety price-list PDF into catalog/products.json and packshots."""

import json
import re
import unicodedata
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "catalog" / "FumeSociety-Product.pdf"
OUT_JSON = ROOT / "catalog" / "products.json"
IMAGE_DIR = ROOT / "catalog" / "images"

FEATURED = [
    ("Creed", "CREED AVENTUS", "100ML", 1),
    ("Dior", "Dior Homme Intense Dior", "100ml", 2),
    ("Tom Ford", "Tobacco Vanille Tom Ford", "50ml", 3),
    ("Amouage", "Guidance Amouage EDP", "100ml", 4),
    ("Xerjoff", "XJ 1861 Naxos Xerjoff", "100ml", 5),
]


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value)
    text = text.encode("ascii", "ignore").decode()
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "product"


def clean_label(brand: str, name: str) -> str:
    label = re.sub(r"\s+", " ", name).strip()
    brand_pattern = re.compile(re.escape(brand), re.IGNORECASE)

    def strip_edge(pattern_side: str) -> str | None:
        if pattern_side == "suffix":
            match = re.search(rf"(?i)(?:\s*[-–]\s*|\s+){re.escape(brand)}\s*$", label)
        else:
            match = re.search(rf"(?i)^{re.escape(brand)}(?:\s*[-–]\s*|\s+)", label)
        if not match:
            return None
        return (label[: match.start()] + label[match.end() :]).strip(" -–")

    stripped = strip_edge("suffix") or strip_edge("prefix")
    if stripped:
        label = stripped
    else:
        match = None
        for found in brand_pattern.finditer(label):
            match = found
        if match:
            label = (label[: match.start()] + label[match.end() :]).strip(" -–")
    label = re.sub(r"\s+", " ", label).strip(" -–")
    return label or name


def parse_details(text: str) -> tuple[str | None, str | None, dict, str]:
    raw = re.sub(r"\s+", " ", text).strip()
    raw = re.sub(r"\b(Top|Middle|Base|Main):(?=\S)", r"\1: ", raw)
    family = None
    audience = None
    rest = raw
    match = re.match(r"^(.*?)\s+•\s+For (women and men|women|men)\b\s*(.*)$", raw)
    if match:
        family = match.group(1).strip() or None
        audience = match.group(2)
        rest = match.group(3).strip()
    notes = {}
    parts = re.split(r"\b(Top|Middle|Base|Main)\s*:\s*", rest)
    index = 1
    while index + 1 < len(parts):
        value = parts[index + 1].strip(" ,")
        if value:
            notes[parts[index].lower()] = value
        index += 2
    return family, audience, notes, raw


def parse_pdf(path: Path) -> list[dict]:
    doc = pymupdf.open(path)
    products = []
    order = 0
    for page_number, page in enumerate(doc, start=1):
        images = sorted(page.get_image_info(xrefs=True), key=lambda image: image["bbox"][1])
        lines = []
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                text = "".join(span["text"] for span in line["spans"]).strip()
                if not text:
                    continue
                lines.append(
                    {
                        "x": line["bbox"][0],
                        "y": line["bbox"][1],
                        "size": line["spans"][0]["size"],
                        "text": text,
                    }
                )
        centers = [(image["bbox"][1] + image["bbox"][3]) / 2 for image in images]
        for index, image in enumerate(images):
            center = centers[index]
            top = 0 if index == 0 else (centers[index - 1] + center) / 2
            bottom = 9999 if index == len(centers) - 1 else (center + centers[index + 1]) / 2
            row = [
                line
                for line in lines
                if top <= line["y"] < bottom
                and line["y"] < 570
                and line["text"] not in {"PHOTO", "BRAND AND PRODUCT", "SIZE AND PRICE", "FRAGRANCE DETAILS"}
            ]
            name_lines = sorted((line for line in row if 140 <= line["x"] < 330), key=lambda line: line["y"])
            size_lines = sorted((line for line in row if 330 <= line["x"] < 430), key=lambda line: line["y"])
            detail_lines = sorted((line for line in row if line["x"] >= 430), key=lambda line: line["y"])
            brand_lines = [line["text"] for line in name_lines if abs(line["size"] - 9) < 0.3]
            title_lines = [line["text"] for line in name_lines if abs(line["size"] - 10) < 0.3]
            brand = brand_lines[-1].strip() if brand_lines else ""
            name = " ".join(brand_lines[:-1] + title_lines).strip()
            variants = []
            size_buffer = []
            for line in size_lines:
                if line["text"].startswith("$"):
                    variants.append(
                        {
                            "size": " ".join(size_buffer).strip(),
                            "price": float(line["text"].replace("$", "").replace(",", "")),
                        }
                    )
                    size_buffer = []
                else:
                    size_buffer.append(line["text"])
            if size_buffer:
                variants.append({"size": " ".join(size_buffer).strip(), "price": None})
            family, audience, notes, details = parse_details(" ".join(line["text"] for line in detail_lines))
            order += 1
            products.append(
                {
                    "order": order,
                    "brand": brand,
                    "name": name,
                    "label": clean_label(brand, name),
                    "variants": variants,
                    "family": family,
                    "audience": audience,
                    "notes": notes,
                    "details": details,
                    "image_xref": image["xref"],
                    "page": page_number,
                }
            )
    return products


def main() -> None:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    products = parse_pdf(PDF)
    doc = pymupdf.open(PDF)
    used_ids = set()
    missing_price = 0
    for product in products:
        base = slugify(f"{product['brand']}-{product['label']}")
        product_id = base
        if product_id in used_ids:
            price = product["variants"][0]["price"] if product["variants"] else None
            product_id = f"{base}-{int(price)}" if price is not None else f"{base}-{product['page']}"
        suffix = 2
        while product_id in used_ids:
            product_id = f"{base}-{suffix}"
            suffix += 1
        used_ids.add(product_id)
        image = doc.extract_image(product["image_xref"])
        filename = f"{product_id}.jpg"
        (IMAGE_DIR / filename).write_bytes(image["image"])
        product["id"] = product_id
        product["image"] = f"catalog/images/{filename}"
        del product["image_xref"]
        if any(variant["price"] is None for variant in product["variants"]):
            missing_price += 1
        featured = next(
            (item for item in FEATURED if item[0] == product["brand"] and item[1] == product["name"]),
            None,
        )
        if featured:
            product["featured"] = True
            product["featuredSize"] = featured[2]
            product["featuredOrder"] = featured[3]

    products.sort(key=lambda product: product["order"])

    payload = {
        "house": "FumeSociety",
        "updated": "2026-09-28",
        "currency": "USD",
        "source": "Available Product Catalog, 28 Sep 2026",
        "cover": {"products": 1408, "variants": 1494},
        "counts": {
            "products": len(products),
            "variants": sum(len(product["variants"]) for product in products),
            "brands": len({product["brand"] for product in products}),
        },
        "products": products,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(payload["counts"]))
    print("missing prices", missing_price)
    featured = [product for product in products if product.get("featured")]
    print("featured", [(product["id"], product["featuredSize"], product["variants"]) for product in featured])


if __name__ == "__main__":
    main()
