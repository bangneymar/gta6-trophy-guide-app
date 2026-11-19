// Leonida Trophy Guide — bootstrap: load the trophy data, wire the controls,
// and keep the checklist, filters, spoiler mode and detail panel in sync.
import { loadEarned, saveEarned, downloadExport, parseImportText } from './state.js';
import { matchesFilters } from './filters.js';
import { renderProgress, renderRoadmap, renderTrophyList, renderDetail, renderFooterSources } from './render.js';

// Load the guide data (a local file under app/ — the app makes no network requests).
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const roadmap = doc.roadmap || [];
const knownNames = new Set(trophies.map((t) => t.name));

// UI state: earned set (persisted), filters, spoiler mode, selected trophy.
let earned = loadEarned(knownNames);
let selectedName = null;
const filters = { query: '', kind: 'all', grade: 'all', status: 'all' };
let spoilerOn = false;

// Re-render every part of the page from the current state.
function renderAll() {
  const visible = trophies.filter((t) => matchesFilters(t, filters, earned));
  renderProgress(trophies, earned);
  renderRoadmap(roadmap, trophies, earned);
  renderTrophyList(visible, spoilerOn, earned, selectedName, toggleEarned, selectTrophy);
  const selected = trophies.find((t) => t.name === selectedName) ?? null;
  renderDetail(selected, roadmap, spoilerOn, earned, toggleEarned);
}

// Tick or untick one trophy, save, and re-render.
function toggleEarned(name, isEarned) {
  if (isEarned) earned.add(name);
  else earned.delete(name);
  saveEarned(earned);
  renderAll();
}

// Open one trophy's guide in the detail panel.
function selectTrophy(name) {
  selectedName = name;
  renderAll();
  document.getElementById('detailPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Wire the filter controls.
document.getElementById('search').addEventListener('input', (event) => {
  filters.query = event.target.value;
  renderAll();
});
document.getElementById('kindFilter').addEventListener('change', (event) => {
  filters.kind = event.target.value;
  renderAll();
});
document.getElementById('gradeFilter').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  renderAll();
});
document.getElementById('statusFilter').addEventListener('change', (event) => {
  filters.status = event.target.value;
  renderAll();
});
document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  spoilerOn = event.target.checked;
  renderAll();
});

// Press "/" anywhere (outside a text field) to jump straight to the search box.
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
  event.preventDefault();
  document.getElementById('search').focus();
});

// Export progress to a JSON file.
document.getElementById('exportBtn').addEventListener('click', () => {
  downloadExport(earned);
});

// Import progress back from a JSON file.
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = parseImportText(await file.text(), knownNames);
    saveEarned(earned);
    renderAll();
  } catch (error) {
    alert(`Could not import that file: ${error.message}`);
  }
  event.target.value = '';
});

// Reset all progress after a confirmation.
document.getElementById('resetBtn').addEventListener('click', () => {
  if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});

renderFooterSources(doc.sources);
renderAll();
