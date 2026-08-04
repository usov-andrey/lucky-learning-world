# Walkthrough — TASK-013: Word Realm Back Navigation & Image Rendering Fix

Fixed missing "Back" (⬅️ Back) buttons in Word Realm Test & Tiles modes and fixed pet image loading in Tiles mode.

## Changes Made

### 1. Engine (`engine/spelling-engine.js` & `v2/engine/spelling-engine.js`)
- Added `prevTest()` to step back to the previous word during spelling tests and rebuild queue from `currentIndex`.
- Added `prevGame()` to step back to the previous word in Tiles (Game) mode and rebuild queue from `currentIndex`.
- Included `monsterId: item.monsterId` in `getCurrentGameQuestion()`.

### 2. View & DOM (`index.html`, `v2/index.html`, `app.js`, `v2/app.js`)
- Added `<button class="back-btn" id="btn-test-prev">⬅️ Back</button>` to Test Mode container.
- Added `<button class="back-btn" id="btn-game-prev">⬅️ Back</button>` to Tiles Game Mode action bar.
- Bound click/touch handlers for `btn-test-prev` and `btn-game-prev`.
- Enforced project rule **Disabled Navigation Guard**: disabled `btn-test-prev` and `btn-game-prev` when `currentIndex === 0` (opacity 0.35, pointer-events none).
- Created helper `getCharacterImgSrc(pres, defaultChar)` to properly resolve `art.src` for Pokemon characters (e.g. Growlithe / `embercub`) across themes.

### 3. Automated Unit Tests (`tests/spelling-back-nav-and-image.test.mjs`)
- Added unit tests for `SpellingEngine.prevTest()`, `SpellingEngine.prevGame()`, index 0 guard disabled state, and `getCharacterImgSrc()` resolving `art.src`.

## Verification Results

### Automated Tests
- Ran `node --test tests/*.test.mjs`:
  - **99 passing tests**, 0 failing tests.
