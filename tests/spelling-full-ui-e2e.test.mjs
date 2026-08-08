// @task TASK-013
// @ac AC-6 Full E2E UI Test Suite for Word Realm across Learn, Test, and Tiles Modes
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Full E2E UI Test: Word Realm - Learn, Test (Digital/Paper), and Tiles Mode full interactions", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;

  localStorage.clear();

  const { AppController } = await import(`../app.js?full_e2e=${Date.now()}`);
  const app = new AppController();

  // Complete onboarding
  app.completeOnboarding();

  // 1. Enter Word Realm
  app.startWordRealm();
  assert.equal(app.spellingEngine.mode, "learn");
  assert.equal(app.elements.learnWordDisplay.textContent, "EARN");
  assert.equal(app.elements.btnLearnPrev.disabled, true, "Learn prev disabled on index 0");

  // Click Learn Next
  app.elements.btnLearnNext.click();
  assert.equal(app.spellingEngine.currentIndex, 1);
  assert.equal(app.elements.learnWordDisplay.textContent, "LEARN");
  assert.equal(app.elements.btnLearnPrev.disabled, false, "Learn prev enabled on index 1");

  // Click Learn Prev
  app.elements.btnLearnPrev.click();
  assert.equal(app.spellingEngine.currentIndex, 0);
  assert.equal(app.elements.learnWordDisplay.textContent, "EARN");
  assert.equal(app.elements.btnLearnPrev.disabled, true, "Learn prev disabled again on index 0");

  // 2. Switch to Test Mode (Digital)
  app.switchSpellingMode("test");
  assert.equal(app.spellingEngine.mode, "test");
  assert.equal(app.elements.btnTestPrev.disabled, true, "Test prev disabled on index 0");

  // Digital Test Submit correct word
  app.elements.digitalTestInput.value = "earn";
  app.elements.btnDigitalSubmit.click();
  assert.equal(app.elements.digitalFeedbackText.textContent, "Correct! ★");

  // Fast forward timer to advance test
  app.spellingEngine.currentIndex = 1;
  app.spellingEngine.queue.shift();
  app.renderSpellingTest();
  assert.equal(app.spellingEngine.testIndex, 1);
  assert.equal(app.elements.btnTestPrev.disabled, false, "Test prev enabled on index 1");

  // Click Test Prev button
  app.elements.btnTestPrev.click();
  assert.equal(app.spellingEngine.testIndex, 0);
  assert.equal(app.elements.btnTestPrev.disabled, true, "Test prev disabled on returning to index 0");

  // 3. Test Mode (Paper)
  app.switchTestSubmode("paper");
  assert.equal(app.elements.paperTestBox.style.display, "block");
  app.elements.btnPaperReveal.click();
  assert.equal(app.elements.paperRevealedWord.style.display, "block");

  // 4. Switch to Tiles Mode (Game)
  app.switchSpellingMode("game");
  assert.equal(app.spellingEngine.mode, "game");
  assert.equal(app.elements.btnGamePrev.disabled, true, "Game prev disabled on index 0");

  const q = app.spellingEngine.getCurrentGameQuestion();
  assert.ok(q, "Tiles question object must exist");
  assert.equal(q.targetWord, "earn");

  // Simulate user clicking letter tiles one by one
  const targetLetters = q.targetWord.split("");
  targetLetters.forEach(targetChar => {
    const tileBtns = Array.from(app.elements.letterTilesBank.querySelectorAll(".tile-btn"));
    const matchingBtn = tileBtns.find(b => b.textContent.trim().toLowerCase() === targetChar && !b.disabled);
    assert.ok(matchingBtn, `Tile button for letter '${targetChar}' must exist in bank`);

    // Click tile button
    matchingBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });

  // Verify slots are filled with upper-case letters
  const filledSlots = Array.from(app.elements.wordSlotsRow.querySelectorAll(".letter-slot.filled"));
  assert.equal(filledSlots.length, 4, "All 4 slots must be filled after clicking tile buttons");
  assert.equal(filledSlots.map(s => s.textContent).join(""), "EARN");

  // Test Clear button
  app.elements.btnClearSpelling.click();
  assert.equal(app.selectedLetterTiles.length, 0, "Selected tiles reset on Clear");

  // Re-fill tiles and submit Attack
  targetLetters.forEach(targetChar => {
    const tileBtns = Array.from(app.elements.letterTilesBank.querySelectorAll(".tile-btn"));
    const matchingBtn = tileBtns.find(b => b.textContent.trim().toLowerCase() === targetChar && !b.disabled);
    matchingBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });

  app.elements.btnSubmitSpelling.click();
  assert.equal(app.elements.wordFeedbackText.textContent, "Direct hit on monster! ★");

  // Advance game index to 1
  app.spellingEngine.currentIndex = 1;
  app.spellingEngine.queue.shift();
  app.renderSpellingGame();
  assert.equal(app.spellingEngine.gameIndex, 1);
  assert.equal(app.elements.btnGamePrev.disabled, false, "Game prev enabled on index 1");

  // Click Game Prev button
  app.elements.btnGamePrev.click();
  assert.equal(app.spellingEngine.gameIndex, 0);
  assert.equal(app.elements.btnGamePrev.disabled, true, "Game prev disabled on returning to index 0");
});
