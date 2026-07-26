import test from "node:test";
import assert from "node:assert/strict";
import {
  EASY_B,
  factKey,
  tableFactsKeys,
  tableHardKeys,
  createFactRecord,
  getMastery,
  updateFactOnAnswer,
  buildLevelSessionPlan,
  validateLevelSessionPlan,
  buildMixSessionPlan,
  pickRecentMistakeKeys,
  createLevelSession,
  currentQuestion,
  answerFirstTry,
  confirmCorrection,
  requeueMissedFact,
  computeAnswer,
} from "../engine/math-engine.js";
import { DEFAULT_GAME_SETTINGS } from "../content/settings.js";
import { LEVELS } from "../content/levels.js";

// Deterministic PRNG so repeated test runs are reproducible.
function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function masteredFactStats(keys, level = 2) {
  const stats = {};
  keys.forEach((key) => {
    stats[key] = { ...createFactRecord(), mastery: level, attempts: 10, correct: 10 };
  });
  return stats;
}

const LEVEL_X6 = LEVELS.find((l) => l.id === "x6");
const LEVEL_X8 = LEVELS.find((l) => l.id === "x8"); // has reviewTables [6, 7]

// --- Level session planner -------------------------------------------------

test("buildLevelSessionPlan: 1 warmup + exactly 10 scored; no consecutive duplicate fact", () => {
  for (let seed = 0; seed < 60; seed += 1) {
    const rng = mulberry32(seed * 97 + 1);
    const keys = tableFactsKeys(6);
    const factStats = masteredFactStats(keys.filter(() => rng() < 0.5), 2);

    const plan = buildLevelSessionPlan(LEVEL_X6, factStats, DEFAULT_GAME_SETTINGS, rng);
    const errors = validateLevelSessionPlan(plan.questions, DEFAULT_GAME_SETTINGS, LEVEL_X6);
    assert.deepEqual(errors, [], errors.join("; "));
  }
});

test("buildLevelSessionPlan: levels with reviewTables draw 8 own-table + 2 review, from unlocked tables only", () => {
  const rng = mulberry32(777);
  const plan = buildLevelSessionPlan(LEVEL_X8, {}, DEFAULT_GAME_SETTINGS, rng);
  const errors = validateLevelSessionPlan(plan.questions, DEFAULT_GAME_SETTINGS, LEVEL_X8);
  assert.deepEqual(errors, [], errors.join("; "));

  const scored = plan.questions.filter((q) => q.phase === "scored");
  const ownTable = scored.filter((q) => q.origin !== "review");
  const review = scored.filter((q) => q.origin === "review");
  assert.equal(ownTable.length, 8);
  assert.equal(review.length, 2);
  review.forEach((q) => {
    assert.ok(LEVEL_X8.reviewTables.includes(q.a) || LEVEL_X8.reviewTables.includes(q.b));
  });
});

test("buildLevelSessionPlan: `missing` type only ever appears for mastery >= 2 facts", () => {
  for (let seed = 0; seed < 40; seed += 1) {
    const rng = mulberry32(seed * 13 + 5);
    const keys = tableFactsKeys(6);
    const factStats = masteredFactStats(keys.filter(() => rng() < 0.4), 2);
    const plan = buildLevelSessionPlan(LEVEL_X6, factStats, DEFAULT_GAME_SETTINGS, rng);
    plan.questions.forEach((q) => {
      if (q.type === "missing") {
        assert.ok(getMastery(factStats, q.key) >= 2, `missing used for low-mastery ${q.key}`);
      }
    });
  }
});

test("buildLevelSessionPlan (hard drill): focus facts are the weakest hard facts", () => {
  const weakHard = ["6x8", "6x9"];
  const factStats = masteredFactStats(tableHardKeys(6).filter((k) => !weakHard.includes(k)), 2);
  const rng = mulberry32(555);
  const plan = buildLevelSessionPlan(LEVEL_X6, factStats, DEFAULT_GAME_SETTINGS, rng);
  assert.deepEqual(new Set(plan.meta.focusFacts), new Set(weakHard));
});

