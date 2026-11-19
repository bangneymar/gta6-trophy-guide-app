/* Leonida Trophy Guide — tracker logic. No network: data comes from data/trophies.json only. */
(function () {
  "use strict";

  var STORAGE_KEY = "gta6-trophy-guide-v1";
  var DATA_URL = "data/trophies.json";

  var trophies = [];
  var earned = new Set();
  var selectedName = null;
  var filters = { q: "", grade: "all", kind: "all", spoiler: false, remaining: false };

  var listEl = document.getElementById("trophy-list");
  var detailEl = document.getElementById("detail");
  var metaEl = document.getElementById("list-meta");
  var emptyEl = document.getElementById("empty-note");

  function fold(text) {
    return (text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved && Array.isArray(saved.earned)) {
        earned = new Set(saved.earned.filter(function (n) { return typeof n === "string"; }));
      }
    } catch (err) { earned = new Set(); }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: Array.from(earned), savedAt: new Date().toISOString() }));
    } catch (err) { /* storage unavailable: progress lives only for this session */ }
  }

  function isEarned(t) { return earned.has(t.name); }

  function visibleTrophies() {
    var q = fold(filters.q.trim());
    return trophies.filter(function (t) {
      if (filters.spoiler && t.kind === "story" && !isEarned(t)) return false;
      if (filters.grade !== "all" && t.grade !== filters.grade) return false;
      if (filters.kind === "missable") { if (!t.missable) return false; }
      else if (filters.kind !== "all" && t.kind !== filters.kind) return false;
      if (filters.remaining && isEarned(t)) return false;
      if (q) {
        var hay = fold(t.name + " " + t.description + " " + t.guide);
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function gradeLabel(g) {
    return g.charAt(0).toUpperCase() + g.slice(1);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function renderProgress() {
    var total = trophies.length;
    var got = earned.size;
    var pct = total ? Math.round((got / total) * 100) : 0;
    document.getElementById("earned-count").textContent = String(got);
    document.getElementById("total-count").textContent = String(total);
    document.getElementById("progress-pct").textContent = pct + "%";
    var bar = document.getElementById("progress-bar");
    bar.setAttribute("aria-valuenow", String(got));
    bar.setAttribute("aria-valuemax", String(total));
    document.getElementById("progress-fill").style.width = pct + "%";
    var counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    var totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    trophies.forEach(function (t) {
      totals[t.grade] = (totals[t.grade] || 0) + 1;
      if (isEarned(t)) counts[t.grade] = (counts[t.grade] || 0) + 1;
    });
    var parts = ["platinum", "gold", "silver", "bronze"].map(function (g) {
      return gradeLabel(g) + " " + (counts[g] || 0) + "/" + (totals[g] || 0);
    });
    document.getElementById("grade-counts").innerHTML = "";
    parts.forEach(function (p, i) {
      var b = el("b", null, p);
      document.getElementById("grade-counts").appendChild(b);
      if (i < parts.length - 1) document.getElementById("grade-counts").appendChild(document.createTextNode(" · "));
    });
  }

  function renderList() {
    var shown = visibleTrophies();
    listEl.innerHTML = "";
    metaEl.textContent = shown.length + " of " + trophies.length + " trophies shown";
    emptyEl.hidden = shown.length !== 0;
    shown.forEach(function (t) {
      var li = el("li", "trophy-card" + (isEarned(t) ? " earned" : "") + (selectedName === t.name ? " selected" : ""));
      li.setAttribute("data-trophy", t.name);
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.setAttribute("aria-pressed", isEarned(t) ? "true" : "false");

      var top = el("div", "trophy-top");
      var check = document.createElement("input");
      check.type = "checkbox";
      check.className = "trophy-check";
      check.checked = isEarned(t);
      check.setAttribute("aria-label", "Mark " + t.name + " as earned");
      check.addEventListener("click", function (ev) {
        ev.stopPropagation();
        toggleEarned(t.name);
      });
      var name = el("h3", "trophy-name", t.name);
      top.appendChild(check);
      top.appendChild(name);
      li.appendChild(top);

      li.appendChild(el("p", "trophy-desc", t.description));

      var tags = el("div", "trophy-tags");
      tags.appendChild(el("span", "tag " + t.grade, gradeLabel(t.grade)));
      tags.appendChild(el("span", "tag kind-" + t.kind, t.kind === "story" ? "Story" : t.kind === "collectibles" ? "Collectible" : "Activity"));
      if (t.missable) tags.appendChild(el("span", "tag missable", "Missable"));
      if (isEarned(t)) tags.appendChild(el("span", "tag earned-tag", "Earned"));
      li.appendChild(tags);

      li.addEventListener("click", function () { selectTrophy(t.name); });
      li.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selectTrophy(t.name); }
      });
      listEl.appendChild(li);
    });
  }

  function renderDetail() {
    var t = trophies.find(function (x) { return x.name === selectedName; });
    detailEl.innerHTML = "";
    if (!t) {
      detailEl.appendChild(el("p", "detail-empty", "Select a trophy to read its guide and sources."));
      return;
    }
    if (filters.spoiler && t.kind === "story" && !isEarned(t)) {
      detailEl.appendChild(el("p", "detail-empty", "Spoiler-safe is on: this story trophy stays hidden until you earn it."));
      return;
    }
    var title = el("h2", null, t.name);
    detailEl.appendChild(title);
    var grade = el("p", "detail-grade");
    grade.appendChild(el("span", "tag " + t.grade, gradeLabel(t.grade)));
    if (t.missable) grade.appendChild(document.createTextNode(" "));
    if (t.missable) grade.appendChild(el("span", "tag missable", "Missable"));
    detailEl.appendChild(grade);
    detailEl.appendChild(el("p", null, t.description));
    detailEl.appendChild(el("h3", null, "How to unlock it"));
    detailEl.appendChild(el("p", null, t.guide));
    if (/BELUM TERKONFIRMASI/.test(t.guide)) {
      detailEl.appendChild(el("p", "unconfirmed", "Unconfirmed: the exact method is still being pinned down by trophy hunters. Check the sources below for the latest before trying."));
    }
    detailEl.appendChild(el("h3", null, "Sources"));
    var ul = el("ul", "sources");
    (t.sources || []).forEach(function (s) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.name;
      li.appendChild(a);
      ul.appendChild(li);
    });
    detailEl.appendChild(ul);
    var actions = el("div", "detail-actions");
    var mark = el("button", null, isEarned(t) ? "Mark as not earned" : "Mark as earned");
    mark.type = "button";
    mark.addEventListener("click", function () { toggleEarned(t.name); });
    actions.appendChild(mark);
    var next = el("button", null, "Next un-earned trophy");
    next.type = "button";
    next.addEventListener("click", function () { selectNextUnearned(t.name); });
    actions.appendChild(next);
    detailEl.appendChild(actions);
  }

  function renderRoadmap() {
    var story = trophies.filter(function (t) { return t.kind === "story"; });
    var storyDone = story.filter(isEarned).length;
    var miss = trophies.find(function (t) { return t.missable; });
    var strangers = trophies.filter(function (t) {
      return ["Road to Rehabilitation", "This Was No Boat Accident", "The Lone Rider", "Supply & Demand", "Spin On This!", "Strangers & Freaks"].indexOf(t.name) !== -1;
    });
    var strangersDone = strangers.filter(isEarned).length;
    var done = earned.size;
    var map = {
      story: "Story trophies: " + storyDone + " of " + story.length + " earned.",
      missable: miss ? ("Positive Mental Attitude: " + (isEarned(miss) ? "earned." : "not earned yet — do the Chapter 1 balcony meditation!")) : "",
      completion: "Overall: " + done + " of " + trophies.length + " trophies earned (" + (trophies.length ? Math.round((done / trophies.length) * 100) : 0) + "%).",
      strangers: "Strangers & Freaks strands: " + strangersDone + " of " + strangers.length + " earned."
    };
    document.querySelectorAll("[data-roadmap-progress]").forEach(function (node) {
      node.textContent = map[node.getAttribute("data-roadmap-progress")] || "";
    });
    var next = trophies.filter(function (t) { return !isEarned(t); }).slice(0, 5);
    var box = document.getElementById("next-up");
    box.innerHTML = "";
    box.appendChild(el("h3", null, "Next up"));
    if (next.length === 0) {
      box.appendChild(el("p", null, "Every trophy is earned. Vice Got a Price! should be yours."));
      return;
    }
    var ul = document.createElement("ul");
    next.forEach(function (t) {
      var li = document.createElement("li");
      var b = el("strong", null, t.name + " ");
      li.appendChild(b);
      li.appendChild(document.createTextNode("— " + t.description));
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  function renderAll() {
    renderProgress();
    renderList();
    renderDetail();
    renderRoadmap();
  }

  function toggleEarned(name) {
    if (earned.has(name)) earned.delete(name);
    else earned.add(name);
    saveProgress();
    renderAll();
  }

  function selectTrophy(name) {
    selectedName = name;
    renderList();
    renderDetail();
    if (window.innerWidth <= 900) detailEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function selectNextUnearned(afterName) {
    var idx = trophies.findIndex(function (t) { return t.name === afterName; });
    for (var i = 1; i <= trophies.length; i++) {
      var t = trophies[(idx + i) % trophies.length];
      if (!isEarned(t)) { selectTrophy(t.name); return; }
    }
  }

  function switchTab(tab) {
    document.querySelectorAll(".tab").forEach(function (b) {
      var active = b.getAttribute("data-tab") === tab;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.getElementById("view-checklist").hidden = tab !== "checklist";
    document.getElementById("view-checklist").classList.toggle("active", tab === "checklist");
    document.getElementById("view-roadmap").hidden = tab !== "roadmap";
    document.getElementById("view-roadmap").classList.toggle("active", tab === "roadmap");
  }

  function download(filename, text) {
    var blob = new Blob([text], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function bindControls() {
    document.getElementById("search").addEventListener("input", function (ev) {
      filters.q = ev.target.value;
      renderList();
    });
    document.getElementById("filter-grade").addEventListener("change", function (ev) {
      filters.grade = ev.target.value;
      renderList();
    });
    document.getElementById("filter-kind").addEventListener("change", function (ev) {
      filters.kind = ev.target.value;
      renderList();
    });
    document.getElementById("spoiler-toggle").addEventListener("change", function (ev) {
      filters.spoiler = ev.target.checked;
      renderList();
      renderDetail();
    });
    document.getElementById("remaining-only").addEventListener("change", function (ev) {
      filters.remaining = ev.target.checked;
      renderList();
    });
    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
    });
    document.getElementById("export-btn").addEventListener("click", function () {
      download("gta6-trophy-progress.json", JSON.stringify({ game: "Grand Theft Auto VI", earned: Array.from(earned).sort(), exportedAt: new Date().toISOString() }, null, 2));
    });
    var importBtn = document.getElementById("import-btn");
    var importFile = document.getElementById("import-file");
    importBtn.addEventListener("click", function () { importFile.click(); });
    importFile.addEventListener("change", function () {
      var file = importFile.files && importFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(String(reader.result));
          var names = Array.isArray(parsed) ? parsed : parsed.earned;
          if (!Array.isArray(names)) throw new Error("bad file");
          var known = new Set(trophies.map(function (t) { return t.name; }));
          var fresh = new Set();
          names.forEach(function (n) { if (known.has(n)) fresh.add(n); });
          earned = fresh;
          saveProgress();
          renderAll();
        } catch (err) {
          window.alert("That file is not a valid progress export.");
        }
        importFile.value = "";
      };
      reader.readAsText(file);
    });
    document.getElementById("reset-btn").addEventListener("click", function () {
      if (!window.confirm("Clear all earned trophies?")) return;
      earned = new Set();
      saveProgress();
      renderAll();
    });
    document.getElementById("search").addEventListener("keydown", function (ev) {
      if (ev.key === "/") { ev.preventDefault(); }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && document.activeElement !== document.getElementById("search")) {
        ev.preventDefault();
        document.getElementById("search").focus();
      }
    });
  }

  loadProgress();
  bindControls();
  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("trophies.json failed to load");
      return res.json();
    })
    .then(function (data) {
      trophies = Array.isArray(data) ? data : data.trophies || [];
      renderAll();
    })
    .catch(function () {
      metaEl.textContent = "Could not load the trophy list. Check that data/trophies.json is present.";
    });
})();
