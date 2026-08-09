// @task TASK-019
// Permanent Playwright E2E regression suite: drives one continuous real-Chromium
// session through the full main scenario, in order, across every game mode —
// exactly as Lucky actually plays. Built after a real production incident (Math
// Realm ×7, question ~8, unexpected drop to the dashboard) that no `jsdom`-based
// test could have caught, since `jsdom` never lays out, paints, or runs real
// event/timer scheduling the way a browser does (see TASK-018).
//
// Every interaction below is a real click or typed input into rendered DOM. The
// only reads of `window.appController` internals are read-only getters used as an
// oracle for the target spelling word in Test/Game mode (AC-1) — that word is
// deliberately never shown in the DOM, since it's what the child is being quizzed
// on. The Math Realm's correct answer is instead derived purely from the rendered
// `#math-question-text`, with no internals involved at all.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

// Progression is seeded with every level unlocked so the run can go straight to
// the ×7 table — the exact level Lucky was playing — instead of grinding ×6
// first. This mirrors a real returning player's save state; unlocking is fully
// covered separately by the progression unit tests.
const SEEDED_PROGRESSION = {
  schemaVersion: 1,
  points: 0,
  unlockedLevelIds: ["x6", "x7", "x8", "x9", "x10"],
  levels: {},
  appliedOutcomeIds: [],
};

function parseMathCorrectAnswer(questionText) {
  let m = questionText.match(/^(\d+)\s*×\s*(\d+)\s*=\s*\?$/);
  if (m) {
    return Number(m[1]) * Number(m[2]);
  }
  m = questionText.match(/^(\d+)\s*×\s*\?\s*=\s*(\d+)$/);
  if (m) {
    return Number(m[2]) / Number(m[1]);
  }
  throw new Error(`Unrecognized math question format: "${questionText}"`);
}

