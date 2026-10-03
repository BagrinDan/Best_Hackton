"""
AI Card Generator - versiune Groq
"""

import os
import json
import re
import time
import hashlib
import base64
from pathlib import Path
from urllib.parse import quote
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from groq import Groq
import requests


# ============ CONFIG ============
CARDS_DIR = Path("cards")
CACHE_DIR = Path("cache")
CARDS_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("❌ GROQ_API_KEY lipsește din .env!")

client = Groq(api_key=api_key)

# Modele Groq (stabile, gratuite)
MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
]


# ============ UTILITARE ============
def escape_xml(text):
    if not text:
        return ""
    return (str(text).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;"))


def slugify(text):
    text = text.lower().strip()
    for k, v in {'ă':'a','â':'a','î':'i','ș':'s','ț':'t',
                 'Ă':'a','Â':'a','Î':'i','Ș':'s','Ț':'t'}.items():
        text = text.replace(k, v)
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')[:50]


def clean_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text


def cache_key(*args):
    return hashlib.md5("|".join(str(a) for a in args).encode()).hexdigest()


# ============ SYSTEM PROMPT ============
SYSTEM_PROMPT = """Ești un expert în pedagogie vizuală. Primești o definiție dintr-un manual școlar și o transformi în JSON structurat pentru generare de imagini educaționale.

REGULI:
1. Identifică conceptul principal și formula (dacă există).
2. Pentru fiecare variabilă, găsește o REPREZENTARE VIZUALĂ CONCRETĂ (obiect real).
3. Fiecare element primește: simbol, nume, reprezentare, emoji, culoare hex.
4. Layout: "formula_vizuala" (formule), "flow" (procese), "simplu" (concepte).
5. Generează și un "prompt_imagine" în ENGLEZĂ pentru AI de imagini.

Returnează DOAR JSON valid:
{
  "concept": "Volumul",
  "definitie_scurta": "Volumul este masa împărțită la densitate",
  "formula": "V = m / ρ",
  "layout": "formula_vizuala",
  "elemente": [
    {"simbol": "V", "nume": "volum", "reprezentare": "vas cu apă", "emoji": "🥛", "culoare": "#4A90E2"},
    {"simbol": "m", "nume": "masa", "reprezentare": "găleată 1kg", "emoji": "🪣", "culoare": "#E74C3C"},
    {"simbol": "ρ", "nume": "densitate", "reprezentare": "cilindru gradat", "emoji": "📏", "culoare": "#27AE60"}
  ],
  "operatori": ["÷", "="],
  "explicatie_vizuala": "Volumul (vasul) = masa (găleata) ÷ densitatea (cilindrul)",
  "prompt_imagine": "flat design educational illustration, three simple icons: a transparent water container, a red bucket with weight symbol, a green measuring cylinder, connected by arrows, minimalist, white background, pastel colors, no text, vector style"
}"""


# ============ ANALIZĂ ============
def analyze_definition(definitie: str) -> Optional[dict]:
    key = cache_key("analyze", definitie)
    cache_file = CACHE_DIR / f"{key}.json"
    if cache_file.exists():
        print("   💾 Din cache")
        return json.loads(cache_file.read_text())
    
    user_prompt = f"""Analizează această definiție și returnează JSON structurat:

DEFINIȚIE:
{definitie}

Returnează DOAR JSON valid."""
    
    for i, model in enumerate(MODELS):
        try:
            print(f"   🤖 [{i+1}/{len(MODELS)}] {model}")
            start = time.time()
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=2000,
            )
            
            raw = response.choices[0].message.content
            data = json.loads(clean_json(raw))
            
            elapsed = time.time() - start
            print(f"      ✅ {elapsed:.1f}s | Concept: {data.get('concept')}")
            
            cache_file.write_text(json.dumps(data, ensure_ascii=False))
            return data
        
        except json.JSONDecodeError as e:
            print(f"      ⚠️ JSON invalid, încerc alt model")
            continue
        except Exception as e:
            print(f"      ⚠️ {str(e)[:80]}")
            continue
    
    print("   ❌ Toate modelele au eșuat")
    return None


