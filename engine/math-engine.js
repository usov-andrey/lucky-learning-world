// Pure game logic for Lucky Monster Math v3. No DOM access — importable from
// Node for tests (test/*.test.mjs) and from the browser via game-controller.js.
//
// Scope per PROPOSAL-v3-final.md §7: math facts, mastery, and the per-level
// session plan/runtime. Level/character/pool content lives in content/*.js;
// stars/unlocks/points live in progression.js; reward selection lives in
// reward-engine.js. This module never reads levels/characters/pools itself —
// callers pass in a `level` object.

export const B_MIN = 2;
export const B_MAX = 10;
export const EASY_B = [2, 3, 4, 5, 10];
// The facts Lucky actually struggles with: a table times a "big" operand
// (6×6, 6×7, 6×8, 6×9). When settings.hardDrill is on, a level's scored
// questions are drawn almost entirely from these — repeats allowed — so she
// drills the ones that don't stick instead of coasting on easy ones.
export const HARD_B = [6, 7, 8, 9];

export function factKey(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return `${lo}x${hi}`;
}

export function factProduct(key) {
  const [a, b] = key.split("x").map(Number);
  return a * b;
}

export function tableFactsKeys(table) {
  const keys = [];
  for (let b = B_MIN; b <= B_MAX; b += 1) {
    keys.push(factKey(table, b));
  }
  return keys;
}

// The "hard" facts of a table: the ones with a big second operand (6..9).
export function tableHardKeys(table) {
  return HARD_B.map((b) => factKey(table, b));
}

function shuffleWithRng(list, rng) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// --- Fact records / mastery ---------------------------------------------

export function createFactRecord() {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    wrongStreak: 0,
    lastSession: 0,
    mastery: 0,
    streakSessionIds: [],
    fastStreak: 0,
  };
}

export function getFactRecord(factStats, key) {
  return factStats[key] ? { ...createFactRecord(), ...factStats[key] } : createFactRecord();
}

export function getMastery(factStats, key) {
  return getFactRecord(factStats, key).mastery || 0;
}

export function getAttempts(factStats, key) {
  return getFactRecord(factStats, key).attempts || 0;
}

function computeMasteryLevel(prev, next) {
  let mastery = prev.mastery || 0;

  if (next.wrongStreak >= 2) {
    mastery = Math.max(1, mastery - 1);
  }
  if (mastery < 1 && next.attempts >= 1) {
    mastery = 1;
  }
  if (mastery < 2 && next.streak >= 3 && (next.streakSessionIds || []).length >= 2) {
    mastery = 2;
  }
  // Fast-answer streak only counts once a fact is already "known" (level 2).
  if (mastery === 2 && (next.fastStreak || 0) >= 3) {
    mastery = 3;
  }
  return mastery;
}

export function updateFactOnAnswer(factStats, key, { correct, elapsedMs, sessionCount }) {
  const prev = getFactRecord(factStats, key);
  const next = { ...prev };
  next.attempts = prev.attempts + 1;

  if (correct) {
    next.correct = prev.correct + 1;
    next.streak = prev.streak + 1;
    next.wrongStreak = 0;
    const sessions = new Set(prev.streakSessionIds || []);
    sessions.add(sessionCount);
    next.streakSessionIds = [...sessions];
    next.lastSession = sessionCount;
    if (prev.mastery >= 2 && typeof elapsedMs === "number" && elapsedMs < 5000) {
      next.fastStreak = (prev.fastStreak || 0) + 1;
    } else {
      next.fastStreak = 0;
    }
  } else {
    next.streak = 0;
    next.streakSessionIds = [];
    next.wrongStreak = (prev.wrongStreak || 0) + 1;
    next.fastStreak = 0;
    next.lastSession = sessionCount;
  }

  next.mastery = computeMasteryLevel(prev, next);

  return { ...factStats, [key]: next };
}

// --- Question helpers -----------------------------------------------------

export function computeAnswer(question) {
  return question.type === "missing" ? question.b : question.a * question.b;
}

export function buildChoices(question, rng = Math.random) {
  const correct = computeAnswer(question);
  const pool = new Set([correct]);
  const deltas = [1, 2, 3, -1, -2, -3];
  let guard = 0;
  while (pool.size < 3 && guard < 50) {
    guard += 1;
    const delta = deltas[Math.floor(rng() * deltas.length)];
    if (question.type === "missing") {
      pool.add(clamp(question.b + delta, B_MIN, B_MAX));
    } else {
      pool.add(question.a * clamp(question.b + delta, B_MIN, B_MAX));
    }
  }
  const values = shuffleWithRng([...pool], rng);
  return values.map((value) => ({ value, correct: value === correct }));
}

