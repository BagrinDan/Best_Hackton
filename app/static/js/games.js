/* Construiește formula */
let FM = [
  ["Viteza medie", "v = d / t"],
  ["Legea a II-a a lui Newton", "F = m · a|F = a · m"],
  ["Greutatea", "G = m · g|G = g · m"],
  ["Densitatea", "ρ = m / V"],
  ["Presiunea", "p = F / S"],
  ["Lucrul mecanic", "L = F · d|L = d · F"],
];
let fi = 0,
  fsc = 0,
  fmis = 0,
  fl = 0,
  slots = [],
  pcs = [];
function startF() {
  fi = 0;
  fsc = 0;
  loadF();
  go("formula", "classes");
}
function loadF() {
  const t = FM[fi][1].split("|")[0].split(" ");
  fmis = 0;
  fl = 0;
  slots = t.map(() => null);
  pcs = shuf(t.map((x, i) => ({ x, i, u: false })));
  $("fBody").classList.remove("hidden");
  $("fRes").classList.add("hidden");
  $("fmN").textContent = FM[fi][0];
  $("fMsg").textContent = "";
  drawF();
}
function drawF(c) {
  $("fSlots").className = "slots" + (c || "");
  $("fCnt").textContent = `${fi + 1} / ${FM.length}`;
  $("fSlots").innerHTML = slots
    .map(
      (s, i) =>
        `<div class="slot ${s ? "f" : ""}" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="dropP(event,${i})" onclick="unplace(${i})">${s ? s.x : ""}</div>`,
    )
    .join("");
  $("fPcs").innerHTML = pcs
    .map(
      (p) =>
        `<div class="pc ${p.u ? "used" : ""}" draggable="true" ondragstart="event.dataTransfer.setData('text',${p.i})" onclick="place(${p.i})">${p.x}</div>`,
    )
    .join("");
}
function place(id) {
  if (fl) return;
  const p = pcs.find((q) => q.i === id),
    k = slots.indexOf(null);
  if (!p || p.u || k < 0) return;
  slots[k] = p;
  p.u = true;
  chk();
}
function dropP(e, k) {
  e.preventDefault();
  if (fl) return;
  const p = pcs.find((q) => q.i === +e.dataTransfer.getData("text"));
  if (!p || p.u) return;
  if (slots[k]) slots[k].u = false;
  slots[k] = p;
  p.u = true;
  chk();
}
function unplace(k) {
  if (fl || !slots[k]) return;
  slots[k].u = false;
  slots[k] = null;
  drawF();
}
function chk() {
  drawF();
  if (slots.includes(null)) return;
  fl = 1;
  const v = slots.map((x) => x.x).join(" ");
  if (FM[fi][1].split("|").some((a) => nm(a) === nm(v))) {
    if (!fmis) fsc++;
    drawF(" ok");
    $("fMsg").textContent = "Corect! ✓";
    setTimeout(() => {
      fi++;
      fi >= FM.length ? endF() : loadF();
    }, 1000);
  } else {
    fmis++;
    drawF(" bad");
    $("fMsg").textContent = "Aproape, mai încearcă.";
    setTimeout(() => {
      slots.forEach((x) => (x.u = false));
      slots = slots.map(() => null);
      fl = 0;
      $("fMsg").textContent = "";
      drawF();
    }, 900);
  }
}
function endF() {
  $("fBody").classList.add("hidden");
  $("fRes").classList.remove("hidden");
  const p = Math.round((fsc / FM.length) * 100);
  $("fRes").innerHTML =
    `<h2>Ai terminat!</h2><div class="ring" style="--p:${p}%"><strong>${fsc}/${FM.length}</strong></div><p class="mut" style="margin-bottom:20px">formule construite corect din prima încercare</p><button class="btn" onclick="startF()">↻ Joacă din nou</button> <button class="back" style="margin:0 0 0 8px" onclick="backFn()">Înapoi la jocuri</button>`;
}
/* Duel */
let dq = [],
  di = 0,
  ds = [0, 0],
  dn = ["", ""],
  dl = 0;