# ============ IMAGINE ============
def generate_image(prompt: str, width=800, height=500) -> Optional[bytes]:
    key = cache_key("image", prompt, width, height)
    cache_file = CACHE_DIR / f"{key}.png"
    if cache_file.exists():
        print("   💾 Imagine din cache")
        return cache_file.read_bytes()
    
    encoded = quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}"
    params = {"width": width, "height": height, "nologo": "true", "model": "flux", "enhance": "true"}
    
    try:
        print(f"   🎨 Generez imagine...")
        start = time.time()
        response = requests.get(url, params=params, timeout=120)
        response.raise_for_status()
        elapsed = time.time() - start
        print(f"      ✅ {elapsed:.1f}s | {len(response.content)//1024} KB")
        cache_file.write_bytes(response.content)
        return response.content
    except Exception as e:
        print(f"      ❌ {str(e)[:100]}")
        return None


# ============ SVG ============
def image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode()


def generate_card_svg(data: dict, image_bytes: Optional[bytes] = None) -> str:
    concept = data.get("concept", "")
    formula = data.get("formula", "")
    definitie = data.get("definitie_scurta", "")
    explicatie = data.get("explicatie_vizuala", "")
    elemente = data.get("elemente", [])
    operatori = data.get("operatori", ["÷", "="])
    
    width = 900
    height = 700 if image_bytes else 620
    
    img_embed = ""
    if image_bytes:
        b64 = image_to_base64(image_bytes)
        img_embed = f'''
    <g transform="translate(50, 280)">
        <rect x="0" y="0" width="800" height="300" rx="16" 
              fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" filter="url(#shadow)"/>
        <image href="data:image/png;base64,{b64}" x="10" y="10" 
               width="780" height="280" preserveAspectRatio="xMidYMid meet"/>
    </g>'''
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF"/>
            <stop offset="100%" style="stop-color:#F4F6F8"/>
        </linearGradient>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4A90E2"/>
            <stop offset="100%" style="stop-color:#7B68EE"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.12"/>
        </filter>
        <filter id="shadowSmall" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
        </filter>
    </defs>
    <rect width="{width}" height="{height}" fill="url(#bgGrad)"/>
    <rect x="0" y="0" width="{width}" height="140" fill="url(#headerGrad)"/>
    <text x="{width//2}" y="70" text-anchor="middle" 
          font-family="Arial" font-size="38" font-weight="bold" fill="#FFFFFF">
        {escape_xml(concept)}
    </text>
    {"" if not formula else f"""<rect x="{width//2 - 150}" y="90" width="300" height="40" rx="20" 
              fill="rgba(255,255,255,0.25)"/>
    <text x="{width//2}" y="117" text-anchor="middle" 
          font-family="Arial" font-size="22" font-weight="bold" fill="#FFFFFF">
        {escape_xml(formula)}
    </text>"""}
