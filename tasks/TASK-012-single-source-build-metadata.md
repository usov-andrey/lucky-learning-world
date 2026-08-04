---
id: TASK-012
title: "Single-Source Build Version and Date"
status: RELEASED
version: v1.4.0
created: 2026-08-04
github_issue: null
---

# TASK-012: Single-Source Build Version and Date

## Problem

Release `v1.3.2` contained the correct build time in `index.html`, but `app.js` overwrote the diagnostic label at runtime with the hardcoded date `2026-07-27`. The displayed version was correct while the displayed release date was stale.

## Acceptance criteria

- [x] **AC-45**: Version and UTC build time come from one authoritative build metadata module; no historical runtime date literal remains.
- [x] **AC-46**: Release automation updates version, build timestamp, cache busters, service-worker cache, and telemetry version consistently.
- [x] **AC-47**: Exact tests fail on any version/date mismatch and verify the rendered diagnostic label.

## Expected files

- `build-info.js`
- `app.js`
- `index.html`
- `scripts/release.mjs`
- `tests/build-metadata.test.mjs`

## Release

- Target: `v1.4.0`, bundled with TASK-011.
