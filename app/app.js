// Leonida Trophy Guide — checklist tracker.
// Loads app/data/trophies.json, renders the 55 trophies, and keeps the
// earned set in localStorage. No network is used beyond this one local file.
const STORAGE_KEY = "leonida-trophy-progress-v1";
const SPOILER_KEY = "leonida-trophy-spoiler-v1";

const STAGES = [
  { n: 1, title: "Story of Leonida", note: "Play Chapters 1–5 (about 60–80 hours). All 12 story trophies pop as the missions end. Do the balcony meditation in Chapter 1." },
  { n: 2, title: "Activities & sports", note: "Races, Shooting Range golds, stunts, arcade games, fishing and challenges. The Shootist needs all 42 range golds." },
  { n: 3, title: "Collections & the map", note: "Card sets, WAiNK scans, vehicles, treasures and the whole map. Scan everything early — it counts twice." },
  { n: 4, title: "Robberies & the underworld", note: "Bank vaults, armored trucks, gang operations, shops and fencing. Vaults open in Chapter 4." },
  { n: 5, title: "100% & the Platinum", note: "Finish the in-game 100% checklist for A Long Road, then Vice Got a Price! pops on its own." },
];

const KIND_LABELS = { story: "Story", missable: "Missable", collectibles: "Collectibles", activities: "Activities", online: "Online" };

const listEl = document.getElementById("trophy-list");
const detailEl = document.getElementById("detail");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const resultCount = document.getElementById("result-count");
const searchEl = document.getElementById("search");
const gradeEl = document.getElementById("grade-filter");
const kindEl = document.getElementById("kind-filter");
const missableEl = document.getElementById("missable-only");
const spoilerEl = document.getElementById("spoiler-safe");

let trophies = [];
let earned = loadEarned();
let selectedId = null;

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function loadSpoiler() {
  try {
    return localStorage.getItem(SPOILER_KEY) !== "off";
  } catch {
    return true;
  }
}

function isHiddenFromSpoilers(t) {
  return spoilerEl.checked && t.kind === "story" && !earned.has(t.id);
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  if (gradeEl.value && t.grade !== gradeEl.value) return false;
  if (kindEl.value === "missable" && !t.missable) return false;
  if (kindEl.value === "online") return false;
  if (kindEl.value && kindEl.value !== "missable" && kindEl.value !== "online" && t.kind !== kindEl.value) return false;
  if (missableEl.checked && !t.missable) return false;
  return true;
}

function renderRoadmap() {
  const box = document.getElementById("stages");
  box.innerHTML = "";
  for (const s of STAGES) {
    const inStage = trophies.filter((t) => t.stage === s.n);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const li = document.createElement("li");
    const h = document.createElement("h3");
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(s.n);
    h.append(num, document.createTextNode(" " + s.title));
    const p = document.createElement("p");
    p.textContent = s.note;
    const c = document.createElement("span");
    c.className = "count";
    c.textContent = `${done}/${inStage.length} earned in this stage`;
    li.append(h, p, c);
    box.append(li);
  }
}

function renderProgress() {
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const total = trophies.length || 55;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressFill.style.width = pct + "%";
  progressText.textContent = `${done} of ${total} trophies earned — ${pct}% toward Vice Got a Price!`;
}

