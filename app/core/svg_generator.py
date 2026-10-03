"""Pure SVG card rendering: no network calls or GPU dependencies."""


import re
import xml.etree.ElementTree as ET


PALETTE = ["#4A90E2", "#E74C3C", "#27AE60", "#F4A261", "#7B68EE"]


EMOJI_FONT = "Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif"


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
    culoare = safe_color(elem.get("culoare"), index)
    simbol = elem.get("simbol", "?")[:4]
    emoji = elem.get("emoji", "❓")
    nume = elem.get("nume", "")[:20]
    reprezentare = elem.get("reprezentare", "")[:30]
    
    return f'''
    <circle cx="{x}" cy="{y}" r="{radius}" fill="{culoare}" opacity="0.15"/>
    <circle cx="{x}" cy="{y}" r="{radius}" fill="none" stroke="{culoare}" stroke-width="3"/>
    <text x="{x}" y="{y + 20}" text-anchor="middle" font-size="64" 
          font-family="{EMOJI_FONT}">{escape_xml(emoji)}</text>
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


def _svg_formula(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    formula = (data.get("formula") or "")[:40]
    definitie = data.get("definitie_scurta", data.get("explicatie_vizuala", ""))
    explicatie = data.get("explicatie_vizuala", "")[:130]
    elemente = data.get("elemente", [])[:4]
    operatori = data.get("operatori", [])
    
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


def _svg_flow(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")
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
    definitie = data.get("definitie_scurta", "")
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


def _svg_proprietati(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")
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
        
        culoare = safe_color(elem.get("culoare"), i)
        nume = elem.get("nume", "")[:20]
        reprezentare = elem.get("reprezentare", "")[:30]
        emoji = elem.get("emoji", "❓")
        
        main_svg += f'''
    <rect x="{x - card_w//2 + 30}" y="{y - card_h//2}" 
          width="{card_w - 60}" height="{card_h}" rx="15" 
          fill="{culoare}" opacity="0.1" 
          stroke="{culoare}" stroke-width="2"/>
    <text x="{x - 40}" y="{y + 18}" text-anchor="middle" 
          font-size="48" font-family="{EMOJI_FONT}">{escape_xml(emoji)}</text>
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


def _svg_simplu(data: dict) -> str:
    concept = data.get("concept", "")[:50]
    definitie = data.get("definitie_scurta", "")
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


def safe_color(value, index=0):
    """Only accept hex colors in SVG attributes."""
    return value if isinstance(value, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", value) else PALETTE[index % len(PALETTE)]


def generate_illustration_svg(data: dict) -> str:
    """Render only the diagram for a study card, without its answer and footer."""
    plan = dict(data, concept="", formula="", definitie_scurta="", explicatie_vizuala="")
    if not plan.get("elemente") and plan.get("layout") != "geometric":
        plan["layout"] = "simplu"
        plan["elemente"] = [{"simbol": "", "nume": "", "reprezentare": "", "emoji": "📘", "culoare": "#4A90E2"}]
    root = ET.fromstring(generate_card_svg(plan))
    # The shared header always emits defs, background, header background, title.
    # Preserve its definitions for shadows used by the illustration itself.
    for node in list(root)[1:4]:
        root.remove(node)
    width = int(root.attrib["width"])
    height = int(root.attrib["height"]) - 150
    root.set("viewBox", f"0 130 {width} {height}")
    root.set("height", str(height))
    root.set("preserveAspectRatio", "xMidYMid meet")
    return ET.tostring(root, encoding="unicode")
