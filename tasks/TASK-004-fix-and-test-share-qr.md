---
id: TASK-004
title: "Fix and Unit Test Share Controller and QR Generator Engine Modules"
status: PROPOSED
version: v1.0.3
created: 2026-07-28
github_issue: "#4"
---

# TASK-004: Fix and Unit Test Share Controller and QR Generator Engine Modules

## 💡 1. Idea & Proposal
- **Context**: Currently, `engine/qr-generator.js` (11.43% line coverage) and `engine/share-controller.js` (17.37% line coverage / 22.46% aggregate) fail to function properly in runtime and offline environments. 
  - **Issue 1**: `ShareController.generateVictoryCardBlob` relies on external network fonts (`Fredoka`/`Outfit`), which fail when offline or in JSDOM environments, rejecting the promise and resulting in a blank `#qr-modal-canvas`.
  - **Issue 2**: `QRGenerator.renderToCanvas` is never directly called for standalone QR rendering in `openQrModal()`, leaving the UI without a clear, instant QR code visual fallback.
  - **Issue 3**: Neither `qr-generator.js` nor `share-controller.js` has dedicated unit tests in `tests/`, leaving both modules vulnerable to regressions.
- **Proposed Solution**: 
  1. Fix `engine/qr-generator.js` canvas rendering math, alignment, and error correction matrix calculations so offline/canvas QR generation works 100% reliably without network dependencies.
  2. Refactor `engine/share-controller.js` to use system font fallbacks (`sans-serif`, `system-ui`) alongside custom web fonts so card rendering never fails or rejects when offline.
  3. Update `app.js` `openQrModal()` to directly invoke `QRGenerator.renderToCanvas()` as a primary instant renderer, while asynchronously augmenting with victory card graphics.
  4. Create `tests/share-qr.test.mjs` tagged with `@task TASK-004` and `@ac AC-10.1`/`AC-10.2` to bring unit test coverage of `engine/qr-generator.js` and `engine/share-controller.js` to **>80%**.

## 📋 2. Acceptance Criteria (AC)
- [ ] **AC-10.1 (Offline QR Canvas Generation)**: `QRGenerator.renderToCanvas(canvas, text)` MUST render a valid, non-empty 2D QR matrix onto any HTML5 Canvas element without network requests or external dependencies.
- [ ] **AC-10.2 (Robust Share Card Generation & Link Parser)**: `ShareController.generateVictoryCardBlob()` MUST resolve a valid image `Blob` even when web fonts fail to load. `ShareController.parseUrlChallenge()` MUST correctly parse `deck`, `words`, and `from` URL parameters.
- [ ] **AC-10.3 (Unit Test Coverage Gate)**: `tests/share-qr.test.mjs` MUST achieve **>80% line coverage** for `engine/qr-generator.js` and `engine/share-controller.js`, passing `npm run test:coverage:gate`.

## 🧪 3. Test Coverage
- `tests/share-qr.test.mjs` (tagged with `// @task TASK-004` and `// @ac AC-10.1`, `// @ac AC-10.2`)

## 💻 4. Impacted Code Files
- `engine/qr-generator.js`
- `engine/share-controller.js`
- `app.js`
- `ACCEPTANCE_CRITERIA.md`
- `tasks/INDEX.md`
- `tests/share-qr.test.mjs`

## 📦 5. Release & Artifacts
- **Version**: `v1.0.3`
- **Handoff Document**: `docs/handoffs/TASK-004-handoff.md`
- **Release Notes / Walkthrough**: `docs/walkthroughs/TASK-004-walkthrough.md`
