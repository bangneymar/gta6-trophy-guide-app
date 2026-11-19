// Rendering: the progress header, the roadmap stages, the trophy checklist
// cards and the detail panel that shows one trophy's guide and sources.
import { displayName, displayDescription, isSpoilerHidden } from './filters.js';

const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', completion: '100% & Platinum' };

// Update the progress card: count, percent, bar and per-grade counts.
export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const count = earned.size;
  const percent = total ? Math.round((count / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = String(count);
  document.getElementById('progressText').textContent = `${percent}% to the Platinum`;
  const fill = document.getElementById('progressFill');
  fill.style.width = `${percent}%`;
  document.getElementById('progressBarWrap').setAttribute('aria-valuenow', String(count));
  const counts = document.getElementById('gradeCounts');
  counts.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const ofGrade = trophies.filter((t) => t.grade === grade);
    const earnedOfGrade = ofGrade.filter((t) => earned.has(t.name)).length;
    const item = document.createElement('li');
    const bold = document.createElement('b');
    bold.textContent = `${earnedOfGrade}/${ofGrade.length}`;
    item.append(bold, ` ${GRADE_LABELS[grade]}`);
    counts.append(item);
  }
}

// Render the five roadmap stages, each with its trophy count and earned count.
export function renderRoadmap(roadmap, trophies, earned) {
  const list = document.getElementById('roadmapStages');
  list.replaceChildren();
  for (const stage of roadmap) {
    const stageTrophies = trophies.filter((t) => t.roadmap === stage.stage);
    const done = stageTrophies.filter((t) => earned.has(t.name)).length;
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    const number = document.createElement('span');
    number.className = 'stage-no';
    number.textContent = `Stage ${stage.stage}`;
    heading.append(number, stage.title);
    const summary = document.createElement('p');
    summary.textContent = stage.summary;
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    const bold = document.createElement('b');
    bold.textContent = `${done}/${stageTrophies.length} earned`;
    meta.append(bold, ` · ${stage.difficulty}`);
    item.append(heading, summary, meta);
    list.append(item);
  }
}

// Build one trophy card: checkbox, name, description, tags and a guide link.
export function buildTrophyCard(trophy, spoilerOn, earned, selectedName, onToggle, onSelect) {
  const item = document.createElement('li');
  const card = document.createElement('article');
  card.className = 'trophy-card' + (earned.has(trophy.name) ? ' earned' : '') + (selectedName === trophy.name ? ' selected' : '');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Guide for ${displayName(trophy, spoilerOn, earned)}`);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${displayName(trophy, spoilerOn, earned)} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => onToggle(trophy.name, box.checked));

  const body = document.createElement('div');
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = displayName(trophy, spoilerOn, earned);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = displayDescription(trophy, spoilerOn, earned);
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${trophy.grade}`;
  gradeTag.textContent = GRADE_LABELS[trophy.grade];
  tags.append(gradeTag);
  for (const kind of trophy.kinds) {
    const tag = document.createElement('span');
    tag.className = `tag kind-${kind}`;
    tag.textContent = KIND_LABELS[kind] ?? kind;
    tags.append(tag);
  }
  if (trophy.missable) {
    const tag = document.createElement('span');
    tag.className = 'tag missable';
    tag.textContent = 'Missable';
    tags.append(tag);
  }
  body.append(name, desc, tags);

  const link = document.createElement('span');
  link.className = 'guide-link';
  link.textContent = 'Guide →';

  card.addEventListener('click', () => onSelect(trophy.name));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(trophy.name);
    }
  });
  card.append(box, body, link);
  item.append(card);
  return item;
}

// Render the filtered trophy list and the result count line.
export function renderTrophyList(trophies, spoilerOn, earned, selectedName, onToggle, onSelect) {
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  for (const trophy of trophies) {
    list.append(buildTrophyCard(trophy, spoilerOn, earned, selectedName, onToggle, onSelect));
  }
  document.getElementById('emptyNote').hidden = trophies.length > 0;
  const total = trophies.length;
  const shown = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('resultLine').textContent =
    `Showing ${total} ${total === 1 ? 'trophy' : 'trophies'}${total ? ` — ${shown} earned` : ''}`;
}

// Render the detail panel for one trophy: official text, guide, sources, roadmap.
export function renderDetail(trophy, roadmap, spoilerOn, earned, onToggle) {
  const panel = document.getElementById('detailPanel');
  panel.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy to read its guide, its sources and its place on the roadmap.';
    panel.append(empty);
    return;
  }
  const hidden = isSpoilerHidden(trophy, spoilerOn, earned);
  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(title);

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${trophy.grade}`;
  gradeTag.textContent = GRADE_LABELS[trophy.grade];
  tags.append(gradeTag);
  for (const kind of trophy.kinds) {
    const tag = document.createElement('span');
    tag.className = `tag kind-${kind}`;
    tag.textContent = KIND_LABELS[kind] ?? kind;
    tags.append(tag);
  }
  if (trophy.missable) {
    const tag = document.createElement('span');
    tag.className = 'tag missable';
    tag.textContent = 'Missable';
    tags.append(tag);
  }
  panel.append(tags);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'detail-empty';
    note.textContent = 'Spoiler-safe mode is on: this story trophy stays hidden until you earn it. Tick it off in the list, or turn spoiler-safe mode off, to read its guide.';
    panel.append(note);
  } else {
    const desc = document.createElement('p');
    desc.className = 'official-desc';
    desc.textContent = `“${trophy.description}” — official description`;
    panel.append(desc);
    if (trophy.missable) {
      const warn = document.createElement('p');
      warn.className = 'missable-warn';
      warn.textContent = '⚠ Missable — read the guide before you pass the point it warns about.';
      panel.append(warn);
    }
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    panel.append(guideHeading, guide);

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    const sources = document.createElement('ul');
    sources.className = 'source-list';
    for (const source of trophy.sources || []) {
      const item = document.createElement('li');
      if (source.url) {
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = source.name;
        item.append(link);
      } else {
        item.textContent = source.name;
      }
      sources.append(item);
    }
    panel.append(sourcesHeading, sources);

    const stage = (roadmap || []).find((s) => s.stage === trophy.roadmap);
    if (stage) {
      const stageHeading = document.createElement('h3');
      stageHeading.textContent = 'Roadmap';
      const stageNote = document.createElement('p');
      stageNote.className = 'roadmap-note';
      stageNote.textContent = `Stage ${stage.stage} — ${stage.title}. ${stage.summary}`;
      panel.append(stageHeading, stageNote);
    }
  }

  const earnRow = document.createElement('label');
  earnRow.className = 'earn-row';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.addEventListener('change', () => onToggle(trophy.name, box.checked));
  const label = document.createElement('span');
  label.textContent = earned.has(trophy.name) ? 'Earned — ticked off' : 'Mark as earned';
  earnRow.append(box, label);
  panel.append(earnRow);
}

// Render the footer source list from the document's global sources.
export function renderFooterSources(sources) {
  const paragraph = document.getElementById('sourceList');
  paragraph.replaceChildren();
  const label = document.createElement('strong');
  label.textContent = 'Sources used across this guide: ';
  paragraph.append(label);
  (sources || []).forEach((source, index) => {
    if (index > 0) paragraph.append(document.createTextNode(' · '));
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      paragraph.append(link);
    } else {
      paragraph.append(document.createTextNode(source.name));
    }
  });
}
