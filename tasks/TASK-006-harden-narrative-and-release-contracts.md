---
id: TASK-006
title: "Harden Narrative Event and PWA Release Contracts"
status: PROPOSED
version: v1.0.4
created: 2026-07-29
github_issue: null
---

# TASK-006: Harden Narrative Event and PWA Release Contracts

## 💡 1. Idea & Proposal

- **Context**: TASK-001 is already released as `v1.0.0`. A later review of its
  historical implementation plan found two residual narrative-contract risks and
  one release-tooling inconsistency. These findings must not reopen or rewrite
  TASK-001.
- **Current evidence**:
  - `app.js` represents a requeue as `answer.incorrect` with
    `context.requeued: true`, while `content/narrative-themes.js` and
    `tests/narrative-engine.test.mjs` still expose a separate `item.requeued`;
  - `emitNarrativeEvent()` has no transition-level idempotency guard;
  - `manifest.json` contains no standard version field, but release documentation
    still lists it as a synchronized version target.
- **Proposed Solution**:
  1. Establish one canonical requeue event contract.
  2. Add deterministic duplicate-event suppression.
  3. Correct release tooling and documentation so only real version markers are
     synchronized.
  4. Treat TASK-004 as the sole owner of `engine/share-controller.js` fixes and
     coverage.

## 📋 2. Acceptance Criteria (AC)

- [ ] **AC-18.1 (Canonical Requeue Contract)**:
  Runtime code emits only `answer.incorrect` with `context.requeued: true`.
  `item.requeued` is not emitted, and obsolete catalog/test promises are removed
  or explicitly marked as compatibility-only.
- [ ] **AC-18.2 (Narrative Event Idempotency)**:
  Re-rendering, theme refresh, or repeated delivery of the same transition cannot
  generate duplicate narrative, milestone, reward, completion, timer, TTS, or
  sound effects. A new item or attempt still creates a new event.
- [ ] **AC-18.3 (Standards-Compliant PWA Versioning)**:
  Release tooling synchronizes real version markers and never adds a non-standard
  `version` field to `manifest.json`. Generated release notes accurately list only
  files whose version markers were updated.
- [ ] **AC-18.4 (No TASK-004 Scope Duplication)**:
  TASK-006 does not modify `engine/share-controller.js` or its QR/offline coverage.
  Those changes remain owned by TASK-004; TASK-006 records and verifies the
  dependency only.

## 🧪 3. Test Coverage

- `tests/narrative-engine.test.mjs`
  - canonical `answer.incorrect.context.requeued` behavior;
  - absence of a second requeue narrative event.
- `tests/narrative-integration.test.mjs`
  - transition-key idempotency;
  - theme refresh does not repeat side effects;
  - a new attempt or item remains emit-capable.
- `tests/release.test.mjs` or the existing release automation test suite
  - real version-marker synchronization;
  - no manifest version insertion;
  - truthful generated release notes.
- TASK-004 tests remain in `tests/share-qr.test.mjs`.

## 💻 4. Impacted Code Files

- `app.js`
- `content/narrative-themes.js`
- `tests/narrative-engine.test.mjs`
- `tests/narrative-integration.test.mjs`
- `scripts/release.mjs`
- `DEVELOPMENT_RULES.md`
- release automation tests and generated documentation

Explicitly out of scope:

- `engine/share-controller.js`
- `engine/qr-generator.js`
- `tests/share-qr.test.mjs`

## 📦 5. Release & Artifacts

- **Target Version**: `v1.0.4`, unless TASK-005 releases first and requires a
  version rebase.
- **Implementation Plan**:
  `docs/plans/TASK-006-implementation-plan.md`
- **Release Notes / Walkthrough**:
  `docs/walkthroughs/TASK-006-walkthrough.md`

