// Progress persistence for the Leonida checklist: localStorage plus JSON export/import.
// The stored value is an array of earned trophy ids. Nothing here touches the network.
export const STORAGE_KEY = 'gta6-trophy-guide-earned-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earnedIds) {
  const ids = [...earnedIds].filter((id) => Number.isInteger(id)).sort((a, b) => a - b);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  return ids;
}

export function exportEarned(earnedIds) {
  const payload = {
    app: 'gta6-trophy-guide',
    exportedAt: new Date().toISOString(),
    earned: saveEarned(earnedIds),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

export async function importEarned(file, totalTrophies) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('That file has no earned list in it.');
  const clean = ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= totalTrophies);
  if (clean.length === 0 && ids.length > 0) throw new Error('No trophy ids in that file matched this guide.');
  return new Set(clean);
}
