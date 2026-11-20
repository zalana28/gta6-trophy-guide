// Leonida Checklist: renders the 55 trophies, the checklist state, the roadmap and the
// missable view. Data comes only from the local data/trophies.json; progress lives in
// localStorage via storage.js; filtering lives in filters.js; stages live in roadmap.js.
import { loadEarned, saveEarned, exportEarned, importEarned } from './storage.js';
import { filterTrophies, gradeCounts, progressPercent } from './filters.js';
import { ROADMAP_STAGES, trophiesForStage } from './roadmap.js';

const params = new URLSearchParams(location.search);
const response = await fetch('data/trophies.json');
const doc = await response.json();
const TROPHIES = doc.trophies;
const byId = new Map(TROPHIES.map((trophy) => [trophy.id, trophy]));

let earned = loadEarned();
let spoilerSafe = params.get('spoiler') === '1';
let currentView = params.get('view') === 'roadmap' || params.get('view') === 'missable'
  ? params.get('view')
  : 'checklist';
let openTrophyId = Number(params.get('trophy')) || null;

const listEl = document.getElementById('trophyList');
const resultLine = document.getElementById('resultLine');
const emptyNote = document.getElementById('emptyNote');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const kindFilter = document.getElementById('kindFilter');
const missableOnly = document.getElementById('missableOnly');
const hiddenOnly = document.getElementById('hiddenOnly');
const earnedFilter = document.getElementById('earnedFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const detailPanel = document.getElementById('detailPanel');
const detailBody = document.getElementById('detailBody');

if (params.get('grade')) gradeFilter.value = params.get('grade');
if (params.get('kind')) kindFilter.value = params.get('kind');
if (params.get('q')) searchInput.value = params.get('q');
spoilerToggle.checked = spoilerSafe;

function isSpoilerHidden(trophy) {
  return spoilerSafe && trophy.kind === 'story' && !earned.has(trophy.id);
}

function sourceLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function currentFilters() {
  return {
    query: searchInput.value.trim(),
    grade: gradeFilter.value,
    kind: kindFilter.value,
    missableOnly: missableOnly.checked,
    hiddenOnly: hiddenOnly.checked,
    earned: earnedFilter.value,
  };
}

function renderProgress() {
  const total = TROPHIES.length;
  const pct = progressPercent(earned.size, total);
  document.getElementById('progressText').textContent = `${earned.size} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}% to platinum`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressBarWrap').setAttribute('aria-valuenow', String(earned.size));
  const counts = gradeCounts(TROPHIES);
  const earnedByGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of TROPHIES) {
    if (earned.has(trophy.id)) earnedByGrade[trophy.grade] += 1;
  }
  document.getElementById('gradeCounts').textContent =
    `Platinum ${earnedByGrade.platinum}/${counts.platinum} · Gold ${earnedByGrade.gold}/${counts.gold} · ` +
    `Silver ${earnedByGrade.silver}/${counts.silver} · Bronze ${earnedByGrade.bronze}/${counts.bronze} · ` +
    `Hidden ${TROPHIES.filter((t) => t.hidden).length} · Missable ${TROPHIES.filter((t) => t.missable).length}`;
  document.getElementById('progressNote').textContent =
    earned.size === total
      ? 'Platinum earned — you are a Leonida Legend.'
      : 'Platinum: Vice Got a Price! — earn the other 54.';
}

function trophyCard(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(trophy.id) ? ' earned' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveEarned(earned);
    renderAll();
  });
  const body = document.createElement('div');
  body.className = 'trophy-body';
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
  const badge = document.createElement('span');
  badge.className = `badge ${trophy.grade}`;
  badge.textContent = trophy.grade;
  head.append(name, badge);
  if (trophy.missable) {
    const tag = document.createElement('span');
    tag.className = 'tag miss';
    tag.textContent = '⚠ Missable';
    head.append(tag);
  }
  if (trophy.hidden) {
    const tag = document.createElement('span');
    tag.className = 'tag hid';
    tag.textContent = 'Hidden';
    head.append(tag);
  }
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = trophy.kind;
  head.append(kind);
  if (earned.has(trophy.id)) {
    const mark = document.createElement('span');
    mark.className = 'earned-mark';
    mark.textContent = '✓ Earned';
    head.append(mark);
  }
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isSpoilerHidden(trophy)
    ? 'Spoiler-safe mode hides this story trophy until you earn it.'
    : trophy.description;
  const guide = document.createElement('p');
  guide.className = 'trophy-guide';
  guide.textContent = isSpoilerHidden(trophy) ? '' : trophy.guide;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'guide-btn';
  btn.textContent = 'Guide + sources';
  btn.addEventListener('click', () => openDetail(trophy.id));
  body.append(head, desc, guide, btn);
  li.append(box, body);
  return li;
}

