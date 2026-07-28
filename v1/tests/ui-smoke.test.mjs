import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

test("Real DOM UI Smoke Test: complete onboarding, navigate screens, and open/close modals", async () => {
  const htmlPath = path.resolve("./index.html");
  const htmlContent = fs.readFileSync(htmlPath, "utf8");

  const dom = new JSDOM(htmlContent, {
    url: "https://usov-andrey.github.io/lucky-learning-world/",
    runScripts: "dangerously",
    resources: "usable"
  });

  const { window } = dom;
  const { document } = window;

  global.window = window;
  global.document = document;
  global.localStorage = window.localStorage;
  global.HTMLElement = window.HTMLElement;

  // Mock SpeechSynthesis
  window.speechSynthesis = {
    speak: () => {},
    cancel: () => {}
  };
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };

  // Import app.js dynamically inside JSDOM environment
  const { AppController } = await import("../app.js");
  window.app = new AppController();

  // 1. Verify Onboarding Modal opens for new user
  const onboardingModal = document.getElementById("onboarding-modal");
  assert.ok(onboardingModal, "onboarding-modal must exist");

  // Complete onboarding
  const nameInput = document.getElementById("onboarding-name-input");
  if (nameInput) nameInput.value = "Lucky";
  const btnStartOnboarding = document.getElementById("btn-start-onboarding");
  assert.ok(btnStartOnboarding, "btn-start-onboarding must exist");
  btnStartOnboarding.click();

  assert.ok(!onboardingModal.classList.contains("active"), "onboarding-modal must close after completion");

  // 2. Test Navigation: Enter Math Realm & Return
  const btnEnterMath = document.getElementById("btn-enter-math");
  assert.ok(btnEnterMath, "btn-enter-math must exist");
  btnEnterMath.click();

  const mathView = document.getElementById("math-view");
  assert.ok(mathView.classList.contains("active"), "math-view must become active on click");

  const btnBackMath = document.getElementById("btn-back-from-math");
  assert.ok(btnBackMath, "btn-back-from-math must exist");
  btnBackMath.click();

  const dashboardView = document.getElementById("dashboard-view");
  assert.ok(dashboardView.classList.contains("active"), "dashboard-view must return active on back button");

  // 3. Test Navigation: Enter Spelling Realm & Return
  const btnEnterWord = document.getElementById("btn-enter-word");
  assert.ok(btnEnterWord, "btn-enter-word must exist");
  btnEnterWord.click();

  const wordView = document.getElementById("word-view");
  assert.ok(wordView.classList.contains("active"), "word-view must become active on click");

  const btnBackWord = document.getElementById("btn-back-from-word");
  assert.ok(btnBackWord, "btn-back-from-word must exist");
  btnBackWord.click();
  assert.ok(dashboardView.classList.contains("active"), "dashboard-view must return active on back button");

  // 4. Test Navigation: Enter Pokédex & Return
  const btnEnterPokedex = document.getElementById("btn-enter-pokedex");
  assert.ok(btnEnterPokedex, "btn-enter-pokedex must exist");
  btnEnterPokedex.click();

  const pokedexView = document.getElementById("pokedex-view");
  assert.ok(pokedexView.classList.contains("active"), "pokedex-view must become active on click");

  const btnBackPokedex = document.getElementById("btn-back-from-pokedex");
  assert.ok(btnBackPokedex, "btn-back-from-pokedex must exist");
  btnBackPokedex.click();
  assert.ok(dashboardView.classList.contains("active"), "dashboard-view must return active on back button");

  // 5. Test QR Modal: Open & Close
  const btnShowQrHeader = document.getElementById("btn-show-qr-header");
  assert.ok(btnShowQrHeader, "btn-show-qr-header must exist");
  btnShowQrHeader.click();

  const qrModal = document.getElementById("qr-modal");
  assert.ok(qrModal.classList.contains("active"), "qr-modal must become active on QR header click");

  const btnCloseQrModal = document.getElementById("btn-close-qr-modal");
  assert.ok(btnCloseQrModal, "btn-close-qr-modal must exist");
  btnCloseQrModal.click();
  assert.ok(!qrModal.classList.contains("active"), "qr-modal must close on done click");

  // 6. Test Parent Gate Modal: Open, enter PIN, change theme to comic
  const btnParentModeHeader = document.getElementById("btn-parent-mode-header");
  assert.ok(btnParentModeHeader, "btn-parent-mode-header must exist");
  btnParentModeHeader.click();

  const parentGateModal = document.getElementById("parent-gate-modal");
  assert.ok(parentGateModal.classList.contains("active"), "parent-gate-modal must become active on lock click");

  const parentGateInput = document.getElementById("parent-gate-input");
  assert.ok(parentGateInput, "parent-gate-input must exist");
  parentGateInput.value = "1234";

  const btnParentGateSubmit = document.getElementById("btn-parent-gate-submit");
  assert.ok(btnParentGateSubmit, "btn-parent-gate-submit must exist");
  btnParentGateSubmit.click();

  const parentSettingsModal = document.getElementById("parent-settings-modal");
  assert.ok(parentSettingsModal.classList.contains("active"), "parent-settings-modal must open after valid PIN");

  const optionComic = document.getElementById("theme-option-comic");
  assert.ok(optionComic, "theme-option-comic must exist");
  optionComic.click();

  assert.equal(document.documentElement.getAttribute("data-theme"), "comic", "data-theme attribute must update to 'comic'");

  const btnCloseParentSettings = document.getElementById("btn-close-parent-settings");
  assert.ok(btnCloseParentSettings, "btn-close-parent-settings must exist");
  btnCloseParentSettings.click();
  assert.ok(!parentSettingsModal.classList.contains("active"), "parent-settings-modal must close on Done click");
  assert.equal(document.documentElement.getAttribute("data-theme"), "comic", "data-theme attribute must remain 'comic' after modal close");
});
