// Static default game settings. Content only — no DOM, no storage, no logic
// beyond what the shape itself implies. Parent view may store an edited copy;
// this module always describes the factory defaults.

export const DEFAULT_GAME_SETTINGS = {
  // hardDrill: concentrate scored questions on the "big" facts (6×6…6×9) with
  // repeats, instead of coasting on easy ones. warmupCount is kept at 1 so the
  // session opens with a single confidence question, then it's almost all hard.
  hardDrill: true,
  warmupCount: 1,
  scoredCount: 10,
  passThreshold: 0.5, // inclusive: accuracy >= threshold
  unlockThreshold: 0.75,
  rewardThreshold: 0.9,
  // Soft daily goal (a target, never a cap): the picker stays playable all day.
  // Reaching it is celebrated; going over it is encouraged (endless practice).
  dailyGoalAttempts: 3,
};
