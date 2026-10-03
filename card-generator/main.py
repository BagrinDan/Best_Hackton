"""
AI Card Generator - versiune completă v3
Clasificare pe 3 straturi + 6 layout-uri + emoji mari
"""

import os
import json
import re
import time
import hashlib
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI


# ============ CONFIG ============
CARDS_DIR = Path("cards")
CACHE_DIR = Path("cache")
CARDS_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("❌ OPENROUTER_API_KEY lipsește din .env!")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

MODELS = [
    "google/gemma-4-31b-it:free",
    "qwen/qwen3.8-27b:free",
    "cohere/north-mini-code:free",
    "apodex/apodex-1.1-mini:free",
]

PALETTE = ["#4A90E2", "#E74C3C", "#27AE60", "#F4A261", "#7B68EE"]
EMOJI_FONT = "Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif"


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
    if not text:
        return ""
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        if len(parts) >= 2:
            text = parts[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text


def cache_key(*args):
    return hashlib.md5("|".join(str(a) for a in args).encode()).hexdigest()


def wrap_text(text: str, max_chars: int = 95) -> list:
    if not text:
        return []
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            current += (" " if current else "") + word
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


# ============ SYSTEM PROMPT (cu clasificare în sub-tipuri) ============
SYSTEM_PROMPT = """Ești un expert în pedagogie vizuală. Transformi definiții școlare în JSON structurat pentru carduri vizuale.

DETECTEAZĂ TIPUL ȘI SUB-TIPUL:

1. "formula" — formule matematice/fizice
   - Exemplu: V = m/ρ, I = U/R, F = m×a

2. "flow" — procese în pași
   - Exemplu: fotosinteza, digestia, ciclul apei

3. "geometric" — concepte cu geometrie/optică
   - Sub-tipuri:
     - "reflexie": raze care lovesc o suprafață și se întorc
     - "refractie": raze care trec prin alt mediu schimbând direcția
     - "unghi_incidenta": unghiul α dintre raza incidentă și normală
     - "unghi_reflexie": unghiul β dintre raza reflectată și normală

4. "proprietati" — definiții cu atribute multiple
   - Exemplu: oglinda plană, imaginea virtuală

5. "simplu" — default pentru restul

REGULI:
- Maxim 4 elemente.
- Fiecare element:
  - simbol: 1-3 caractere (V, m, ρ, AO, OC, α, β)
  - nume: 1-2 cuvinte (max 20 caractere)
  - reprezentare: max 30 caractere
  - emoji: OBLIGATORIU, alege din: 🥛 🪣 📏 ⚖️ 🧊 🔆 ✨ 💡 📐 🔋 🚰 🚧 🌱 ☀️ 🍬 🪞 🎯 📊 ⚡ 🌊
  - culoare: din ["#4A90E2", "#E74C3C", "#27AE60", "#F4A261", "#7B68EE"]

Pentru "geometric", adaugă câmpul "subtipo" (unul din: reflexie, refractie, unghi_incidenta, unghi_reflexie).

Returnează DOAR JSON valid.

EXEMPLE:

"Reflexia luminii" →
{
  "concept": "Reflexia luminii",
  "layout": "geometric",
  "subtipo": "reflexie",
  "definitie_scurta": "Schimbarea direcției luminii la suprafața dintre două medii",
  "elemente": [
    {"simbol": "AO", "nume": "rază incidentă", "reprezentare": "lumina care vine", "emoji": "🔆", "culoare": "#F4A261"},
    {"simbol": "OC", "nume": "normala", "reprezentare": "perpendiculara", "emoji": "📐", "culoare": "#7B68EE"},
    {"simbol": "OB", "nume": "rază reflectată", "reprezentare": "lumina care pleacă", "emoji": "✨", "culoare": "#E74C3C"}
  ],
  "explicatie_vizuala": "Raza AO lovește oglinda și se reflectă în OB. α = β."
}

"Refracția luminii" →
{
  "concept": "Refracția luminii",
  "layout": "geometric",
  "subtipo": "refractie",
  "definitie_scurta": "Schimbarea direcției luminii la trecerea prin alt mediu",
  "elemente": [
    {"simbol": "AO", "nume": "rază incidentă", "reprezentare": "lumina care vine", "emoji": "🔆", "culoare": "#F4A261"},
    {"simbol": "OC", "nume": "normala", "reprezentare": "perpendiculara", "emoji": "📐", "culoare": "#7B68EE"},
    {"simbol": "OB", "nume": "rază refractată", "reprezentare": "lumina deviată", "emoji": "🌊", "culoare": "#4A90E2"}
  ],
  "explicatie_vizuala": "Lumina trece din aer în apă și își schimbă direcția."
}

"Unghiul de incidență" →
{
  "concept": "Unghiul de incidență",
  "layout": "geometric",
  "subtipo": "unghi_incidenta",
  "definitie_scurta": "Unghiul dintre raza incidentă și normală",
  "elemente": [
    {"simbol": "AO", "nume": "rază incidentă", "reprezentare": "lumina care vine", "emoji": "🔆", "culoare": "#F4A261"},
    {"simbol": "OC", "nume": "normala", "reprezentare": "perpendiculara", "emoji": "📐", "culoare": "#7B68EE"},
    {"simbol": "α", "nume": "unghi α", "reprezentare": "unghiul de incidență", "emoji": "📊", "culoare": "#27AE60"}
  ],
  "explicatie_vizuala": "Unghiul dintre raza AO și normala OC este unghiul de incidență α."
}

"Volumul" →
{
  "concept": "Volumul",
  "layout": "formula",
  "formula": "V = m / ρ",
  "definitie_scurta": "Volumul este masa împărțită la densitate",
  "elemente": [
    {"simbol": "V", "nume": "volum", "reprezentare": "vas cu apă", "emoji": "🥛", "culoare": "#4A90E2"},
    {"simbol": "m", "nume": "masa", "reprezentare": "găleată 1kg", "emoji": "🪣", "culoare": "#E74C3C"},
    {"simbol": "ρ", "nume": "densitate", "reprezentare": "cilindru gradat", "emoji": "📏", "culoare": "#27AE60"}
  ],
  "operatori": ["÷", "="],
  "explicatie_vizuala": "Volumul (vasul) = masa (găleata) ÷ densitatea (cilindrul)"
}"""


# ============ FALLBACK LOCAL ============
def fallback_analyze(definitie: str) -> dict:
    text = definitie.strip()
    
    concept_match = re.match(r'^([^:\.]+?)(?:\s+este|\s+se numește|:)', text)
    concept = concept_match.group(1).strip() if concept_match else text[:50]
    
    formula = None
    formula_match = re.search(r'[A-Za-zρσΔ][A-Za-z0-9_]*\s*=\s*[A-Za-z0-9_ρσΔ\s/×·*+\-]+', text)
    if formula_match:
        formula = formula_match.group(0).strip()
    
    # Detectează sub-tip geometric
    d = text.lower()
    subtipo = None
    if "reflexi" in d:
        if "unghi" in d:
            subtipo = "unghi_reflexie"
        else:
            subtipo = "reflexie"
    elif "refracți" in d or "refrac" in d:
        subtipo = "refractie"
    elif "incidenț" in d or "incidenta" in d:
        subtipo = "unghi_incidenta"
    
    # Detectează layout
    if subtipo:
        layout = "geometric"
    elif formula:
        layout = "formula"
    elif "proces" in d or "transformă" in d:
        layout = "flow"
    elif "se numește" in d or "este o" in d:
        layout = "proprietati"
    else:
        layout = "simplu"
    
    cuvinte = re.findall(r'\b[A-ZĂÂÎȘȚ][a-zăăâîșț]+\b', text)
    cuvinte = list(dict.fromkeys(cuvinte))[:3]
    
    emoji_pool = ["💡", "📘", "🔍", "✨"]
    elemente = []
    for i, cuvant in enumerate(cuvinte):
        elemente.append({
            "simbol": cuvant[0] if cuvant else "?",
            "nume": cuvant.lower()[:20],
            "reprezentare": f"concept: {cuvant.lower()}"[:30],
            "emoji": emoji_pool[i % len(emoji_pool)],
            "culoare": PALETTE[i % len(PALETTE)],
        })
    
    if not elemente:
        elemente = [
            {"simbol": "A", "nume": "concept", "reprezentare": "abstract", "emoji": "📘", "culoare": "#4A90E2"},
            {"simbol": "→", "nume": "relație", "reprezentare": "logică", "emoji": "🔍", "culoare": "#E74C3C"},
            {"simbol": "B", "nume": "rezultat", "reprezentare": "concluzie", "emoji": "💡", "culoare": "#27AE60"},
        ]
    
    return {
        "concept": concept.title()[:50],
        "definitie_scurta": text[:200],
        "formula": formula,
        "layout": layout,
        "subtipo": subtipo,
        "elemente": elemente,
        "operatori": ["÷", "="] if formula else ["→", "→"],
        "explicatie_vizuala": f"Conceptul: {concept[:80]}",
        "fallback": True,
    }


# ============ ANALIZĂ AI ============
def analyze_definition(definitie: str, max_retries: int = 3) -> Optional[dict]:
    key = cache_key("analyze_v3", definitie)
    cache_file = CACHE_DIR / f"{key}.json"
    if cache_file.exists():
        print("   💾 Din cache")
        return json.loads(cache_file.read_text())
    
    user_prompt = f"""Returnează JSON structurat pentru această definiție:

{definitie}

JSON:"""
    
    last_error = None
    valid_layouts = ["formula", "flow", "geometric", "proprietati", "simplu"]
    
    for attempt in range(max_retries):
        for i, model in enumerate(MODELS):
            try:
                print(f"   🤖 [{i+1}/{len(MODELS)}] {model.split('/')[-1]}")
                start = time.time()
                
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=1500,
                )
                
                raw = response.choices[0].message.content
                if not raw:
                    raise ValueError("Răspuns gol")
                
                data = json.loads(clean_json(raw))
                
                # Validare layout
                if data.get("layout") not in valid_layouts:
                    fb = fallback_analyze(definitie)
                    data["layout"] = fb["layout"]
                    data["subtipo"] = fb.get("subtipo")
                
                # Validare elemente
                if not data.get("elemente") or len(data["elemente"]) < 2:
                    fb = fallback_analyze(definitie)
                    data["elemente"] = fb["elemente"]
                
                elapsed = time.time() - start
                subtipo_str = f" / {data.get('subtipo')}" if data.get('subtipo') else ""
                print(f"      ✅ {elapsed:.1f}s | Layout: {data.get('layout')}{subtipo_str}")
                
                cache_file.write_text(json.dumps(data, ensure_ascii=False))
                return data
            
            except json.JSONDecodeError:
                print(f"      ⚠️ JSON invalid")
                last_error = "JSON invalid"
                continue
            except Exception as e:
                err = str(e)
                last_error = err[:100]
                if "429" in err:
                    print(f"      ⏳ 429, aștept 5s...")
                    time.sleep(5)
                else:
                    print(f"      ⚠️ {err[:80]}")
                continue
        
        if attempt < max_retries - 1:
            wait = 10 * (attempt + 1)
            print(f"   ⏸️ Runda {attempt+1} eșuată, aștept {wait}s...")
            time.sleep(wait)
    
    print(f"   ❌ Fallback local...")
    data = fallback_analyze(definitie)
    cache_file.write_text(json.dumps(data, ensure_ascii=False))
    return data