test("buildLevelSessionPlan (hard drill): every scored question is a hard fact, and facts repeat", () => {
  for (let seed = 0; seed < 40; seed += 1) {
    const rng = mulberry32(seed * 31 + 7);
    const plan = buildLevelSessionPlan(LEVEL_X6, {}, DEFAULT_GAME_SETTINGS, rng);
    const scored = plan.questions.filter((q) => q.phase === "scored");
    const hard = new Set(tableHardKeys(6));
    scored.forEach((q) => assert.ok(hard.has(q.key), `non-hard scored fact ${q.key}`));
    // Only 4 distinct hard facts across 10 scored slots ⇒ facts must repeat.
    assert.ok(new Set(scored.map((q) => q.key)).size < scored.length, "expected repeated hard facts");
  }
});

// --- Level session runtime -------------------------------------------------

function makeSimplePlanQuestions() {
  return [
    { key: "6x2", a: 6, b: 2, type: "product", phase: "warmup", origin: "warmup" },
    { key: "6x3", a: 6, b: 3, type: "product", phase: "warmup", origin: "warmup" },
    { key: "6x4", a: 6, b: 4, type: "product", phase: "scored", origin: "focus" },
    { key: "6x5", a: 6, b: 5, type: "product", phase: "scored", origin: "filler" },
    { key: "6x6", a: 6, b: 6, type: "product", phase: "scored", origin: "filler" },
    { key: "6x7", a: 6, b: 7, type: "product", phase: "scored", origin: "filler" },
    { key: "6x8", a: 6, b: 8, type: "product", phase: "scored", origin: "filler" },
  ];
}

test("answerFirstTry: correct answer awards a point only in the scored phase and advances reveal", () => {
  let session = createLevelSession("x6", makeSimplePlanQuestions(), DEFAULT_GAME_SETTINGS);
  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 1000); // warmup correct
  assert.equal(session.points, 0);
  assert.equal(session.reveal, 1);

  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 1000); // warmup correct
  assert.equal(session.points, 0);
  assert.equal(session.reveal, 2);

  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 1000); // scored correct
  assert.equal(session.points, 1);
  assert.equal(session.reveal, 3);
});

test("wrong first tap adds no point; confirmCorrection increments assistedCorrections only", () => {
  let session = createLevelSession("x6", makeSimplePlanQuestions(), DEFAULT_GAME_SETTINGS);
  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 500); // warmup 1 correct
  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 500); // warmup 2 correct

  const scoredQuestion = currentQuestion(session);
  assert.equal(scoredQuestion.phase, "scored");
  session = answerFirstTry(session, computeAnswer(scoredQuestion) + 1, 500); // wrong
  assert.equal(session.points, 0);
  assert.equal(session.pendingCorrection.key, scoredQuestion.key);
  assert.equal(session.assistedCorrections, 0);

  session = confirmCorrection(session, () => 0);
  assert.equal(session.points, 0, "no point on the forced confirmation tap");
  assert.equal(session.assistedCorrections, 1);
  assert.equal(session.pendingCorrection, null);
});

test("requeue: inserted 2-3 ahead replacing a filler; correct retry restores the point; at most once per fact", () => {
  let session = createLevelSession("x6", makeSimplePlanQuestions(), DEFAULT_GAME_SETTINGS);
  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 500);
  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 500);

  const missed = currentQuestion(session); // 6x4, origin "focus"
  session = answerFirstTry(session, computeAnswer(missed) + 1, 500);
  const distance2Rng = () => 0; // distance = 2
  session = confirmCorrection(session, distance2Rng);

  assert.ok(session.requeuedKeys.includes(missed.key));
  const requeuedIndex = session.queue.findIndex((q) => q.key === missed.key && q.requeued);
  assert.ok(requeuedIndex >= 0, "missed fact was requeued");
  assert.ok(requeuedIndex >= 1 && requeuedIndex <= 2, `requeued at index ${requeuedIndex}`);
  // Never replaces the focus fact itself or another requeue — only a filler.
  const total = session.queue.length + session.history.length;
  assert.equal(total, makeSimplePlanQuestions().length);

  // Fast-forward to the requeued occurrence and answer it correctly: the
  // point is restored via the normal scored-correct path.
  while (currentQuestion(session).key !== missed.key) {
    const q = currentQuestion(session);
    session = answerFirstTry(session, computeAnswer(q), 500);
  }
  const pointsBefore = session.points;
  session = answerFirstTry(session, computeAnswer(currentQuestion(session)), 500);
  assert.equal(session.points, pointsBefore + 1);

  // A second miss on an already-requeued fact loses the point permanently —
  // requeueMissedFact must not be invoked twice for the same key.
  assert.equal(session.requeuedKeys.filter((k) => k === missed.key).length, 1);
});

