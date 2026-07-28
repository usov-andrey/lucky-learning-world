// Static level manifest — the level map is built from this, not hardcoded
// buttons. Order is the unlock sequence (level N+1 unlocks from level N).

export const LEVELS = [
  { id: "x6", order: 1, table: 6, reviewTables: [], rewardPoolId: "x6", residentId: "res_x6" },
  { id: "x7", order: 2, table: 7, reviewTables: [6], rewardPoolId: "x7", residentId: "res_x7" },
  { id: "x8", order: 3, table: 8, reviewTables: [6, 7], rewardPoolId: "x8", residentId: "res_x8" },
  { id: "x9", order: 4, table: 9, reviewTables: [6, 7, 8], rewardPoolId: "x9", residentId: "res_x9" },
  { id: "x10", order: 5, table: 10, reviewTables: [6, 7, 8, 9], rewardPoolId: "x10", residentId: "res_x10" },
];
