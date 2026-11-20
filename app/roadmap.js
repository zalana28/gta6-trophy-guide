// The platinum roadmap: six ordered stages built from the official trophy descriptions.
// Each stage lists the trophy ids that belong to it, in play order.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story, chapters 1–5',
    note: 'All 12 story trophies pop from missions and chapter endings. Do the Chapter 1 balcony meditation with Lucia (Positive Mental Attitude) before Chapter 1 ends — it is the only possibly-missable moment in the game.',
    trophies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    stage: 2,
    title: 'Stage 2 — Side characters & strangers',
    note: 'Finish the five named character strands (Andy, Kenton, Billy, Randy, Tyrone), Bret’s hunt, and eight Strangers & Freaks strands. Start them as they open during the story; finish them in free roam.',
    trophies: [22, 23, 24, 26, 27, 29, 25],
  },
  {
    stage: 3,
    title: 'Stage 3 — Activities, races & shooting',
    note: 'Try all nine activity types, win 20 races and 14 drone races, gold all 42 shooting-range challenges, beat Cal at fishing, finish an arcade game, and work through 50 of the 80 challenges.',
    trophies: [15, 16, 19, 18, 17, 20, 21, 32, 46, 47, 48],
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles & exploration',
    note: 'Meditate at all 18 spots, complete 3 card sets (15 for 100%), WAiNK-scan 100 locations, discover 100 vehicles, and clear the fog from the whole map of Leonida.',
    trophies: [28, 30, 31, 35, 42],
  },
  {
    stage: 5,
    title: 'Stage 5 — Crime, robberies & money',
    note: 'Rob vaults, trucks, shops and one illegal operation per gang; lose a 4-star wanted level with your partner; launder $250,000 in Marked Bills; spend $100,000; buy all 8 garages and register 10 vehicles.',
    trophies: [33, 34, 36, 37, 38, 39, 40, 41, 43, 52, 53, 54, 55, 44, 45, 49, 50, 51],
  },
  {
    stage: 6,
    title: 'Stage 6 — 100% cleanup & the platinum',
    note: 'Open Progress > 100% Completion after the story and clear the remaining checklist items. When A Long Road pops, the platinum (Vice Got a Price!) follows at once.',
    trophies: [14, 1],
  },
];

export function stageForTrophy(trophyId) {
  const found = ROADMAP_STAGES.find((stage) => stage.trophies.includes(trophyId));
  return found ? found.stage : 6;
}

export function trophiesForStage(stageNumber, trophies) {
  const stage = ROADMAP_STAGES.find((item) => item.stage === stageNumber);
  if (!stage) return [];
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  return stage.trophies.map((id) => byId.get(id)).filter(Boolean);
}
