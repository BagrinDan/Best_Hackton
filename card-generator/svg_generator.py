"""
SVG Generator - Metoda A
Generează carduri vizuale din definiții, fără GPU, fără internet.
"""

import os
import re
from pathlib import Path

# ============ CONFIG ============
CARDS_DIR = Path("cards")
CARDS_DIR.mkdir(exist_ok=True)


# ============ UTILITARE ============

def escape_xml(text):
    """Escape caractere speciale XML"""
    if not text:
        return ""
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;"))


def slugify(text):
    """Transformă text în nume de fișier safe"""
    text = text.lower().strip()
    # Înlocuiește diacriticele românești
    replacements = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
        'Ă': 'a', 'Â': 'a', 'Î': 'i', 'Ș': 's', 'Ț': 't',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Înlocuiește non-alfanumerice cu _
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')[:50]


# ============ EXTRAGERE ELEMENTE ============

def extract_elements(definitie, concept=""):
    """
    Extrage elemente vizuale din definiție.
    
    În producție: folosești un LLM (GPT, Gemini) care returnează JSON.
    Pentru test: folosim pattern matching simplu.
    """
    d = (definitie + " " + concept).lower()
    
    # Volum / densitate
    if any(k in d for k in ["volum", "densitate", "masa"]):
        return [
            {"emoji": "🥛", "label": "V", "sub": "volum", "culoare": "#4A90E2"},
            {"emoji": "🪣", "label": "m", "sub": "masa", "culoare": "#E74C3C"},
            {"emoji": "📏", "label": "ρ", "sub": "densitate", "culoare": "#27AE60"},
        ]
    
    # Fotosinteză
    if "fotosintez" in d:
        return [
            {"emoji": "☀️", "label": "Lumină", "sub": "energie", "culoare": "#F4A261"},
            {"emoji": "🌱", "label": "Plantă", "sub": "transformare", "culoare": "#27AE60"},
            {"emoji": "🍬", "label": "Glucoză", "sub": "produs", "culoare": "#E76F51"},
        ]
    
    # Electricitate / Ohm
    if any(k in d for k in ["curent", "tensiune", "rezisten", "ohm"]):
        return [
            {"emoji": "🔋", "label": "U", "sub": "tensiune", "culoare": "#E74C3C"},
            {"emoji": "🚰", "label": "I", "sub": "curent", "culoare": "#4A90E2"},
            {"emoji": "🚧", "label": "R", "sub": "rezistență", "culoare": "#27AE60"},
        ]
    
    # Forță / Newton
    if any(k in d for k in ["forță", "forta", "newton", "accelera"]):
        return [
            {"emoji": "🏋️", "label": "F", "sub": "forță", "culoare": "#E74C3C"},
            {"emoji": "⚖️", "label": "m", "sub": "masă", "culoare": "#4A90E2"},
            {"emoji": "🚀", "label": "a", "sub": "accelerație", "culoare": "#27AE60"},
        ]
    
    # Default: 3 elemente generice
    return [
        {"emoji": "📖", "label": "A", "sub": "concept", "culoare": "#4A90E2"},
        {"emoji": "➡️", "label": "→", "sub": "relație", "culoare": "#E74C3C"},
        {"emoji": "💡", "label": "B", "sub": "rezultat", "culoare": "#27AE60"},
    ]


