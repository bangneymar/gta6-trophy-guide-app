// Progress state: which trophies are earned, saved in localStorage,
// plus export to a JSON file and import back from one.
export const STORAGE_KEY = 'leonida-trophy-guide-progress-v1';

// The game this guide tracks — an export file for another game is refused on import.
export const GAME_NAME = 'Grand Theft Auto VI';

// Load the earned set, keeping only names the guide actually lists.
export function loadEarned(knownNames) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) return new Set();
    return new Set(names.filter((name) => knownNames.has(name)));
  } catch {
    return new Set();
  }
}

// Save the earned set to localStorage.
export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

// Build the JSON text an export file carries.
export function buildExportText(earned) {
  return JSON.stringify(
    { game: GAME_NAME, guide: 'Leonida Trophy Guide', exportedAt: new Date().toISOString(), earned: [...earned].sort() },
    null,
    2,
  );
}

// Download the export file through a temporary anchor.
export function downloadExport(earned) {
  const blob = new Blob([buildExportText(earned)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gta6-trophy-progress.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

// Parse an imported file's text into an earned set, ignoring unknown names.
// A file that names a different game is refused instead of silently importing.
export function parseImportText(text, knownNames) {
  const parsed = JSON.parse(text);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.game && parsed.game !== GAME_NAME) {
    throw new Error(`That file is progress for ${parsed.game}, not ${GAME_NAME}.`);
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file has no earned-trophy list.');
  const earned = new Set(names.filter((name) => typeof name === 'string' && knownNames.has(name)));
  return earned;
}
