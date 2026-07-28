import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialProgression,
  normalizeStoredState,
  validateSettings,
  starsForAccuracy,
  computeLevelOutcome,
  applyLevelOutcome,
  migrateProgressionFromV2,
} from "../engine/progression.js";
import { DEFAULT_GAME_SETTINGS } from "../content/settings.js";
import { LEVELS } from "../content/levels.js";
import { tableFactsKeys, getMastery, createFactRecord } from "../engine/math-engine.js";

function outcomeFor(points, levelId, overrides = {}) {
  const outcome = computeLevelOutcome({ points, assistedCorrections: 0 }, DEFAULT_GAME_SETTINGS);
  return { ...outcome, levelId, outcomeId: overrides.outcomeId || `${levelId}-${points}`, createdAt: "2026-07-11T00:00:00.000Z" };
}

test("stars: 4 pts -> 0 stars, 5 -> *, 8 -> **, 9 -> *** (inclusive bounds)", () => {
  assert.equal(starsForAccuracy(4 / 10, DEFAULT_GAME_SETTINGS), 0);
  assert.equal(starsForAccuracy(5 / 10, DEFAULT_GAME_SETTINGS), 1);
  assert.equal(starsForAccuracy(8 / 10, DEFAULT_GAME_SETTINGS), 2);
  assert.equal(starsForAccuracy(9 / 10, DEFAULT_GAME_SETTINGS), 3);
  assert.equal(starsForAccuracy(10 / 10, DEFAULT_GAME_SETTINGS), 3);
});

test("computeLevelOutcome: unlock at ** and reward at ***", () => {
  assert.equal(computeLevelOutcome({ points: 5, assistedCorrections: 0 }, DEFAULT_GAME_SETTINGS).unlocksNext, false);
  assert.equal(computeLevelOutcome({ points: 8, assistedCorrections: 0 }, DEFAULT_GAME_SETTINGS).unlocksNext, true);
  assert.equal(computeLevelOutcome({ points: 8, assistedCorrections: 0 }, DEFAULT_GAME_SETTINGS).earnsReward, false);
  assert.equal(computeLevelOutcome({ points: 9, assistedCorrections: 0 }, DEFAULT_GAME_SETTINGS).earnsReward, true);
});

test("starsForAccuracy: boundaries follow edited parent settings, not hardcoded defaults", () => {
  const stricter = { ...DEFAULT_GAME_SETTINGS, passThreshold: 0.6, unlockThreshold: 0.8, rewardThreshold: 0.95 };
  assert.equal(starsForAccuracy(5 / 10, stricter), 0, "5/10 no longer passes under the stricter settings");
  assert.equal(starsForAccuracy(6 / 10, stricter), 1);
  assert.equal(starsForAccuracy(8 / 10, stricter), 2);
  assert.equal(starsForAccuracy(9 / 10, stricter), 2, "9/10 no longer earns *** under the stricter reward threshold");
  assert.equal(starsForAccuracy(9.5 / 10, stricter), 3);
});

test("validateSettings: rejects unordered thresholds", () => {
  assert.equal(validateSettings(DEFAULT_GAME_SETTINGS), true);
  assert.equal(validateSettings({ passThreshold: 0.8, unlockThreshold: 0.5, rewardThreshold: 0.9 }), false);
  assert.equal(validateSettings({ passThreshold: 0, unlockThreshold: 0.5, rewardThreshold: 0.9 }), false);
  assert.equal(validateSettings({ passThreshold: 0.5, unlockThreshold: 0.9, rewardThreshold: 0.8 }), false);
});

test("applyLevelOutcome: points wallet increases after every attempt, never decreases", () => {
  let progression = createInitialProgression(LEVELS);
  progression = applyLevelOutcome(progression, outcomeFor(3, "x6", { outcomeId: "a" }), LEVELS);
  assert.equal(progression.points, 3);
  progression = applyLevelOutcome(progression, outcomeFor(2, "x6", { outcomeId: "b" }), LEVELS);
  assert.equal(progression.points, 5);
  // Even a 0-point attempt still "applies" (banked, no regression elsewhere).
  progression = applyLevelOutcome(progression, outcomeFor(0, "x6", { outcomeId: "c" }), LEVELS);
  assert.equal(progression.points, 5);
});