function factDisplay(key, contextTables, rng) {
  const [lo, hi] = key.split("x").map(Number);
  const options = [];
  if (contextTables.includes(lo)) {
    options.push({ a: lo, b: hi });
  }
  if (hi !== lo && contextTables.includes(hi)) {
    options.push({ a: hi, b: lo });
  }
  if (options.length === 0) {
    options.push({ a: lo, b: hi });
  }
  return options[Math.floor(rng() * options.length)];
}

function makeQuestion(key, phase, origin, factStats, tables, rng) {
  const { a, b } = factDisplay(key, tables, rng);
  const mastery = getMastery(factStats, key);
  const canBeMissing = mastery >= 2;
  const type = canBeMissing && rng() < 0.35 ? "missing" : "product";
  return { key, a, b, type, phase, origin };
}

// --- Level session planner -------------------------------------------------

function pickWarmupFacts(table, count, rng) {
  const easyKeys = shuffleWithRng(
    EASY_B.map((b) => factKey(table, b)),
    rng,
  );
  const chosen = easyKeys.slice(0, count);
  while (chosen.length < count) {
    chosen.push(easyKeys[0] || factKey(table, EASY_B[0]));
  }
  return chosen;
}

function pickLevelFocusFacts(coreKeys, factStats, rng) {
  const weakCount = coreKeys.filter((key) => getMastery(factStats, key) < 2).length;
  const count = clamp(weakCount || 2, 2, 4);
  const sorted = shuffleWithRng(coreKeys, rng).sort((keyA, keyB) => {
    const masteryDiff = getMastery(factStats, keyA) - getMastery(factStats, keyB);
    if (masteryDiff !== 0) {
      return masteryDiff;
    }
    return getAttempts(factStats, keyA) - getAttempts(factStats, keyB);
  });
  return sorted.slice(0, Math.min(count, sorted.length));
}

function sortByWeakestFirst(keys, factStats, rng) {
  return shuffleWithRng(keys, rng).sort((keyA, keyB) => {
    const masteryDiff = getMastery(factStats, keyA) - getMastery(factStats, keyB);
    if (masteryDiff !== 0) {
      return masteryDiff;
    }
    return getAttempts(factStats, keyA) - getAttempts(factStats, keyB);
  });
}

// Hard-drill focus: the 1-2 weakest hard facts of the table (the ones Lucky is
// currently getting wrong). They are guaranteed to appear and are the facts
// the requeue-on-error flow protects.
function pickHardFocusFacts(hardKeys, factStats, rng) {
  return sortByWeakestFirst(hardKeys, factStats, rng).slice(0, 2);
}

// Hard-drill core bag: fill every scored slot from the table's hard facts only
// (6×6…6×9), cycling weakest-first so the shakiest facts repeat the most.
// Repeats within a session are intentional (Lucky asked to see the same hard
// ones again); the no-adjacent-duplicate rule still keeps them off back-to-back.
function buildHardCoreBag(hardKeys, count, factStats, rng) {
  const ordered = sortByWeakestFirst(hardKeys, factStats, rng);
  const bag = [];
  let index = 0;
  while (bag.length < count) {
    bag.push(ordered[index % ordered.length]);
    index += 1;
  }
  return bag.slice(0, count);
}

// Hard-drill review: reinforce the hard facts of already-unlocked lower tables
// (weakest first), never the easy ones.
function pickHardReviewKeys(reviewTables, factStats, count, rng) {
  if (count <= 0 || reviewTables.length === 0) {
    return [];
  }
  const pool = [...new Set(reviewTables.flatMap((table) => tableHardKeys(table)))];
  const sorted = sortByWeakestFirst(pool, factStats, rng);
  const result = [];
  let index = 0;
  while (result.length < count && sorted.length > 0) {
    result.push(sorted[index % sorted.length]);
    index += 1;
  }
  return result;
}