function duelSetup() {
  $("dSetup").classList.remove("hidden");
  $("dPlay").classList.add("hidden");
  go("duel", "classes");
}
function startD() {
  dn = [
    $("p1").value.trim() || "Jucător 1",
    $("p2").value.trim() || "Jucător 2",
  ];
  ds = [0, 0];
  di = 0;
  dq = shuf(DQ);
  if (dq.length % 2) dq.pop();
  $("dSetup").classList.add("hidden");
  $("dPlay").classList.remove("hidden");
  $("dEnd").classList.add("hidden");
  $("dGame").classList.remove("hidden");
  drawD();
}
function drawD() {
  dl = 0;
  const c = dq[di],
    t = di % 2;
  c.o = shuf(c.o0);
  $("dBoard").innerHTML = [0, 1]
    .map(
      (i) =>
        `<div class="pbox ${i === t ? "turn" : ""}"><small class="mut">${i === t ? "Rândul tău" : "Așteaptă"}</small><div class="b" style="font-weight:600">${esc(dn[i])}</div><h3>${ds[i]}</h3></div>`,
    )
    .join("");
  $("dQ").innerHTML =
    `<div class="shead"><span class="ftag">${c.tag}</span><div class="counter">${di + 1} / ${dq.length}</div></div><h2 style="font-size:22px;margin:16px 0 4px;line-height:1.3">${c.q}</h2><div class="art" style="font-size:56px;padding:14px;margin:12px 0 6px;width:100%">${c.a}</div>` +
    c.o
      .map((o, k) => `<button class="opt" onclick="pick(${k})">${o}</button>`)
      .join("");
}
function pick(k) {
  if (dl) return;
  dl = 1;
  const c = dq[di],
    ok = c.o[k] === c.f;
  if (ok) ds[di % 2]++;
  document.querySelectorAll(".opt").forEach((b, i) => {
    if (c.o[i] === c.f) b.classList.add("c");
    else if (i === k) b.classList.add("w");
  });
  setTimeout(() => {
    di++;
    di >= dq.length ? endD() : drawD();
  }, 1100);
}
function endD() {
  $("dGame").classList.add("hidden");
  $("dEnd").classList.remove("hidden");
  const w =
    ds[0] === ds[1]
      ? "Egalitate! 🤝"
      : `${esc(dn[ds[0] > ds[1] ? 0 : 1])} câștigă! 🏆`;
  $("dEnd").innerHTML =
    `<h2>${w}</h2><div class="stats" style="grid-template-columns:repeat(2,1fr)">${[0, 1].map((i) => `<div class="stat">${esc(dn[i])}<b>${ds[i]}</b>puncte</div>`).join("")}</div><button class="btn" onclick="startD()">↻ Revanșă</button> <button class="back" style="margin:0 0 0 8px" onclick="backFn()">Înapoi la jocuri</button>`;
}
/* 3D comun */
const T3 = [];
let loop3 = 0;
function mk3d(el, z) {
  if (typeof THREE === "undefined") {
    el.innerHTML =
      '<p class="mut" style="padding:40px;text-align:center">three.js nu s-a încărcat (verifică conexiunea la internet).</p>';
    return null;
  }
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  el.appendChild(r.domElement);
  const sc = new THREE.Scene(),
    cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  cam.position.set(0, 0, z);
  sc.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(3, 5, 6);
  sc.add(dl);
  const v = { sc, cam, r, el, root: new THREE.Group() };
  sc.add(v.root);
  v.fit = () => {
    const w = el.clientWidth,
      h = el.clientHeight;
    r.setSize(w, h);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    v.w = w;
  };
  if (!loop3) {
    loop3 = 1;
    (function lp() {
      requestAnimationFrame(lp);
      T3.forEach((t) => {
        if (!t.v.el.offsetParent) return;
        if (t.v.w !== t.v.el.clientWidth) t.v.fit();
        t.f();
        t.v.r.render(t.v.sc, t.v.cam);
      });
    })();
  }
  return v;
}
const mat = (c, r) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: r || 0.45 });
/* Atom 3D */
const EL = [
    "",
    "Hidrogen",
    "Heliu",
    "Litiu",
    "Beriliu",
    "Bor",
    "Carbon",
    "Azot",
    "Oxigen",
    "Fluor",
    "Neon",
  ],
  AM = [
    [1, 0, 1],
    [2, 2, 2],
    [3, 4, 3],
    [6, 6, 6],
    [8, 8, 8],
    [10, 10, 10],
  ],
  ACOL = { p: 0xf6c445, n: 0xafc4e6, e: 0x0b2545 },
  ALIM = { p: 10, n: 12, e: 10 };
let av = null,
  ap = 0,
  an = 0,
  ae = 0,
  ai = 0,
  asp = [],
  nuc,
  shl;
