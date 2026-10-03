const FAQ = [
  [
    "Cum încep să învăț?",
    "Din pagina principală alegi „Pe domenii” sau „Clase”. Ajungi la o temă și apeși pe ea ca să se deschidă flashcard-urile.",
  ],
  [
    "Cum funcționează un flashcard?",
    "Pe fața cardului vezi imaginea și întrebarea. Apeși pe card ca să-l întorci și să vezi răspunsul, formula și desenul.",
  ],
  [
    "Ce înseamnă „Nu știu” și „Știu”?",
    "Sunt cele 2 butoane de sub card și alcătuiesc raportul final. La „Nu știu” primești dedesubt o explicație mai detaliată, nu doar răspunsul.",
  ],
  [
    "Care e diferența dintre domenii și clase?",
    "„Pe domenii” grupează fizica după subiect (Mecanică, Optică etc.). „Clase” urmează manualul fiecărei clase, capitol cu capitol.",
  ],
  [
    "Pot încărca propriul manual?",
    "Da, din butonul „Încarcă un PDF”. Definițiile din manual sunt extrase și transformate în carduri SVG pe care le poți studia.",
  ],
  [
    "Ce sunt jocurile?",
    "Sunt în „Clase”: alegi clasa, capitolul și tema, iar fiecare temă are jocurile ei (formule, duel, 3D) acolo unde se potrivesc.",
  ],
];
const C1 = [
  {
    tag: "CONCEPT",
    q: "Ce este mișcarea mecanică?",
    a: "🚗<small>A ─────────→ B</small>",
    f: "Schimbarea poziției",
    e: "Mișcarea mecanică este <b>schimbarea poziției unui corp în timp</b> față de un reper.",
    h: "Pentru a descrie mișcarea avem nevoie de corp, reper și timp.",
    m: "🏠 🚗 → → →",
  },
  {
    tag: "CONCEPT",
    q: "Ce este reperul în descrierea mișcării?",
    a: "🏠 🚲<small>reper &nbsp;&nbsp;&nbsp; corp</small>",
    f: "Un corp de referință",
    e: "Reperul este corpul sau punctul față de care stabilim <b>poziția și mișcarea</b> altui corp.",
    h: "Un copac poate fi reper pentru o bicicletă care trece pe lângă el.",
    m: "🌳 │ 🚲 →",
  },
  {
    tag: "IMAGINE",
    q: "Mașina își schimbă poziția față de copac. Este în mișcare?",
    a: "🌳 🚙💨<small>poziția se schimbă →</small>",
    f: "Da, este în mișcare",
    e: "Poziția mașinii față de reperul ales, <b>copacul</b>, se modifică în timp.",
    h: "Mișcarea și repausul se stabilesc întotdeauna față de un reper.",
    m: "🌳 🚙 → →",
  },
  {
    tag: "CONCEPT",
    q: "Ce este traiectoria unui corp?",
    a: "⚽<small>⌒ ⌒ ⌒ linia descrisă</small>",
    f: "Linia descrisă de corp",
    e: "Traiectoria este <b>linia pe care o descrie corpul</b> în timpul mișcării.",
    h: "Traiectoria poate fi dreaptă, circulară sau curbilinie.",
    m: "⚽ ⤴ ⤵",
  },
  {
    tag: "ASOCIERE",
    q: "Ce traiectorie are un lift care urcă vertical?",
    a: "🏢⬆️<small>urcă pe verticală</small>",
    f: "Rectilinie",
    e: "Liftul se deplasează pe o <b>linie dreaptă verticală</b>, deci mișcarea este rectilinie.",
    h: "„Rectilinie” înseamnă că traiectoria este o dreaptă.",
    m: "▯ ↑ ▯ ↑ ▯",
  },
  {
    tag: "ASOCIERE",
    q: "Ce traiectorie are un punct de pe roata unei biciclete?",
    a: "🚲<small>roata se rotește ⟳</small>",
    f: "Circulară",
    e: "Față de centrul roții, punctul descrie un <b>cerc</b>.",
    h: "Mișcarea în jurul unui centru fix are traiectorie circulară.",
    m: "● ⟳",
  },
  {
    tag: "CONCEPT",
    q: "Ce reprezintă distanța parcursă?",
    a: "🚶‍♀️<small>A ~~~~~~~~ B</small>",
    f: "Lungimea drumului",
    e: "Distanța este <b>lungimea totală a traiectoriei</b> parcurse de corp.",
    h: "Distanța se măsoară în metri (m) în Sistemul Internațional.",
    m: "A ─── s ─── B",
  },
  {
    tag: "COMPARAȚIE",
    q: "Un pasager stă pe scaun într-un autobuz în mers. Față de autobuz este...",
    a: "🚌 🧍<small>autobuzul → → →</small>",
    f: "În repaus",
    e: "Față de autobuz, poziția pasagerului <b>nu se schimbă</b>. Față de stradă, el este în mișcare.",
    h: "Același corp poate fi în repaus față de un reper și în mișcare față de altul.",
    m: "🚌🧍 → | 🏠",
  },
  {
    tag: "UNITĂȚI",
    q: "Care este unitatea SI pentru distanță?",
    a: "📏<small>? = unitatea distanței</small>",
    f: "metrul (m)",
    e: "În Sistemul Internațional, distanța și deplasarea se exprimă în <b>metri (m)</b>.",
    h: "Pentru drumuri mari se folosesc kilometri, dar unitatea SI este metrul.",
    m: "1 km = 1000 m",
  },
  {
    tag: "RECAPITULARE",
    q: "Ce trei elemente sunt esențiale pentru descrierea mișcării?",
    a: "🚗 🌳 ⏱️<small>corp + reper + timp</small>",
    f: "Corp • reper • timp",
    e: "Descrierea pornește de la <b>corpul studiat</b>, <b>reperul ales</b> și evoluția poziției în <b>timp</b>.",
    h: "Aceste elemente ne spun dacă un corp se mișcă sau este în repaus.",
    m: "🚗 + 🌳 + ⏱️",
  },
];
const C2 = [
  {
    tag: "FORMULĂ",
    q: "Cum se calculează viteza medie?",
    a: "🏎️ ⏱️<small>distanță ÷ timp</small>",
    f: "v = d / t",
    e: "Viteza medie este <b>distanța parcursă împărțită la timpul</b> în care a fost parcursă.",
    h: "Unitatea SI pentru viteză este m/s.",
    m: "v = d ÷ t",
  },
  {
    tag: "PROBLEMĂ",
    q: "Un tren parcurge 120 km în 2 h. Care este viteza medie?",
    a: "🚆<small>120 km în 2 h</small>",
    f: "60 km/h",
    e: "v = d / t = 120 km / 2 h = <b>60 km/h</b>.",
    h: "Împarte distanța la timp și păstrează unitățile.",
    m: "120 ÷ 2 = 60",
  },
  {
    tag: "CONCEPT",
    q: "Ce înseamnă mișcare uniformă?",
    a: "🚄<small>viteză constantă →→→</small>",
    f: "Viteză constantă",
    e: "Într-o mișcare uniformă, corpul parcurge <b>distanțe egale în intervale de timp egale</b>.",
    h: "Viteza nu se schimbă pe tot parcursul mișcării.",
    m: "v = ct.",
  },
];
const S = { "Mișcarea mecanică": C1, Viteza: C2 };
const DOM = [
  [
    "🚗",
    "Mecanică",
    "Mișcare, forțe, energie",
    "Mișcarea mecanică,Viteza,Accelerația,Forța,Energia",
  ],
  [
    "🌍",
    "Gravitație",
    "Atracția corpurilor",
    "Greutatea,Căderea liberă,Câmpul gravitațional",
  ],
  [
    "💧",
    "Fluide și presiune",
    "Lichide și gaze",
    "Presiunea,Principiul lui Arhimede,Vasele comunicante",
  ],
  [
    "🌡️",
    "Termodinamică",
    "Căldură și temperatură",
    "Temperatura,Căldura,Gazul ideal",
  ],
  [
    "🌊",
    "Oscilații și unde",
    "Pendul și frecvență",
    "Pendulul,Frecvența,Undele mecanice",
  ],
  ["🔊", "Acustică", "Sunet și ecou", "Sunetul,Ecoul,Înălțimea sunetului"],
  [
    "💡",
    "Electricitate",
    "Curent și circuite",
    "Curentul electric,Tensiunea,Legea lui Ohm",
  ],
  ["🧲", "Magnetism", "Câmp magnetic", "Magneții,Câmpul magnetic,Busola"],
  [
    "⚡",
    "Electromagnetism",
    "Inducție, transformator",
    "Inducția,Generatorul,Transformatorul",
  ],
  ["🌈", "Optică", "Reflexie și refracție", "Reflexia,Refracția,Lentilele"],
  [
    "⚛️",
    "Fizică atomică",
    "Atom și electroni",
    "Modelul atomic,Electronii,Nivelurile energetice",
  ],
  [
    "☢️",
    "Fizică nucleară",
    "Radioactivitate",
    "Nucleul,Radioactivitatea,Fisiunea",
  ],
  [
    "🚀",
    "Fizică modernă",
    "Fotoni, concepte moderne",
    "Fotonii,Efectul fotoelectric,Dualitatea",
  ],
  [
    "🪐",
    "Astronomie",
    "Planete, stele, Univers",
    "Sistemul solar,Stelele,Universul",
  ],
  ["🎲", "Toate domeniile", "Recapitulare amestecată", ""],
];
const CL = {
  6: "Mișcarea mecanică:Mișcarea mecanică,Viteza,Traiectoria|Forța:Forța,Greutatea,Frecarea|Energia:Energia,Lucrul mecanic",
  7: "Mecanica:Forța,Presiunea,Arhimede|Căldura:Temperatura,Dilatarea|Electricitate:Curentul electric,Circuitul",
  8: "Optică:Reflexia,Refracția,Lentilele|Electricitate:Tensiunea,Legea lui Ohm|Magnetism:Câmpul magnetic",
  9: "Cinematica:Mișcarea mecanică,Viteza,Accelerația|Dinamica:Legile lui Newton,Frecarea|Energia:Lucrul mecanic,Energia cinetică",
  10: "Termodinamică:Temperatura,Gazul ideal|Electrostatica:Sarcina electrică,Câmpul electric|Curentul continuu:Legea lui Ohm,Circuite",
  11: "Oscilații:Pendulul,Oscilatorul|Unde:Undele mecanice,Interferența|Optică ondulatorie:Difracția,Polarizarea",
  12: "Fizică atomică:Modelul atomic,Spectre|Fizică nucleară:Radioactivitatea,Fisiunea|Relativitate:Postulatele,Dilatarea timpului",
};
/* Clasa a 6-a: capitole, teme, jocuri pe temă */
const CH6 = [
  [
    "I. Introducere în studiul fizicii",
    "🔬",
    ["1.1 Ce este fizica? Fenomenul fizic", "1.2 Recapitulare"],
  ],
  [
    "II. Mărimi fizice. Măsurări",
    "📏",
    [
      "2.1 Mărimi fizice. Unități de măsură",
      "2.2 Măsurarea lungimii. Erori instrumentale. Calculul erorilor",
      "2.3 Măsurarea timpului. Aplicații",
      "2.4 Măsurarea ariei și a volumului. Aplicații",
      "2.5 Lucrare de laborator „Determinarea volumului unui paralelipiped dreptunghic”",
      "2.6 Lucrare de laborator „Măsurarea volumului unui corp de formă neregulată”",
      "2.7 Proiect STEAM: Instrumente de măsură",
      "2.8 Recapitulare",
    ],
  ],
  [
    "III. Fenomene mecanice",
    "⚙️",
    [
      "3.1 Inerția",
      "3.2 Masa corpului. Cântărirea. Aplicații",
      "3.3 Densitatea substanței. Determinarea densității",
      "3.4 Lucrare de laborator „Determinarea densității substanței”",
      "3.5 Recapitulare",
    ],
  ],
  [
    "IV. Fenomene termice",
    "🌡️",
    [
      "4.1 Structura moleculară a substanței. Starea termică",
      "4.2 Încălzire, răcire, temperatura. Termometrul. Scări de temperatură",
      "4.3 Lucrare de laborator „Măsurarea temperaturii unui corp care se răcește”",
      "4.4 Dilatare/contracție (calitativ). Anomalia termică a apei",
      "4.5 Proiect STEAM: Măsurarea temperaturii",
      "4.6 Recapitulare",
    ],
  ],
  [
    "V. Fenomene electrice. Fenomene magnetice",
    "⚡",
    [
      "5.1 Electrizarea corpurilor. Sarcina electrică",
      "5.2 Structura atomică a substanței. Modelul planetar al atomului",
      "5.3 Conductoare și izolatoare electrice",
      "5.4 Electrizarea prin contact. Electrizarea prin influență",
      "5.5 Fenomene electrice în atmosferă. Măsuri de protecție",
      "5.6 Magneți. Interacțiuni între magneți, poli magnetici",
      "5.7 Recapitulare",
    ],
  ],
  [
    "VI. Fenomene optice",
    "💡",
    [
      "6.1 Surse de lumină. Corpuri transparente, translucide și opace",
      "6.2 Propagarea rectilinie a luminii. Fascicul de lumină",
      "6.3 Umbra și penumbra",
      "6.4 Eclipsele de Soare și de Lună",
      "6.5 Recapitulare",
    ],
  ],
];
/* q = „întrebare|corect|greșit|greșit|greșit”, separate prin ¦ ; f = „Nume~formulă” ; a = atom 3D ; b = balanță 3D */
const K = {
  1.1: {
    q: "Ce studiază fizica?|Fenomenele naturii și proprietățile corpurilor|Doar plantele și animalele|Doar substanțele chimice|Istoria popoarelor¦Care este un fenomen fizic?|Topirea gheții|Arderea lemnului|Ruginirea fierului|Putrezirea fructelor¦În fenomenul fizic...|nu apar substanțe noi|apar mereu substanțe noi|dispar toate corpurile|se schimbă mereu culoarea¦Care este un fenomen sonor?|Ecoul|Fulgerul|Evaporarea|Magnetizarea",
  },
  2.1: {
    q: "Care este unitatea SI pentru lungime?|metrul|kilogramul|secunda|litrul¦Ce este o mărime fizică?|O proprietate care se poate măsura|Un instrument de măsură|Un tip de fenomen|O formulă¦1 km = ?|1000 m|100 m|10 m|10 000 m¦Unitatea SI pentru masă este...|kilogramul|newtonul|metrul|litrul",
  },
  2.2: {
    q: "Cu ce măsurăm lungimea unei cărți?|Cu rigla|Cu cronometrul|Cu termometrul|Cu balanța¦1 m = ?|100 cm|10 cm|1000 cm|10 mm¦De ce repetăm o măsurătoare?|Pentru a reduce efectul erorilor|Ca să schimbăm unitatea|Ca să schimbăm corpul|Nu are rost¦Valoarea medie se calculează...|suma valorilor împărțită la numărul lor|ca produsul valorilor|ca diferența dintre prima și ultima|ca valoarea cea mai mare",
    f: [
      "Valoarea medie a două măsurători~xm = ( x₁ + x₂ ) / 2|xm = ( x₂ + x₁ ) / 2",
    ],
  },
  2.3: {
    q: "Cu ce măsurăm timpul?|Cu cronometrul|Cu rigla|Cu mensura|Cu dinamometrul¦1 h = ?|3600 s|60 s|360 s|1000 s¦1 min = ?|60 s|100 s|10 s|600 s¦Care instrument măsoară timpul?|Ceasul|Termometrul|Balanța|Rigla",
  },
  2.4: {
    q: "Unitatea SI pentru arie este...|m²|m|m³|kg¦Unitatea SI pentru volum este...|m³|m²|m|cm¦1 L = ?|1 dm³|1 m³|1 cm³|10 dm³¦Aria dreptunghiului este...|lungime · lățime|lungime + lățime|lungime / lățime|lungime − lățime",
    f: [
      "Aria dreptunghiului~A = L · l",
      "Volumul paralelipipedului~V = L · l · h",
    ],
  },
  2.5: {
    q: "Cum aflăm volumul unui paralelipiped dreptunghic?|Măsurăm L, l, h și le înmulțim|Măsurăm doar lungimea|Îl cântărim|Folosim termometrul¦Unitatea SI pentru volum este...|m³|m²|kg|s¦Ce măsurăm cu rigla?|Dimensiunile corpului|Masa|Temperatura|Timpul",
    f: ["Volumul paralelipipedului~V = L · l · h"],
  },
  2.6: {
    q: "Cum măsurăm volumul unui corp neregulat?|Prin scufundare într-un vas gradat|Cu rigla|Cu cronometrul|Cu dinamometrul¦Ce citim pe un cilindru gradat?|Volumul lichidului|Masa|Temperatura|Timpul¦Volumul corpului este...|volumul final minus cel inițial|suma volumelor|produsul volumelor|raportul volumelor",
    f: ["Volumul corpului neregulat~V = V₂ − V₁"],
  },
  3.1: {
    q: "Inerția este proprietatea corpurilor de a...|păstra starea de mișcare sau repaus|se încălzi|se electriza|străluci¦De ce ne înclinăm înainte când autobuzul frânează brusc?|Din cauza inerției|Din cauza căldurii|Din cauza luminii|Din cauza magnetismului¦Care corp are inerția mai mare?|Cel cu masa mai mare|Cel mai mic|Cel mai colorat|Cel mai cald¦Inerția se manifestă când...|un corp își schimbă starea de mișcare|un corp se răcește|un corp strălucește|un corp se dizolvă",
  },
  3.2: {
    b: 1,
    q: "Unitatea SI pentru masă este...|kilogramul|newtonul|litrul|metrul¦Cu ce instrument măsurăm masa?|Cu balanța|Cu rigla|Cu termometrul|Cu cronometrul¦1 kg = ?|1000 g|100 g|10 g|10 000 g¦Masa este o măsură a...|inerției corpului|temperaturii corpului|culorii corpului|formei corpului",
  },
  3.3: {
    q: "Densitatea se calculează ca...|masă împărțită la volum|volum împărțit la masă|masă înmulțită cu volum|masă minus volum¦Unitatea SI pentru densitate este...|kg/m³|kg·m|m³/kg|kg¦Densitatea apei este aproximativ...|1000 kg/m³|1 kg/m³|100 kg/m³|10 kg/m³¦Un corp mai puțin dens decât apa...|plutește|se scufundă mereu|se dizolvă|se topește",
    f: [
      "Densitatea~ρ = m / V",
      "Masa din densitate~m = ρ · V",
      "Volumul din densitate~V = m / ρ",
    ],
  },
  3.4: {
    q: "Pentru densitate măsurăm...|masa și volumul|doar timpul|doar temperatura|doar lungimea¦Cum aflăm volumul unui corp neregulat?|Prin scufundare într-un vas gradat|Cu ceasul|Cu busola|Cu balanța¦Densitatea se calculează ca...|masă împărțită la volum|volum împărțit la masă|masă înmulțită cu volum|masă minus volum",
    f: ["Densitatea~ρ = m / V"],
  },
  4.1: {
    q: "Din ce sunt formate substanțele?|Din molecule aflate în mișcare|Doar din aer|Doar din lumină|Dintr-un material continuu¦Moleculele sunt cel mai îndepărtate în stare...|gazoasă|solidă|lichidă|cristalină¦Când temperatura crește, mișcarea moleculelor...|se intensifică|încetinește|dispare|rămâne zero¦Care stare are formă și volum proprii?|Solidă|Gazoasă|Lichidă|Plasmă",
  },
  4.2: {
    q: "Cu ce măsurăm temperatura?|Cu termometrul|Cu balanța|Cu rigla|Cu cronometrul¦Apa îngheață la...|0 °C|100 °C|37 °C|−10 °C¦Apa fierbe la presiune normală la...|100 °C|0 °C|50 °C|212 °C¦Echilibrul termic înseamnă că...|corpurile ating aceeași temperatură|corpurile se opresc|corpurile se topesc|corpurile se rotesc",
    f: ["Scara Kelvin~T = t + 273|T = 273 + t"],
  },
  4.3: {
    q: "Ce instrument folosim în lucrare?|Termometrul|Rigla|Dinamometrul|Busola¦Pentru a urmări răcirea măsurăm temperatura la intervale de...|timp egale|lungime egale|masă egale|volum egale¦Răcirea se oprește la temperatura...|mediului (echilibru termic)|de 0 K|de topire|de fierbere",
  },
  4.4: {
    q: "Încălzit, un corp solid de obicei...|se dilată|se contractă mereu|dispare|își schimbă masa¦De ce au șinele de tren mici spații între ele?|Pentru dilatarea termică|Pentru zgomot|Pentru lumină|Pentru magnetism¦Apa are densitatea maximă la...|4 °C|0 °C|100 °C|20 °C¦Prin răcire corpurile de obicei...|se contractă|se dilată|se aprind|se electrizează",
  },
  5.1: {
    q: "Sarcinile electrice sunt de...|două feluri: pozitive și negative|un singur fel|trei feluri|niciun fel¦Corpuri cu sarcini de același semn...|se resping|se atrag|se topesc|nu interacționează¦Corpuri cu sarcini de semne opuse...|se atrag|se resping|se topesc|devin magneți¦Electrizarea prin frecare transferă...|electroni|neutroni|protoni|atomi întregi",
  },
  5.2: {
    a: 1,
    q: "Modelul planetar: în centrul atomului se află...|nucleul|electronii|neutrinii|moleculele¦Electronii au sarcină...|negativă|pozitivă|nulă|variabilă¦Protonii au sarcină...|pozitivă|negativă|nulă|dublă¦Un atom neutru are...|număr egal de protoni și electroni|doar protoni|doar electroni|mai mulți electroni",
  },
  5.3: {
    q: "Care este conductor electric?|Cuprul|Sticla|Cauciucul|Lemnul uscat¦Care este izolator electric?|Plasticul|Fierul|Aluminiul|Aurul¦De ce au firele înveliș de plastic?|Plasticul izolează și protejează|Arată frumos|E mai greu|Conduce mai bine¦Conductoarele au electroni...|liberi, care se pot mișca|blocați definitiv|inexistenți|doar pozitivi",
  },
  5.4: {
    q: "La electrizarea prin contact, corpurile capătă sarcini de...|același semn|semne opuse|nicio sarcină|semn variabil¦Electrizarea prin influență are loc...|fără atingere, prin apropiere|doar prin frecare|doar prin încălzire|doar prin magnet¦Electroscopul indică...|prezența sarcinii electrice|temperatura|masa|timpul",
  },
  5.5: {
    q: "Fulgerul este...|o descărcare electrică în atmosferă|o eclipsă|o reflexie|o dilatare¦Ce protejează clădirile de trăsnet?|Paratrăsnetul|Termometrul|Ceasul|Busola¦În timpul furtunii...|ne adăpostim într-o clădire|stăm sub un copac singur|ținem obiecte metalice|mergem pe câmp",
  },
  5.6: {
    q: "Polii magnetici de același nume...|se resping|se atrag|se topesc|se anulează¦Un magnet are...|doi poli: Nord și Sud|un singur pol|trei poli|niciun pol¦Ce atrage un magnet?|Fierul|Lemnul|Sticla|Plasticul",
  },
  6.1: {
    q: "Care este sursă primară de lumină?|Soarele|Luna|Oglinda|Perdeaua¦Un corp transparent...|lasă lumina să treacă|nu lasă lumina să treacă|reflectă toată lumina|absoarbe toată lumina¦Un corp opac...|nu lasă lumina să treacă|lasă lumina să treacă clar|e mereu luminos|e mereu colorat¦Geamul mat este...|translucid|opac|sursă de lumină|oglindă",
  },
  6.2: {
    q: "În mediu omogen lumina se propagă...|în linie dreaptă|în zigzag|în cerc|în spirală¦Viteza luminii în vid este aproximativ...|300 000 km/s|300 km/s|3000 km/s|30 km/s¦Un fascicul de lumină este...|un mănunchi de raze|un singur punct|un corp opac|o umbră",
  },
  6.3: {
    q: "Umbra se formează când lumina întâlnește...|un corp opac|un corp transparent|aerul|vidul¦Penumbra apare când sursa de lumină este...|extinsă, nu punctiformă|punctiformă|absentă|verde¦Umbra este regiunea în care...|nu ajunge lumina sursei|ajunge toată lumina|lumina e mai puternică|apare curcubeul",
  },
  6.4: {
    q: "Eclipsa de Soare are loc când...|Luna este între Pământ și Soare|Pământul este între Soare și Lună|Soarele este între Pământ și Lună|Marte este între ele¦Eclipsa de Lună are loc când...|Pământul este între Soare și Lună|Luna este între Soare și Pământ|Soarele este între Pământ și Lună|Venus este între ele¦Eclipsa totală de Lună apare la...|Lună plină|Lună nouă|primul pătrar|ultimul pătrar",
  },
};
const KC = {
  1.1: `🔬|Ce studiază fizica?|Fenomenele naturii
🌧️|Ploaia este un fenomen...|fizic (natural)
🧊|Topirea gheții este un fenomen...|fizic
🔥|Arderea lemnului produce...|substanțe noi (chimic)
🌈|Curcubeul este un fenomen...|optic
🔊|Ecoul este un fenomen...|sonor
🧲|Atragerea fierului de un magnet|fenomen magnetic
⚡|Fulgerul este un fenomen...|electric
🌡️|Fierberea apei este un fenomen...|termic
🍎|Căderea unui măr ține de fenomene...|mecanice`,
  2.1: `📏|Unitatea SI pentru lungime|metrul (m)
⏱️|Unitatea SI pentru timp|secunda (s)
⚖️|Unitatea SI pentru masă|kilogramul (kg)
🌡️|Ce măsoară termometrul?|temperatura
📐|Ce este o mărime fizică?|ceva ce se poate măsura
🛣️|1 km =|1000 m
🍬|1 kg =|1000 g
🕒|1 h =|3600 s
🧴|1 L =|1 dm³
🔢|SI înseamnă|Sistemul Internațional`,
  2.2: `📏|Cu ce măsori lungimea unui caiet?|cu rigla
🧵|Instrument flexibil pentru lungimi|ruleta
🔍|Liniuțele de pe riglă sunt|diviziuni
🚗|Distanțele mari se măsoară în|kilometri
🔁|De ce repeți măsurarea?|reduci eroarea
➗|Valoarea medie a măsurătorilor|suma împărțită la număr
⚠️|Eroarea instrumentală depinde de|precizia instrumentului
📎|1 m =|100 cm
✏️|1 cm =|10 mm
✍️|Rezultatul se scrie|valoare ± eroare`,
  2.3: `⏱️|Instrument pentru intervale scurte|cronometrul
⌚|Cu ce măsori timpul în general?|cu ceasul
⏳|1 min =|60 s
🕐|1 h =|60 min
📅|1 zi =|24 h
🏃|Pentru o cursă de 100 m folosești|cronometrul
🌅|Un an are aproximativ|365 de zile
🕰️|Unitatea SI pentru timp|secunda
🔔|Un interval de timp este între|două momente
⏲️|120 s =|2 min`,
  2.4: `🟦|Aria dreptunghiului|A = L · l
📦|Volumul paralelipipedului|V = L · l · h
🏠|Unitatea SI pentru arie|m²
🧊|Unitatea SI pentru volum|m³
🥛|1 L =|1 dm³
💧|1 mL =|1 cm³
🧪|Volumul unui lichid se măsoară cu|cilindrul gradat
⬜|Aria unui pătrat cu latura de 3 m|9 m²
📐|1 m² =|10 000 cm²
🧱|Volumul unui cub cu latura de 2 m|8 m³`,
  2.5: `📦|Ce măsori pentru volumul paralelipipedului?|L, l și h
📏|Cu ce măsori dimensiunile?|cu rigla
✖️|Cum afli volumul?|înmulțești L · l · h
🧊|Unitatea volumului în SI|m³
🔁|De ce măsori de mai multe ori?|reduci eroarea
🧮|V pentru L=2 cm, l=3 cm, h=4 cm|24 cm³
🧾|Ce notezi în tabel?|valorile și unitățile
👁️|Cum citești rigla?|perpendicular pe diviziune
📊|Rezultatul final al volumului|media măsurătorilor
🎲|Câte fețe are un paralelipiped?|6`,
  2.6: `🪨|Cum măsori volumul unei pietre?|prin scufundare în apă
🧪|Ce vas folosești?|cilindrul gradat
💧|Ce notezi mai întâi?|volumul inițial al apei
⬆️|După scufundare nivelul apei|crește
➖|Volumul corpului|V₂ − V₁
🔎|Nivelul apei se citește la|baza meniscului
🧵|Corpul se leagă cu|un fir
🚫|Corpul trebuie să fie|insolubil în apă
🥄|1 mL =|1 cm³
📐|V₁=50 mL, V₂=65 mL; V corp =|15 mL`,
  3.1: `🚌|Autobuzul frânează brusc, pasagerii merg|înainte
🛷|Ce este inerția?|păstrarea stării de mișcare sau repaus
🏐|Care corp are inerție mai mare?|cel cu masă mai mare
🚀|Un corp fără forțe rămâne în|repaus sau mișcare uniformă
🪑|Fața de masă trasă brusc: obiectele|rămân pe loc
🚗|Centura de siguranță ajută din cauza|inerției
🥤|Apa se varsă la pornirea bruscă din cauza|inerției
🏃|Alergătorul nu se oprește brusc din|inerție
🪀|Ce măsoară masa?|inerția corpului
⚽|Pentru a mișca o minge grea ai nevoie de|forță mai mare`,
  3.2: `⚖️|Instrument pentru masă|balanța
🍎|Unitatea SI pentru masă|kilogramul
🍬|1 kg =|1000 g
🥔|1 t =|1000 kg
🪶|1 g =|1000 mg
🧺|Cântărirea se face cu|balanța și mase marcate
🔄|Balanța e în echilibru când|talerele sunt la același nivel
🐘|Masa se schimbă prin deplasare?|nu
🧊|Masa depinde de|cantitatea de substanță
🎒|Un rucsac de 2500 g are|2,5 kg`,
  3.3: `🧮|Densitatea|ρ = m / V
💧|Densitatea apei|1000 kg/m³
🛟|Un corp plutește în apă dacă|are densitate mai mică
⚓|Un corp mai dens decât apa|se scufundă
📏|Unitatea SI pentru densitate|kg/m³
🧈|Uleiul față de apă este|mai puțin dens
🪙|Masa din densitate|m = ρ · V
📦|Volumul din densitate|V = m / ρ
⛓️|Fierul față de apă este|mai dens
🎈|Heliul față de aer este|mai puțin dens`,
  3.4: `⚖️|Masa corpului se măsoară cu|balanța
🧪|Volumul unui corp neregulat|cilindrul gradat
🧮|Densitatea este|masa împărțită la volum
🔁|Pentru precizie|repeți măsurătorile
📝|Rezultatele se trec în|tabel
🪨|Volumul pietrei se află|prin scufundare
📊|Densitatea finală este|media valorilor
🔢|m=200 g, V=100 cm³; ρ =|2 g/cm³
🧴|1 g/cm³ =|1000 kg/m³
🔬|Densitatea este proprietate a|substanței`,
  4.1: `🧬|Substanțele sunt formate din|molecule
🐜|Moleculele se află în|mișcare continuă
🧊|Stare cu formă și volum proprii|solidă
💧|Stare cu volum propriu, fără formă|lichidă
💨|Stare fără formă și volum proprii|gazoasă
🔥|Încălzite, moleculele se mișcă|mai repede
❄️|Răcite, moleculele se mișcă|mai încet
🌫️|Difuzia este|amestecarea spontană a substanțelor
☕|Zahărul se dizolvă în ceai prin|difuzie
🌡️|Starea termică se caracterizează prin|temperatură`,
  4.2: `🌡️|Instrument pentru temperatură|termometrul
🧊|Apa îngheață la|0 °C
♨️|Apa fierbe la|100 °C
🤒|Temperatura corpului uman|aprox. 37 °C
🔥|T (Kelvin) din t (Celsius)|T = t + 273
❄️|0 °C în kelvini|273 K
⚖️|Echilibru termic înseamnă|aceeași temperatură
🥶|Căldura trece de la corpul cald la cel|rece
🌤️|Scara folosită în Europa|Celsius
📈|Încălzirea înseamnă temperatură care|crește`,
  4.3: `🌡️|Instrument folosit în lucrare|termometrul
⏱️|Temperatura se notează la|intervale egale de timp
🥛|Un corp cald lăsat în cameră|se răcește
📉|Graficul răcirii arată temperatura|scăzând în timp
🏁|Răcirea se oprește la|temperatura mediului
📝|Datele se trec în|tabel
🔍|Termometrul se citește|la nivelul lichidului
🚫|Termometrul nu atinge|pereții vasului
♨️|Apa fierbinte se manipulează|cu atenție
🤝|Echilibru termic cu aerul|aceeași temperatură`,
  4.4: `🚂|Șinele de tren au spații pentru|dilatare
🌡️|În termometru lichidul la încălzire|se dilată
❄️|La răcire corpurile se|contractă
💧|Apa are densitate maximă la|4 °C
🧊|Gheața față de apa lichidă este|mai puțin densă
🌉|Podurile au rosturi pentru|dilatare
🎈|Gazele se dilată față de solide|mai mult
🔥|Dilatarea apare la|încălzire
🍾|Apa îngheață într-o sticlă închisă: sticla|poate crăpa
🐟|Peștii supraviețuiesc iarna datorită|anomaliei termice a apei`,
  5.1: `🎈|Frecat de păr, balonul se|electrizează
⚡|Sarcinile electrice sunt de|două feluri
🔴|Sarcini de același semn|se resping
🔵|Sarcini de semne opuse|se atrag
🧤|La frecare se transferă|electroni
🔺|Corp cu surplus de electroni|încărcat negativ
🔻|Corp cu deficit de electroni|încărcat pozitiv
📏|Unitatea sarcinii electrice|coulombul (C)
🧪|Electroscopul indică|prezența sarcinii
🪄|Bagheta de sticlă frecată cu mătase|se încarcă pozitiv`,
  5.2: `⚛️|În centrul atomului se află|nucleul
🟡|Protonul are sarcină|pozitivă
⚫|Electronul are sarcină|negativă
⚪|Neutronul are sarcină|nulă
🪐|Electronii se rotesc în jurul|nucleului
🔋|Atomul neutru are|protoni = electroni
🔢|Numărul protonilor definește|elementul
🌌|Modelul planetar al atomului|Rutherford
➕|Ionul pozitiv|a pierdut electroni
➖|Ionul negativ|a primit electroni`,
  5.3: `🔌|Un conductor electric|cuprul
🧤|Un izolator electric|cauciucul
🪟|Sticla este|izolator
🔗|Metalele conduc prin|electroni liberi
🪙|Aluminiul este|conductor
🧱|Lemnul uscat este|izolator
🔋|Mânerul ștecherului e din|plastic (izolator)
💧|Apa sărată este|conductoare
🧶|Firul de cupru e acoperit cu|izolator
🏃|Corpul uman este|conductor`,
  5.4: `🤝|Prin contact corpurile capătă sarcină|de același semn
👆|Electrizarea prin influență are loc|fără atingere
🧪|Electroscopul cu foițe indică|sarcina electrică
🔌|La contact se transferă|electroni
🧲|Un corp încărcat apropiat de unul neutru|separă sarcinile
🪁|Prin influență, partea apropiată capătă sarcină|de semn opus
🌍|Împământarea|descarcă corpul
⚖️|Sarcina electrică totală se|conservă
⚡|Descărcarea electrică este|trecerea sarcinii
🎈|Balonul lipit de perete: electrizare prin|influență`,
  5.5: `⚡|Fulgerul este|descărcare electrică în atmosferă
🌩️|Tunetul este|zgomotul fulgerului
🏠|Paratrăsnetul protejează|clădirile
🌳|În furtună nu te adăposti|sub un copac singur
🚗|Mașina protejează ca o|cușcă metalică
📱|În furtună eviți|obiectele metalice și apa
🌥️|Norii se electrizează prin|frecarea particulelor
👀|Lumina fulgerului ajunge|înaintea tunetului
🏊|În furtună ieși|din apă
🛑|La furtună stai|în clădire`,
  5.6: `🧲|Un magnet are|doi poli
🧭|Busola indică|Nordul magnetic
🔴|Poli de același nume|se resping
🔁|Poli diferiți|se atrag
🔩|Magnetul atrage|fierul
🪵|Magnetul nu atrage|lemnul
✂️|Rupt în două, un magnet are|tot doi poli
🌍|Pământul se comportă ca|un magnet uriaș
🔋|Câmpul magnetic apare în jurul|magnetului
🚪|Magneții se folosesc la|ușa frigiderului`,
  6.1: `☀️|Sursă naturală de lumină|Soarele
💡|Sursă artificială de lumină|becul
🌙|Luna|reflectă lumina Soarelui
🪟|Corpul transparent|lasă lumina să treacă
🫧|Geamul mat este|translucid
🧱|Corpul opac|nu lasă lumina
🔥|Flacăra este sursă|primară
🪞|Oglinda|reflectă lumina
🕯️|Lumânarea aprinsă este sursă|artificială
🐛|Licuriciul este sursă|naturală`,
  6.2: `🔦|Lumina se propagă|în linie dreaptă
☄️|Viteza luminii în vid|300 000 km/s
🌅|Raza de lumină arată|direcția de propagare
🔆|Fasciculul de lumină este|un mănunchi de raze
🌫️|Fasciculul se vede în ceață datorită|particulelor din aer
🕳️|Camera obscură demonstrează|propagarea rectilinie
🌞|Lumina Soarelui ajunge la Pământ în|aprox. 8 minute
🧭|Mediu omogen înseamnă|aceleași proprietăți peste tot
⚡|Lumina este mai rapidă decât|sunetul
📐|Raza se reprezintă printr-o|dreaptă cu săgeată`,
  6.3: `👤|Umbra apare în spatele unui corp|opac
💡|O sursă punctiformă dă|umbră netă
🌓|Penumbra este|umbră parțială
☀️|Umbra e mai lungă când Soarele este|jos pe cer
🕛|Umbra e cea mai scurtă la|amiază
🧱|Fără corp opac|nu există umbră
🪟|Un corp transparent|nu face umbră
🌲|Umbra copacului dimineața este|lungă
🔦|Lanterna aproape de corp|mărește umbra
🧮|Umbra și penumbra apar când sursa e|extinsă`,
  6.4: `🌑|Eclipsa de Soare|Luna între Pământ și Soare
🌕|Eclipsa de Lună|Pământul între Soare și Lună
👓|Eclipsa de Soare se privește cu|ochelari speciali
🌘|Eclipsa totală de Lună apare la|Lună plină
🌒|Eclipsa de Soare apare la|Lună nouă
🌍|Umbra Pământului cade pe|Lună
🌞|Eclipsa totală acoperă|discul Soarelui
🪐|Luna se rotește în jurul|Pământului
🔭|Eclipsele se prevăd prin|calcule astronomice
🌗|Penumbra Lunii dă o eclipsă|parțială`,
};
const XP = {
    1.1: "Fizica este știința care studiază fenomenele naturii: tot ce se petrece în jurul nostru fără ca substanțele să se transforme în altele noi, precum topirea gheții, ploaia, ecoul sau fulgerul. Când apare o substanță nouă (de exemplu la arderea lemnului), fenomenul este chimic, nu fizic.",
    2.1: "O mărime fizică este o proprietate care poate fi măsurată: lungimea, masa, timpul, temperatura. Fiecare se măsoară într-o unitate; în Sistemul Internațional (SI) sunt metrul, kilogramul și secunda. Unitățile au multipli și submultipli legați prin raporturi fixe, de exemplu 1 km = 1000 m.",
    2.2: "Lungimea se măsoară cu rigla, ruleta sau șublerul, comparând-o cu o unitate etalon. Orice măsurătoare are o eroare, pentru că instrumentul are precizie limitată. De aceea măsurăm de mai multe ori, calculăm valoarea medie și scriem rezultatul ca valoare ± eroare.",
    2.3: "Timpul este durata dintre două momente și se măsoară cu ceasul sau cronometrul. Unitatea SI este secunda: 1 min = 60 s, iar 1 h = 60 min = 3600 s. Pentru intervale scurte, cum e o cursă, se folosește cronometrul, care este mai precis.",
    2.4: "Aria arată cât de întinsă este o suprafață: la dreptunghi A = L · l, în m². Volumul arată spațiul ocupat de un corp: la paralelipiped V = L · l · h, în m³. Lichidele se măsoară cu cilindrul gradat, iar 1 L = 1 dm³ și 1 mL = 1 cm³.",
    2.5: "Pentru volumul unui paralelipiped măsori cu rigla lungimea, lățimea și înălțimea, apoi le înmulțești: V = L · l · h. Repeți măsurătorile, le notezi într-un tabel cu unități și faci media, ca să reduci efectul erorilor. Rigla se citește cu ochiul perpendicular pe diviziune.",
    2.6: "Un corp neregulat nu se poate măsura cu rigla, așa că îl scufunzi într-un cilindru gradat cu apă. Notezi volumul inițial V₁ și cel final V₂; diferența V₂ − V₁ este volumul corpului. Corpul trebuie scufundat complet, legat cu un fir și insolubil în apă.",
    3.1: "Inerția este proprietatea corpurilor de a-și păstra starea de repaus sau de mișcare uniformă, dacă nu acționează alte corpuri asupra lor. De aceea pasagerii se înclină înainte când autobuzul frânează: corpul lor vrea să continue mișcarea. Cu cât masa e mai mare, cu atât inerția e mai mare.",
    3.2: "Masa arată cât de multă substanță conține un corp și măsoară inerția lui. Unitatea SI este kilogramul: 1 kg = 1000 g, iar 1 t = 1000 kg. Masa se măsoară cu balanța, comparând corpul cu mase marcate, și nu se schimbă când corpul își schimbă locul.",
    3.3: "Densitatea arată câtă masă are o unitate de volum dintr-o substanță: ρ = m / V, în kg/m³. Apa are 1000 kg/m³. Un corp mai puțin dens decât apa plutește (ulei, gheață), unul mai dens se scufundă (fier). Din formulă rezultă și m = ρ · V și V = m / ρ.",
    3.4: "Pentru densitate măsori masa cu balanța și volumul cu rigla sau prin scufundare în cilindrul gradat, apoi calculezi ρ = m / V. Repeți măsurătorile, faci media și treci datele într-un tabel. Densitatea este o proprietate a substanței, nu a formei corpului.",
    4.1: "Substanțele sunt formate din molecule aflate în continuă mișcare. În starea solidă ele sunt apropiate, în cea lichidă se mișcă mai liber, iar în cea gazoasă sunt îndepărtate și umplu tot spațiul. Cu cât temperatura e mai mare, cu atât se mișcă mai repede; difuzia este amestecarea spontană a substanțelor.",
    4.2: "Temperatura arată cât de cald sau rece este un corp și se măsoară cu termometrul. Pe scara Celsius apa îngheață la 0 °C și fierbe la 100 °C; în kelvini T = t + 273. Căldura trece de la corpul mai cald la cel mai rece până se atinge echilibrul termic, adică aceeași temperatură.",
    4.3: "La lucrare urmărești cum scade temperatura unui corp cald. O citești cu termometrul la intervale egale de timp, o treci în tabel și desenezi graficul. Temperatura scade tot mai încet până ajunge la cea a mediului, când se atinge echilibrul termic.",
    4.4: "La încălzire majoritatea corpurilor se dilată (își măresc volumul), iar la răcire se contractă; gazele se dilată cel mai mult. De aceea șinele și podurile au rosturi. Apa face excepție: are densitatea maximă la 4 °C, iar gheața e mai puțin densă și plutește, deci peștii supraviețuiesc iarna.",
    5.1: "Frecând două corpuri, electronii trec de la unul la altul: cel care primește electroni se încarcă negativ, cel care îi pierde, pozitiv. Sarcinile de același semn se resping, cele de semne opuse se atrag. Electroscopul arată prezența sarcinii electrice.",
    5.2: "Atomul are un nucleu central (protoni pozitivi și neutroni fără sarcină) și electroni negativi care se rotesc în jurul lui, ca planetele în jurul Soarelui (modelul planetar). Atomul neutru are tot atâția electroni câți protoni. Dacă pierde sau primește electroni, devine ion.",
    5.3: "Conductoarele (metale, apă sărată) au electroni liberi care se pot deplasa, deci lasă curentul să treacă. Izolatoarele (sticlă, plastic, cauciuc, lemn uscat) nu au electroni liberi. De aceea firele sunt din cupru și acoperite cu plastic.",
    5.4: "La electrizarea prin contact atingi un corp neutru cu unul încărcat și amândouă capătă sarcină de același semn. La electrizarea prin influență apropii corpul încărcat fără să-l atingi: sarcinile corpului neutru se separă, iar partea apropiată capătă sarcină de semn opus.",
    5.5: "Fulgerul este o descărcare electrică uriașă în atmosferă, iar tunetul este zgomotul produs de ea. Lumina ajunge înaintea sunetului. Paratrăsnetul protejează clădirile; în furtună te adăpostești într-o clădire sau în mașină și eviți copacii singuratici, apa și obiectele metalice.",
    5.6: "Orice magnet are doi poli, Nord și Sud, care nu pot fi separați: dacă rupi un magnet, fiecare bucată are tot doi poli. Polii de același nume se resping, cei diferiți se atrag. Magnetul atrage fierul, iar Pământul se comportă ca un magnet uriaș, de aceea busola indică Nordul.",
    6.1: "Sursele primare produc lumină (Soarele, becul, flacăra), iar corpurile iluminate doar o reflectă (Luna, oglinda). Corpurile transparente lasă lumina să treacă (geamul), cele translucide o lasă să treacă împrăștiată (geamul mat), iar cele opace nu o lasă deloc.",
    6.2: "În mediu omogen lumina se propagă în linie dreaptă, de aceea se formează umbre și funcționează camera obscură. Raza este direcția de propagare, iar fasciculul este un mănunchi de raze. Viteza luminii în vid este de aproximativ 300 000 km/s, mult mai mare decât a sunetului.",
    6.3: "Umbra apare în spatele unui corp opac, în zona unde nu ajunge lumina sursei. Dacă sursa e extinsă, lângă umbră apare penumbra, o zonă luminată parțial. Umbra e lungă când Soarele este jos pe cer și foarte scurtă la amiază.",
    6.4: "Eclipsa de Soare are loc când Luna ajunge între Pământ și Soare (la Lună nouă) și îi acoperă discul. Eclipsa de Lună are loc când Pământul este între Soare și Lună (la Lună plină) și umbra lui cade pe Lună. Eclipsa de Soare se privește doar cu ochelari speciali.",
  },
  EX = {
    1.1: `c|Curgerea apei în râu este un fenomen {mecanic}.|termic,electric,optic,magnetic|pag. 8 · ex. 2a
c|Formarea umbrei este un exemplu de fenomen {optic}.|mecanic,termic,electric,magnetic|pag. 8 · ex. 2b
c|Topirea gheții este un fenomen {termic}.|mecanic,electric,optic,magnetic|pag. 8 · ex. 2c
c|Trăsnetul este un fenomen {electric}.|mecanic,termic,optic,magnetic|pag. 8 · ex. 2d
c|Devierea acului unei busole este un fenomen {magnetic}.|mecanic,termic,electric,optic|pag. 8 · ex. 2e`,
    1.2: `c|Lumea din jurul tău se numește {natură}.|materie,fizică|pag. 10 · fișa de evaluare I.a
c|Fizica studiază o categorie distinctă de fenomene ale naturii, numite {fenomene fizice}.|fenomene chimice,corpuri|pag. 10 · fișa de evaluare I.c
g|Fierberea apei este un fenomen...|termic;electric;optic|pag. 10 · fișa de evaluare III.b
g|Rostogolirea unei mingi este un fenomen...|mecanic;termic;electric|pag. 10 · fișa de evaluare III.c
g|Reflexia luminii de la o oglindă este un fenomen...|optic;mecanic;electric|pag. 10 · fișa de evaluare III.d
g|Deschiderea și închiderea ușilor este un fenomen...|mecanic;optic;termic|pag. 10 · fișa de evaluare III.e
g|Formarea umbrei în cazul corpurilor luminate este un fenomen...|optic;electric;magnetic|pag. 10 · fișa de evaluare III.f`,
    2.1: `c|Măsurările în fizică pot fi {directe} și {indirecte}.|fundamentale,derivate|pag. 14 · ex. 1a
c|Rezultatul unei măsurări se exprimă în valoare {numerică} și unitate {de măsură}.|fizică,derivată|pag. 14 · ex. 1b
c|Lungimea, masa, timpul, temperatura sunt {mărimi fizice}.|instrumente,fenomene|pag. 14 · ex. 1c
c|Pentru măsurarea mărimilor fizice sunt necesare {instrumente de măsură}.|fenomene fizice,formule|pag. 14 · ex. 1d
g|Într-o zi sunt...|1 440 min;24 min;144 min;86 400 min|pag. 14 · ex. 3
g|100 m reprezintă...|10 000 cm;100 cm;1 000 cm;100 000 cm|pag. 14 · ex. 3`,
    2.2: `c|0,02 km + 25 dm = {22,5} m.|0,225,225,2,25|pag. 18 · ex. 2a
c|455 mm − 2 dm = {0,255} m.|2,55,0,0255,25,5|pag. 18 · ex. 2b
c|197 cm + 330 mm = {2,3} m.|23,0,23,230|pag. 18 · ex. 2c
c|3 m + 50 cm − 7 dm = {2,8} m.|28,3,8,0,28|pag. 18 · ex. 2d`,
    2.3: `c|Timpul este o mărime fizică ce caracterizează {durata} sau perioada desfășurării unui fenomen fizic.|lungimea,masa|pag. 20 · ex. 1a
c|Unitatea de măsură pentru timp în SI este {secunda}, cu simbolul {s}.|minutul,h|pag. 20 · ex. 1b
c|Instrumentele pentru măsurarea timpului pot fi: {ceas}, {cronometru}, {clepsidră}.|riglă,balanță,termometru|pag. 20 · ex. 1c`,
    2.4: `c|Volumul este o mărime fizică prin care se măsoară {spațiul ocupat de un corp}.|masa corpului,timpul|pag. 23 · ex. 1a
c|Volumul corpurilor cu formă geometrică regulată se determină aplicând {formule matematice}.|balanța,cronometrul|pag. 23 · ex. 1b
c|Volumul unui corp solid de formă neregulată poate fi determinat {prin scufundare într-un lichid}.|cu termometrul,cu cronometrul|pag. 23 · ex. 1c`,
    2.8: `c|Cu ajutorul cilindrului gradat putem măsura {volumul}.|timpul,masa|pag. 29 · fișa de evaluare III.a
c|Lungimea se măsoară cu {rigla gradată}.|cronometrul,balanța|pag. 29 · fișa de evaluare III.b
c|Diferența dintre valoarea medie și valoarea măsurată se numește {eroare absolută}.|densitate,volum|pag. 29 · fișa de evaluare III.c
g|„Secunda este o mărime fizică fundamentală.”|Fals;Adevărat|pag. 29 · fișa de evaluare II.b
g|„Unitatea de măsură pentru arie în SI este m³.”|Fals;Adevărat|pag. 29 · fișa de evaluare II.c`,
    3.2: `g|„Unitatea de măsură în SI pentru masă este gramul.”|Fals;Adevărat|pag. 36 · ex. 2a
g|„Balanța este în echilibru când masele de pe talere sunt egale.”|Adevărat;Fals|pag. 36 · ex. 2b
g|„Masa corpurilor este o mărime fundamentală.”|Adevărat;Fals|pag. 36 · ex. 2c
c|250 g + 10 500 mg = {0,2605} kg.|2,605,0,02605,260,5|pag. 36 · ex. 3a
c|245 g − 145 000 mg = {0,1} kg.|1,10,0,01|pag. 36 · ex. 3b`,
    3.5: `c|Prin cântărire măsurăm {masa}.|volumul,densitatea|pag. 42 · fișa de evaluare III.a
c|Densitatea lichidului se măsoară cu {densimetrul}.|rigla,cronometrul|pag. 42 · fișa de evaluare III.b
c|Măsurarea mărimilor fizice se efectuează cu diferite {instrumente} de măsură.|fenomene,corpuri|pag. 42 · fișa de evaluare III.c
g|„Fenomenul prin care corpurile se opun schimbării stării de repaus sau de mișcare se numește inerție.”|Adevărat;Fals|pag. 42 · fișa de evaluare II.a
g|„Masa corpului se măsoară cu rigla.”|Fals;Adevărat|pag. 42 · fișa de evaluare II.c`,
    4.1: `c|Substanța este alcătuită din {particule}.|fenomene,raze|pag. 46 · ex. 1a
c|Cea mai mică particulă a substanței, care determină proprietățile acesteia, este numită {moleculă}.|volum,temperatură|pag. 46 · ex. 1b
c|Starea termică a unui corp poate fi modificată {prin contact termic}.|prin cântărire,prin măsurarea lungimii|pag. 46 · ex. 1c`,
    4.2: `c|Temperatura este o mărime fizică ce caracterizează {gradul} de încălzire a unui corp.|volumul,timpul|pag. 49 · ex. 1a
c|Cea mai utilizată scară termometrică este {scara Celsius}.|scara metrului,scara volumului|pag. 49 · ex. 1b`,
    4.4: `c|Fenomenul termic prin care un corp își mărește dimensiunile prin încălzire este numit {dilatare termică}.|contracție,evaporare|pag. 53 · ex. 1a
c|Între șinele de tren se lasă spații, pentru că vara acestea se {dilată}.|contractă,topesc|pag. 53 · ex. 1b
c|Prin încălzire, {gazele} se dilată la fel, iar corpurile solide din substanțe diferite se dilată în mod {diferit}.|lichidele,identic|pag. 53 · ex. 1c`,
    4.6: `c|Dilatarea termică constă în {mărirea dimensiunilor unui corp prin încălzire}.|micșorarea masei,creșterea densității|pag. 57 · fișa de evaluare III.a
c|Temperatura se măsoară cu {termometrul}.|balanța,rigla|pag. 57 · fișa de evaluare III.b
g|„Apa are cea mai mare densitate la temperatura de +4 °C.”|Adevărat;Fals|pag. 57 · fișa de evaluare II.a
g|„Substanțele simple sunt formate din atomi identici.”|Adevărat;Fals|pag. 57 · fișa de evaluare II.b
g|„Diferite gaze se dilată la fel.”|Adevărat;Fals|pag. 57 · fișa de evaluare II.c`,
    5.2: `c|Trecerea unui corp din stare {neutră} în stare electrizată este rezultatul unei {electrizări} dintre două corpuri.|termică,măsurări|pag. 63 · ex. 1a
c|Modelul structurii interne a atomului propus de Rutherford este cunoscut sub denumirea de {model planetar}.|model termic,model optic|pag. 63 · ex. 1b
c|În jurul nucleului se mișcă {electronii}, particule cu sarcină electrică {negativă}.|protonii,pozitivă|pag. 63 · ex. 1c
c|Particula elementară din nucleul atomului lipsită de sarcină electrică este {neutronul}.|protonul,electronul|pag. 63 · ex. 1d`,
    5.4: `c|Electrizarea corpurilor poate fi prin {frecare}, {contact} și {influență}.|încălzire,răcire,topire|pag. 69 · ex. 1a
c|Corpurile care, prin frecare, au căpătat proprietatea de a atrage alte corpuri se numesc {electrizate}.|neutre,magnetice|pag. 69 · ex. 1b
c|Se deosebesc două tipuri de sarcini electrice: {pozitive} și {negative}.|termice,optice|pag. 69 · ex. 1c
c|Electrizarea prin contact are loc prin trecerea {electronilor}.|protonilor,neutronilor|pag. 69 · ex. 1d`,
    5.7: `c|Corpul neelectrizat se numește {neutru}.|pozitiv,negativ|pag. 77 · fișa de evaluare III.a
c|Gradul de electrizare a unui corp este caracterizat de mărimea fizică numită {sarcină electrică}.|masă,densitate|pag. 77 · fișa de evaluare III.b
c|Edificiile se protejează de trăsnet cu ajutorul {paratrăsnetului}.|termometrului,electroscopului|pag. 77 · fișa de evaluare III.c
g|„Polii magnetici de același nume se atrag.”|Fals;Adevărat|pag. 77 · fișa de evaluare II.a
g|„Polii magnetului nu pot fi separați unul de celălalt.”|Adevărat;Fals|pag. 77 · fișa de evaluare II.b
g|„Corpul neutru se electrizează negativ când primește electroni.”|Adevărat;Fals|pag. 77 · fișa de evaluare II.c`,
    6.3: `g|„Umbra este un fenomen ce confirmă propagarea rectilinie a luminii.”|Adevărat;Fals|pag. 87 · ex. 1a
g|„Dacă un corp opac este mai aproape de sursa de lumină, umbra lui pe ecran va fi mai mică.”|Fals;Adevărat|pag. 87 · ex. 1b
g|„La iluminarea cu o sursă punctiformă, pe ecranul din spatele corpului opac se observă umbra lui.”|Adevărat;Fals|pag. 87 · ex. 1c`,
    6.5: `g|„Toate corpurile care produc lumină sunt surse naturale de lumină.”|Fals;Adevărat|pag. 92 · fișa de evaluare II.a
g|„Corpurile care nu permit trecerea razelor de lumină se numesc transparente.”|Fals;Adevărat|pag. 92 · fișa de evaluare II.b
g|„Un fascicul de lumină foarte îngust se numește rază de lumină.”|Adevărat;Fals|pag. 92 · fișa de evaluare II.c`,
  };