// Builds the core-table share of the scored question keys: every focus fact
// appears twice (guaranteed practice), the remainder is filled with other
// core facts (known ones preferred, so the session still feels 90/10 easy).
function buildCoreScoredKeys(coreKeys, focusFacts, count, factStats, rng) {
  const bag = [];
  focusFacts.forEach((key) => {
    bag.push(key, key);
  });

  const fillerPool = coreKeys.filter((key) => !focusFacts.includes(key));
  const known = shuffleWithRng(
    fillerPool.filter((key) => getMastery(factStats, key) >= 2),
    rng,
  );
  const unknown = shuffleWithRng(
    fillerPool.filter((key) => getMastery(factStats, key) < 2),
    rng,
  );
  const orderedFillers = [...known, ...unknown];

  let index = 0;
  while (bag.length < count) {
    if (orderedFillers.length === 0) {
      bag.push(focusFacts[index % focusFacts.length] || coreKeys[0]);
    } else {
      bag.push(orderedFillers[index % orderedFillers.length]);
    }
    index += 1;
  }
  return bag.slice(0, count);
}

// Prevents "keep adding the same number" within a session: review questions
// are drawn from already-unlocked (lower) tables, weakest mastery first.
function pickReviewKeys(reviewTables, factStats, count, rng) {
  if (count <= 0 || reviewTables.length === 0) {
    return [];
  }
  const pool = [...new Set(reviewTables.flatMap((table) => tableFactsKeys(table)))];
  const sorted = shuffleWithRng(pool, rng).sort(
    (keyA, keyB) => getMastery(factStats, keyA) - getMastery(factStats, keyB),
  );
  const result = [];
  let index = 0;
  while (result.length < count && sorted.length > 0) {
    result.push(sorted[index % sorted.length]);
    index += 1;
  }
  return result;
}

function ensureNoAdjacentDuplicates(keys, rng) {
  let arr = shuffleWithRng(keys, rng);
  for (let guard = 0; guard < 200; guard += 1) {
    let ok = true;
    for (let i = 1; i < arr.length; i += 1) {
      if (arr[i] === arr[i - 1]) {
        ok = false;
        let swapped = false;
        for (let j = i + 1; j < arr.length; j += 1) {
          if (arr[j] !== arr[i] && arr[j] !== arr[i - 1]) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            swapped = true;
            break;
          }
        }
        if (!swapped) {
          arr = shuffleWithRng(arr, rng);
          break;
        }
      }
    }
    if (ok) {
      return arr;
    }
  }
  return arr;
}

function fixWarmupScoredBoundary(warmupFacts, scoredKeys) {
  if (warmupFacts.length === 0 || scoredKeys.length < 2) {
    return scoredKeys;
  }
  const lastWarmup = warmupFacts[warmupFacts.length - 1];
  if (scoredKeys[0] !== lastWarmup) {
    return scoredKeys;
  }
  const arr = [...scoredKeys];
  const swapIndex = arr.findIndex((key, index) => index > 0 && key !== lastWarmup);
  if (swapIndex > 0) {
    [arr[0], arr[swapIndex]] = [arr[swapIndex], arr[0]];
  }
  return arr;
}

// buildLevelSessionPlan(level, factStats, settings, rng) -> { questions, meta }
//
// 2 unscored warmup questions (easy operands, guaranteed success) + exactly
// `settings.scoredCount` scored questions: for levels with reviewTables, 2 of
// those are review questions from already-unlocked tables, the rest are the
// level's own core facts (PROPOSAL-v3-final.md §2).
export function buildLevelSessionPlan(level, factStats, settings, rng = Math.random) {
  const hardDrill = settings.hardDrill !== false;
  const coreKeys = tableFactsKeys(level.table);
  const reviewCount = level.reviewTables.length > 0 ? 2 : 0;
  const coreScoredCount = settings.scoredCount - reviewCount;

  const warmupFacts = pickWarmupFacts(level.table, settings.warmupCount, rng);

  let focusFacts;
  let coreBag;
  let reviewKeys;
  if (hardDrill) {
    const hardKeys = tableHardKeys(level.table);
    focusFacts = pickHardFocusFacts(hardKeys, factStats, rng);
    coreBag = buildHardCoreBag(hardKeys, coreScoredCount, factStats, rng);
    reviewKeys = pickHardReviewKeys(level.reviewTables, factStats, reviewCount, rng);
  } else {
    focusFacts = pickLevelFocusFacts(coreKeys, factStats, rng);
    coreBag = buildCoreScoredKeys(coreKeys, focusFacts, coreScoredCount, factStats, rng);
    reviewKeys = pickReviewKeys(level.reviewTables, factStats, reviewCount, rng);
  }

  const scoredKeysRaw = [...coreBag, ...reviewKeys];
  const scoredKeys = fixWarmupScoredBoundary(warmupFacts, ensureNoAdjacentDuplicates(scoredKeysRaw, rng));

  const allTables = [level.table, ...level.reviewTables];
  const originFor = (key) => {
    if (focusFacts.includes(key)) return "focus";
    if (reviewKeys.includes(key)) return "review";
    return "filler";
  };

  const warmupQs = warmupFacts.map((key) => makeQuestion(key, "warmup", "warmup", factStats, allTables, rng));
  const scoredQs = scoredKeys.map((key) => makeQuestion(key, "scored", originFor(key), factStats, allTables, rng));

  return {
    questions: [...warmupQs, ...scoredQs],
    meta: { levelId: level.id, focusFacts, reviewKeys },
  };
}

