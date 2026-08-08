// @task TASK-018
// @ac AC-57 Every modal overlay is a direct child of body
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("TASK-018 AC-57: no modal-overlay is nested inside another element (a hidden ancestor silently collapses it to 0x0, invisible to jsdom-only checks)", () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const document = dom.window.document;

  const overlays = document.querySelectorAll(".modal-overlay");
  assert.ok(overlays.length > 0, "expected at least one .modal-overlay in index.html");

  for (const overlay of overlays) {
    assert.equal(
      overlay.parentElement.tagName,
      "BODY",
      `#${overlay.id || "(no id)"} must be a direct child of <body>, found inside <${overlay.parentElement.tagName.toLowerCase()}${overlay.parentElement.id ? "#" + overlay.parentElement.id : ""}> instead -- a display:none ancestor would render it at 0x0 regardless of the overlay's own CSS`
    );
  }
});
