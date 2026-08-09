// @task TASK-019
// @ac AC-5 A freshly onboarded player's starter pet is saved correctly for every
// starter choice, not just the default one.
//
// Regression guard: TASK-019's original fix (dataset.starterPet -> dataset.starter)
// only exercised the Embercub starter in its Playwright suite. An independent review
// found the other two starter buttons still referenced stale ids ("aquafox",
// "leafpup") that don't exist in content/characters.js, so choosing them saved an
// invalid collection entry. Fixed by pointing data-starter at real character ids
// (bubblit, leafling); this test checks all three so a future rename can't silently
// reintroduce the same class of bug.
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("TASK-019 AC-5: every starter-pet button saves a real, valid character id", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const starterButtons = [...htmlContent.matchAll(/starter-pet-btn[^>]*data-starter="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(starterButtons.length, 3, "expected exactly 3 starter-pet buttons in index.html");

  const { getCharacterById } = await import(`../content/characters.js?starter_test=${Date.now()}`);

  for (const starterId of starterButtons) {
    const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
    const { window } = dom;
    globalThis.window = window;
    globalThis.document = window.document;
    globalThis.localStorage = window.localStorage;
    localStorage.clear();

    const { AppController } = await import(`../app.js?starter_test=${Date.now()}_${starterId}`);
    const app = new AppController();

    document.querySelectorAll(".starter-pet-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.starter === starterId);
    });
    app.elements.onboardingNameInput.value = "Lucky";
    app.completeOnboarding();

    assert.equal(app.player.starterPet, starterId, `player.starterPet must be "${starterId}"`);
    assert.equal(app.collection.length, 1, `collection must have exactly 1 entry for starter "${starterId}"`);
    assert.equal(app.collection[0].id, starterId, `collection entry id must be "${starterId}"`);
    assert.ok(
      getCharacterById(starterId),
      `data-starter="${starterId}" must resolve to a real character in content/characters.js`,
    );
  }
});