test("applyLevelOutcome: same outcomeId applied twice changes progress once", () => {
  let progression = createInitialProgression(LEVELS);
  const outcome = outcomeFor(9, "x6", { outcomeId: "same" });
  progression = applyLevelOutcome(progression, outcome, LEVELS);
  const afterFirst = progression;
  progression = applyLevelOutcome(progression, outcome, LEVELS);
  assert.deepEqual(progression, afterFirst);
  assert.equal(progression.points, 9);
});

test("applyLevelOutcome: unlock stores level ids, not objects, and never double-unlocks", () => {
  let progression = createInitialProgression(LEVELS);
  progression = applyLevelOutcome(progression, outcomeFor(8, "x6", { outcomeId: "u1" }), LEVELS);
  assert.deepEqual(progression.unlockedLevelIds, ["x6", "x7"]);
  progression.unlockedLevelIds.forEach((id) => assert.equal(typeof id, "string"));

  // Replaying an already-unlocked level's ** result must not add a
  // duplicate or falsely "re-unlock" x7.
  progression = applyLevelOutcome(progression, outcomeFor(8, "x6", { outcomeId: "u2" }), LEVELS);
  assert.deepEqual(progression.unlockedLevelIds, ["x6", "x7"]);
});

test("applyLevelOutcome: x10 (last level) unlocking next is a no-op", () => {
  let progression = createInitialProgression(LEVELS);
  progression = { ...progression, unlockedLevelIds: ["x6", "x7", "x8", "x9", "x10"] };
  progression = applyLevelOutcome(progression, outcomeFor(9, "x10", { outcomeId: "last" }), LEVELS);
  assert.deepEqual(progression.unlockedLevelIds, ["x6", "x7", "x8", "x9", "x10"]);
});

test("normalizeStoredState: recovers a valid shape from garbage/partial input", () => {
  assert.deepEqual(normalizeStoredState(null, LEVELS), createInitialProgression(LEVELS));
  assert.deepEqual(normalizeStoredState(undefined, LEVELS), createInitialProgression(LEVELS));
  assert.deepEqual(normalizeStoredState("not an object", LEVELS), createInitialProgression(LEVELS));

  const normalized = normalizeStoredState({ points: -5, unlockedLevelIds: ["x6", "bogus", "x6"] }, LEVELS);
  assert.equal(normalized.points, 0);
  assert.deepEqual(normalized.unlockedLevelIds, ["x6"]);
  assert.deepEqual(normalized.levels, {});
});

test("migrateProgressionFromV2: 4+ mastered core facts pass a level and unlock the next", () => {
  function masteredFactStats(keys) {
    const stats = {};
    keys.forEach((key) => {
      stats[key] = { ...createFactRecord(), mastery: 2 };
    });
    return stats;
  }

  const fresh = migrateProgressionFromV2({}, LEVELS, tableFactsKeys, getMastery);
  assert.deepEqual(fresh.unlockedLevelIds, ["x6"]);
  assert.deepEqual(fresh.levels, {});

  const sixMastered = masteredFactStats(tableFactsKeys(6).slice(0, 5));
  const afterSix = migrateProgressionFromV2(sixMastered, LEVELS, tableFactsKeys, getMastery);
  assert.deepEqual(afterSix.unlockedLevelIds, ["x6", "x7"]);
  assert.equal(afterSix.levels.x6.stars, 1);
  assert.equal(afterSix.levels.x7, undefined);

  const sixAndSevenMastered = masteredFactStats([
    ...tableFactsKeys(6).slice(0, 5),
    ...tableFactsKeys(7).slice(0, 5),
  ]);
  const afterSeven = migrateProgressionFromV2(sixAndSevenMastered, LEVELS, tableFactsKeys, getMastery);
  assert.deepEqual(afterSeven.unlockedLevelIds, ["x6", "x7", "x8"]);
});
