---
id: TASK-022
title: "Fix Build Timestamp Drift From Untrusted Dev Clock"
status: PROPOSED # [IDEA | PROPOSED | ACCEPTED | IN_PROGRESS | TESTED | RELEASED]
version: v1.0.0
created: 2026-08-09
github_issue: null
---

# TASK-022: Fix Build Timestamp Drift From Untrusted Dev Clock

## 💡 1. Idea & Proposal
- **Context**: The "Build Version" diagnostic (`diag-build-version`) shows `BUILD_TIMESTAMP`
  from `build-info.js`, converted to Asia/Bangkok. That conversion (`formatBuildLabel`,
  `Intl.DateTimeFormat` with `timeZone: "Asia/Bangkok"`) is mathematically correct — it's
  not a UTC-offset or DST bug. The real problem is upstream: `BUILD_TIMESTAMP` is captured
  by `scripts/release.mjs` via `new Date().toISOString()`, run on a developer/agent sandbox
  machine. That sandbox's system clock was empirically measured to be running fast versus a
  trusted external time source (timeapi.io) — real UTC `04:08:13` vs. sandbox UTC
  `04:31:02`, a ~23 minute drift at time of testing (VM/sandbox clocks commonly drift
  further after suspend/resume, so the gap can grow well past that, consistent with the
  ~1 hour lag the owner observed against their phone's clock in Bangkok). The diagnostic
  panel also claims `Environment: Production GitHub Pages`, i.e. it's asserting an accurate
  production deploy time, but the timestamp baked into it was never actually measured at
  deploy time by a trustworthy clock.
- **Proposed Solution**: Do not trust the local dev/agent sandbox clock as the source of
  truth for the *deployed* timestamp. GitHub Actions runners are freshly provisioned,
  NTP-synced cloud VMs, and the deploy job is the moment "Production GitHub Pages" becomes
  true. Add a CI-only step to `.github/workflows/deploy.yml`, after the test/coverage gate
  and before the Pages artifact is uploaded, that overwrites `BUILD_TIMESTAMP` in the
  workflow's checkout (not committed to git — `scripts/release.mjs` and local dev keep their
  existing behavior) using the runner's own clock via a new `scripts/stamp-deploy-timestamp.mjs`
  helper. This makes the shipped diagnostic timestamp accurate to the real deploy instant
  regardless of which machine ran `release.mjs` or how skewed its clock was.

## 📋 2. Acceptance Criteria (AC)
- [x] **AC-1**: `scripts/stamp-deploy-timestamp.mjs` exists, rewrites only the
      `BUILD_TIMESTAMP` export in `build-info.js` to `new Date().toISOString()`, and leaves
      `APP_VERSION` and everything else in the file untouched.
- [x] **AC-2**: `.github/workflows/deploy.yml` runs the stamping script after the test suite
      and before `actions/upload-pages-artifact`, so the deployed artifact carries a
      CI-runner-accurate timestamp while the committed `build-info.js` (and the tests that
      assert `BUILD_TIMESTAMP`-derived output) are unaffected.
- [x] **AC-3**: Existing `tests/build-metadata.test.mjs` still passes unmodified — the
      stamping step must run after tests, not before, and must not change `APP_VERSION`.

## 🧪 3. Test Coverage
- `tests/build-metadata.test.mjs` (existing, unmodified — validates the committed
  `BUILD_TIMESTAMP`/`APP_VERSION` pairing and `formatBuildLabel()` self-consistency; the CI
  stamping step intentionally runs after this test suite, not in place of it).
- `scripts/stamp-deploy-timestamp.mjs` is a deploy-time-only tool with no local test
  double — it does one `fs.readFileSync`/regex-replace/`fs.writeFileSync`, mirroring the
  already-tested regex pattern in `scripts/release.mjs`.

## 💻 4. Impacted Code Files
- `scripts/stamp-deploy-timestamp.mjs` (new)
- `.github/workflows/deploy.yml`
- `build-info.js` (clarifying comment only, no logic change)

## 📦 5. Release & Artifacts
- **Version**: `v1.7.2`
- **Release Notes / Walkthrough**: `docs/releases/v1.7.2.md`
