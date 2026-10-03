let uploadBusy = false;
let generatedCards = [];
let generatedManualName = "";

function generatedUrl(value) {
  const url = new URL(value, window.location.origin);
  if (url.origin !== window.location.origin || !url.pathname.startsWith("/cards/")) {
    throw new Error("Serverul a returnat o adresă de card invalidă.");
  }
  return url.href;
}

function uploadOptions() {
  return [
    ["skipPages", "skip_pages", 0, Infinity],
    ["limitChunks", "limit_chunks", 1, Infinity],
    ["limitCards", "limit_cards", 1, 100],
  ].flatMap(([id, name, min, max]) => {
    const value = $(id).value.trim();
    if (!value && id === "limitChunks") return [];
    const number = Number(value);
    if (!value || !Number.isInteger(number) || number < min || number > max) {
      throw new Error("Verifică numărul de pagini, fragmente și carduri.");
    }
    return [[name, String(number)]];
  });
}

function renderGeneratedCards(result, filename) {
  if (!Array.isArray(result.cards)) throw new Error("Răspuns invalid de la server.");
  const cards = result.cards.map((card) => ({
    ...card, svg_url: generatedUrl(card.svg_url),
    illustration_url: card.illustration_url ? generatedUrl(card.illustration_url) : null,
  }));
  const preview = generatedUrl(result.preview_url);
  generatedCards = cards;
  generatedManualName = filename;
  $("generatedCards").replaceChildren();
  for (const card of cards) {
    const tile = document.createElement("article");
    tile.className = "card generated-card";
    const image = document.createElement("img");
    image.src = card.illustration_url || card.svg_url;
    image.alt = card.term;
    image.loading = "lazy";
    const title = document.createElement("h3");
    title.textContent = card.term;
    const definition = document.createElement("p");
    definition.textContent = card.definition;
    const source = document.createElement("small");
    source.textContent = card.page ? `Pagina ${card.page}` : "Definiție din manual";
    tile.append(image, title, definition, source);
    if (card.generation_error) {
      const warning = document.createElement("p");
      warning.className = "mut";
      warning.textContent = "Ilustrația nu a putut fi generată; definiția este disponibilă.";
      tile.append(warning);
    }
    $("generatedCards").append(tile);
  }
  $("generatedPreview").href = preview;
  $("uploadResults").classList.toggle("hidden", cards.length === 0);
}

async function up(file) {
  if (!file || uploadBusy) return;
  const status = $("upn");
  status.classList.remove("upload-error");
  try {
    if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("Alege un fișier PDF.");
    if (!file.size) throw new Error("Fișierul PDF este gol.");
    if (file.size > 50 * 1024 * 1024) throw new Error("PDF-ul trebuie să aibă maximum 50 MB.");
    const form = new FormData();
    form.append("file", file);
    uploadOptions().forEach(([name, value]) => form.append(name, value));
    uploadBusy = true;
    $("pdfInput").disabled = true;
    ["skipPages", "limitChunks", "limitCards"].forEach((id) => ($(id).disabled = true));
    $("upload").setAttribute("aria-busy", "true");
    $("fn").textContent = file.name;
    $("uploadResults").classList.add("hidden");
    const steps = [...$("stp").children];
    steps.forEach((step) => step.classList.remove("d"));
    status.textContent = "Manualul este procesat. Extragem definițiile și generăm cardurile; acest pas poate dura câteva minute.";
    const pending = fetch("/api/cards/generate-from-pdf", { method: "POST", body: form });
    steps[0].classList.add("d");
    const response = await pending;
    let result;
    try { result = await response.json(); }
    catch { throw new Error("Serverul nu a returnat un răspuns valid. Verifică dacă backend-ul rulează."); }
    if (!response.ok) {
      if (response.status === 503) throw new Error("Procesarea a eșuat. Verifică dacă modelul configurat și serverul LLM sunt disponibile, apoi încearcă din nou.");
      throw new Error(typeof result.detail === "string" ? result.detail : "Fișierul sau opțiunile de procesare nu sunt valide.");
    }
    renderGeneratedCards(result, file.name);
    steps.forEach((step) => step.classList.add("d"));
    const fallbackCount = generatedCards.filter((card) => card.generation_error).length;
    status.textContent = generatedCards.length
      ? `${generatedCards.length} carduri generate.${fallbackCount ? ` ${fallbackCount} carduri conțin doar text.` : ""} Le poți vedea mai jos sau începe studiul.`
      : "Nu am găsit definiții în paginile analizate. Încearcă alte pagini sau mai multe fragmente. PDF-ul trebuie să conțină text selectabil.";
  } catch (error) {
    status.classList.add("upload-error");
    status.textContent = error instanceof TypeError
      ? "Nu putem contacta serverul. Deschide aplicația prin backend și verifică dacă acesta rulează."
      : error.message;
  } finally {
    uploadBusy = false;
    $("pdfInput").disabled = false;
    ["skipPages", "limitChunks", "limitCards"].forEach((id) => ($(id).disabled = false));
    $("upload").setAttribute("aria-busy", "false");
  }
}

function studyGeneratedCards() {
  if (!generatedCards.length) return;
  const name = "Manual: " + generatedManualName;
  S[name] = generatedCards.map((card) => {
    const image = document.createElement("img");
    image.className = "generated-flash-image";
    image.src = card.illustration_url || card.svg_url;
    image.alt = card.term;
    return {
      tag: "ÎNTREBARE", q: card.question || `Ce este ${card.term}?`,
      a: card.illustration_url ? image.outerHTML : "📘",
      f: card.short_answer || card.definition,
      e: "", x: esc(card.definition) + (card.explanation ? "<br><br>" + esc(card.explanation) : ""),
      studyIllustration: card.illustration_url ? image.outerHTML : "📘",
      h: card.page ? `Revino la pagina ${card.page} din manual pentru context.` : "Revino la definiția din manual pentru context.",
      m: card.page ? `Pagina ${card.page}` : "Definiție din manual",
    };
  });
  openSet(name, "Manual încărcat › " + generatedManualName, () => go("upload"), "upload");
}
