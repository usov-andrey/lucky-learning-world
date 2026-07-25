// The Mix / Daily-Challenge node — a sixth, special selectable node that drills
// the facts Lucky recently got wrong across her unlocked tables (Phase 3).
//
// It is deliberately NOT a LEVELS entry: the five times-table levels stay exactly
// as they are, and the Mix rides its own reward path (a guaranteed level-up of an
// owned creature + a shiny-jump chance — see reward-engine.chooseMixReward). Its
// `residentId` is only the silhouette mascot shown while playing (reused art, Mew
// — never a collectible caught from the Mix).
export const MIX = {
  id: "mix",
  isMix: true,
  table: null,
  reviewTables: [],
  residentId: "aurelio", // Mew — mystery-challenge mascot (silhouette only)
  unlockAfterTables: 2, // appears once >=2 table levels are unlocked
};
