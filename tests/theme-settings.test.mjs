import test from "node:test";
import assert from "node:assert/strict";
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

test("ThemeManager: returns 'pokemon' default theme when localStorage is un-set", () => {
  localStorage.clear();
  assert.equal(ThemeManager.getTheme(), "pokemon");
});

test("ThemeManager: setTheme updates state and returns valid theme", () => {
  localStorage.clear();
  const theme = ThemeManager.setTheme("comic");
  assert.equal(theme, "comic");
  assert.equal(ThemeManager.getTheme(), "comic");
  assert.equal(localStorage.getItem(ThemeManager.STORAGE_KEY), "comic");
});

test("ThemeManager: invalid theme name falls back to 'pokemon'", () => {
  localStorage.clear();
  const theme = ThemeManager.setTheme("invalid_theme_xyz");
  assert.equal(theme, "pokemon");
  assert.equal(ThemeManager.getTheme(), "pokemon");
});

test("ThemeManager: getCharacterPresentation falls back gracefully", () => {
  localStorage.clear();
  ThemeManager.setTheme("pokemon");
  const fallbackObj = { id: "res_x6", name: "Pikachu" };
  const res = ThemeManager.getCharacterPresentation("res_x6", fallbackObj);
  assert.deepEqual(res, fallbackObj);
});