function openAtom() {
  go("atom", "classes");
  if (!av) {
    av = mk3d($("aV"), 9);
    if (av) {
      nuc = new THREE.Group();
      shl = new THREE.Group();
      av.root.add(nuc, shl);
      let dn = 0,
        px = 0,
        py = 0;
      const e = $("aV");
      e.onpointerdown = (ev) => {
        dn = 1;
        px = ev.clientX;
        py = ev.clientY;
      };
      addEventListener("pointerup", () => (dn = 0));
      e.onpointermove = (ev) => {
        if (!dn) return;
        av.root.rotation.y += (ev.clientX - px) * 0.01;
        av.root.rotation.x += (ev.clientY - py) * 0.01;
        px = ev.clientX;
        py = ev.clientY;
      };
      T3.push({
        v: av,
        f: () => {
          if (!dn) av.root.rotation.y += 0.003;
          asp.forEach((q) => (q.rotation.z += q.userData.sp));
        },
      });
    }
  }
  ai = 0;
  ap = an = ae = 0;
  $("aF").textContent = "";
  aDraw();
}
function aAdd(k, d) {
  const v = { p: ap, n: an, e: ae }[k] + d;
  if (v < 0 || v > ALIM[k]) return;
  if (k === "p") ap = v;
  else if (k === "n") an = v;
  else ae = v;
  $("aF").textContent = "";
  aDraw();
}
function aDraw() {
  const m = AM[ai],
    q = ap - ae;
  $("aT").textContent = `Misiune ${ai + 1} / ${AM.length}`;
  $("aM").innerHTML =
    `Construiește atomul neutru de <b>${EL[m[0]]}-${m[0] + m[1]}</b>.`;
  $("a_p").textContent = ap;
  $("a_n").textContent = an;
  $("a_e").textContent = ae;
  $("aI").innerHTML = ap
    ? `Ai construit: <b>${EL[ap]}-${ap + an}</b> · ${q ? `ion ${q > 0 ? "+" : "−"}${Math.abs(q)}` : "atom neutru"}`
    : "Adaugă protoni ca să apară un element.";
  if (!av) return;
  nuc.clear();
  shl.clear();
  asp = [];
  const n = ap + an,
    R = n > 1 ? 0.3 * Math.cbrt(n) : 0;
  let pl = ap,
    nl = an;
  for (let i = 0; i < n; i++) {
    const k = (i % 2 === 0 && pl > 0) || nl === 0 ? "p" : "n";
    k === "p" ? pl-- : nl--;
    const y = n > 1 ? 1 - (2 * (i + 0.5)) / n : 0,
      rd = Math.sqrt(1 - y * y),
      t = i * 2.4,
      b = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 20), mat(ACOL[k]));
    b.position.set(Math.cos(t) * rd * R, y * R, Math.sin(t) * rd * R);
    nuc.add(b);
  }
  [2, 3].forEach((r, s) => {
    const c = s ? Math.max(0, ae - 2) : Math.min(ae, 2);
    if (!c) return;
    const tl = new THREE.Group(),
      sp = new THREE.Group();
    tl.rotation.x = s ? -0.5 : 0.45;
    tl.rotation.y = s ? 0.4 : 0;
    sp.userData.sp = s ? 0.008 : 0.015;
    sp.add(
      new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.015, 8, 72),
        new THREE.MeshBasicMaterial({ color: 0x9db6de }),
      ),
    );
    for (let k = 0; k < c; k++) {
      const e = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        mat(ACOL.e),
      );
      e.position.set(
        r * Math.cos((k / c) * 6.283),
        r * Math.sin((k / c) * 6.283),
        0,
      );
      sp.add(e);
    }
    tl.add(sp);
    shl.add(tl);
    asp.push(sp);
  });
}
function aCheck() {
  const m = AM[ai],
    bad = [
      ap !== m[0] && "protonii (ei definesc elementul)",
      an !== m[1] && "neutronii (ei dau masa atomului)",
      ae !== m[2] &&
        "electronii (atomul neutru are tot atâția electroni câți protoni)",
    ].filter(Boolean);
  if (bad.length) {
    $("aF").textContent = "Mai verifică: " + bad.join(", ") + ".";
    return;
  }
  $("aF").textContent = "✓ Corect!";
  setTimeout(() => {
    ai = (ai + 1) % AM.length;
    ap = an = ae = 0;
    $("aF").textContent = ai
      ? ""
      : "🎉 Ai terminat toate misiunile, o luăm de la capăt!";
    aDraw();
  }, 1100);
}
/* Balanța */
const MS = [0, 1, 2, 3, 5];
let bv = null,
  bl = [0, 0, 0, 0, 0],
  br = [0, 0, 0, 0, 0],
  bm = 1,
  bs = 0,
  bsv = 0,
  bA = 0,
  bTg = 0,
  beam;
