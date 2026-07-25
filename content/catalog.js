// Validated read-only lookup over content/*.js. Pure — no DOM, no storage.
// Throws at build time (import) if the static content is internally
// inconsistent, so a broken content edit fails fast instead of surfacing as a
// runtime crash mid-session.

import { LEVELS } from "./content/levels.js?v=2026-07-20b";
import { CHARACTERS } from "./content/characters.js?v=2026-07-20b";
import { REWARD_POOLS } from "./content/reward-pools.js?v=2026-07-20b";
import { MIX } from "./content/mix.js?v=2026-07-20b";

function assertUniqueIds(list, label) {
  const seen = new Set();
  list.forEach((item) => {
    if (seen.has(item.id)) {
      throw new Error(`catalog: duplicate ${label} id "${item.id}"`);
    }
    seen.add(item.id);
  });
}

export function validateCatalog(levels = LEVELS, characters = CHARACTERS, pools = REWARD_POOLS) {
  const errors = [];
  const characterIds = new Set(characters.map((c) => c.id));
  const poolIds = new Set(pools.map((p) => p.id));

  try {
    assertUniqueIds(levels, "level");
  } catch (error) {
    errors.push(error.message);
  }
  try {
    assertUniqueIds(characters, "character");
  } catch (error) {
    errors.push(error.message);
  }
  try {
    assertUniqueIds(pools, "reward pool");
  } catch (error) {
    errors.push(error.message);
  }

  levels.forEach((level) => {
    if (!characterIds.has(level.residentId)) {
      errors.push(`catalog: level "${level.id}" residentId "${level.residentId}" does not resolve`);
    }
    if (!poolIds.has(level.rewardPoolId)) {
      errors.push(`catalog: level "${level.id}" rewardPoolId "${level.rewardPoolId}" does not resolve`);
    }
  });

  pools.forEach((pool) => {
    pool.characterIds.forEach((id) => {
      if (!characterIds.has(id)) {
        errors.push(`catalog: pool "${pool.id}" characterId "${id}" does not resolve`);
      }
    });
  });

  characters.forEach((character) => {
    if (character.art && character.art.kind === "image" && !character.art.src) {
      errors.push(`catalog: image character "${character.id}" is missing art.src`);
    }
  });

  // The Mix node isn't a level, but its silhouette mascot must resolve.
  if (!characterIds.has(MIX.residentId)) {
    errors.push(`catalog: MIX residentId "${MIX.residentId}" does not resolve`);
  }

  return errors;
}

const validationErrors = validateCatalog();
if (validationErrors.length > 0) {
  throw new Error(`Invalid game content:\n${validationErrors.join("\n")}`);
}

export function levelsInOrder() {
  return [...LEVELS].sort((a, b) => a.order - b.order);
}

export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) || null;
}

export function getNextLevel(level) {
  return LEVELS.find((candidate) => candidate.order === level.order + 1) || null;
}

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) || null;
}

export function getPool(id) {
  return REWARD_POOLS.find((pool) => pool.id === id) || null;
}

// Resolves table levels and the Mix node by id (the Mix is not in LEVELS).
export function resolveLevel(id) {
  return id === MIX.id ? MIX : getLevel(id);
}

export { LEVELS, CHARACTERS, REWARD_POOLS, MIX };