function renderList() {
  const shown = filterTrophies(TROPHIES, currentFilters(), earned);
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyNote.hidden = shown.length !== 0;
  resultLine.textContent =
    `Showing ${shown.length} of ${TROPHIES.length} trophies` +
    (spoilerSafe ? ' · spoiler-safe mode on (story names hidden until earned)' : '');
}

function renderRoadmap() {
  const stageList = document.getElementById('stageList');
  stageList.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const note = document.createElement('p');
    note.textContent = stage.note;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    const items = trophiesForStage(stage.stage, TROPHIES);
    const done = items.filter((t) => earned.has(t.id)).length;
    const label = document.createElement('b');
    label.textContent = `${done}/${items.length} earned: `;
    names.append(label);
    names.append(document.createTextNode(items.map((t) => t.name).join(' · ')));
    li.append(heading, note, names);
    stageList.append(li);
  }
}

function renderMissable() {
  const wrap = document.getElementById('missableList');
  wrap.replaceChildren();
  for (const trophy of TROPHIES.filter((t) => t.missable)) {
    const card = document.createElement('div');
    card.className = 'miss-card';
    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name} — ${trophy.grade}`;
    const warn = document.createElement('p');
    const strong = document.createElement('strong');
    strong.className = 'warn';
    strong.textContent = 'The only trophy that may be missable. ';
    warn.append(strong, document.createTextNode(trophy.guide));
    const state = document.createElement('p');
    state.textContent = earned.has(trophy.id)
      ? '✓ You have marked this one earned — the risk is behind you.'
      : 'Not yet marked earned. Do the Chapter 1 balcony meditation before Chapter 1 ends.';
    card.append(heading, warn, state);
    wrap.append(card);
  }
}

function openDetail(trophyId) {
  const trophy = byId.get(trophyId);
  if (!trophy) return;
  openTrophyId = trophyId;
  detailBody.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = trophy.name;
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent =
    `${trophy.grade} · ${trophy.kind}` +
    (trophy.hidden ? ' · hidden on PlayStation' : ' · visible on PlayStation') +
    (trophy.missable ? ' · possibly missable' : ' · not missable') +
    (trophy.count ? ` · count: ${trophy.count}` : '') +
    ` · roadmap stage ${trophy.roadmap_stage}`;
  const desc = document.createElement('p');
  const descLabel = document.createElement('strong');
  descLabel.textContent = 'Official description: ';
  desc.append(descLabel, document.createTextNode(trophy.description));
  const guide = document.createElement('p');
  guide.textContent = trophy.guide;
  const sources = document.createElement('div');
  sources.className = 'sources';
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources for this guide';
  const list = document.createElement('ul');
  for (const url of trophy.sources || []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `${sourceLabel(url)} — ${url}`;
    item.append(link);
    list.append(item);
  }
  sources.append(sourcesHeading, list);
  detailBody.append(heading, meta, desc, guide, sources);
  detailPanel.hidden = false;
}

function closeDetail() {
  openTrophyId = null;
  detailPanel.hidden = true;
}

function showView(view) {
  currentView = view;
  for (const btn of document.querySelectorAll('.view-btn')) {
    btn.classList.toggle('active', btn.dataset.view === view);
  }
  document.getElementById('checklistView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('missableView').hidden = view !== 'missable';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missable') renderMissable();
}

function renderAll() {
  renderProgress();
  renderList();
  if (currentView === 'roadmap') renderRoadmap();
  if (currentView === 'missable') renderMissable();
  if (openTrophyId) openDetail(openTrophyId);
}

for (const btn of document.querySelectorAll('.view-btn')) {
  btn.addEventListener('click', () => showView(btn.dataset.view));
}
for (const control of [searchInput, gradeFilter, kindFilter, missableOnly, hiddenOnly, earnedFilter]) {
  control.addEventListener('input', renderList);
  control.addEventListener('change', renderList);
}
spoilerToggle.addEventListener('change', () => {
  spoilerSafe = spoilerToggle.checked;
  renderList();
});
document.getElementById('exportBtn').addEventListener('click', () => exportEarned(earned));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await importEarned(file, TROPHIES.length);
    saveEarned(earned);
    renderAll();
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear every tick on this checklist?')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});
document.getElementById('detailClose').addEventListener('click', closeDetail);

showView(currentView);
renderAll();
if (openTrophyId && byId.has(openTrophyId)) openDetail(openTrophyId);
window.__ready = true;
