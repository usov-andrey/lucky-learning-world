#!/usr/bin/env node

/**
 * TASK-022: Deploy-time-only patch for BUILD_TIMESTAMP.
 *
 * `scripts/release.mjs` stamps BUILD_TIMESTAMP with whatever machine ran it —
 * usually a developer/agent sandbox, whose system clock is not guaranteed to
 * be NTP-accurate. This script re-stamps it using the GitHub Actions runner's
 * own clock (a freshly provisioned, NTP-synced VM) at the moment the Pages
 * artifact is actually built, so the "Build Version" diagnostic reflects the
 * real production deploy instant. It only rewrites the checkout used for the
 * CI job's artifact — it is never committed back to git.
 */

import fs from "node:fs";

const path = new URL("../build-info.js", import.meta.url);
const content = fs.readFileSync(path, "utf8");
const accurate = new Date().toISOString();

const restamped = content.replace(
  /export\s+const\s+BUILD_TIMESTAMP\s*=\s*"[^"]+"/,
  `export const BUILD_TIMESTAMP = "${accurate}"`
);

if (restamped === content) {
  throw new Error("stamp-deploy-timestamp: BUILD_TIMESTAMP export not found in build-info.js");
}

fs.writeFileSync(path, restamped);
console.log(`Stamped deploy-accurate BUILD_TIMESTAMP = ${accurate}`);
