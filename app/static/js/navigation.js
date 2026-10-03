const SEC = [
  "home",
  "domains",
  "subs",
  "classes",
  "study",
  "upload",
  "theme",
  "formula",
  "duel",
  "atom",
  "balance",
  "ex",
];
let back = () => go("home"),
  cur = null,
  set = [],
  idx = 0,
  ans = [],
  clsSel = 6,
  chSel = null;
function backFn() {
  back();
}
function go(id, nav) {
  SEC.forEach((x) => $(x).classList.toggle("hidden", x !== id));
  const n = nav || id;
  document
    .querySelectorAll(".navlinks a")
    .forEach((a) => a.classList.toggle("on", a.dataset.p === n));
  scrollTo({ top: 0 });
}
function showDomains() {
  $("dGrid").innerHTML = DOM.map(
    (d, i) =>
      `<button class="card tile ${i == 14 ? "dash" : ""}" onclick="openDom(${i})"><div class="e">${d[0]}</div><h3>${d[1]}</h3><p>${d[2]}</p><div class="go">Explorează →</div></button>`,
  ).join("");
  go("domains");
}
function openDom(i) {
  const d = DOM[i];
  let subs = d[3] ? d[3].split(",") : Object.keys(S);
  $("sCrumb").innerHTML = `Pe domenii › <b>${d[1]}</b>`;
  $("sTitle").textContent = d[0] + " " + d[1];
  $("sGrid").innerHTML = subs
    .map(
      (s) =>
        `<button class="card tile ${S[s] ? "" : "off"}" onclick="openSet('${s}','${d[1]} › ${s}',()=>openDom(${i}),'domains')"><h3>${s}</h3><p>${S[s] ? S[s].length + " flashcard-uri" : "Set în pregătire"}</p><div class="go">${S[s] ? "Începe testul →" : "Vezi detalii →"}</div></button>`,
    )
    .join("");
  go("subs", "domains");
}
function showClasses() {
  $("chips").innerHTML = [6, 7, 8, 9, 10, 11, 12]
    .map(
      (n) =>
        `<button class="chip ${n == clsSel ? "on" : ""}" onclick="clsSel=${n};chSel=null;showClasses()">Clasa ${n}</button>`,
    )
    .join("");
  curChs =
    clsSel == 6
      ? CH6.map((c) => [c[0], c[2], c[1]])
      : CL[clsSel].split("|").map((x) => {
          const [a, b] = x.split(":");
          return [a, b.split(","), "📘"];
        });
  const chs = curChs;
  $("cBody").innerHTML =
    `<div class="card manual"><div class="e">📘</div><div><h3>Clasa ${ro(clsSel)} · Fizică</h3><span class="tag">Manual disponibil</span></div></div><h3 style="margin-bottom:14px">Capitole</h3><div class="grid g3">${chs.map((c, i) => `<button class="cbox ${chSel === i ? "on" : ""}" onclick="chSel=${i};showClasses()">${i + 1}. ${c[0]}<small>${c[1].length} teme</small></button>`).join("")}</div>` +
    (chSel !== null
      ? `<div class="card themes"><h3>Temele capitolului: ${chs[chSel][0]}</h3>${chs[chSel][1].map((t, j) => `<button class="trow" onclick="openTheme(${chSel},${j})">${t}<span>${themeInfo(t)}</span></button>`).join("")}</div>`
      : "");
  go("classes");
}
let thEx = [],
  curChs = [],
  thName = "",
  thK = null,
  thEm = "",
  thChapter = "",
  hub = () => {},
  DQ = [];
function themeInfo(t) {
  const id = t.split(" ")[0];
  return /Recapitulare/.test(t)
    ? "Recapitulare →"
    : K[id]
      ? "Flashcard-uri + jocuri →"
      : S[t]
        ? "Flashcard-uri →"
        : "În pregătire";
}
function openTheme(ci, j) {
  const c = curChs[ci],
    name = c[1][j];
  let k = K[name.split(" ")[0]];
  if (/Recapitulare/.test(name)) {
    const m = { q: "", f: [] };
    c[1].forEach((t) => {
      const x = K[t.split(" ")[0]];
      if (x) {
        m.q += (m.q ? "¦" : "") + x.q;
        m.f = m.f.concat(x.f || []);
      }
    });
    if (m.q) k = m;
  }
  thName = name;
  thK = k;
  thEm = c[2];
  thChapter = c[0];
  hub = () => openTheme(ci, j);
  back = showClasses;
  const id0 = name.split(" ")[0],
    rc = /Recapitulare/.test(name),
    tg = (D, d) => (D[d] ? D[d].split("\n").map((l) => l + "|" + d) : []);
  let cc = tg(KC, id0),
    ex = tg(EX, id0);
  if (rc) {
    cc = shuf(c[1].flatMap((t) => tg(KC, t.split(" ")[0]))).slice(0, 12);
    ex = c[1].flatMap((t) => tg(EX, t.split(" ")[0]));
  }
  thEx = ex;
  if (cc.length)
    S[name] = cc.map((x) => {
      const a = x.split("|");
      return {
        tag: "ÎNTREBARE",
        q: a[1],
        a: a[0],
        f: a[2],
        e: "",
        x: XP[a[3]],
        h: "Întoarce cardul ca să verifici răspunsul, apoi continuă.",
        m: a[0],
      };
    });
  const T = (i, t, p, f) =>
    `<button class="card tile" onclick="launch('${f}')"><div class="e">${i}</div><h3>${t}</h3><p>${p}</p><div class="go">Joacă →</div></button>`;
  let h = "";
  if (S[name])
    h += T(
      "🗂️",
      "Flashcard-uri",
      S[name].length + " carduri cu răspuns și rapoarte",
      "c",
    );
  if (thEx.length)
    h += T(
      "✍️",
      "Exerciții din manual",
      "Cuvinte lipsă și grile din manual",
      "x",
    );
  if (k) {
    h += T(
      "⚔️",
      "Duel pe același ecran",
      "Doi elevi, întrebări din această temă",
      "d",
    );
    if (k.f && k.f.length)
      h += T(
        "🧩",
        "Construiește formula",
        k.f.length + " formule din această temă",
        "f",
      );
    if (k.a)
      h += T("⚛️", "Asamblează atomul 3D", "Protoni, neutroni, electroni", "a");
    if (k.b)
      h += T("⚖️", "Balanța 3D", "Cântărire și echilibru cu momente", "b");
  }
  $("thGrid").innerHTML =
    h || '<p class="mut">Set în pregătire pentru această temă.</p>';
  $("thTitle").textContent = thEm + " " + name;
  $("thCrumb").innerHTML =
    `Clase › Clasa ${clsSel} › ${c[0]} › <b>${name.split(" ").slice(0, 2).join(" ")}</b>`;
  go("theme", "classes");
}
function launch(k) {
  back = hub;
  if (k === "c")
    openSet(thName, "Clasa " + clsSel + " › " + thName, hub, "classes");
  else if (k === "d") {
    DQ = thK.q.split("¦").map((x) => {
      const a = x.split("|");
      return { tag: "ÎNTREBARE", q: a[0], a: thEm, f: a[1], o0: a.slice(1) };
    });
    duelSetup();
  } else if (k === "f") {
    FM = thK.f.map((x) => x.split("~"));
    startF();
  } else if (k === "x") startX();
  else if (k === "a") openAtom();
  else openBal();
}