function openBal() {
  go("balance", "classes");
  if (!bv) {
    bv = mk3d($("bV"), 13);
    if (bv) {
      beam = new THREE.Group();
      const bx = (w, h, d, c, x, y) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
        m.position.set(x, y, 0);
        return m;
      };
      beam.add(bx(11.6, 0.22, 0.9, 0x2f5d9b, 0, 0));
      for (let i = -5; i <= 5; i++)
        if (i) beam.add(bx(0.05, 0.1, 0.92, 0xf6c445, i, 0.16));
      const post = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 2.4, 4),
        mat(0x0b2545),
      );
      post.position.y = -1.3;
      bv.root.position.y = 0.8;
      bv.root.add(beam, post, bx(4, 0.3, 1.6, 0x0b2545, 0, -2.6));
      T3.push({
        v: bv,
        f: () => {
          bA += (bTg - bA) * 0.08;
          beam.rotation.z = bA;
        },
      });
    }
  }
  bNew();
}
function bNew() {
  bm = 1;
  bs = 0;
  bl = [0, 0, 0, 0, 0];
  br = [0, 0, 0, 0, 0];
  bl[1 + Math.floor(Math.random() * 4)] = [2, 3, 5][
    Math.floor(Math.random() * 3)
  ];
  bUpd();
}
function bFree() {
  bm = 0;
  bs = 0;
  bl = [0, 0, 0, 0, 0];
  br = [0, 0, 0, 0, 0];
  bUpd();
}
function bClk(s, i) {
  if (bm && s === "L") return;
  const a = s === "L" ? bl : br;
  a[i] = MS[(MS.indexOf(a[i]) + 1) % MS.length];
  bUpd();
}
function bUpd() {
  const T = (a) => a.reduce((x, m, i) => x + m * (i + 1) * 2, 0),
    tl = T(bl),
    tr = T(br);
  bTg = Math.max(-0.3, Math.min(0.3, (tl - tr) * 0.012));
  const row = (a, s, o) =>
    o
      .map(
        (i) =>
          `<button class="sb" ${bm && s === "L" ? "disabled" : ""} onclick="bClk('${s}',${i})"><small>${((i + 1) * 0.2).toFixed(1)} m</small><br>${a[i] ? a[i] + " kg" : "—"}</button>`,
      )
      .join("");
  $("bL").innerHTML = row(bl, "L", [4, 3, 2, 1, 0]);
  $("bR").innerHTML = row(br, "R", [0, 1, 2, 3, 4]);
  if (bm && tl === tr && tr > 0 && !bs) {
    bs = 1;
    bsv++;
  }
  $("bT").textContent = bm ? "Misiune: echilibrează balanța" : "Mod liber";
  $("bP").textContent = bm
    ? "Partea stângă e fixă. Pune greutăți în dreapta ca momentele să fie egale."
    : "Pune greutăți pe ambele părți și urmărește cum se înclină.";
  $("bC").textContent = "Rezolvate: " + bsv;
  $("bI").innerHTML =
    `M₁ = ${tl} N·m &nbsp;|&nbsp; M₂ = ${tr} N·m<br><b>${tl === tr && tl > 0 ? "✓ Echilibru: M₁ = M₂" : tl > tr ? "Se înclină spre stânga" : tr > tl ? "Se înclină spre dreapta" : "Pune greutăți pe pârghie"}</b>`;
  if (!bv) return;
  beam.children.filter((c) => c.userData.w).forEach((c) => beam.remove(c));
  [
    [bl, -1, 0xf6c445],
    [br, 1, 0x8fb0e0],
  ].forEach(([a, g, c]) =>
    a.forEach((m, i) => {
      if (!m) return;
      const h = 0.25 + 0.14 * m,
        r = 0.22 + 0.04 * m,
        w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat(c));
      w.position.set(g * (i + 1), 0.11 + h / 2, 0);
      w.userData.w = 1;
      beam.add(w);
    }),
  );
}
