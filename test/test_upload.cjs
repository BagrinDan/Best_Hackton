const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function element() {
  const classes = new Set();
  return {
    value: '', textContent: '', disabled: false, children: [],
    classList: {
      add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
    },
    append(...children) { this.children.push(...children); },
    replaceChildren() { this.children = []; },
    setAttribute(name, value) { this[name] = value; },
    get outerHTML() { return `<img src="${this.src}" alt="safe">`; },
  };
}

function setup(fetch) {
  const elements = Object.fromEntries([
    'upn', 'fn', 'pdfInput', 'skipPages', 'limitChunks', 'limitCards',
    'upload', 'stp', 'uploadResults', 'generatedCards', 'generatedPreview',
  ].map((id) => [id, element()]));
  elements.skipPages.value = '5';
  elements.limitChunks.value = '2';
  elements.limitCards.value = '3';
  elements.stp.children = Array.from({ length: 4 }, element);
  let study;
  const context = vm.createContext({
    $, URL, FormData, TypeError, fetch,
    window: { location: { origin: 'http://localhost:20000' } },
    document: { createElement: element },
    S: {}, esc: (text) => text.replaceAll('<', '&lt;'),
    openSet: (...args) => { study = args; }, go: () => {},
  });
  function $(id) { return elements[id]; }
  vm.runInContext(fs.readFileSync('app/static/js/upload.js', 'utf8'), context);
  return { context, elements, study: () => study };
}

const file = () => Object.assign(new Blob(['%PDF-1.4 mock'], { type: 'application/pdf' }), { name: 'manual.pdf' });

test('PDF upload sends form options, shows SVGs, and opens study cards', async () => {
  let sent;
  const { context, elements, study } = setup(async (url, options) => {
    sent = { url, options };
    return { ok: true, json: async () => ({
      preview_url: 'http://localhost:20000/cards/batch/index.html',
      cards: [{ term: '<Forța>', definition: '<Definition>', explanation: 'Explanation',
        page: 12, svg_url: 'http://localhost:20000/cards/batch/card.svg',
        illustration_url: 'http://localhost:20000/cards/batch/illustration.svg',
        question: 'Ce studiază fizica?', short_answer: 'Fenomenele naturii', visual_plan: {} }],
    }) };
  });
  await context.up(file());
  assert.equal(sent.url, '/api/cards/generate-from-pdf');
  assert.equal(sent.options.body.get('skip_pages'), '5');
  assert.equal(sent.options.body.get('limit_chunks'), '2');
  assert.equal(sent.options.body.get('limit_cards'), '3');
  assert.equal(sent.options.body.get('file').size, file().size);
  assert.equal(elements.generatedCards.children.length, 1);
  assert.equal(elements.generatedCards.children[0].children[1].textContent, '<Forța>');
  assert.match(elements.upn.textContent, /1 carduri generate/);
  assert.equal(elements.pdfInput.disabled, false);
  context.studyGeneratedCards();
  assert.equal(study()[0], 'Manual: manual.pdf');
  const studyCard = context.S[study()[0]][0];
  assert.equal(studyCard.q, 'Ce studiază fizica?');
  assert.equal(studyCard.f, 'Fenomenele naturii');
  assert.equal(studyCard.e, '');
  assert.match(studyCard.x, /&lt;Definition>/);
  assert.match(studyCard.a, /illustration.svg/);
  assert.match(studyCard.studyIllustration, /illustration.svg/);
});

test('server errors restore controls and show a useful error', async () => {
  const { context, elements } = setup(async () => ({ ok: false, status: 503, json: async () => ({ detail: 'failure' }) }));
  await context.up(file());
  assert.match(elements.upn.textContent, /Procesarea a eșuat/);
  assert.equal(elements.upn.classList.contains('upload-error'), true);
  assert.equal(elements.pdfInput.disabled, false);
  assert.equal(elements.upload['aria-busy'], 'false');
});

test('invalid files are rejected before making a request', async () => {
  let requests = 0;
  const { context, elements } = setup(async () => { requests++; });
  await context.up({ name: 'wrong.txt', size: 20 });
  assert.equal(requests, 0);
  assert.match(elements.upn.textContent, /Alege un fișier PDF/);
});
