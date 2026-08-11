// @task TASK-021
// @ac AC-78 AC-79 AC-80
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("TASK-021 AC-78..AC-80: existing canonical stars render in header and level chips", async () => {
  const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(html, { url: "http://localhost/" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  localStorage.clear();
  localStorage.setItem("lucky_learning_player", JSON.stringify({ name: "Lucky", starterPet: "embercub" }));
  localStorage.setItem("lmm3s:progression", JSON.stringify({
    schemaVersion: 1,
    points: 17,
    unlockedLevelIds: ["x6", "x7", "x8", "x9", "x10"],
    levels: {
      x6: { attempts: 2, bestPoints: 8, stars: 2, lastPlayedAt: "2026-08-10T14:06:00.000Z" },
      x7: { attempts: 1, bestPoints: 9, stars: 3, lastPlayedAt: "2026-08-10T14:07:00.000Z" },
      x8: { attempts: 1, bestPoints: 4, stars: 0, lastPlayedAt: "2026-08-10T14:08:00.000Z" },
    },
    appliedOutcomeIds: ["one", "two", "three"],
  }));

  const { AppController } = await import(`../app.js?star_display=${Date.now()}`);
  const app = new AppController();
  assert.equal(app.elements.totalStarsCount.textContent, "5");

  app.renderMathChips();
  assert.match(app.elements.mathLevelChips.querySelector('[data-math-level="x6"]').textContent, /★★/);
  assert.match(app.elements.mathLevelChips.querySelector('[data-math-level="x7"]').textContent, /★★★/);
  assert.doesNotMatch(app.elements.mathLevelChips.querySelector('[data-math-level="x8"]').textContent, /★/);
  dom.window.close();
});
