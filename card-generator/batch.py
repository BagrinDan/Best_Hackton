"""
Batch: JSON cu definiții → carduri SVG
"""

import json
import sys
from pathlib import Path
from main import generate_card_from_definition


def process_definitions_json(input_file: str, delay: float = 3.0):
    with open(input_file, "r", encoding="utf-8") as f:
        definitions = json.load(f)
    
    print(f"📚 {len(definitions)} definiții de procesat\n")
    
    results = []
    for i, d in enumerate(definitions, 1):
        term = d.get("term", "unknown")
        print(f"\n[{i}/{len(definitions)}] {term}")
        
        # ⚠️ CRUCIAL: extrage definiția
        definitie = d.get("definition", "").strip()
        
        if not definitie:
            print(f"   ⚠️ Definiție lipsă, skip")
            continue
        
        card = generate_card_from_definition(
            definitie,                        # ← acum există
            delay=delay,
            explanation_hint=d.get("explanation", ""),
            image_prompt_hint=d.get("image_prompt", ""),
        )
        
        if card:
            card["term"] = term
            card["page"] = d.get("page")
            card["quote"] = d.get("quote", "")
            card["original_definition"] = definitie
            card["explanation"] = d.get("explanation", "")
            card["image_prompt"] = d.get("image_prompt", "")
            results.append(card)
        else:
            print(f"   ❌ Eșec: {term}")
    
    index_path = Path("cards") / "index.json"
    index_path.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    
    print(f"\n{'='*70}")
    print(f"✅ {len(results)}/{len(definitions)} carduri generate")
    print(f"📄 {index_path}")
    print(f"{'='*70}")


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "definitions.json"
    delay = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
    process_definitions_json(input_file, delay=delay)