// --- Mix / Daily-Challenge planner ----------------------------------------

// Fact keys across `tables` that Lucky is *currently* getting wrong — a live
// wrong streak means her last answer on that fact was wrong. Ordered most-broken
// and most-recent first, then weakest mastery.
export function pickRecentMistakeKeys(factStats, tables, rng = Math.random) {
  const pool = [...new Set(tables.flatMap((table) => tableFactsKeys(table)))];
  const mistakes = pool.filter((key) => getFactRecord(factStats, key).wrongStreak >= 1);
  return shuffleWithRng(mistakes, rng).sort((keyA, keyB) => {
    const a = getFactRecord(factStats, keyA);
    const b = getFactRecord(factStats, keyB);
    if (b.wrongStreak !== a.wrongStreak) return b.wrongStreak - a.wrongStreak;
    if ((b.lastSession || 0) !== (a.lastSession || 0)) return (b.lastSession || 0) - (a.lastSession || 0);
    return (a.mastery || 0) - (b.mastery || 0);
  });
}

// buildMixSessionPlan(tables, factStats, settings, rng) -> { questions, meta }
//
// The Mix / Daily-Challenge node drills the facts Lucky recently got wrong across
// her unlocked `tables`, falling back to her weakest facts so the plan is always
// full even with a clean or blank history. Same shape as buildLevelSessionPlan:
// `settings.warmupCount` warmups + `settings.scoredCount` scored questions.
export function buildMixSessionPlan(tables, factStats, settings, rng = Math.random) {
  const contextTables = tables.length > 0 ? tables : [B_MAX];
  const scoredCount = settings.scoredCount;

  const warmupTable = contextTables[Math.floor(rng() * contextTables.length)];
  const warmupFacts = pickWarmupFacts(warmupTable, settings.warmupCount, rng);

  const pool = [...new Set(contextTables.flatMap((table) => tableFactsKeys(table)))];
  const mistakes = pickRecentMistakeKeys(factStats, contextTables, rng);
  const weakFill = sortByWeakestFirst(
    pool.filter((key) => !mistakes.includes(key)),
    factStats,
    rng,
  );
  const ordered = [...mistakes, ...weakFill];
  const focusFacts = ordered.slice(0, 2);

  // Cycle weakest/mistakes-first so the shakiest facts repeat the most (same
  // idea as the hard-drill core bag). Order within the session is then shuffled.
  const bag = [];
  let index = 0;
  while (bag.length < scoredCount && ordered.length > 0) {
    bag.push(ordered[index % ordered.length]);
    index += 1;
  }

  const scoredKeys = fixWarmupScoredBoundary(warmupFacts, ensureNoAdjacentDuplicates(bag, rng));
  const originFor = (key) => (focusFacts.includes(key) ? "focus" : "filler");

  const warmupQs = warmupFacts.map((key) => makeQuestion(key, "warmup", "warmup", factStats, contextTables, rng));
  const scoredQs = scoredKeys.map((key) => makeQuestion(key, "scored", originFor(key), factStats, contextTables, rng));

  return {
    questions: [...warmupQs, ...scoredQs],
    meta: { levelId: "mix", focusFacts, mistakeKeys: mistakes },
  };
}

