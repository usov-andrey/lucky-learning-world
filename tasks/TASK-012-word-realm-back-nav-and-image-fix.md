# TASK-012: Word Realm Test & Tiles Back Navigation & Image Rendering Fix

## Overview
Adds a Back (⬅️ Back) button to Word Realm Test mode and Tiles (Game) mode with disabled navigation guards on index 0. Fixes pet/monster image rendering in Tiles mode (e.g. Growlithe) by properly unwrapping `art.src` image paths.

## Acceptance Criteria

- **AC-1**: Test Mode in Word Realm includes a functional `⬅️ Back` button that navigates to the previous word when `currentIndex > 0`.
- **AC-2**: Test Mode `⬅️ Back` button is disabled (opacity 0.35, pointer-events none) when `currentIndex === 0`.
- **AC-3**: Tiles (Game) Mode in Word Realm includes a functional `⬅️ Back` button that navigates to the previous monster/word when `currentIndex > 0`.
- **AC-4**: Tiles (Game) Mode `⬅️ Back` button is disabled (opacity 0.35, pointer-events none) when `currentIndex === 0`.
- **AC-5**: Monster sprites in Tiles Mode (e.g., Growlithe / embercub) correctly display their image assets across Pokemon and Comic themes without broken image icons.
- **AC-6**: Automated unit tests cover `SpellingEngine.prevTest()`, `SpellingEngine.prevGame()`, and image path resolving functions with 100% test pass rate.

## Target Version
`v1.4.0`