# ============ SVG HELPERS ============
def _svg_header(concept: str, formula: str, width: int = 900) -> str:
    return f'''
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF"/>
            <stop offset="100%" style="stop-color:#F4F6F8"/>
        </linearGradient>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4A90E2"/>
            <stop offset="100%" style="stop-color:#7B68EE"/>
        </linearGradient>
        <filter id="shadowSmall" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.15"/>
        </filter>
    </defs>
    <rect width="{width}" height="100%" fill="url(#bgGrad)"/>
    <rect x="0" y="0" width="{width}" height="130" fill="url(#headerGrad)"/>
    <text x="{width//2}" y="65" text-anchor="middle" 
          font-family="Arial, Helvetica, sans-serif" font-size="36" 
          font-weight="bold" fill="#FFFFFF">
        {escape_xml(concept)}
    </text>
    {"" if not formula else f"""
    <rect x="{width//2 - 160}" y="82" width="320" height="38" rx="19" 
          fill="rgba(255,255,255,0.25)"/>
    <text x="{width//2}" y="108" text-anchor="middle" 
          font-family="Arial" font-size="20" font-weight="bold" fill="#FFFFFF">
        {escape_xml(formula)}
    </text>"""}
    '''


def _svg_footer(definitie: str, explicatie: str, width: int, y_start: int) -> tuple:
    svg = ""
    y = y_start
    
    if explicatie:
        svg += f'''
    <rect x="50" y="{y}" width="{width-100}" height="50" rx="15" 
          fill="#E8F4FD" stroke="#4A90E2" stroke-width="2"/>
    <text x="{width//2}" y="{y + 32}" text-anchor="middle" 
          font-family="Arial" font-size="14" fill="#1A1A2E">
        💡 {escape_xml(explicatie[:130])}
    </text>'''
        y += 65
    
    if definitie:
        lines = wrap_text(definitie, max_chars=95)
        box_height = 45 + len(lines) * 20
        svg += f'''
    <rect x="50" y="{y}" width="{width-100}" height="{box_height}" rx="12" 
          fill="#FFF9E6" stroke="#F4A261" stroke-width="2"/>
    <text x="{width//2}" y="{y + 24}" text-anchor="middle" 
          font-family="Arial" font-size="13" font-weight="bold" fill="#E76F51">
        📖 Definiție
    </text>'''
        for i, line in enumerate(lines):
            svg += f'''
    <text x="{width//2}" y="{y + 46 + i*18}" text-anchor="middle" 
          font-family="Arial" font-size="13" fill="#2C3E50">
        {escape_xml(line)}
    </text>'''
        y += box_height + 10
    
    return svg, y


