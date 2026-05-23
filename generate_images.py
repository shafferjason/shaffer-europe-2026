#!/usr/bin/env python3
"""
Generate travel-scrapbook images for shaffer-europe-2026 using Google Imagen 4.
Run: python3 generate_images.py
"""

import os
import sys
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

OUTPUT_DIR = Path("/Users/jasonshaffer/code/shaffer-europe-2026/images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    print("ERROR: Neither GEMINI_API_KEY nor GOOGLE_API_KEY is set. Stopping.")
    sys.exit(1)

print(f"API key found ({len(API_KEY)} chars). Using imagen-4.0-generate-001.")

from google import genai
from google.genai import types

client = genai.Client(api_key=API_KEY)
MODEL = "imagen-4.0-generate-001"

IMAGES = [
    {
        "filename": "hero-poster.png",
        "mime": "image/png",
        "aspect_ratio": "16:9",
        "prompt": (
            "Vintage 1930s European travel-poster illustration. "
            "Title 'SHAFFERS ABROAD' in bold Art Deco lettering at the top. "
            "Center: a stylized cruise ship gliding through Mediterranean waves, "
            "white hull with blue accents, sun rising behind it, seagulls overhead, "
            "a distant coastline of pale chalk cliffs and Italian umbrella pines. "
            "Bottom decorative ribbon reads: 'A Mediterranean Voyage 1926.' "
            "Color palette: deep navy, cream, brick red, dusty gold, sea-blue. "
            "Slight paper-grain texture. Flat graphic poster style, no photography."
        ),
    },
    {
        "filename": "paper-bg.jpg",
        "mime": "image/jpeg",
        "aspect_ratio": "1:1",
        "prompt": (
            "Subtle aged cream paper texture, seamlessly tileable, "
            "warm off-white color similar to #f4ead5, very light grain "
            "with occasional fiber specks and faint vellum imperfections. "
            "No strong patterns, no text, no objects. "
            "Clean macro photograph of old paper surface."
        ),
    },
    {
        "filename": "washi-pattern-1.png",
        "mime": "image/png",
        "aspect_ratio": "4:1",
        "prompt": (
            "Horizontal washi tape decorative strip. "
            "Navy blue background with tiny cream-colored nautical anchors "
            "evenly spaced in a repeating row. "
            "Slightly rough painted edges on top and bottom, "
            "hand-crafted Japanese washi tape look. "
            "Flat graphic design, isolated on white, no photography."
        ),
    },
    {
        "filename": "washi-pattern-2.png",
        "mime": "image/png",
        "aspect_ratio": "4:1",
        "prompt": (
            "Horizontal washi tape decorative strip. "
            "Cream or off-white background with thin diagonal red stripes "
            "running at 45 degrees, evenly spaced. "
            "Slightly rough painted edges on top and bottom, "
            "hand-crafted Japanese washi tape look. "
            "Flat graphic design, isolated on white, no photography."
        ),
    },
    {
        "filename": "washi-pattern-3.png",
        "mime": "image/png",
        "aspect_ratio": "4:1",
        "prompt": (
            "Horizontal washi tape decorative strip. "
            "Dusty gold or ochre background with small abstract leaf shapes "
            "in a deeper warm gold, repeating pattern. "
            "Slightly rough painted edges on top and bottom, "
            "hand-crafted Japanese washi tape look. "
            "Flat graphic design, isolated on white, no photography."
        ),
    },
    {
        "filename": "country-stamps.png",
        "mime": "image/png",
        "aspect_ratio": "4:1",
        "prompt": (
            "Five vintage passport-style postage stamps arranged in a horizontal row "
            "on a white background. "
            "Each stamp is square with serrated perforated edges and slightly faded ink, "
            "tilted at a slightly different angle. "
            "Stamp 1 Morocco: mosque dome with crescent, text MAROC 2026. "
            "Stamp 2 Spain: flamenco fan, text ESPANA 2026. "
            "Stamp 3 Portugal: blue-and-white azulejo tile pattern, text PORTUGAL 2026. "
            "Stamp 4 Italy: gondola on canal, text ITALIA 2026. "
            "Stamp 5 France: Eiffel Tower, text FRANCE 2026. "
            "Vintage postage stamp illustration style, aged colors, collector aesthetic."
        ),
    },
    {
        "filename": "gulf-of-med-map.png",
        "mime": "image/png",
        "aspect_ratio": "16:9",
        "prompt": (
            "Hand-drawn watercolor cartographic map of the western Mediterranean Sea. "
            "Cream parchment paper background with sepia and navy ink. "
            "Cruise route shown as a dashed line connecting in order: "
            "Casablanca Morocco, Malaga, Cadiz, Lisbon, Alicante, Menorca, Sardinia, Genoa, Marseille. "
            "Each city labeled in hand-lettered script. "
            "Small vintage ship icon placed mid-route on the dashed line. "
            "Ornate compass rose in the lower-right corner. "
            "Coastal outlines drawn in loose hand-inked style. "
            "Illustrated antique cartography aesthetic, no satellite imagery."
        ),
    },
]

results = []

for img in IMAGES:
    filename = img["filename"]
    out_path = OUTPUT_DIR / filename
    print(f"\nGenerating {filename}...")
    try:
        response = client.models.generate_images(
            model=MODEL,
            prompt=img["prompt"],
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=img["aspect_ratio"],
                output_mime_type=img["mime"],
            ),
        )
        generated = response.generated_images
        if not generated:
            raise ValueError("No images returned in response")

        raw = generated[0].image.image_bytes
        if raw is None:
            raise ValueError("image_bytes is None")

        out_path.write_bytes(raw)
        size_kb = out_path.stat().st_size // 1024
        print(f"  SAVED: {out_path} ({size_kb} KB)")
        results.append(("OK", filename, str(out_path)))

    except Exception as e:
        print(f"  FAILED: {filename} — {e}")
        results.append(("FAIL", filename, str(e)))

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
for status, name, detail in results:
    if status == "OK":
        print(f"  [OK]   {name}")
        print(f"         {detail}")
    else:
        print(f"  [FAIL] {name}")
        print(f"         {detail}")

ok_count = sum(1 for s, _, _ in results if s == "OK")
print(f"\n{ok_count}/{len(results)} images generated successfully.")
