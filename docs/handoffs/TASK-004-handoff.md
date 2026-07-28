# Handoff Specification — TASK-004: Fix & Unit Test Share Controller and QR Generator

**Task Key**: `TASK-004`  
**GitHub Issue**: [#4](https://github.com/usov-andrey/lucky-learning-world/issues/4)  
**Task Specification**: [tasks/TASK-004-fix-and-test-share-qr.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/TASK-004-fix-and-test-share-qr.md)  
**Status**: `PROPOSED` / Ready for Implementation  
**Target Release Version**: `v1.0.3`  

---

## 🔍 Executive Context & Root Cause Analysis

During technical audit and code coverage measurement in TASK-002, two engine modules were identified with critically low coverage:
- **`engine/qr-generator.js`**: `11.43%` line coverage.
- **`engine/share-controller.js`**: `17.37%` line coverage (`22.46%` aggregate).

### Verified Problems & Failure Modes:

1. **Font Loading Failure in Offline/PWA Environment**:
   - `ShareController.generateVictoryCardBlob` uses `document.fonts.load('16px Fredoka')` or `document.fonts.load('16px Outfit')`.
   - In offline mode, on devices without network access, or in test runners (`jsdom`), `document.fonts.load` rejects or hangs. This causes the returned promise to reject, skipping canvas rendering entirely and leaving `#qr-modal-canvas` blank.
2. **Missing Instant Direct QR Rendering**:
   - `app.js` `openQrModal()` calls `ShareController.generateVictoryCardBlob`, but never calls `QRGenerator.renderToCanvas(canvas, url)` directly as a fast synchronous fallback.
   - If image creation fails, no QR code is shown to the user at all.
3. **URL Parameter Encoding Bugs**:
   - `ShareController.createShareUrl()` does not encode custom word lists cleanly when words contain special characters or spaces.
   - `ShareController.parseUrlChallenge()` lacks fallback handling when `deck` or `words` URL params are malformed or missing.
4. **Zero Unit Tests for QR & Share Engines**:
   - `tests/` contains no dedicated unit test suite for `qr-generator.js` or `share-controller.js`.

---

## 🎯 Acceptance Criteria (AC)

- **`[AC-10.1]` Offline QR Canvas Generation**:
  - `QRGenerator.renderToCanvas(canvas, text, options)` MUST render a valid, non-empty 2D QR matrix onto any HTML5 Canvas element without network requests or external font dependencies.
  - Must gracefully handle empty inputs, custom dimensions (`size`, `margin`), and custom background/foreground color tokens.

- **`[AC-10.2]` Robust Share Card Generation & Link Parser**:
  - `ShareController.generateVictoryCardBlob(options)` MUST resolve a valid image `Blob` even when web fonts fail to load or when running in offline mode (using system font fallbacks `sans-serif`/`system-ui`).
  - `ShareController.createShareUrl(options)` and `ShareController.parseUrlChallenge()` MUST correctly generate and parse `deck`, `words`, `from`, and `score` URL query parameters with URI encoding safety.

- **`[AC-10.3]` Unit Test Coverage Gate (>80%)**:
  - `tests/share-qr.test.mjs` MUST achieve **>80% line coverage** for `engine/qr-generator.js` and `engine/share-controller.js`.
  - The repository MUST pass `npm run test:coverage:gate` without errors.

---

## 🛠️ Step-by-Step Implementation Guide for AI Agent / Developer

### Step 1: Refactor `engine/share-controller.js` Font & Canvas Safety
- Wrap `document.fonts.load` in a `Promise.race` with a short timeout (e.g. 300ms fallback timeout) or a `try/catch` fallback using `fontFamily = '"Fredoka", "Outfit", system-ui, sans-serif'`.
- Ensure `generateVictoryCardBlob` never rejects due to font loading errors; always render the canvas using fallback system fonts if custom web fonts are unavailable.

### Step 2: Upgrade `app.js` `openQrModal()`
- In `openQrModal()` inside `app.js`:
  1. Instantly call `QRGenerator.renderToCanvas(this.elements.qrModalCanvas, url, { size: 240 })` synchronously so the user sees a valid QR code immediately.
  2. Asynchronously invoke `ShareController.generateVictoryCardBlob(...)` to overlay the styled victory card graphics if available.

### Step 3: Create `tests/share-qr.test.mjs`
Create a new unit test suite under `tests/share-qr.test.mjs`:
```javascript
// @task TASK-004
// @ac AC-10.1: Offline QR Canvas Generation
// @ac AC-10.2: Robust Share Card Generation & Link Parser
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { QRGenerator } from '../engine/qr-generator.js';
import { ShareController, getThemeCanvasTokens } from '../engine/share-controller.js';

test('TASK-004 AC-10.1: QRGenerator creates matrix and renders to canvas', () => {
  const dom = new JSDOM('<canvas id="test-canvas"></canvas>');
  const canvas = dom.window.document.getElementById('test-canvas');
  
  QRGenerator.renderToCanvas(canvas, 'https://usov-andrey.github.io/lucky-learning-world/', { size: 240 });
  assert.equal(canvas.width, 240);
  assert.equal(canvas.height, 240);
});

test('TASK-004 AC-10.2: ShareController createShareUrl and parseUrlChallenge', () => {
  const url = ShareController.createShareUrl({ deck: 'page22', senderName: 'Lucky' });
  assert.match(url, /deck=page22/);
  assert.match(url, /from=Lucky/);
});
```

### Step 4: Add Section 10 to `ACCEPTANCE_CRITERIA.md`
Add `10. 🔗 Social Share Controller & QR Code Engine Rules` to [ACCEPTANCE_CRITERIA.md](file:///d:/SD/personal/projects/lucky-learning-world/ACCEPTANCE_CRITERIA.md).

### Step 5: Verify & Release
Run the following verification pipeline:
```bash
npm test
npm run test:coverage:gate
npm run task:sync -- --github
node scripts/release.mjs --bump=patch --task=TASK-004
```

---

## 📌 File Locations & References

- Task Spec: [tasks/TASK-004-fix-and-test-share-qr.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/TASK-004-fix-and-test-share-qr.md)
- Master Index: [tasks/INDEX.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/INDEX.md)
- QR Generator Engine: [engine/qr-generator.js](file:///d:/SD/personal/projects/lucky-learning-world/engine/qr-generator.js)
- Share Controller Engine: [engine/share-controller.js](file:///d:/SD/personal/projects/lucky-learning-world/engine/share-controller.js)
- App Controller: [app.js](file:///d:/SD/personal/projects/lucky-learning-world/app.js#L1393-L1417)
- Target Test File: `tests/share-qr.test.mjs`
