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

// True when a trophy passes the current kind, grade, status and search filters.
export function matchesFilters(trophy, filters, earned) {
  if (filters.kind !== 'all' && !trophy.kinds.includes(filters.kind)) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.status === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.status === 'unearned' && earned.has(trophy.name)) return false;
  const query = filters.query.trim().toLowerCase();
  if (!query) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, ...(trophy.kinds || [])].join(' ').toLowerCase();
  return haystack.includes(query);
}