def _element_big_emoji(x: int, y: int, elem: dict, radius: int = 60, index: int = 0) -> str:
    """Element cu EMOJI MARE în cerc + simbol mic dedesubt."""
    culoare = elem.get("culoare", PALETTE[index % len(PALETTE)])
    simbol = elem.get("simbol", "?")[:4]
    emoji = elem.get("emoji", "❓")
    nume = elem.get("nume", "")[:20]
    reprezentare = elem.get("reprezentare", "")[:30]
    
    return f'''
    <circle cx="{x}" cy="{y}" r="{radius}" fill="{culoare}" opacity="0.15"/>
    <circle cx="{x}" cy="{y}" r="{radius}" fill="none" stroke="{culoare}" stroke-width="3"/>
    <text x="{x}" y="{y + 20}" text-anchor="middle" font-size="64" 
          font-family="{EMOJI_FONT}">{emoji}</text>
    <text x="{x}" y="{y + 100}" text-anchor="middle" 
          font-family="Arial" font-size="20" font-weight="bold" fill="{culoare}">
        {escape_xml(simbol)}
    </text>
    <text x="{x}" y="{y + 122}" text-anchor="middle" 
          font-family="Arial" font-size="13" fill="#2C3E50">
        {escape_xml(nume)}
    </text>
    <text x="{x}" y="{y + 140}" text-anchor="middle" 
          font-family="Arial" font-size="11" fill="#7F8C8D" font-style="italic">
        {escape_xml(reprezentare)}
    </text>'''


