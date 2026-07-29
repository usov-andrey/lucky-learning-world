// @task TASK-007
// @ac AC-19
// @ac AC-20
// @ac AC-21
// @ac AC-22
// @ac AC-23
// @ac AC-24

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const document = new JSDOM(html).window.document;
const dashboard = document.querySelector("#dashboard-view");

test("TASK-007 AC-19: dashboard uses a short personal welcome and one direct prompt", () => {
  assert.ok(dashboard);
  assert.equal(dashboard.querySelector("#welcome-greeting-title")?.textContent.trim(), "Hi, Lucky! ✨");
  assert.equal(dashboard.querySelector(".dashboard-prompt")?.textContent.trim(), "Pick your quest");

  assert.match(app, /welcomeGreetingTitle:\s*document\.getElementById\("welcome-greeting-title"\)/);
  assert.match(app, /welcomeGreetingTitle\.textContent\s*=\s*`Hi, \$\{this\.player\.name\}! ✨`/);
});

test("TASK-007 AC-20 and AC-21: choices are clear and supporting copy stays tiny", () => {
  const cards = [...dashboard.querySelectorAll(".realm-card")];
  assert.equal(cards.length, 3);
  assert.deepEqual(
    cards.map((card) => card.querySelector(".realm-title")?.textContent.trim()),
    ["Math Battle", "Word Quest", "My Pets"]
  );

  for (const card of cards) {
    const descriptions = card.querySelectorAll(".realm-desc");
    assert.equal(descriptions.length, 1, "each choice should have one supporting line");
    assert.ok(
      descriptions[0].textContent.trim().split(/\s+/).length <= 4,
      "supporting copy should be four words or fewer"
    );
    assert.equal(card.querySelectorAll(".realm-action-btn").length, 1);
  }

  const dashboardCopy = dashboard.textContent;
  for (const removedCopy of [
    "Welcome Adventurer! Choose Your Realm!",
    "Battle monsters, earn stars, and collect pets in your Pokédex!",
    "Fast mental math duels",
    "18 words from Page 22",
    "Unified Pokédex"
  ]) {
    assert.doesNotMatch(dashboardCopy, new RegExp(removedCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("TASK-007 AC-22: every quest has a playful visual stage and distinct color treatment", () => {
  for (const card of dashboard.querySelectorAll(".realm-card")) {
    assert.ok(card.querySelector(".realm-visual"), "missing visual stage");
    assert.ok(card.querySelector(".realm-sparkles"), "missing playful decoration");
  }

  assert.match(css, /#dashboard-view\s+\.math-realm\s*\{[^}]*--realm-accent:/s);
  assert.match(css, /#dashboard-view\s+\.word-realm\s*\{[^}]*--realm-accent:/s);
  assert.match(css, /#dashboard-view\s+\.pokedex-realm\s*\{[^}]*--realm-accent:/s);
});

test("TASK-007 AC-23: actions remain large and navigation targets only explicit buttons", () => {
  assert.match(css, /\.realm-action-btn\s*\{[^}]*height:\s*var\(--min-touch-target\)/s);
  assert.match(css, /button,[\s\S]*\.realm-action-btn,[\s\S]*touch-action:\s*manipulation/);

  assert.match(app, /id === "btn-enter-math"/);
  assert.match(app, /id === "btn-enter-word"/);
  assert.match(app, /id === "btn-enter-pokedex"/);
  assert.doesNotMatch(app, /card-math-realm["']\)\.addEventListener/);
  assert.doesNotMatch(app, /card-word-realm["']\)\.addEventListener/);
  assert.doesNotMatch(app, /card-pokedex-realm["']\)\.addEventListener/);
});

test("TASK-007 AC-24: phone breakpoint contains dedicated compact dashboard rules", () => {
  const mobile = css.match(/@media \(max-width: 600px\)\s*\{([\s\S]*?)\n\}/)?.[1] || "";
  assert.match(mobile, /#dashboard-view\s+\.dashboard-intro/);
  assert.match(mobile, /#dashboard-view\s+\.realm-card/);
  assert.match(mobile, /#dashboard-view\s+\.realm-visual/);
  assert.match(mobile, /#dashboard-view\s+\.realm-title/);
  assert.match(mobile, /#header-player-avatar[\s\S]*#header-player-name[\s\S]*display:\s*none/);

  assert.equal(document.querySelector(".brand-title")?.textContent.trim(), "Lucky's World");
  assert.equal(document.querySelector("#btn-show-qr-header")?.getAttribute("aria-label"), "Share with friends");
  assert.equal(document.querySelector("#btn-parent-mode-header")?.getAttribute("aria-label"), "Parent settings");
});
