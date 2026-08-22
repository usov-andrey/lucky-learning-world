// Static reward pools — the only source of reward eligibility. Each level's
// `rewardPoolId` (content/levels.js) resolves to exactly one pool here.

export const REWARD_POOLS = [
  { id: "x6", characterIds: ["embercub", "leafling", "bubblit"] },
  { id: "x7", characterIds: ["sparkitty", "coraly", "frosty"] },
  { id: "x8", characterIds: ["glimmowl", "duskit", "pebblin"] },
  { id: "x9", characterIds: ["wispurr", "glowmoth", "tidalpup"] },
  { id: "x10", characterIds: ["starhorn", "aurelio", "moonkit"] },
];

// Lucky's requested Word Realm test rewards. Spelling tests exhaust this pool
// before chooseReward() falls back to the complete standard roster above.
export const SPELLING_TEST_REWARD_POOL = {
  id: "spelling-tests",
  characterIds: ["frosty", "pebblin", "glowmoth", "aurelio"],
};

export function getPoolById(poolId) {
  return REWARD_POOLS.find(p => p.id === poolId) || REWARD_POOLS[0];
}