# ============ LAYOUT 1: FORMULA ============
def _svg_formula(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    formula = (data.get("formula") or "")[:40]
    definitie = data.get("definitie_scurta", data.get("explicatie_vizuala", ""))[:250]
    explicatie = data.get("explicatie_vizuala", "")[:130]
    elemente = data.get("elemente", [])[:4]
    operatori = data.get("operatori", ["÷", "="])
    
    width = 900
    n = len(elemente)
    main_svg = ""
    
    if n > 0:
        margin_x = 80
        available = width - 2 * margin_x
        spacing = available / n if n > 1 else available
        start_x = margin_x + spacing / 2
        y_center = 290
        
        for i, elem in enumerate(elemente):
            x = start_x + i * spacing
            main_svg += _element_big_emoji(x, y_center, elem, radius=60, index=i)
            
            if i < n - 1 and i < len(operatori):
                op_x = x + spacing / 2
                main_svg += f'''
    <text x="{op_x}" y="{y_center + 15}" text-anchor="middle" 
          font-size="40" fill="#1A1A2E" font-family="Arial" font-weight="bold">
        {escape_xml(operatori[i])}
    </text>'''
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 500)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, formula, width)}
    {main_svg}
    {footer}
</svg>'''


# ============ LAYOUT 2: FLOW ============
def _svg_flow(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")[:250]
    explicatie = data.get("explicatie_vizuala", "")[:130]
    elemente = data.get("elemente", [])[:5]
    
    width = 900
    n = len(elemente)
    main_svg = ""
    
    if n > 0:
        margin_x = 80
        available = width - 2 * margin_x
        spacing = available / n if n > 1 else available
        start_x = margin_x + spacing / 2
        y_center = 290
        
        for i, elem in enumerate(elemente):
            x = start_x + i * spacing
            main_svg += _element_big_emoji(x, y_center, elem, radius=60, index=i)
            
            if i < n - 1:
                arrow_x = x + spacing / 2
                main_svg += f'''
    <text x="{arrow_x}" y="{y_center + 15}" text-anchor="middle" 
          font-size="44" fill="#7F8C8D" font-family="Arial">→</text>'''
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 500)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


# ============ LAYOUT 3: GEOMETRIC (cu sub-tipuri) ============
def _svg_geometric(data: dict) -> str:
    """
    Layout geometric cu sub-tipuri:
    - reflexie: oglindă + raze + unghiuri α β
    - refractie: suprafață + rază incidentă + rază refractată (unghiuri diferite)
    - unghi_incidenta: doar unghiul α evidențiat
    - unghi_reflexie: doar unghiul β evidențiat
    """
    subtipo = data.get("subtipo", "reflexie")
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")[:250]
    explicatie = data.get("explicatie_vizuala", "")[:130]
    
    width = 900
    
    if subtipo == "refracție" or subtipo == "refractie":
        return _svg_refractie(concept, definitie, explicatie, width)
    elif subtipo == "unghi_incidenta":
        return _svg_unghi_incidenta(concept, definitie, explicatie, width)
    elif subtipo == "unghi_reflexie":
        return _svg_unghi_reflexie(concept, definitie, explicatie, width)
    else:
        return _svg_reflexie(concept, definitie, explicatie, width)


def _svg_reflexie(concept, definitie, explicatie, width=900) -> str:
    """Reflexia: oglindă + raze + unghiuri α β egale."""
    cx, mirror_y = width // 2, 440
    
    main_svg = f'''
    <defs>
        <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F4A261"/>
        </marker>
        <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#E74C3C"/>
        </marker>
    </defs>
    
    <!-- Oglinda -->
    <line x1="{cx - 280}" y1="{mirror_y}" x2="{cx + 280}" y2="{mirror_y}" 
          stroke="#2C3E50" stroke-width="4"/>
    <line x1="{cx - 280}" y1="{mirror_y + 6}" x2="{cx + 280}" y2="{mirror_y + 6}" 
          stroke="#2C3E50" stroke-width="1" stroke-dasharray="8,4"/>
    <text x="{cx + 295}" y="{mirror_y + 5}" font-family="Arial" font-size="13" fill="#2C3E50">
        oglindă
    </text>
    
    <!-- Normala -->
    <line x1="{cx}" y1="{mirror_y}" x2="{cx}" y2="{mirror_y - 240}" 
          stroke="#7B68EE" stroke-width="3" stroke-dasharray="8,6"/>
    <text x="{cx + 12}" y="{mirror_y - 230}" font-family="Arial" font-size="14" font-weight="bold" fill="#7B68EE">
        C
    </text>
    <text x="{cx + 12}" y="{mirror_y - 210}" font-family="Arial" font-size="11" fill="#7B68EE">
        normală
    </text>
    
    <!-- Punct O -->
    <circle cx="{cx}" cy="{mirror_y}" r="6" fill="#2C3E50"/>
    <text x="{cx - 22}" y="{mirror_y + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#2C3E50">
        O
    </text>
    
    <!-- Raza incidentă -->
    <line x1="{cx - 200}" y1="{mirror_y - 180}" x2="{cx}" y2="{mirror_y}" 
          stroke="#F4A261" stroke-width="4" marker-end="url(#arrowOrange)"/>
    <text x="{cx - 220}" y="{mirror_y - 190}" font-family="Arial" font-size="16" font-weight="bold" fill="#F4A261">
        A
    </text>
    <text x="{cx - 280}" y="{mirror_y - 100}" font-family="Arial" font-size="12" fill="#F4A261">
        rază incidentă
    </text>
    
    <!-- Raza reflectată -->
    <line x1="{cx}" y1="{mirror_y}" x2="{cx + 200}" y2="{mirror_y - 180}" 
          stroke="#E74C3C" stroke-width="4" marker-end="url(#arrowRed)"/>
    <text x="{cx + 205}" y="{mirror_y - 190}" font-family="Arial" font-size="16" font-weight="bold" fill="#E74C3C">
        B
    </text>
    <text x="{cx + 150}" y="{mirror_y - 100}" font-family="Arial" font-size="12" fill="#E74C3C">
        rază reflectată
    </text>
    
    <!-- Unghiul α -->
    <path d="M {cx} {mirror_y - 80} A 80 80 0 0 0 {cx - 65} {mirror_y - 55}" 
          fill="none" stroke="#27AE60" stroke-width="2"/>
    <text x="{cx - 55}" y="{mirror_y - 70}" font-family="Arial" font-size="20" font-weight="bold" fill="#27AE60">
        α
    </text>
    
    <!-- Unghiul β -->
    <path d="M {cx} {mirror_y - 80} A 80 80 0 0 1 {cx + 65} {mirror_y - 55}" 
          fill="none" stroke="#27AE60" stroke-width="2"/>
    <text x="{cx + 35}" y="{mirror_y - 70}" font-family="Arial" font-size="20" font-weight="bold" fill="#27AE60">
        β
    </text>
