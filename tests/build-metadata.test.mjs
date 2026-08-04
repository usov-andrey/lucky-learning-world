// @task TASK-012
// @ac AC-45 Single authoritative build metadata
// @ac AC-46 Release automation synchronization
// @ac AC-47 Exact diagnostic verification
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { APP_VERSION, BUILD_TIMESTAMP, formatBuildLabel } from "../build-info.js";

test("TASK-012 AC-45 and AC-47: diagnostics use the exact authoritative version and UTC timestamp", () => {
  const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const expectedUtc = new Date(BUILD_TIMESTAMP).toISOString().slice(0, 16).replace("T", " ");
  assert.equal(APP_VERSION, "v1.4.0");
  assert.equal(packageJson.version, APP_VERSION.slice(1));
  assert.equal(formatBuildLabel(), `${APP_VERSION} (${expectedUtc} UTC)`);
  assert.match(app, /formatBuildLabel\(\)/);
  assert.doesNotMatch(app, /2026-07-27/);
  assert.match(html, /id="diag-build-version"[^>]*>Loading current build…<\/span>/);
});

test("TASK-012 AC-46: release automation updates build metadata instead of hardcoding app diagnostics", () => {
  const release = fs.readFileSync(new URL("../scripts/release.mjs", import.meta.url), "utf8");
  assert.match(release, /file: 'build-info\.js'[\s\S]*APP_VERSION/);
  assert.match(release, /file: 'build-info\.js'[\s\S]*BUILD_TIMESTAMP/);
  assert.doesNotMatch(release, /file: 'app\.js'[\s\S]{0,120}APP_VERSION/);
});
