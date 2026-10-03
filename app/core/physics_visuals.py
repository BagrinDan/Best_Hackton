"""Small, consistent vector illustrations for textbook physics concepts."""

import unicodedata


def normalize(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", text.lower()) if not unicodedata.combining(c))


def scene_for_term(term: str) -> str | None:
    text = normalize(term)
    if "forta" in text or "force" in text:
        if text.strip() in ("forta", "force"):
            return "force"
        if "frecare" in text or "friction" in text:
            return "friction"
        return None
    for keywords, scene in (
        (("frecare", "friction"), "friction"),
        (("densitat", "density"), "density"),
        (("miscare", "viteza", "motion", "speed"), "motion"),
        (("forta", "force"), "force"),
        (("volum", "volume"), "volume"),
        (("circuit",), "circuit"),
    ):
        if any(word in text for word in keywords):
            return scene
    return None


def icon_svg(element: dict, x: float, y: float, color: str) -> str:
    """Draw a vector icon chosen from meaning; never rely on emoji fonts."""
    text = normalize(" ".join(str(element.get(k, "")) for k in ("nume", "reprezentare", "simbol")))
    emoji = element.get("emoji", "")
    if any(k in text for k in ("volum", "vas", "apa", "recipient")) or "🥛" in emoji:
        shape = '<path d="M-30-35V35Q0 48 30 35V-35" fill="#e9f4ff"/><path d="M-30 0Q0 12 30 0V35Q0 48-30 35Z" fill="#a7d9f5"/><ellipse cy="-35" rx="30" ry="9" fill="white"/>'
    elif any(k in text for k in ("masa", "greutate", "kg")) or any(k in emoji for k in ("⚖", "🪣")):
        shape = '<circle cy="-28" r="12" fill="none"/><path d="M-25-12H25L38 38H-38Z" fill="#c6d5ed"/><path d="M-15 17H15"/>'
    elif any(k in text for k in ("densitat", "particul")):
        shape = '<rect x="-36" y="-36" width="72" height="72" rx="10" fill="#e5f5ed"/>' + ''.join(f'<circle cx="{xx}" cy="{yy}" r="5" fill="{color}" stroke="none"/>' for xx in (-20, 0, 20) for yy in (-20, 0, 20))
    elif any(k in text for k in ("lumina", "lumin", "bec")) or any(k in emoji for k in ("💡", "🔆", "✨")):
        shape = '<path d="M-15 18C-15 7-29 2-29-15A29 29 0 0 1 29-15C29 2 15 7 15 18Z" fill="#fff1b8"/><path d="M-15 25H15M-12 34H12M0-28V-5M-43-20H-36M36-20H43"/>'
    elif any(k in text for k in ("oglind", "suprafata")) or "🪞" in emoji:
        shape = '<rect x="-28" y="-40" width="56" height="68" rx="8" fill="#d6eaf5"/><path d="M-15-23L13 5M-15-10L3 8M0 28V42M-20 42H20"/>'
    elif any(k in text for k in ("timp", "clock")) or "⏱" in emoji:
        shape = '<circle r="34" fill="white"/><path d="M0-22V0L18 12"/><circle r="3"/>'
    elif any(k in text for k in ("tensiune", "bateri")) or "🔋" in emoji:
        shape = '<rect x="-25" y="-35" width="50" height="70" rx="8" fill="#e6f4ee"/><path d="M-10-42H10M-12-14H12M0-26V-2M-12 20H12"/>'
    elif any(k in text for k in ("rezistent", "resistor")) or "🚧" in emoji:
        shape = '<path d="M-45 0H-30L-20-15-8 15 4-15 16 15 28 0H45"/>'
    elif any(k in text for k in ("forta", "directie", "acceler", "curent")) or "➡" in emoji:
        shape = '<path d="M-40 0H35M15-20L38 0 15 20"/>'
    elif any(k in text for k in ("lungime", "rigla", "masur")) or "📏" in emoji:
        shape = '<rect x="-45" y="-18" width="90" height="36" rx="5" fill="#fff0c2"/><path d="M-30-18V0M-15-18V-5M0-18V0M15-18V-5M30-18V0"/>'
    elif any(k in text for k in ("temperat", "caldur")):
        shape = '<path d="M-10 18V-30A10 10 0 0 1 10-30V18A20 20 0 1 1-10 18Z" fill="#ffe7df"/><path d="M0-18V30"/><circle cy="30" r="8" fill="#e76f51" stroke="none"/>'
    else:
        shape = '<rect x="-34" y="-30" width="68" height="60" rx="12" fill="#e8effa"/><path d="M-34-12H34M-12-30V30"/>'
    return f'<g transform="translate({x} {y})" stroke="{color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">{shape}</g>'


def scene_svg(scene: str) -> str:
    """Render schematic examples, with no numeric measurements or invented formula."""
    blue, red = "#2f5d9b", "#d85f4a"
    arrow = lambda x1, y1, x2, y2, color=blue: f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="7" marker-end="url(#arrow-{color[1:]})"/>'
    block = lambda x, y, color: f'<rect x="{x}" y="{y}" width="120" height="90" rx="14" fill="{color}" stroke="{blue}" stroke-width="3"/><path d="M{x+20} {y+20}H{x+100}" stroke="white" stroke-opacity=".7" stroke-width="5"/>'
    surface = '<path d="M70 265H730" stroke="#7890ab" stroke-width="4"/>'
    if scene == "motion":
        content = surface + block(130, 170, "#d7e6f8") + block(530, 170, "#9fc2ed")
        content += arrow(260, 205, 505, 205) + '<circle cx="100" cy="135" r="10" fill="#e4b74c"/><path d="M100 145V265" stroke="#7890ab" stroke-width="3"/>'
        content += '<text x="190" y="305">A</text><text x="590" y="305">B</text>'
    elif scene in ("force", "friction"):
        content = surface + block(340, 170, "#b5d1ef") + arrow(470, 210, 680, 210)
        if scene == "friction":
            content += arrow(330, 230, 130, 230, red)
            content += ''.join(f'<path d="M{x} 275l-12 12" stroke="#7890ab" stroke-width="2"/>' for x in range(90, 720, 25))
    elif scene == "density":
        content = ''
        for x, count, color in ((140, 3, blue), (490, 5, red)):
            content += f'<rect x="{x}" y="90" width="170" height="170" rx="16" fill="white" stroke="{color}" stroke-width="4"/>'
            for i in range(count):
                for j in range(count):
                    content += f'<circle cx="{x+25+i*120/(count-1)}" cy="{115+j*120/(count-1)}" r="7" fill="{color}"/>'
    elif scene == "volume":
        content = '<path d="M260 70L510 105V275L260 240Z" fill="#e3eefb" stroke="#2f5d9b" stroke-width="3"/><path d="M260 70L360 25L610 60L510 105Z" fill="#f0f6ff" stroke="#2f5d9b" stroke-width="3"/><path d="M510 105L610 60V230L510 275Z" fill="#bad3ef" stroke="#2f5d9b" stroke-width="3"/>'
    elif scene == "circuit":
        content = '<path d="M190 170V85H610V255H190V195" fill="none" stroke="#2f5d9b" stroke-width="5"/><path d="M160 170H220M175 195H205" stroke="#d85f4a" stroke-width="6"/><circle cx="610" cy="170" r="40" fill="#fff1b8" stroke="#2f5d9b" stroke-width="4"/><path d="M590 150L630 190M630 150L590 190" stroke="#2f5d9b" stroke-width="3"/>'
    else:
        raise ValueError(f"Unsupported physics scene: {scene}")
    defs = ''.join(f'<marker id="arrow-{color[1:]}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="{color}"/></marker>' for color in (blue, red))
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="340" viewBox="0 0 800 340"><defs>{defs}</defs><g font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="{blue}">{content}</g></svg>'
