import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Version Toast Integration: Un-PINned version update announcement banner", async () => {
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

  // Verify version toast is visible on dashboard without requiring PIN
  app.checkToastBannerVisibility();
  assert.equal(app.elements.toastVersionUpdate.style.display, "flex");

  // Click "Try New Version" button (No PIN required!)
  const tryBtn = app.elements.btnToastTryVersion || window.document.getElementById("btn-toast-try-version");
  assert.ok(tryBtn, "btn-toast-try-version must exist");
  tryBtn.click();

  // Verify version dismissal key is set and toast is hidden
  assert.equal(window.localStorage.getItem("lucky_release_toast_dismissed"), "v2.0.1-v19.1");
  assert.equal(app.elements.toastVersionUpdate.style.display, "none");

  // Verify Parent Gate modal is NOT opened (No PIN prompt)
  assert.notEqual(app.elements.parentGateModal.style.display, "flex");
});
