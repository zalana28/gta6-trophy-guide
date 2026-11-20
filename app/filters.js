// Filtering for the trophy list: search text, grade, kind, missable, hidden and earned state.
// Pure functions over the trophy array, so the list render stays testable and small.
export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind]
    .join(' ')
    .toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => word === '' || haystack.includes(word));
}

export function filterTrophies(trophies, filters, earnedIds) {
  return trophies.filter((trophy) => {
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
    if (filters.missableOnly && !trophy.missable) return false;
    if (filters.hiddenOnly && !trophy.hidden) return false;
    if (filters.earned === 'earned' && !earnedIds.has(trophy.id)) return false;
    if (filters.earned === 'unearned' && earnedIds.has(trophy.id)) return false;
    return trophyMatchesSearch(trophy, filters.query);
  });
}

export function gradeCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
  }
  return counts;
}

export function progressPercent(earnedCount, total) {
  if (total === 0) return 0;
  return Math.round((earnedCount / total) * 100);
}