'''
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 560)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


def _svg_refractie(concept, definitie, explicatie, width=900) -> str:
    """Refracția: suprafață cu 2 medii + rază incidentă + rază refractată."""
    cx = width // 2
    surface_y = 400
    
    main_svg = f'''
    <defs>
        <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F4A261"/>
        </marker>
        <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#4A90E2"/>
        </marker>
    </defs>
    
    <!-- Mediu 1 (sus - aer) -->
    <rect x="100" y="{surface_y - 200}" width="{width - 200}" height="200" 
          fill="#E8F4FD" opacity="0.4"/>
    <text x="{width - 130}" y="{surface_y - 170}" font-family="Arial" font-size="14" fill="#4A90E2" font-weight="bold">
        Mediu 1 (aer)
    </text>
    
    <!-- Mediu 2 (jos - apă) -->
    <rect x="100" y="{surface_y}" width="{width - 200}" height="200" 
          fill="#4A90E2" opacity="0.3"/>
    <text x="{width - 130}" y="{surface_y + 190}" font-family="Arial" font-size="14" fill="#4A90E2" font-weight="bold">
        Mediu 2 (apă)
    </text>
    
    <!-- Suprafața de separare -->
    <line x1="100" y1="{surface_y}" x2="{width - 100}" y2="{surface_y}" 
          stroke="#2C3E50" stroke-width="3"/>
    
    <!-- Normala -->
    <line x1="{cx}" y1="{surface_y - 220}" x2="{cx}" y2="{surface_y + 220}" 
          stroke="#7B68EE" stroke-width="3" stroke-dasharray="8,6"/>
    <text x="{cx + 12}" y="{surface_y - 210}" font-family="Arial" font-size="14" font-weight="bold" fill="#7B68EE">
        C
    </text>
    <text x="{cx + 12}" y="{surface_y - 190}" font-family="Arial" font-size="11" fill="#7B68EE">
        normală
    </text>
    
    <!-- Punct O -->
    <circle cx="{cx}" cy="{surface_y}" r="6" fill="#2C3E50"/>
    <text x="{cx - 22}" y="{surface_y + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#2C3E50">
        O
    </text>
    
    <!-- Raza incidentă (din stânga sus) -->
    <line x1="{cx - 200}" y1="{surface_y - 180}" x2="{cx}" y2="{surface_y}" 
          stroke="#F4A261" stroke-width="4" marker-end="url(#arrowOrange)"/>
    <text x="{cx - 220}" y="{surface_y - 190}" font-family="Arial" font-size="16" font-weight="bold" fill="#F4A261">
        A
    </text>
    <text x="{cx - 280}" y="{surface_y - 100}" font-family="Arial" font-size="12" fill="#F4A261">
        rază incidentă
    </text>
    
    <!-- Unghiul α (incidență) -->
    <path d="M {cx} {surface_y - 80} A 80 80 0 0 0 {cx - 65} {surface_y - 55}" 
          fill="none" stroke="#27AE60" stroke-width="2"/>
    <text x="{cx - 55}" y="{surface_y - 70}" font-family="Arial" font-size="20" font-weight="bold" fill="#27AE60">
        α
    </text>
    
    <!-- Raza refractată (în jos, cu unghi diferit - mai aproape de normală) -->
    <line x1="{cx}" y1="{surface_y}" x2="{cx + 130}" y2="{surface_y + 180}" 
          stroke="#4A90E2" stroke-width="4" marker-end="url(#arrowBlue)"/>
    <text x="{cx + 140}" y="{surface_y + 195}" font-family="Arial" font-size="16" font-weight="bold" fill="#4A90E2">
        B
    </text>
    <text x="{cx + 90}" y="{surface_y + 130}" font-family="Arial" font-size="12" fill="#4A90E2">
        rază refractată
    </text>
    
    <!-- Unghiul γ (refracție) -->
    <path d="M {cx} {surface_y + 60} A 60 60 0 0 1 {cx + 40} {surface_y + 40}" 
          fill="none" stroke="#27AE60" stroke-width="2"/>
    <text x="{cx + 45}" y="{surface_y + 55}" font-family="Arial" font-size="20" font-weight="bold" fill="#27AE60">
        γ
    </text>