def extract_formula(definitie):
    """Încearcă să extragă o formulă din definiție"""
    # Caută pattern "X = Y / Z" sau similar
    patterns = [
        r'([A-Za-zρσΔ][A-Za-z0-9_]*)\s*=\s*([A-Za-z0-9_/×·*+\-\s]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, definitie)
        if match:
            return match.group(0).strip()
    
    # Default
    return None


# ============ SVG GENERATOR ============

def generate_svg_card(concept, definitie, elements=None, formula=None):
    """
    Generează un card SVG complet.
    
    Args:
        concept: Numele conceptului (ex: "Volumul")
        definitie: Definiția completă
        elements: Lista de elemente vizuale (opțional)
        formula: Formula (opțional, se extrage automat)
    
    Returns:
        String SVG
    """
    if elements is None:
        elements = extract_elements(definitie, concept)
    
    if formula is None:
        formula = extract_formula(definitie)
    
    n = len(elements)
    width = max(800, 200 + n * 180)
    height = 520
    
    # ===== HEADER =====
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FAFBFC"/>
            <stop offset="100%" style="stop-color:#E9ECEF"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
        </filter>
        <filter id="shadowSmall" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
        </filter>
    </defs>
    
    <!-- Fundal -->
    <rect width="{width}" height="{height}" fill="url(#bgGrad)"/>
    
    <!-- Titlu concept -->
    <text x="{width//2}" y="55" text-anchor="middle" 
          font-family="Arial, Helvetica, sans-serif" font-size="32" 
          font-weight="bold" fill="#2C3E50">
        {escape_xml(concept)}
    </text>
    
    <!-- Linie decorativă sub titlu -->
    <line x1="{width//2 - 60}" y1="75" x2="{width//2 + 60}" y2="75" 
          stroke="#4A90E2" stroke-width="3" stroke-linecap="round"/>
'''
    
    # ===== ELEMENTE VIZUALE =====
    x_positions = [150 + i * 180 for i in range(n)]
    operators = ["÷", "=", "+", "−", "×"]
    
    for i, elem in enumerate(elements[:5]):
        x = x_positions[i]
        culoare = elem.get("culoare", "#4A90E2")
        
        svg += f'''
    <!-- Element {i+1}: {escape_xml(elem.get("sub", ""))} -->
    <g transform="translate({x}, 230)" filter="url(#shadow)">
        <circle cx="0" cy="0" r="65" fill="{culoare}" opacity="0.15"/>
        <circle cx="0" cy="0" r="65" fill="none" stroke="{culoare}" stroke-width="3"/>
        <text x="0" y="22" text-anchor="middle" font-size="58">{elem.get("emoji", "❓")}</text>
    </g>
    <text x="{x}" y="330" text-anchor="middle" font-family="Arial" 
          font-size="22" font-weight="bold" fill="#2C3E50">
        {escape_xml(elem.get("label", ""))}
    </text>
    <text x="{x}" y="355" text-anchor="middle" font-family="Arial" 
          font-size="14" fill="#7F8C8D">
        {escape_xml(elem.get("sub", ""))}
    </text>
'''
        # Operator între elemente
        if i < n - 1 and i < len(operators):
            op_x = x + 90
            svg += f'''
    <text x="{op_x}" y="240" text-anchor="middle" font-size="44" 
          fill="#2C3E50" font-family="Arial" font-weight="bold">
        {operators[i]}
    </text>
'''
    
    # ===== FORMULĂ (dacă există) =====
    if formula:
        svg += f'''
    <!-- Formulă -->
    <rect x="{width//2 - 150}" y="370" width="300" height="45" rx="22" 
          fill="#2C3E50" filter="url(#shadowSmall)"/>
    <text x="{width//2}" y="398" text-anchor="middle" font-family="Arial" 
          font-size="20" font-weight="bold" fill="#FFFFFF">
        {escape_xml(formula)}
    </text>
'''
    
    # ===== DEFINIȚIE JOS =====
    def_y = 430 if formula else 390
    svg += f'''
    <!-- Definiție -->
    <rect x="50" y="{def_y}" width="{width-100}" height="70" rx="12" 
          fill="#FFF9E6" stroke="#F4A261" stroke-width="2"/>
    <text x="{width//2}" y="{def_y + 28}" text-anchor="middle" 
          font-family="Arial" font-size="14" font-weight="bold" fill="#E76F51">
        📖 Definiție
    </text>
    <text x="{width//2}" y="{def_y + 52}" text-anchor="middle" 
          font-family="Arial" font-size="14" fill="#2C3E50">
        {escape_xml(definitie[:110])}{"..." if len(definitie) > 110 else ""}
    </text>
</svg>'''
    
    return svg


# ============ FUNCȚIA PRINCIPALĂ ============

def generate_card(concept, definitie, output_dir=None):
    """
    Generează un card SVG și îl salvează.
    
    Returns:
        Path către fișierul generat
    """
    if output_dir is None:
        output_dir = CARDS_DIR
    
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # Generează SVG
    svg = generate_svg_card(concept, definitie)
    
    # Salvează
    filename = f"{slugify(concept)}.svg"
    filepath = output_dir / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg)
    
    print(f"✅ {filepath}")
    return filepath


# ============ TEST ============

if __name__ == "__main__":
    print("🎨 SVG Card Generator - Metoda A\n")
    
    # Test 1: Volumul
    generate_card(
        concept="Volumul",
        definitie="Volumul este masa supra densitate"
    )
    
    # Test 2: Fotosinteza
    generate_card(
        concept="Fotosinteza",
        definitie="Procesul prin care plantele transformă energia luminoasă în energie chimică"
    )
    
    # Test 3: Legea lui Ohm
    generate_card(
        concept="Legea lui Ohm",
        definitie="Intensitatea curentului este direct proporțională cu tensiunea și invers proporțională cu rezistența"
    )
    
    print("\n✅ Gata! Deschide fișierele din cards/ în browser.")
    print("   Exemplu: xdg-open cards/volumul.svg")
