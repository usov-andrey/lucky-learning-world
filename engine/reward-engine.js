// Pure reward eligibility + selection. No DOM, no storage. RNG is injected so
// selection is deterministic under test. Reads static content (stage ladders) via
// content/characters.js — content is pure, so this stays a pure domain module.

import { getStageCount, getShinyStageLevel } from "../content/characters.js";

// Probability a Mix / Daily-Challenge ★★★ leaps a creature straight to its shiny
// stage instead of a normal +1 level.
export const MIX_SHINY_JUMP_CHANCE = 0.25;

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

// Among owned ids, pick one at the lowest level (ties broken by rng for variety).
function pickLowestLevel(ids, owned, rng) {
  let min = Infinity;
  ids.forEach((id) => {
    min = Math.min(min, owned.get(id).level);
  });
  const tied = ids.filter((id) => owned.get(id).level === min);
  return pick(tied, rng);
}

// chooseReward(pool, collection, allPools, rng) -> { characterId, variant, poolId }
export function chooseReward(pool, collection, allPools, rng = Math.random) {
  const owned = new Map(collection.map((entry) => [entry.id, entry]));

  const poolUnowned = pool.characterIds.filter((id) => !owned.has(id));
  if (poolUnowned.length > 0) {
    return { characterId: pick(poolUnowned, rng), variant: "new", poolId: pool.id };
  }

  const allIds = [...new Set(allPools.flatMap((candidate) => candidate.characterIds))];
  const globalUnowned = allIds.filter((id) => !owned.has(id));
  if (globalUnowned.length > 0) {
    return { characterId: pick(globalUnowned, rng), variant: "new", poolId: null };
  }

  const belowTop = (ids) => ids.filter((id) => owned.has(id) && owned.get(id).level < getStageCount(id));
  const poolBelowTop = belowTop(pool.characterIds);
  if (poolBelowTop.length > 0) {
    return { characterId: pickLowestLevel(poolBelowTop, owned, rng), variant: "levelup", poolId: pool.id };
  }
  const globalBelowTop = belowTop(allIds);
  if (globalBelowTop.length > 0) {
    return { characterId: pickLowestLevel(globalBelowTop, owned, rng), variant: "levelup", poolId: null };
  }

  // Everyone is at their top stage — keep rewarding by leveling the lowest one.
  const ownedIds = allIds.filter((id) => owned.has(id));
  return { characterId: pickLowestLevel(ownedIds, owned, rng), variant: "levelup", poolId: null };
}

// chooseMixReward(collection, allPools, rng) -> { characterId, variant, poolId, toLevel? }
export function chooseMixReward(collection, allPools, rng = Math.random) {
  if (collection.length === 0) {
    const allIds = [...new Set(allPools.flatMap((candidate) => candidate.characterIds))];
    return { characterId: pick(allIds, rng), variant: "new", poolId: null };
  }

  const owned = new Map(collection.map((entry) => [entry.id, entry]));
  const ids = [...owned.keys()];
  const belowShiny = ids.filter((id) => {
    const shinyLevel = getShinyStageLevel(id);
    return shinyLevel != null && owned.get(id).level < shinyLevel;
  });
  const candidates = belowShiny.length > 0 ? belowShiny : ids;
  const target = pickLowestLevel(candidates, owned, rng);

  const shinyLevel = getShinyStageLevel(target);
  const canJump = shinyLevel != null && owned.get(target).level < shinyLevel;
  if (canJump && rng() < MIX_SHINY_JUMP_CHANCE) {
    return { characterId: target, variant: "shinyjump", poolId: null, toLevel: shinyLevel };
  }
  return { characterId: target, variant: "levelup", poolId: null };
}

// applyReward(collection, reward, outcomeId, appliedRewardOutcomeIds)
export function applyReward(collection, reward, outcomeId, appliedRewardOutcomeIds = []) {
  if (!reward || !reward.characterId || appliedRewardOutcomeIds.includes(outcomeId)) {
    return { collection, appliedRewardOutcomeIds };
  }

  const existing = collection.find((entry) => entry.id === reward.characterId);
  let nextCollection;

  if ((reward.variant === "levelup" || reward.variant === "shinyjump") && existing) {
    const nextLevel =
      reward.variant === "shinyjump" && reward.toLevel
        ? Math.max(existing.level + 1, reward.toLevel)
        : existing.level + 1;
    const shinyLevel = getShinyStageLevel(reward.characterId);
    const shiny = existing.shiny || (shinyLevel != null && nextLevel >= shinyLevel);
    nextCollection = collection.map((entry) =>
      entry.id === reward.characterId ? { ...entry, level: nextLevel, shiny } : entry,
    );
  } else if (existing) {
    nextCollection = collection;
  } else {
    nextCollection = [...collection, { id: reward.characterId, shiny: false, level: 1 }];
  }

  return {
    collection: nextCollection,
    appliedRewardOutcomeIds: [...appliedRewardOutcomeIds, outcomeId],
  };
}

export function normalizeCollection(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter((entry) => entry && typeof entry.id === "string")
    .map((entry) => {
      const shiny = Boolean(entry.shiny);
      let level;
      if (Number.isInteger(entry.level) && entry.level >= 1) {
        level = entry.level;
      } else {
        level = shiny ? 2 : 1;
      }
      return { id: entry.id, shiny, level };
    });
}
