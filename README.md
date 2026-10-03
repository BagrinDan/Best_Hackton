# Best_Hackaton
Build Analyze Survive

Topic: Platforma educationala 



Arhitecture: 
====================================================================================================
Book -> ParsingBook -> CardService -> LLM visual plan -> SVG cards
====================================================================================================

## Generate SVG cards locally

The renderer lives in `app/core/svg_generator.py`. The service in
`app/services/card_service.py` uses `ParsingBook` to extract definitions and the
same configured LLM to produce visual plans. SVG rendering needs no GPU or image
API key. Local LLM inference requires Ollama running with the selected model.

Run from the project root:

```bash
.venv/bin/python -m app.services.card_service \
  "test/IX_Fizica (in limba romana, a. 2018).pdf" \
  --skip-pages 5 --limit-chunks 5 --limit-cards 3 --out-dir cards/svg
python3 -m http.server 8000 --directory cards/svg
```

Open http://localhost:8000 to preview the generated cards. The service also
writes SVG files and `index.json` containing the original definitions, source
quotes, page numbers, and visual plans. If a visual plan fails, it writes a text
card and records `generation_error`; PDF extraction failures still propagate.
Use `--model` and `--base-url` to select a different local model/server.

The service automatically loads `.env` from the project root. Existing shell
variables take precedence over `.env`; command-line options take precedence over
both. Ollama is the default and needs no API key. For OpenRouter, configure:

```dotenv
LLM_BACKEND=openrouter
LLM_MODEL=your-provider-model-id
OPENROUTER_API_KEY=your-key
```

For Groq, use `LLM_BACKEND=groq`, `GROQ_API_KEY`, and a Groq model ID in
`LLM_MODEL`. Optional `LLM_BASE_URL` and `LLM_API_KEY` override provider defaults.
The SVG service does not need `FAL_KEY`. Keep `.env` private; it is gitignored.

To use the service from Python, including with a cloud-configured parser:

```python
from app.core.parsing_book import ParsingBook
from app.services.card_service import CardService

parser = ParsingBook(skip_pages=5)
service = CardService(parser, out_dir="cards/svg")
cards = service.generate_from_book(limit_chunks=5, limit_cards=3)
# Or reuse definitions that have already been extracted:
# cards = service.generate_cards(definitions)
```

## Frontend API

Start the FastAPI app from the project root (Ollama should be running when selected):

```bash
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 20000 --reload
```

Interactive API docs: http://localhost:20000/docs. The API loads the root `.env`.
The connected PhysiCards frontend is at http://localhost:20000/. Choose
“Încarcă un PDF”, set the processing options, and select a PDF. The upload screen
shows the generated SVG cards and offers a button to study them in the existing
flashcard view. For a quick check, use 5 skipped pages, 2 chunks, and 3 cards.
Generated study cards show a question and illustration on the front, and a short
answer with a smaller illustration on the back. “Nu știu” opens the full source
definition and explanation below the card. Upload again to generate the new
question/answer fields and illustration files for older batches.
The renderer uses vector icons and schematic diagrams for motion, friction,
density, volume, force, and circuits. It retains dedicated optics diagrams.
Visual plans get one repair attempt when they fail validation or repeat the
term as the answer. Passages the LLM identifies as historical notes or other
non-definitions are excluded; this semantic check still depends on the model.
Source definitions remain available in full, and long SVG explanations wrap.
Generation may take several minutes; the upload controls remain disabled while
the request is running. No separate `http.server` process is required.
Local frontend origins on ports 5173 and 3000 are allowed; customize the
comma-separated `FRONTEND_ORIGINS` variable for another origin.

- `POST /api/cards/generate`: JSON containing `definitions`, each with `term`,
  `definition`, and optional `quote` and `page` (up to 100 definitions).
- `POST /api/cards/generate-from-pdf`: multipart form with `file` (PDF, max 50 MB),
  optional `skip_pages`, `limit_chunks`, and `limit_cards` (default 20, max 100).
- `GET /cards/{batch_id}/{filename}`: generated SVGs, HTML previews, and JSON.
  Existing CLI output remains accessible at `/cards/index.html`.

Each generation response contains `batch_id`, `count`, `preview_url`, and `cards`.
Each card includes a `svg_url` for an `<img>` element plus its source metadata.
Study cards also include `question`, `short_answer`, and `illustration_url` (the
diagram without the card title, answer header, and definition footer).
Requests wait for generation to finish, so allow enough time in your frontend
for local inference. Visual-plan failures yield text cards with `generation_error`;
an extraction or configuration failure returns HTTP 503.

Generate from existing definitions:

```javascript
const response = await fetch('http://localhost:20000/api/cards/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    definitions: [{ term: 'Densitatea', definition: 'Densitatea este masa unității de volum.' }]
  })
});
if (!response.ok) throw new Error((await response.json()).detail);
const result = await response.json();
// Display result.cards[0].svg_url as an image or open result.preview_url.
```

Generate from a PDF selected in your frontend:

```javascript
const form = new FormData();
form.append('file', fileInput.files[0]);
form.append('skip_pages', '5');
form.append('limit_chunks', '2');
form.append('limit_cards', '3');
const response = await fetch('http://localhost:20000/api/cards/generate-from-pdf', {
  method: 'POST', body: form
});
if (!response.ok) throw new Error((await response.json()).detail);
const result = await response.json();
```
