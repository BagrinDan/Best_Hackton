from svg_generator import generate_card

# Pune aici definițiile tale
definitions = [
    {
        "concept": "Densitatea",
        "definitie": "Densitatea este masa unității de volum"
    },
    {
        "concept": "Forța",
        "definitie": "Forța este produsul dintre masă și accelerație"
    },
    {
        "concept": "Energia cinetică",
        "definitie": "Energia cinetică este energia unui corp aflat în mișcare"
    },
]

for d in definitions:
    generate_card(d["concept"], d["definitie"])