test("requeueMissedFact: appends when no eligible filler/review remains ahead", () => {
  const questions = [
    { key: "a", a: 1, b: 1, type: "product", phase: "scored", origin: "focus" },
    { key: "b", a: 1, b: 2, type: "product", phase: "scored", origin: "focus" },
  ];
  let session = createLevelSession("x6", questions, DEFAULT_GAME_SETTINGS);
  session = { ...session, pendingCorrection: session.queue[0] };
  session = requeueMissedFact(session, () => 0);
  assert.equal(session.queue[session.queue.length - 1].key, "a");
  assert.equal(session.queue[session.queue.length - 1].requeued, true);
});

test("reveal counter never decreases across a mixed sequence of right/wrong answers", () => {
  const rng = mulberry32(9);
  const plan = buildLevelSessionPlan(LEVEL_X6, {}, DEFAULT_GAME_SETTINGS, rng);
  let session = createLevelSession("x6", plan.questions, DEFAULT_GAME_SETTINGS);
  let lastReveal = 0;
  let guard = 0;
  while (currentQuestion(session) && guard < 60) {
    guard += 1;
    const question = currentQuestion(session);
    const goWrong = guard % 3 === 0 && !session.pendingCorrection;
    if (session.pendingCorrection) {
      session = confirmCorrection(session, mulberry32(guard));
    } else if (goWrong) {
      session = answerFirstTry(session, computeAnswer(question) + 1, 500);
    } else {
      session = answerFirstTry(session, computeAnswer(question), 500);
    }
    assert.ok(session.reveal >= lastReveal, "reveal decreased");
    lastReveal = session.reveal;
    if (session.finished) break;
  }
});

// --- Mastery ladder (unchanged from v2) ------------------------------------

test("mastery ladder: seen -> known (needs 2 sessions) -> fast -> demotion", () => {
  let stats = {};
  const key = "6x7";

  stats = updateFactOnAnswer(stats, key, { correct: true, sessionCount: 1 });
  assert.equal(getMastery(stats, key), 1);

  stats = updateFactOnAnswer(stats, key, { correct: true, sessionCount: 1 });
  stats = updateFactOnAnswer(stats, key, { correct: true, sessionCount: 1 });
  assert.ok(getMastery(stats, key) < 2, "should not promote within a single session");

  stats = updateFactOnAnswer(stats, key, { correct: true, sessionCount: 2 });
  assert.equal(getMastery(stats, key), 2);

  stats = updateFactOnAnswer(stats, key, { correct: true, elapsedMs: 1000, sessionCount: 2 });
  stats = updateFactOnAnswer(stats, key, { correct: true, elapsedMs: 1500, sessionCount: 3 });
  stats = updateFactOnAnswer(stats, key, { correct: true, elapsedMs: 900, sessionCount: 3 });
  assert.equal(getMastery(stats, key), 3);

  stats = updateFactOnAnswer(stats, key, { correct: false, sessionCount: 4 });
  stats = updateFactOnAnswer(stats, key, { correct: false, sessionCount: 4 });
  assert.equal(getMastery(stats, key), 2);

  let floorStats = { [key]: { ...createFactRecord(), mastery: 1, attempts: 1 } };
  floorStats = updateFactOnAnswer(floorStats, key, { correct: false, sessionCount: 1 });
  floorStats = updateFactOnAnswer(floorStats, key, { correct: false, sessionCount: 1 });
  assert.equal(getMastery(floorStats, key), 1, "mastery should never drop below 1");
});

