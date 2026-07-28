import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Version Toast Integration: Legacy instance (isLatestVersion = false) shows announcement banner", async () => {
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

  window.localStorage.clear();

  const { AppController } = await import(`../app.js?update=${Date.now()}`);
  const app = new AppController();
  app.isLatestVersion = false; // Simulate legacy instance (v1)

  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();

  assert.equal(app.player.name, "Lucky");

  // Verify version toast is visible on legacy instance
  app.checkToastBannerVisibility();
  assert.equal(app.elements.toastVersionUpdate.style.display, "flex");

  // Click "Try New Version" button (No PIN required!)
  const tryBtn = app.elements.btnToastTryVersion || window.document.getElementById("btn-toast-try-version");
  assert.ok(tryBtn, "btn-toast-try-version must exist");
  tryBtn.click();

  // Verify version dismissal key is set and toast is hidden
  assert.equal(window.localStorage.getItem("lucky_release_toast_dismissed"), app.APP_VERSION || "v1.0.0");
  assert.equal(app.elements.toastVersionUpdate.style.display, "none");
});

test("Version Toast Acceptance Criteria: Latest instance (isLatestVersion = true) NEVER shows Try New Version banner", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

  const dom = new JSDOM(htmlContent, {
    url: "http://localhost/v2/",
    runScripts: "dangerously",
    resources: "usable"
  });

  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  globalThis.CustomEvent = window.CustomEvent || globalThis.CustomEvent;

  window.localStorage.clear();

  const { AppController } = await import(`../app.js?update=${Date.now() + 1}`);
  const app = new AppController();
  app.isLatestVersion = true; // Latest version (v2)

  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();

  // Verify version toast is NEVER shown when on latest version
  app.checkToastBannerVisibility();
  assert.equal(app.elements.toastVersionUpdate.style.display, "none", "Latest version (v2) must NEVER show version update toast banner");
});
