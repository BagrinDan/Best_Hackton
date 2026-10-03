/* Exerciții din manual: cuvinte lipsă + grilă */
let XL = [],
  xi = 0,
  xsc = 0,
  xm = 0,
  xs = [],
  xb = [],
  xd = 0;
function startX() {
  XL = thEx.map((l) => {
    const a = l.split("|"),
      id = a[a.length - 1];
    if (a[0] === "c") {
      const ans = [...a[1].matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
      return {
        t: "c",
        id,
        ans,
        parts: a[1].split(/\{[^}]+\}/),
        bank: shuf([...ans, ...(a[2] || "").split(",").filter(Boolean)]),
      };
    }
    const o = a[2].split(";");
    return { t: "g", id, q: a[1], ans: o[0], o: shuf(o) };
  });
  xi = 0;
  xsc = 0;
  $("xMain").classList.remove("hidden");
  $("xRes").classList.add("hidden");
  loadX();
  go("ex", "classes");
}
function loadX() {
  const q = XL[xi];
  xd = 0;
  xm = 0;
  $("xCnt").textContent = `${xi + 1} / ${XL.length}`;
  $("xSrc").innerHTML =
    `📖 <b>Sursa:</b> Manual de Fizică · Clasa ${clsSel} · ${esc(thChapter)} · ${esc(thName)} · ${esc(q.id)}`;
  $("xNext").classList.add("hidden");
  $("xMsg").textContent = "";
  if (q.t === "c") {
    xs = q.ans.map(() => null);
    xb = q.bank.map((w, i) => ({ w, i, u: 0 }));
    drawX();
  } else
    $("xBody").innerHTML =
      `<p class="xt">${esc(q.q)}</p>` +
      q.o
        .map(
          (o, k) =>
            `<button class="opt" onclick="xPick(${k})">${esc(o)}</button>`,
        )
        .join("");
}
function drawX() {
  const q = XL[xi];
  let h = '<p class="xt">';
  q.parts.forEach((p, i) => {
    h += esc(p);
    if (i < q.ans.length)
      h += `<span class="xs ${xs[i] ? "f" : ""}" onclick="xRm(${i})">${xs[i] ? esc(xs[i].w) : "&nbsp;"}</span>`;
  });
  $("xBody").innerHTML =
    h +
    '</p><div class="pcs">' +
    xb
      .map(
        (b) =>
          `<button class="xw ${b.u ? "used" : ""}" onclick="xPut(${b.i})">${esc(b.w)}</button>`,
      )
      .join("") +
    "</div>";
}
function xPut(i) {
  if (xd) return;
  const b = xb.find((x) => x.i === i),
    k = xs.indexOf(null);
  if (b.u || k < 0) return;
  xs[k] = b;
  b.u = 1;
  drawX();
  if (xs.includes(null)) return;
  if (xs.every((x, n) => x.w === XL[xi].ans[n])) {
    xd = 1;
    if (!xm) xsc++;
    $("xMsg").textContent = "✓ Corect!";
    $("xNext").classList.remove("hidden");
  } else {
    xm++;
    xd = 1;
    $("xMsg").textContent = "Nu chiar, mai încearcă.";
    setTimeout(() => {
      xb.forEach((x) => (x.u = 0));
      xs = xs.map(() => null);
      xd = 0;
      $("xMsg").textContent = "";
      drawX();
    }, 900);
  }
}
function xRm(i) {
  if (xd || !xs[i]) return;
  xs[i].u = 0;
  xs[i] = null;
  drawX();
}
function xPick(k) {
  if (xd) return;
  xd = 1;
  const q = XL[xi];
  if (q.o[k] === q.ans) xsc++;
  document.querySelectorAll(".opt").forEach((b, i) => {
    if (q.o[i] === q.ans) b.classList.add("c");
    else if (i === k) b.classList.add("w");
  });
  $("xMsg").textContent =
    q.o[k] === q.ans ? "✓ Corect!" : "Răspunsul corect: " + q.ans;
  $("xNext").classList.remove("hidden");
}
function xNext() {
  xi++;
  if (xi < XL.length) return loadX();
  $("xMain").classList.add("hidden");
  $("xRes").classList.remove("hidden");
  $("xRes").innerHTML =
    `<h2>Ai terminat exercițiile!</h2><div class="ring" style="--p:${Math.round((xsc / XL.length) * 100)}%"><strong>${xsc}/${XL.length}</strong></div><p class="mut" style="margin-bottom:20px">rezolvate corect din prima încercare</p><button class="btn" onclick="startX()">↻ Reia</button> <button class="back" style="margin:0 0 0 8px" onclick="backFn()">Înapoi la temă</button>`;
}