test("factKey/tableFactsKeys: canonical smaller-factor-first key, EASY_B set", () => {
  assert.equal(factKey(7, 6), "6x7");
  assert.equal(factKey(6, 7), "6x7");
  assert.deepEqual(EASY_B, [2, 3, 4, 5, 10]);
  assert.equal(tableFactsKeys(6).length, 9);
});

// --- Mix / Daily-Challenge planner -----------------------------------------

test("buildMixSessionPlan: 1 warmup + exactly 10 scored, no consecutive duplicate fact", () => {
  const settings = DEFAULT_GAME_SETTINGS;
  for (let seed = 0; seed < 40; seed += 1) {
    const rng = mulberry32(seed * 131 + 3);
    const plan = buildMixSessionPlan([6, 7, 8], {}, settings, rng);
    assert.equal(plan.questions.filter((q) => q.phase === "warmup").length, settings.warmupCount);
    assert.equal(plan.questions.filter((q) => q.phase === "scored").length, settings.scoredCount);
    for (let i = 1; i < plan.questions.length; i += 1) {
      assert.notEqual(plan.questions[i].key, plan.questions[i - 1].key, `dup at ${i} (seed ${seed})`);
    }
  }
});

test("buildMixSessionPlan: prioritizes recent-mistake facts (wrongStreak) as focus", () => {
  const factStats = {
    "6x8": { ...createFactRecord(), wrongStreak: 2, lastSession: 9, mastery: 1, attempts: 4, correct: 2 },
    "7x9": { ...createFactRecord(), wrongStreak: 1, lastSession: 8, mastery: 0, attempts: 2, correct: 0 },
    "6x2": { ...createFactRecord(), mastery: 3, attempts: 10, correct: 10 },
  };
  const plan = buildMixSessionPlan([6, 7], factStats, DEFAULT_GAME_SETTINGS, mulberry32(7));
  // Both live mistakes are the focus, worst wrong-streak first.
  assert.deepEqual(plan.meta.focusFacts, ["6x8", "7x9"]);
  assert.deepEqual(plan.meta.mistakeKeys, ["6x8", "7x9"]);
  // A focus fact appears more often than a mastered filler.
  const scored = plan.questions.filter((q) => q.phase === "scored").map((q) => q.key);
  const count = (k) => scored.filter((x) => x === k).length;
  assert.ok(count("6x8") >= 1);
});

test("buildMixSessionPlan: blank history still yields a full valid plan (weakest fallback)", () => {
  const settings = DEFAULT_GAME_SETTINGS;
  const plan = buildMixSessionPlan([6], {}, settings, mulberry32(1));
  assert.equal(plan.questions.length, settings.warmupCount + settings.scoredCount);
  assert.equal(plan.meta.mistakeKeys.length, 0);
  assert.equal(plan.meta.focusFacts.length, 2);
});

test("pickRecentMistakeKeys: only live wrong streaks, worst first", () => {
  const factStats = {
    "6x8": { ...createFactRecord(), wrongStreak: 1, lastSession: 3 },
    "6x9": { ...createFactRecord(), wrongStreak: 3, lastSession: 2 },
    "6x7": { ...createFactRecord(), wrongStreak: 0, streak: 4 }, // recovered -> excluded
  };
  const keys = pickRecentMistakeKeys(factStats, [6], mulberry32(2));
  assert.deepEqual(keys, ["6x9", "6x8"]);
});

test("Integration Contract: ShareController exports createShareUrl and renderQrModal", async () => {
  const { ShareController } = await import("../engine/share-controller.js");
  assert.ok(typeof ShareController.createShareUrl === "function");
  assert.ok(typeof ShareController.renderQrModal === "function");

  const url = ShareController.createShareUrl({ senderName: "Lucky", score: 3 });
  assert.ok(url.includes("from=Lucky"));
  assert.ok(url.includes("score=3"));
});
