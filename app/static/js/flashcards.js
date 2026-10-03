function openSet(name, crumb, b, nav) {
  back = b;
  cur = name;
  $("stCrumb").innerHTML = crumb.replace(/([^›]+)$/, "<b>$1</b>");
  $("stTitle").textContent = "Flashcard-uri: " + name;
  if (!S[name]) {
    $("deck").classList.add("hidden");
    $("res").classList.remove("hidden");
    $("res").innerHTML =
      `<h2>Set în pregătire</h2><p class="mut" style="margin:12px 0 22px">Pentru această temă flashcard-urile nu sunt încă generate. Pentru demo, încearcă „Mișcarea mecanică” sau „Viteza”.</p><button class="btn" onclick="backFn()">← Înapoi</button>`;
    go("study", nav);
    return;
  }
  set = S[name];
  start();
  go("study", nav);
}
function start() {
  idx = 0;
  ans = [];
  $("deck").classList.remove("hidden");
  $("res").classList.add("hidden");
  draw();
}
function draw() {
  const c = set[idx];
  $("fl").classList.remove("flip");
  $("more").classList.add("hidden");
  document.querySelectorAll(".rate").forEach((b) => (b.disabled = false));
  $("tg").textContent = c.tag;
  $("qq").textContent = c.q;
  $("art").innerHTML = c.a;
  $("ff").textContent = c.f;
  $("ff").style.fontSize =
    c.f.length > 24 ? "24px" : c.f.length > 14 ? "32px" : "";
  $("ee").innerHTML = c.e;
  $("mm").textContent = c.m;
  $("cnt").textContent = `${idx + 1} / ${set.length}`;
  $("pr").style.width = ((idx + 1) / set.length) * 100 + "%";
}
function rate(r) {
  ans[idx] = r;
  if (r === 2) return next();
  document.querySelectorAll(".rate").forEach((b) => (b.disabled = true));
  const c = set[idx];
  const x = c.x || (c.e || "") + " " + (c.h || "");
  $("more").innerHTML =
    `<h3>Hai să înțelegem mai bine</h3><p><b>Întrebarea:</b> ${c.q}</p><p>${x}</p><div class="tip">💡 ${c.h}</div><button class="btn" onclick="next()">Continuă →</button>`;
  $("more").classList.remove("hidden");
  $("more").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function next() {
  if (idx === set.length - 1) return finish();
  idx++;
  draw();
}
function finish() {
  const n = set.length,
    bad = ans.filter((x) => x === 0).length,
    good = ans.filter((x) => x === 2).length,
    p = Math.round((good / n) * 100);
  const weak = set
    .filter((_, i) => ans[i] !== 2)
    .map((c) => `<li>${c.q}</li>`)
    .join("");
  const msg =
    p >= 80
      ? "🌟 Excelent! Ai înțeles foarte bine tema. Poți trece la următoarea."
      : p >= 50
        ? "👍 Progres bun! Repetă cardurile la care ai ales „Nu știu”."
        : "📚 Mai e nevoie de puțină recapitulare. Reia tema și concentrează-te pe cardurile de mai jos.";
  $("deck").classList.add("hidden");
  $("res").classList.remove("hidden");
  $("res").innerHTML =
    `<h2>Ai terminat tema!</h2><p class="mut" style="margin-top:8px">Raportul tău pentru <b>${cur}</b></p><div class="ring" style="--p:${p}%"><strong>${p}%</strong></div><div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat">✕<b>${bad}</b>Nu știu</div><div class="stat">✓<b>${good}</b>Știu</div></div><div class="concl"><b>Concluzie:</b><br>${msg}</div>${weak ? `<div class="weak"><b>De repetat:</b><ul>${weak}</ul></div>` : ""}<button class="btn" onclick="start()">↻ Repetă tema</button> <button class="back" style="margin:0 0 0 8px" onclick="backFn()">Alege altă temă</button>`;
}