'''
    
    if image_bytes:
        svg += img_embed
        y_after_image = 610
    else:
        n = len(elemente)
        start_x = (width - (n * 180)) // 2 + 90
        y_center = 320
        
        for i, elem in enumerate(elemente[:5]):
            x = start_x + i * 180
            culoare = elem.get("culoare", "#4A90E2")
            emoji = elem.get("emoji", "❓")
            simbol = elem.get("simbol", "")
            nume = elem.get("nume", "")
            
            svg += f'''
    <g transform="translate({x}, {y_center})" filter="url(#shadowSmall)">
        <circle cx="0" cy="0" r="60" fill="{culoare}" opacity="0.15"/>
        <circle cx="0" cy="0" r="60" fill="none" stroke="{culoare}" stroke-width="3"/>
        <text x="0" y="20" text-anchor="middle" font-size="60">{emoji}</text>
    </g>
    <text x="{x}" y="{y_center + 95}" text-anchor="middle" 
          font-family="Arial" font-size="22" font-weight="bold" fill="{culoare}">
        {escape_xml(simbol)}
    </text>
    <text x="{x}" y="{y_center + 120}" text-anchor="middle" 
          font-family="Arial" font-size="14" fill="#2C3E50">
        {escape_xml(nume)}
    </text>'''
            if i < n - 1 and i < len(operatori):
                svg += f'''
    <text x="{x + 90}" y="{y_center + 10}" text-anchor="middle" 
          font-size="42" fill="#1A1A2E" font-family="Arial" font-weight="bold">
        {escape_xml(operatori[i])}
    </text>'''
        y_after_image = y_center + 180
    
    if explicatie:
        svg += f'''
    <rect x="50" y="{y_after_image}" width="{width-100}" height="55" rx="15" 
          fill="#E8F4FD" stroke="#4A90E2" stroke-width="2"/>
    <text x="{width//2}" y="{y_after_image + 35}" text-anchor="middle" 
          font-family="Arial" font-size="15" fill="#1A1A2E">
        💡 {escape_xml(explicatie[:130])}
    </text>'''
        y_after_image += 70
    
    svg += f'''
    <rect x="50" y="{y_after_image}" width="{width-100}" height="70" rx="12" 
          fill="#FFF9E6" stroke="#F4A261" stroke-width="2"/>
    <text x="{width//2}" y="{y_after_image + 28}" text-anchor="middle" 
          font-family="Arial" font-size="14" font-weight="bold" fill="#E76F51">
        📖 Definiție
    </text>
    <text x="{width//2}" y="{y_after_image + 52}" text-anchor="middle" 
          font-family="Arial" font-size="14" fill="#2C3E50">
        {escape_xml(definitie[:130])}{"..." if len(definitie) > 130 else ""}
    </text>
</svg>'''
    return svg


# ============ PIPELINE ============
def generate_card_from_definition(definitie: str, with_image: bool = True) -> Optional[dict]:
    print(f"\n{'='*70}")
    print(f"📝 {definitie[:90]}...")
    print(f"{'='*70}")
    
    print("📊 Analiză definiție...")
    data = analyze_definition(definitie)
    if not data:
        return None
    
    image_bytes = None
    if with_image and data.get("prompt_imagine"):
        print("🖼️ Generare imagine...")
        image_bytes = generate_image(data["prompt_imagine"])
    
    print("🎨 Generare card SVG...")
    svg = generate_card_svg(data, image_bytes)
    
    slug = slugify(data.get("concept", "card"))
    svg_path = CARDS_DIR / f"{slug}.svg"
    json_path = CARDS_DIR / f"{slug}.json"
    img_path = None
    
    svg_path.write_text(svg, encoding="utf-8")
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    
    if image_bytes:
        img_path = CARDS_DIR / f"{slug}.png"
        img_path.write_bytes(image_bytes)
    
    print(f"✅ {svg_path}")
    if img_path:
        print(f"✅ {img_path}")
    
    return {
        "concept": data.get("concept"),
        "slug": slug,
        "svg_path": str(svg_path),
        "json_path": str(json_path),
        "image_path": str(img_path) if img_path else None,
        "data": data,
    }


# ============ TEST ============
if __name__ == "__main__":
    print("🎨 AI Card Generator (Groq)\n")
    
    definitii = [
        "Volumul este masa suprapusă la densitate",
        "Schimbarea direcției de propagare rectilinie a luminii la suprafața de separație a două medii prin întoarcerea ei în mediul din care vine se numește reflexie a luminii",
    ]
    
    for d in definitii:
        generate_card_from_definition(d, with_image=True)
    
    print(f"\n✅ Gata! xdg-open cards/")