'''
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 640)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


def _svg_unghi_incidenta(concept, definitie, explicatie, width=900) -> str:
    """Unghiul de incidență: doar unghiul α evidențiat."""
    cx, mirror_y = width // 2, 440
    
    main_svg = f'''
    <defs>
        <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F4A261"/>
        </marker>
    </defs>
    
    <!-- Oglinda -->
    <line x1="{cx - 280}" y1="{mirror_y}" x2="{cx + 280}" y2="{mirror_y}" 
          stroke="#2C3E50" stroke-width="4"/>
    
    <!-- Normala -->
    <line x1="{cx}" y1="{mirror_y}" x2="{cx}" y2="{mirror_y - 240}" 
          stroke="#7B68EE" stroke-width="3" stroke-dasharray="8,6"/>
    <text x="{cx + 12}" y="{mirror_y - 230}" font-family="Arial" font-size="14" font-weight="bold" fill="#7B68EE">
        C
    </text>
    <text x="{cx + 12}" y="{mirror_y - 210}" font-family="Arial" font-size="11" fill="#7B68EE">
        normală
    </text>
    
    <!-- Punct O -->
    <circle cx="{cx}" cy="{mirror_y}" r="6" fill="#2C3E50"/>
    <text x="{cx - 22}" y="{mirror_y + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#2C3E50">
        O
    </text>
    
    <!-- Raza incidentă -->
    <line x1="{cx - 200}" y1="{mirror_y - 180}" x2="{cx}" y2="{mirror_y}" 
          stroke="#F4A261" stroke-width="5" marker-end="url(#arrowOrange)"/>
    <text x="{cx - 220}" y="{mirror_y - 190}" font-family="Arial" font-size="16" font-weight="bold" fill="#F4A261">
        A
    </text>
    <text x="{cx - 300}" y="{mirror_y - 100}" font-family="Arial" font-size="14" font-weight="bold" fill="#F4A261">
        rază incidentă
    </text>
    
    <!-- Unghiul α EVIDENȚIAT mare -->
    <path d="M {cx} {mirror_y - 130} A 130 130 0 0 0 {cx - 105} {mirror_y - 80}" 
          fill="#27AE60" fill-opacity="0.2" stroke="#27AE60" stroke-width="3"/>
    <text x="{cx - 75}" y="{mirror_y - 95}" font-family="Arial" font-size="36" font-weight="bold" fill="#27AE60">
        α
    </text>
