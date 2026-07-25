#!/usr/bin/env python3
"""
Lucky's Learning World — OCR & Spelling Deck Generator CLI
Transforms homework photos or text lists into interactive JSON decks for the web hub.
"""

import sys
import os
import re
import json
import argparse

def extract_words_from_text(text):
    """Extract clean words from raw text or OCR output."""
    raw_words = re.findall(r'\b[a-zA-Z]{2,15}\b', text)
    cleaned = []
    seen = set()
    for w in raw_words:
        w_lower = w.lower()
        if w_lower not in seen:
            seen.add(w_lower)
            cleaned.append(w_lower)
    return cleaned

def process_image_ocr(image_path):
    """Run Tesseract OCR on image to extract text."""
    try:
        from PIL import Image
        import pytesseract
        
        img = Image.open(image_path)
        ocr_text = pytesseract.image_to_string(img)
        print(f"📷 OCR extracted raw text from {image_path}:")
        print("---")
        print(ocr_text[:300])
        print("---")
        return extract_words_from_text(ocr_text)
    except ImportError:
        print("⚠️  Pillow or pytesseract not installed. Install via: pip install Pillow pytesseract")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error performing OCR: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate Lucky Spelling Deck from image or text file.")
    parser.add_argument("input_path", help="Path to input image (jpg/png) or text file (txt)")
    parser.add_argument("--deck-name", default="Homework Challenge Deck", help="Name of the generated deck")
    parser.add_argument("--output", default="content/custom-deck.json", help="Output JSON path")
    
    args = parser.parse_args()

    if not os.path.exists(args.input_path):
        print(f"❌ Input file not found: {args.input_path}")
        sys.exit(1)

    ext = os.path.splitext(args.input_path)[1].lower()
    if ext in ['.jpg', '.jpeg', '.png']:
        words = process_image_ocr(args.input_path)
    else:
        with open(args.input_path, 'r', encoding='utf-8') as f:
            words = extract_words_from_text(f.read())

    print(f"✅ Extracted {len(words)} unique words: {', '.join(words)}")

    deck_json = {
        "id": "custom-homework-deck",
        "name": args.deck_name,
        "grade": "custom",
        "words": [{"word": w, "hint": f"Spell '{w}'", "audio": ""} for w in words]
    }

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(deck_json, f, indent=2, ensure_ascii=False)

    print(f"🎉 Saved generated deck to: {args.output}")

    # Generate shareable URL snippet
    words_param = ",".join(words[:10])
    print("\n📲 Shareable LINE link snippet for classmates:")
    print(f"https://lucky-learning-world.github.io/?words={words_param}&from=Lucky")

if __name__ == "__main__":
    main()
