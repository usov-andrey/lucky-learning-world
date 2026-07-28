import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { ThemeManager } from "../content/themes.js";

// Mock localStorage if missing in node environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

test("Theme Integration: Progress reset does not erase selected theme", () => {
  localStorage.clear();
  ThemeManager.setTheme("comic");
  assert.equal(ThemeManager.getTheme(), "comic");

  // Simulate resetting game progress (clearing progress keys)
  localStorage.removeItem("lucky_player");
  localStorage.removeItem("lucky_math_progression");
  localStorage.removeItem("lucky_collection");

  // Selected theme remains preserved
  assert.equal(ThemeManager.getTheme(), "comic");
});

test("Theme Integration: 100% English UI - no Cyrillic text in index.html, app.js or content/", () => {
  const cyrillicRegex = /[А-Яа-яЁё]/;

  const targetFiles = [
    "index.html",
    "app.js",
    "content/themes.js",
    "content/comic-characters.js",
    "engine/share-controller.js"
  ];

  for (const relPath of targetFiles) {
    const fullPath = path.resolve(relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      const match = cyrillicRegex.exec(content);
      assert.equal(match, null, `Found Cyrillic character "${match ? match[0] : ''}" in ${relPath}`);
    }
  }
});
