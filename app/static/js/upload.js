function up(f) {
  if (!f) return;
  $("fn").textContent = f.name;
  $("upn").textContent =
    "Prototip: pașii de mai jos sunt simulați. Parsarea reală a PDF-ului se conectează la server.";
  const s = [...$("stp").children];
  s.forEach((x) => x.classList.remove("d"));
  s.forEach((x, i) => setTimeout(() => x.classList.add("d"), 500 * (i + 1)));
}
