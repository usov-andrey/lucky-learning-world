import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Narrative Integration: Toast banner lifecycle and PIN-protected theme switch", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

  const dom = new JSDOM(htmlContent, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
  });

  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  globalThis.CustomEvent = window.CustomEvent || globalThis.CustomEvent;

  // Clear localStorage
  window.localStorage.clear();

  // Import AppController
  const { AppController } = await import(`../app.js?update=${Date.now()}`);
  const app = new AppController();

  // Complete onboarding
  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();

  assert.equal(app.player.name, "Lucky");

  // Verify toast is visible for pokemon theme on hub
  app.checkToastBannerVisibility();
  assert.equal(app.elements.toastVersionUpdate.style.display, "flex");

  // Click Try Comic Quest button
  const tryBtn = app.elements.btnToastTryComic;
  assert.ok(tryBtn);
  tryBtn.click();

  // Verify campaign key marked as seen and toast hidden
  assert.equal(window.localStorage.getItem("lucky_release_toast_seen"), "comic-quest-v19");
  assert.equal(app.elements.toastVersionUpdate.style.display, "none");

  // Verify parent gate modal is opened
  assert.equal(app.elements.parentGateModal.style.display, "flex");

  // Enter correct PIN (1234)
  app.elements.parentGateInput.value = "1234";
  app.verifyParentGate();

  // Verify parent settings modal opened with appearance radio checked
  assert.equal(app.elements.parentSettingsModal.style.display, "flex");
  const radioComic = window.document.getElementById("radio-theme-comic");
  assert.ok(radioComic.checked);

  // Click Comic theme option
  const cardComic = window.document.getElementById("theme-option-comic");
  cardComic.click();

  // Verify theme changed to comic
  assert.equal(window.document.documentElement.getAttribute("data-theme"), "comic");
});