'''
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 560)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


def _svg_unghi_reflexie(concept, definitie, explicatie, width=900) -> str:
    """Unghiul de reflexie: doar unghiul β evidențiat."""
    cx, mirror_y = width // 2, 440
    
    main_svg = f'''
    <defs>
        <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#E74C3C"/>
        </marker>
    </defs>
    
    <!-- Oglinda -->
    <line x1="{cx - 280}" y1="{mirror_y}" x2="{cx + 280}" y2="{mirror_y}" 
          stroke="#2C3E50" stroke-width="4"/>
    
    <!-- Normala -->
    <line x1="{cx}" y1="{mirror_y}" x2="{cx}" y2="{mirror_y - 240}" 
          stroke="#7B68EE" stroke-width="3" stroke-dasharray="8,6"/>
    <text x="{cx + 12}" y="{mirror_y - 230}" font-family="Arial" font-size="14" font-weight="bold" fill="#7B68EE">
        C
    </text>
    <text x="{cx + 12}" y="{mirror_y - 210}" font-family="Arial" font-size="11" fill="#7B68EE">
        normală
    </text>
    
    <!-- Punct O -->
    <circle cx="{cx}" cy="{mirror_y}" r="6" fill="#2C3E50"/>
    <text x="{cx - 22}" y="{mirror_y + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#2C3E50">
        O
    </text>
    
    <!-- Raza reflectată -->
    <line x1="{cx}" y1="{mirror_y}" x2="{cx + 200}" y2="{mirror_y - 180}" 
          stroke="#E74C3C" stroke-width="5" marker-end="url(#arrowRed)"/>
    <text x="{cx + 205}" y="{mirror_y - 190}" font-family="Arial" font-size="16" font-weight="bold" fill="#E74C3C">
        B
    </text>
    <text x="{cx + 220}" y="{mirror_y - 100}" font-family="Arial" font-size="14" font-weight="bold" fill="#E74C3C">
        rază reflectată
    </text>
    
    <!-- Unghiul β EVIDENȚIAT mare -->
    <path d="M {cx} {mirror_y - 130} A 130 130 0 0 1 {cx + 105} {mirror_y - 80}" 
          fill="#27AE60" fill-opacity="0.2" stroke="#27AE60" stroke-width="3"/>
    <text x="{cx + 45}" y="{mirror_y - 95}" font-family="Arial" font-size="36" font-weight="bold" fill="#27AE60">
        β
    </text>
'''
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 560)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


# ============ LAYOUT 4: PROPRIETATI ============
def _svg_proprietati(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")[:250]
    explicatie = data.get("explicatie_vizuala", "")[:130]
    elemente = data.get("elemente", [])[:4]
    
    width = 900
    n = len(elemente)
    cols = 2 if n > 2 else n
    rows = (n + cols - 1) // cols if cols > 0 else 1
    
    main_svg = f'''
    <circle cx="{width//2}" cy="210" r="65" fill="#7B68EE" opacity="0.15"/>
    <circle cx="{width//2}" cy="210" r="65" fill="none" stroke="#7B68EE" stroke-width="3"/>
    <text x="{width//2}" y="235" text-anchor="middle" font-size="60" 
          font-family="{EMOJI_FONT}">🪞</text>
