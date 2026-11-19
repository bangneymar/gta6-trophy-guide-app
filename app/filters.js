// Filtering, searching and spoiler-hiding for the trophy list.
// A trophy is a story trophy when its kinds include "story".
export function isStoryTrophy(trophy) {
  return trophy.kinds.includes('story');
}

// True when spoiler mode must hide this trophy's name and description.
export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && isStoryTrophy(trophy) && !earned.has(trophy.name);
}

// The name the list shows: the real one, or a hidden placeholder.
export function displayName(trophy, spoilerOn, earned) {
  return isSpoilerHidden(trophy, spoilerOn, earned) ? 'Hidden story trophy' : trophy.name;
}

// The description the list shows under spoiler mode.
export function displayDescription(trophy, spoilerOn, earned) {
  return isSpoilerHidden(trophy, spoilerOn, earned)
    ? 'A story trophy — its name and description stay hidden until you earn it.'
    : trophy.description;
}

// Fold a string for searching: lower case, and strip accents so a search for
// "leon" also matches "León" and "cafe" matches "café".
export function foldForSearch(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// True when a trophy passes the current kind, grade, status and search filters.
export function matchesFilters(trophy, filters, earned) {
  if (filters.kind !== 'all' && !trophy.kinds.includes(filters.kind)) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.status === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.status === 'unearned' && earned.has(trophy.name)) return false;
  const query = foldForSearch(filters.query.trim());
  if (!query) return true;
  const haystack = foldForSearch([trophy.name, trophy.description, trophy.guide, ...(trophy.kinds || [])].join(' '));
  return haystack.includes(query);
}