function renderList() {
  listEl.innerHTML = "";
  const shown = trophies.filter(trophyMatches);
  resultCount.textContent = `${shown.length} of ${trophies.length} trophies shown.`;
  if (shown.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = kindEl.value === "online"
      ? "There are no online trophies — all 55 are offline and single-player."
      : "No trophies match these filters.";
    listEl.append(li);
    return;
  }
  for (const t of shown) {
    const li = document.createElement("li");
    if (earned.has(t.id)) li.classList.add("earned");
    if (selectedId === t.id) li.classList.add("selected");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", "Earned: " + t.name);
    box.addEventListener("click", (ev) => ev.stopPropagation());
    box.addEventListener("change", () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveEarned();
      renderProgress();
      renderRoadmap();
      renderList();
      renderDetail();
    });
    const body = document.createElement("div");
    body.className = "trophy-body";
    const name = document.createElement("div");
    name.className = "trophy-name";
    if (isHiddenFromSpoilers(t)) {
      const span = document.createElement("span");
      span.className = "hidden-name";
      span.textContent = "Hidden story trophy — earn it to reveal its name";
      name.append(span);
    } else {
      name.textContent = t.name;
    }
    const desc = document.createElement("p");
    desc.className = "trophy-desc";
    desc.textContent = isHiddenFromSpoilers(t) ? "Hidden until earned." : t.description;
    const badges = document.createElement("div");
    badges.className = "badges";
    const grade = document.createElement("span");
    grade.className = "badge " + t.grade;
    grade.textContent = t.grade;
    badges.append(grade);
    const kind = document.createElement("span");
    kind.className = "badge kind";
    kind.textContent = KIND_LABELS[t.kind] || t.kind;
    badges.append(kind);
    if (t.missable) {
      const m = document.createElement("span");
      m.className = "badge missable";
      m.textContent = "Missable";
      badges.append(m);
    }
    if (t.guide.includes("BELUM TERKONFIRMASI")) {
      const u = document.createElement("span");
      u.className = "badge unconfirmed";
      u.textContent = "Unconfirmed";
      badges.append(u);
    }
    body.append(name, desc, badges);
    li.append(box, body);
    li.addEventListener("click", () => {
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  detailEl.innerHTML = "";
  const h = document.createElement("h2");
  h.textContent = "Guide";
  detailEl.append(h);
  if (!t) {
    const p = document.createElement("p");
    p.className = "detail-empty";
    p.textContent = "Pick a trophy to see its guide and sources.";
    detailEl.append(p);
    return;
  }
  const title = document.createElement("h3");
  title.textContent = isHiddenFromSpoilers(t) ? "Hidden story trophy" : t.name;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${t.grade} · ${KIND_LABELS[t.kind] || t.kind}${t.missable ? " · Missable" : ""}${t.count ? " · Target: " + t.count : ""} · ${earned.has(t.id) ? "Earned" : "Not earned yet"}`;
  const desc = document.createElement("p");
  desc.textContent = isHiddenFromSpoilers(t) ? "Hidden until earned." : t.description;
  const guide = document.createElement("p");
  guide.className = "guide";
  guide.textContent = isHiddenFromSpoilers(t)
    ? "This story trophy stays hidden until you earn it. Finish the story and come back."
    : t.guide;
  detailEl.append(title, meta, desc, guide);
  if (!isHiddenFromSpoilers(t) && Array.isArray(t.sources) && t.sources.length > 0) {
    const sh = document.createElement("p");
    sh.innerHTML = "<strong>Sources</strong>";
    const ul = document.createElement("ul");
    ul.className = "sources";
    for (const s of t.sources) {
      const li = document.createElement("li");
      if (s.url) {
        const a = document.createElement("a");
        a.href = s.url;
        a.textContent = s.name;
        a.rel = "noopener";
        li.append(a);
      } else {
        li.textContent = s.name;
      }
      ul.append(li);
    }
    detailEl.append(sh, ul);
  }
}

function exportProgress() {
  const data = { game: "Grand Theft Auto VI", earned: [...earned].sort(), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const arr = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(arr)) throw new Error("bad file");
      const ids = new Set(trophies.map((t) => t.id));
      earned = new Set(arr.filter((id) => ids.has(id)));
      saveEarned();
      renderProgress();
      renderRoadmap();
      renderList();
      renderDetail();
    } catch {
      alert("That file is not a Leonida progress export.");
    }
  };
  reader.readAsText(file);
}

spoilerEl.checked = loadSpoiler();
spoilerEl.addEventListener("change", () => {
  try { localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? "on" : "off"); } catch { /* storage unavailable */ }
  renderList();
  renderDetail();
});
searchEl.addEventListener("input", renderList);
gradeEl.addEventListener("change", renderList);
kindEl.addEventListener("change", renderList);
missableEl.addEventListener("change", renderList);
document.getElementById("export-btn").addEventListener("click", exportProgress);
document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-file").click());
document.getElementById("import-file").addEventListener("change", (ev) => {
  if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
  ev.target.value = "";
});
document.getElementById("reset-btn").addEventListener("click", () => {
  if (!confirm("Clear every earned trophy?")) return;
  earned = new Set();
  saveEarned();
  renderProgress();
  renderRoadmap();
  renderList();
  renderDetail();
});

fetch("data/trophies.json")
  .then((r) => { if (!r.ok) throw new Error("trophies.json did not load"); return r.json(); })
  .then((d) => {
    trophies = d.trophies;
    renderRoadmap();
    renderProgress();
    renderList();
    renderDetail();
  })
  .catch(() => {
    progressText.textContent = "Could not load the trophy list.";
    listEl.innerHTML = "<li class='empty'>The trophy data file did not load. Check that data/trophies.json is present.</li>";
  });