test(
  "TASK-019 AC-1..AC-6: full main scenario across every game mode, in order, in a real browser",
  { timeout: 120_000 },
  async () => {
    const server = await startStaticServer(rootDir);
    // --mute-audio: this suite triggers real TTS/audio playback (Great job!,
    // spoken corrections, word pronunciation) — mute it so running the suite
    // doesn't play sound out loud on the machine running it.
    const browser = await chromium.launch({ args: ["--mute-audio"] });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    try {
      const page = await browser.newPage();

      // AC-2: any uncaught exception or console.error fails the suite — except
      // noise caused by CORS-blocked calls to the real production telemetry
      // endpoint, an artifact of serving the app from a local static server
      // instead of its real origin (ClientTelemetry already swallows the
      // failure in its own try/catch, so it never reaches app logic). The
      // browser emits a *generic* "Failed to load resource" console.error for
      // every failed request with no URL in the text, so text-matching can't
      // tell a blocked telemetry ping apart from a real missing asset —
      // failed requests are instead tracked below by URL via
      // "requestfailed"/"response", which is the actual authority on what
      // failed and why.
      page.on("requestfailed", (request) => {
        failedRequests.push({ url: request.url(), reason: request.failure()?.errorText || "unknown" });
      });
      page.on("response", (response) => {
        if (response.status() >= 400) {
          failedRequests.push({ url: response.url(), reason: `HTTP ${response.status()}` });
        }
      });
      const isKnownTelemetryNoise = (text) => text.includes("lucky-games-reporter") || text.startsWith("Failed to load resource");
      page.on("console", (msg) => {
        if (msg.type() === "error" && !isKnownTelemetryNoise(msg.text())) consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });
      // finishMathSession()/finishSpellingSession() alert() on the no-reward path.
      page.on("dialog", (dialog) => dialog.accept());

      await page.addInitScript((progression) => {
        localStorage.setItem("lmm3s:progression", JSON.stringify(progression));
      }, SEEDED_PROGRESSION);

      // `--mute-audio` only silences Chromium's own audio pipeline (<audio>
      // elements); on Windows, window.speechSynthesis routes through the native
      // SAPI/OneCore TTS engine instead and plays out loud regardless of that
      // flag. Neutralize both playback paths at the JS level so this suite never
      // makes sound no matter which OS runs it.
      await page.addInitScript(() => {
        if (window.speechSynthesis) {
          window.speechSynthesis.speak = () => {};
          window.speechSynthesis.cancel = () => {};
        }
        HTMLMediaElement.prototype.play = () => Promise.resolve();
      });

      await page.goto(server.url, { waitUntil: "load" });

      // --- Onboarding -------------------------------------------------------
      await page.locator("#onboarding-modal.active").waitFor({ state: "visible" });
      await page.locator("#onboarding-name-input").fill("Lucky");
      await page.locator('.starter-pet-btn[data-starter="embercub"]').click();
      await page.locator("#btn-start-onboarding").click();
      await page.locator("#onboarding-modal").waitFor({ state: "hidden" });
      console.log("[e2e] onboarding done");

      // --- Math Realm: ×7 table, full session, question 8 included ----------
      // AC-1
      await page.locator("#btn-enter-math").click();
      await page.locator('[data-math-level="x7"]').click();

      const progressSeen = [];
      let usedWrongAnswer = false;
      for (;;) {
        const activeScreen = await page.evaluate(() => document.querySelector(".view-screen.active")?.id);
        assert.equal(activeScreen, "math-view", `AC-3: unexpected screen mid math session: ${activeScreen}`);

        const progressText = (await page.locator("#math-question-progress").textContent()).trim();
        const match = progressText.match(/^Question (\d+) of (\d+)$/);
        assert.ok(match, `unparseable math progress text: "${progressText}"`);
        const curr = Number(match[1]);
        const total = Number(match[2]);

        const buttons = page.locator("#math-answers-grid .answer-btn");
        const buttonCount = await buttons.count();
        // Note: renderMathQuestion() calls finishMathSession() and returns
        // without ever clearing #math-answers-grid, so a stale button set from
        // the last question stays in the DOM after the session ends — count
        // alone can't signal completion. The `curr === total` break below is
        // the real exit condition; this only guards a truly empty first render.
        if (buttonCount === 0) break;

        progressSeen.push(curr);

        const questionText = (await page.locator("#math-question-text").textContent()).trim();
        const correctAnswer = parseMathCorrectAnswer(questionText);

        const values = [];
        for (let i = 0; i < buttonCount; i += 1) {
          values.push(Number(await buttons.nth(i).getAttribute("data-math-choice")));
        }

        // Deliberately miss exactly one scored question (question 4) to exercise
        // the correction/requeue path without shrinking the session length.
        const answerWrong = !usedWrongAnswer && curr === 4;
        const targetValue = answerWrong ? values.find((v) => v !== correctAnswer) : correctAnswer;
        await buttons.nth(values.indexOf(targetValue)).click();

        if (answerWrong) {
          usedWrongAnswer = true;
          // AC-4: correction feedback must never show "undefined".
          const feedback = (await page.locator("#math-feedback-text").textContent()).trim();
          assert.ok(!feedback.includes("undefined"), `math correction text showed "undefined": "${feedback}"`);
          assert.ok(/= \d+$/.test(feedback), `math correction text missing a numeric answer: "${feedback}"`);
          await page.waitForTimeout(1700); // 1400ms confirmCorrection timeout + margin
        } else {
          await page.waitForTimeout(1000); // 800ms correct-answer advance timeout + margin
        }

        if (curr === total) break; // just answered the last question — stop here
      }
      console.log(`[e2e] math session done: ${JSON.stringify(progressSeen)}`);

      // AC-3: strict, unbroken progress from 1 through 8 (the reported crash
      // point) to the full session length, with the session never resetting.
      assert.ok(progressSeen.length >= 8, `math session ended too early: saw ${JSON.stringify(progressSeen)}`);
      assert.deepEqual(
        progressSeen,
        Array.from({ length: progressSeen.length }, (_, i) => i + 1),
        `math question progress was not strictly sequential: ${JSON.stringify(progressSeen)}`,
      );
      assert.ok(progressSeen.includes(8), "math session never reached question 8");

      await page.waitForTimeout(500);
      const mathVictoryActive = await page.evaluate(() =>
        document.getElementById("victory-modal")?.classList.contains("active"),
      );
      if (mathVictoryActive) {
        await page.locator("#btn-victory-continue").click();
      }
      await page.waitForTimeout(300);
      const screenAfterMath = await page.evaluate(() => document.querySelector(".view-screen.active")?.id);
      assert.equal(screenAfterMath, "dashboard-view", "did not return to the dashboard after finishing math");
      console.log("[e2e] math realm complete, back on dashboard");

      // --- Word Realm: Learn mode, all words forward and back ----------------
      await page.locator("#btn-enter-word").click();
      const totalWords = await page.evaluate(() => window.appController.spellingEngine.deck.words.length);
      assert.ok(totalWords > 1, "expected a spelling lesson with more than one word");

      // bindTouchClick debounces repeat taps on the same button within 350ms
      // (anti-double-tap for touch devices) — space these out past that.
      for (let i = 1; i < totalWords; i += 1) {
        await page.locator("#btn-learn-next").click();
        await page.waitForTimeout(400);
      }
      let learnText = (await page.locator("#learn-progress-text").textContent()).trim();
      assert.equal(learnText, `Word ${totalWords} of ${totalWords}`);

      for (let i = 1; i < totalWords; i += 1) {
        await page.locator("#btn-learn-prev").click();
        await page.waitForTimeout(400);
      }
      learnText = (await page.locator("#learn-progress-text").textContent()).trim();
      assert.equal(learnText, `Word 1 of ${totalWords}`);
      console.log("[e2e] learn mode navigation done");

      // --- Word Realm: Test mode, digital (wrong then correct) + paper -------
      await page.locator('[data-spelling-mode="test"]').click();

      await page.locator("#digital-test-input").fill("zzznotarealword");
      await page.locator("#btn-digital-submit").click();
      await page.waitForTimeout(200);
      let digitalFeedback = (await page.locator("#digital-feedback-text").textContent()).trim();
      assert.ok(digitalFeedback.includes("Not quite"), `expected wrong-answer feedback, got: "${digitalFeedback}"`);
      await page.waitForTimeout(1400);

      for (let i = 0; i < 2; i += 1) {
        const targetWord = await page.evaluate(
          () => window.appController.spellingEngine.getCurrentTestQuestion().targetWord,
        );
        await page.locator("#digital-test-input").fill(targetWord);
        await page.locator("#btn-digital-submit").click();
        await page.waitForTimeout(200);
        digitalFeedback = (await page.locator("#digital-feedback-text").textContent()).trim();
        assert.equal(digitalFeedback, "Correct! ★");
        await page.waitForTimeout(900);
      }

      await page.locator("#btn-submode-paper").click();
      await page.locator("#btn-paper-reveal").click();
      const revealedWord = (await page.locator("#paper-revealed-word").textContent()).trim();
      assert.ok(revealedWord.length > 0, "paper mode did not reveal a word");
      await page.locator("#btn-paper-correct").click();
      console.log("[e2e] test mode (digital + paper) done");

      // --- Word Realm: Game (Tiles) mode, played to completion ---------------
      await page.locator('[data-spelling-mode="game"]').click();

      let usedWrongTiles = false;
      let tilesGuard = 0;
      for (;;) {
        tilesGuard += 1;
        assert.ok(tilesGuard < totalWords * 3, "tiles mode loop did not terminate");
        if (tilesGuard % 5 === 0) console.log(`[e2e] tiles mode: iteration ${tilesGuard}`);

        const gameQuestion = await page.evaluate(() => {
          const q = window.appController.spellingEngine.getCurrentGameQuestion();
          return q ? { targetWord: q.targetWord } : null;
        });
        if (!gameQuestion) break;

        const activeScreen = await page.evaluate(() => document.querySelector(".view-screen.active")?.id);
        assert.equal(activeScreen, "word-view", `unexpected screen mid tiles session: ${activeScreen}`);

        if (!usedWrongTiles) {
          usedWrongTiles = true;
          await page.locator("#letter-tiles-bank .tile-btn").first().click();
          await page.locator("#btn-submit-spelling").click();
          await page.waitForTimeout(200);
          const wrongFeedback = (await page.locator("#word-feedback-text").textContent()).trim();
          assert.ok(wrongFeedback.includes("Try again"), `expected wrong-tiles feedback, got: "${wrongFeedback}"`);
          await page.waitForTimeout(1100);
          continue;
        }

        for (const letter of gameQuestion.targetWord.split("")) {
          const tileIndex = await page.evaluate((targetLetter) => {
            const btns = Array.from(document.querySelectorAll("#letter-tiles-bank .tile-btn:not([disabled])"));
            return btns.findIndex((b) => b.textContent.trim().toLowerCase() === targetLetter);
          }, letter);
          assert.ok(tileIndex !== -1, `no tile found for letter '${letter}' of word '${gameQuestion.targetWord}'`);
          await page.locator("#letter-tiles-bank .tile-btn:not([disabled])").nth(tileIndex).click();
        }
        await page.locator("#btn-submit-spelling").click();
        await page.waitForTimeout(900);
      }

      await page.waitForTimeout(500);
      const wordVictoryActive = await page.evaluate(() =>
        document.getElementById("victory-modal")?.classList.contains("active"),
      );
      if (wordVictoryActive) {
        await page.locator("#btn-victory-continue").click();
      }
      await page.waitForTimeout(300);
      const screenAfterWord = await page.evaluate(() => document.querySelector(".view-screen.active")?.id);
      assert.equal(screenAfterWord, "dashboard-view", "did not return to the dashboard after finishing word realm");
      console.log("[e2e] word realm complete, back on dashboard");

      // --- Pokédex + AC-5 starter-pet regression guard ------------------------
      await page.locator("#btn-enter-pokedex").click();
      await page.waitForTimeout(300);
      const pokedexScreen = await page.evaluate(() => document.querySelector(".view-screen.active")?.id);
      assert.equal(pokedexScreen, "pokedex-view");
      const collectedText = (await page.locator("#pets-collected-count").textContent()).trim();
      assert.match(collectedText, /^\d+ \/ \d+$/);

      const player = await page.evaluate(() => window.appController.player);
      assert.equal(player.starterPet, "embercub", "AC-5: starter pet was not saved correctly");
      const collection = await page.evaluate(() => window.appController.collection);
      assert.ok(
        collection.some((pet) => pet.id === "embercub"),
        "AC-5: Embercub starter pet missing from the collection",
      );
    } finally {
      await browser.close();
      await server.close();
    }

    // AC-2, checked last so every earlier assertion's own failure message wins.
    const unexpectedFailedRequests = failedRequests.filter((r) => !r.url.includes("lucky-games-reporter"));
    assert.deepEqual(
      unexpectedFailedRequests,
      [],
      `unexpected failed network requests: ${JSON.stringify(unexpectedFailedRequests)}`,
    );
    assert.deepEqual(pageErrors, [], `uncaught page errors during the run: ${JSON.stringify(pageErrors)}`);
    assert.deepEqual(consoleErrors, [], `console.error calls during the run: ${JSON.stringify(consoleErrors)}`);
  },
);
