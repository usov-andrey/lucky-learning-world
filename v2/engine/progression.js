// Pure progression logic: stars, unlocks, points wallet, best results, and
// the one-time v2 -> v3 migration. No DOM, no storage, no character/reward
// knowledge — callers pass in `levels` (content/levels.js) and, for
// migration, the fact-mastery helpers from engine.js.

export const SCHEMA_VERSION = 1;

export function createInitialProgression(levels) {
  return {
    schemaVersion: SCHEMA_VERSION,
    points: 0,
    unlockedLevelIds: [levels[0].id],
    levels: {},
    appliedOutcomeIds: [],
  };
}

// Defensive against corrupt/partial localStorage content — always returns a
// valid progression shape.
export function normalizeStoredState(raw, levels) {
  const base = createInitialProgression(levels);
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const validLevelIds = new Set(levels.map((level) => level.id));
  const unlockedLevelIds = Array.isArray(raw.unlockedLevelIds)
    ? [...new Set(raw.unlockedLevelIds.filter((id) => validLevelIds.has(id)))]
    : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    points: typeof raw.points === "number" && raw.points >= 0 ? raw.points : 0,
    unlockedLevelIds: unlockedLevelIds.length > 0 ? unlockedLevelIds : base.unlockedLevelIds,
    levels: raw.levels && typeof raw.levels === "object" ? raw.levels : {},
    appliedOutcomeIds: Array.isArray(raw.appliedOutcomeIds) ? raw.appliedOutcomeIds : [],
  };
}

export function validateSettings(settings) {
  const { passThreshold, unlockThreshold, rewardThreshold } = settings;
  return (
    passThreshold > 0 &&
    passThreshold <= unlockThreshold &&
    unlockThreshold <= rewardThreshold &&
    rewardThreshold <= 1
  );
}

export function starsForAccuracy(accuracy, settings) {
  if (accuracy >= settings.rewardThreshold) {
    return 3;
  }
  if (accuracy >= settings.unlockThreshold) {
    return 2;
  }
  if (accuracy >= settings.passThreshold) {
    return 1;
  }
  return 0;
}

// computeLevelOutcome(session, settings) -> { points, accuracy, stars,
// unlocksNext, earnsReward, assistedCorrections }. The caller (game
// controller) attaches levelId/outcomeId/createdAt/rewardPoolId before
// persisting — this function only knows about score math.
export function computeLevelOutcome(session, settings) {
  const accuracy = session.points / settings.scoredCount;
  const stars = starsForAccuracy(accuracy, settings);
  return {
    points: session.points,
    accuracy,
    stars,
    unlocksNext: stars >= 2,
    earnsReward: stars >= 3,
    assistedCorrections: session.assistedCorrections,
  };
}

// applyLevelOutcome(progression, outcome, levels) — idempotent by
// outcome.outcomeId: applying the same outcome twice changes progress once.
export function applyLevelOutcome(progression, outcome, levels) {
  if ((progression.appliedOutcomeIds || []).includes(outcome.outcomeId)) {
    return progression;
  }

  const prevLevel = progression.levels[outcome.levelId] || { attempts: 0, bestPoints: 0, stars: 0 };
  const nextLevelState = {
    attempts: prevLevel.attempts + 1,
    bestPoints: Math.max(prevLevel.bestPoints, outcome.points),
    stars: Math.max(prevLevel.stars, outcome.stars),
    lastPlayedAt: outcome.createdAt,
  };

  let unlockedLevelIds = progression.unlockedLevelIds;
  if (outcome.unlocksNext) {
    const level = levels.find((candidate) => candidate.id === outcome.levelId);
    const next = level && levels.find((candidate) => candidate.order === level.order + 1);
    if (next && !unlockedLevelIds.includes(next.id)) {
      unlockedLevelIds = [...unlockedLevelIds, next.id];
    }
  }

  return {
    ...progression,
    points: progression.points + outcome.points,
    unlockedLevelIds,
    levels: { ...progression.levels, [outcome.levelId]: nextLevelState },
    appliedOutcomeIds: [...(progression.appliedOutcomeIds || []), outcome.outcomeId],
  };
}

// One-time migration (versioned; runs against read-only lmm2:* data). "The
// child never re-earns what she already knows": a table already mastered in
// v2 marks its v3 level passed and unlocks the next one.
export function migrateProgressionFromV2(factStats, levels, tableFactsKeys, getMastery) {
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);
  const unlockedLevelIds = [sortedLevels[0].id];
  const levelsState = {};

  for (let i = 0; i < sortedLevels.length; i += 1) {
    const level = sortedLevels[i];
    const coreKeys = tableFactsKeys(level.table);
    const masteredCount = coreKeys.filter((key) => getMastery(factStats, key) >= 2).length;
    const passed = masteredCount >= 4;
    if (!passed) {
      break;
    }
    levelsState[level.id] = { attempts: 0, bestPoints: 0, stars: 1, lastPlayedAt: null };
    const next = sortedLevels[i + 1];
    if (next && !unlockedLevelIds.includes(next.id)) {
      unlockedLevelIds.push(next.id);
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    points: 0,
    unlockedLevelIds,
    levels: levelsState,
    appliedOutcomeIds: [],
  };
}