'''
    
    y_grid = 320
    card_w = (width - 200) // cols if cols > 0 else 0
    card_h = 130
    
    for i, elem in enumerate(elemente):
        row = i // cols
        col = i % cols
        x = 100 + col * card_w + card_w // 2
        y = y_grid + row * (card_h + 20) + card_h // 2
        
        culoare = elem.get("culoare", PALETTE[i % len(PALETTE)])
        nume = elem.get("nume", "")[:20]
        reprezentare = elem.get("reprezentare", "")[:30]
        emoji = elem.get("emoji", "❓")
        
        main_svg += f'''
    <rect x="{x - card_w//2 + 30}" y="{y - card_h//2}" 
          width="{card_w - 60}" height="{card_h}" rx="15" 
          fill="{culoare}" opacity="0.1" 
          stroke="{culoare}" stroke-width="2"/>
    <text x="{x - 40}" y="{y + 18}" text-anchor="middle" 
          font-size="48" font-family="{EMOJI_FONT}">{emoji}</text>
    <text x="{x + 40}" y="{y - 10}" text-anchor="middle" 
          font-family="Arial" font-size="18" font-weight="bold" fill="{culoare}">
        {escape_xml(nume)}
    </text>
    <text x="{x + 40}" y="{y + 20}" text-anchor="middle" 
          font-family="Arial" font-size="12" fill="#7F8C8D" font-style="italic">
        {escape_xml(reprezentare)}
    </text>'''
    
    footer_y = y_grid + rows * (card_h + 20) + 30
    footer, y_final = _svg_footer(definitie, explicatie, width, footer_y)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


# ============ LAYOUT 5: SIMPLU ============
def _svg_simplu(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")[:250]
    explicatie = data.get("explicatie_vizuala", "")[:130]
    elemente = data.get("elemente", [])[:4]
    
    width = 900
    n = len(elemente)
    main_svg = ""
    
    if n > 0:
        margin_x = 80
        available = width - 2 * margin_x
        spacing = available / n if n > 1 else available
        start_x = margin_x + spacing / 2
        y_center = 290
        
        for i, elem in enumerate(elemente):
            x = start_x + i * spacing
            main_svg += _element_big_emoji(x, y_center, elem, radius=60, index=i)
    
    footer, y_final = _svg_footer(definitie, explicatie, width, 500)
    height = y_final + 20
    
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    {_svg_header(concept, "", width)}
    {main_svg}
    {footer}
</svg>'''


# ============ ROUTER ============
def generate_card_svg(data: dict) -> str:
    layout = data.get("layout", "simplu")
    
    if layout == "formula":
        return _svg_formula(data)
    elif layout == "flow":
        return _svg_flow(data)
    elif layout == "geometric":
        return _svg_geometric(data)
    elif layout == "proprietati":
        return _svg_proprietati(data)
    else:
        return _svg_simplu(data)


# ============ PIPELINE ============
def generate_card_from_definition(
    definitie: str,
    delay: float = 2.0,
    explanation_hint: str = "",
    image_prompt_hint: str = "",
) -> Optional[dict]:
    """
    Pipeline: definiție → analiză AI → SVG card.
    
    Args:
        definitie: textul definiției
        delay: pauză după generare
        explanation_hint: explicație din JSON-ul colegului (opțional)
        image_prompt_hint: prompt imagine din JSON-ul colegului (opțional)
    """
    print(f"\n{'='*70}")
    print(f"📝 {definitie[:90]}...")
    print(f"{'='*70}")
    
    print("📊 Analiză definiție...")
    data = analyze_definition(definitie)
    if not data:
        return None
    
    # Folosește explanation_hint dacă AI-ul nu a dat explicație bună
    if not data.get("explicatie_vizuala") and explanation_hint:
        data["explicatie_vizuala"] = explanation_hint[:150]
    
    # Salvează image_prompt pentru viitor
    if image_prompt_hint:
        data["image_prompt"] = image_prompt_hint
    
    subtipo = f" / {data.get('subtipo')}" if data.get('subtipo') else ""
    print(f"🎨 Generare card SVG (layout: {data.get('layout')}{subtipo})...")
    svg = generate_card_svg(data)
    
    slug = slugify(data.get("concept", "card"))
    svg_path = CARDS_DIR / f"{slug}.svg"
    json_path = CARDS_DIR / f"{slug}.json"
    
    svg_path.write_text(svg, encoding="utf-8")
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    
    print(f"✅ {svg_path}")
    
    if delay > 0:
        time.sleep(delay)
    
    return {
        "concept": data.get("concept"),
        "slug": slug,
        "svg_path": str(svg_path),
        "json_path": str(json_path),
        "data": data,
    }

# ============ TEST ============
if __name__ == "__main__":
    print("🎨 AI Card Generator v3\n")
    
    definitii = [
        "Volumul este masa suprapusă la densitate",
        "Reflexia luminii este schimbarea direcției de propagare a luminii la suprafața de separație a două medii",
        "Refracția luminii este schimbarea direcției de propagare a luminii la trecerea ei prin suprafața de separație a două medii transparente",
        "Unghiul de incidență este unghiul format de raza incidentă și perpendiculara coborâtă în punctul de incidență",
        "Unghiul de reflexie este unghiul format de raza reflectată și perpendiculara coborâtă în punctul de incidență",
        "Oglinda plană este suprafața plană, netedă și lucioasă care reflectă bine lumina",
        "Intensitatea curentului este direct proporțională cu tensiunea și invers proporțională cu rezistența",
    ]
    
    results = []
    for d in definitii:
        r = generate_card_from_definition(d, delay=3.0)
        if r:
            results.append(r)
    
    print(f"\n{'='*70}")
    print(f"✅ Generate {len(results)}/{len(definitii)} carduri")
    print(f"📁 xdg-open cards/")
    print(f"{'='*70}")