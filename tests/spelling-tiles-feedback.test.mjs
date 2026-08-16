// @task TASK-027
// @ac AC-91 AC-92 AC-93 AC-94 AC-95
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

class FakeAudioContext {
  static ramps = [];
  static starts = 0;

  constructor() {
    this.currentTime = 0;
    this.destination = {};
    this.state = "running";
  }

  createOscillator() {
    return {
      type: "sine",
      frequency: {
        setValueAtTime(value) { FakeAudioContext.ramps.push(value); },
        exponentialRampToValueAtTime(value) { FakeAudioContext.ramps.push(value); }
      },
      connect() {},
      start() { FakeAudioContext.starts += 1; },
      stop() {}
    };
  }

  createGain() {
    return {
      gain: {
        setValueAtTime() {},
        exponentialRampToValueAtTime() {}
      },
      connect() {}
    };
  }

  resume() { return Promise.resolve(); }
}

function installDom() {
  const dom = new JSDOM(html, { url: "http://localhost/" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  dom.window.AudioContext = FakeAudioContext;
  FakeAudioContext.ramps = [];
  FakeAudioContext.starts = 0;
  return dom;
}

test("TASK-027 AC-91/AC-95: Tiles arena has a tablet battle layout and 64px touch controls", () => {
  const dom = new JSDOM(html);
  const layout = dom.window.document.querySelector("#spelling-game-container .spelling-battle-layout");
  assert.ok(layout, "Tiles battle stage and controls must share one responsive layout");
  assert.ok(layout.querySelector(".battle-stage"));
  assert.ok(layout.querySelector(".question-container"));
  assert.match(css, /@media\s*\(min-width:\s*700px\)[\s\S]*\.spelling-battle-layout\s*\{[\s\S]*grid-template-columns/);
  assert.match(css, /#spelling-game-container\s+\.tile-btn[\s\S]*min-height:\s*64px/);
  assert.match(css, /#spelling-game-container\s+\.audio-pronounce-btn[\s\S]*min-height:\s*64px/);
  assert.match(css, /#spelling-game-container\s+button[\s\S]*touch-action:\s*manipulation/);
});

test("TASK-027 AC-92/AC-94/AC-95: correct Tiles attack gives concise visual, motion, rising sound, and locks double submit", async () => {
  const dom = installDom();
  const originalSetTimeout = globalThis.setTimeout;
  const scheduled = [];
  globalThis.setTimeout = (fn) => { scheduled.push(fn); return scheduled.length; };

  try {
    localStorage.clear();
    const { AppController } = await import(`../app.js?tiles_hit=${Date.now()}`);
    const app = new AppController();
    app.completeOnboarding();
    app.startWordRealm();
    app.switchSpellingMode("game");

    const q = app.spellingEngine.getCurrentGameQuestion();
    app.selectedLetterTiles = q.targetWord.split("");
    app.handleSpellingGameSubmit();
    const historyAfterFirstTap = app.spellingEngine.history.length;
    app.handleSpellingGameSubmit();

    assert.equal(app.elements.wordFeedbackText.textContent, "HIT!");
    assert.equal(app.elements.wordBattleFeedback.textContent.trim(), "HIT!");
    assert.ok(app.elements.wordBattleFeedback.classList.contains("hit"));
    assert.ok(app.elements.wordMonsterImg.classList.contains("hit-anim"));
    assert.equal(app.spellingEngine.history.length, historyAfterFirstTap, "second tap is ignored during feedback");
    assert.ok(FakeAudioContext.starts > 0, "success effect starts an oscillator");
    assert.ok(FakeAudioContext.ramps.at(-1) > FakeAudioContext.ramps[0], "success pitch rises");
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    dom.window.close();
  }
});

test("TASK-027 AC-93/AC-94: wrong Tiles attack gives MISS, dodge, descending sound, and no repeated definition", async () => {
  const dom = installDom();
  const originalSetTimeout = globalThis.setTimeout;
  const scheduled = [];
  globalThis.setTimeout = (fn) => { scheduled.push(fn); return scheduled.length; };

  try {
    localStorage.clear();
    const { AppController } = await import(`../app.js?tiles_miss=${Date.now()}`);
    const app = new AppController();
    app.completeOnboarding();
    app.startWordRealm();
    app.switchSpellingMode("game");

    const q = app.spellingEngine.getCurrentGameQuestion();
    app.selectedLetterTiles = ["x"];
    app.handleSpellingGameSubmit();

    assert.equal(app.elements.wordFeedbackText.textContent, "MISS! TRY AGAIN");
    assert.ok(!app.elements.wordFeedbackText.textContent.includes(q.definition));
    assert.equal(app.elements.wordHintText.textContent, `Hint: "${q.definition}"`);
    assert.equal(app.elements.wordBattleFeedback.textContent.trim(), "MISS!");
    assert.ok(app.elements.wordBattleFeedback.classList.contains("miss"));
    assert.ok(app.elements.wordMonsterImg.classList.contains("miss-anim"));
    assert.ok(FakeAudioContext.starts > 0, "miss effect starts an oscillator");
    assert.ok(FakeAudioContext.ramps.at(-1) < FakeAudioContext.ramps[0], "miss pitch descends");
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    dom.window.close();
  }
});