export function validateLevelSessionPlan(questions, settings, level) {
  const errors = [];
  const expectedTotal = settings.warmupCount + settings.scoredCount;
  if (questions.length !== expectedTotal) {
    errors.push(`expected ${expectedTotal} questions, got ${questions.length}`);
  }
  const warmup = questions.filter((q) => q.phase === "warmup");
  const scored = questions.filter((q) => q.phase === "scored");
  if (warmup.length !== settings.warmupCount) {
    errors.push(`warmup count ${warmup.length}, expected ${settings.warmupCount}`);
  }
  if (scored.length !== settings.scoredCount) {
    errors.push(`scored count ${scored.length}, expected ${settings.scoredCount}`);
  }
  const reviewExpected = level.reviewTables.length > 0 ? 2 : 0;
  const review = scored.filter((q) => q.origin === "review");
  if (review.length !== reviewExpected) {
    errors.push(`review count ${review.length}, expected ${reviewExpected}`);
  }
  for (let i = 1; i < questions.length; i += 1) {
    if (questions[i].key === questions[i - 1].key) {
      errors.push(`repeated fact at index ${i}`);
    }
  }
  return errors;
}

// --- Level session runtime (queue, reveal, requeue-on-error) --------------

export function createLevelSession(levelId, questions, settings) {
  return {
    levelId,
    queue: questions.slice(),
    scoredCount: settings.scoredCount,
    points: 0,
    reveal: 0,
    requeuedKeys: [],
    assistedCorrections: 0,
    pendingCorrection: null,
    history: [],
    finished: false,
  };
}

export function currentQuestion(session) {
  if (session.pendingCorrection) {
    return session.pendingCorrection;
  }
  return session.queue[0] || null;
}

// answerFirstTry(session, answerValue, elapsedMs) — first tap on a question.
// Correct: awards a point iff scored, advances the reveal, dequeues.
// Wrong: no point, no dequeue yet — the question becomes `pendingCorrection`
// so the UI can highlight the right answer; the child must tap it via
// confirmCorrection to proceed (calm, guaranteed-success continuation).
export function answerFirstTry(session, answerValue, elapsedMs) {
  if (session.pendingCorrection) {
    throw new Error("answerFirstTry called while a correction is pending");
  }
  const question = session.queue[0];
  const correct = answerValue === computeAnswer(question);

  if (correct) {
    const queue = session.queue.slice(1);
    const points = session.points + (question.phase === "scored" ? 1 : 0);
    const reveal = Math.min(8, session.reveal + 1);
    const history = [...session.history, { key: question.key, phase: question.phase, correct: true, elapsedMs }];
    return { ...session, queue, points, reveal, history, finished: queue.length === 0 };
  }

  return { ...session, pendingCorrection: question };
}

// Requeues the fact under correction 2-3 positions ahead, replacing a
// not-yet-shown filler/review question (never a focus fact or another
// requeue); appended if none qualifies. At most once per fact per attempt.
export function requeueMissedFact(session, rng = Math.random) {
  const question = session.pendingCorrection;
  const distance = 2 + Math.floor(rng() * 2); // 2 or 3
  const remainder = session.queue.slice(1);
  const requeuedQuestion = { ...question, requeued: true, origin: "requeue" };

  let targetIndex = -1;
  for (let i = distance - 1; i < remainder.length; i += 1) {
    const candidate = remainder[i];
    if ((candidate.origin === "filler" || candidate.origin === "review") && !candidate.requeued) {
      targetIndex = i;
      break;
    }
  }

  const nextQueue =
    targetIndex === -1
      ? [...remainder, requeuedQuestion]
      : [...remainder.slice(0, targetIndex), requeuedQuestion, ...remainder.slice(targetIndex + 1)];

  return {
    ...session,
    queue: nextQueue,
    requeuedKeys: [...session.requeuedKeys, question.key],
  };
}

// The forced confirmation tap after a wrong first try: always succeeds (the
// child taps the highlighted correct answer), teaches the fact, and — for a
// scored question not already requeued this attempt — reinserts it so a
// correct retry can restore the point.
export function confirmCorrection(session, rng = Math.random) {
  const question = session.pendingCorrection;
  if (!question) {
    throw new Error("confirmCorrection called with no pending correction");
  }

  const eligibleForRequeue =
    question.phase === "scored" && !session.requeuedKeys.includes(question.key);
  const working = eligibleForRequeue
    ? requeueMissedFact(session, rng)
    : { ...session, queue: session.queue.slice(1) };

  const history = [...session.history, { key: question.key, phase: question.phase, correct: false }];

  return {
    ...working,
    history,
    assistedCorrections: session.assistedCorrections + 1,
    pendingCorrection: null,
    finished: working.queue.length === 0,
  };
}
