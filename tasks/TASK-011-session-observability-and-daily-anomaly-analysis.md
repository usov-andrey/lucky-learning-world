---
id: TASK-011
title: "Session Observability and Daily Anomaly Analysis"
status: RELEASED
version: v1.4.0
created: 2026-08-04
github_issue: null
---

# TASK-011: Session Observability and Daily Anomaly Analysis

## 1. Problem statement

Production sessions currently provide too little evidence for diagnosing interaction failures. Known symptoms include buttons that must be pressed several times, UI values rendered as `undefined`, actions that do not produce a visible state change, duplicate event handling, and other soft failures that do not necessarily throw JavaScript exceptions.

The repository already contains `telemetry.js` and `reporter.js`, but the current implementation is not a complete session-observability system:

- `telemetry.js` keeps only a small local buffer and cannot support cross-session analysis;
- `reporter.js` is optimized for crash reports and short breadcrumbs, not complete action timelines;
- there is no durable server-side event store;
- button intent is not correlated with the resulting UI or state transition;
- there is no automatic daily anomaly analysis or daily report.

This task must create privacy-safe observability for every production session and automatically analyze the previous day of sessions for errors and suspicious behavior.

## 2. Scope and required architecture

### 2.1 One canonical telemetry pipeline

- Audit and consolidate the overlapping responsibilities of `telemetry.js` and `reporter.js` behind one documented client API.
- Keep crash capture active before ES modules load, but route crashes and semantic application events through one versioned event contract.
- The canonical backend source and deployment instructions must be versioned with Lucky Learning World under `platform/observability/`; the production Worker must not depend on an untracked copy in another repository.
- The existing reporter endpoint may be reused only after its deployed source, target repository, storage bindings, and secrets are verified.

### 2.2 Anonymous session lifecycle

Create a random, non-identifying `session_id` for each page lifecycle and emit:

- `session.started` with app version, channel, normalized device class, viewport class, initial screen, and service-worker version;
- `session.heartbeat` while the page is visible;
- `session.hidden`, `session.resumed`, and best-effort `session.ended` using `visibilitychange`, `pagehide`, and `sendBeacon`;
- a monotonically increasing `sequence` number so an exact session timeline can be reconstructed even when batches arrive out of order.

Do not use a child name, account, email, IP address, advertising identifier, or raw browser fingerprint as a session identifier.

### 2.3 Interaction intent and outcome correlation

Capture user intent in the document capture phase for every actionable control:

- `button`, `[role="button"]`, navigation items, lesson cards, answer choices, letter tiles, modal controls, and controls with `data-action`;
- pointer, touch, mouse, and keyboard activation source;
- stable `target_id` or `data-action`, current screen, current lesson/mode/item index, and timestamp;
- enabled/disabled/visible state at the moment of activation.

Each intent must receive a unique `action_id`. Application handlers must emit one of the following correlated outcomes:

- `action.completed` with the semantic state change and latency;
- `action.noop` with an explicit reason such as `disabled`, `guarded`, `already_active`, or `invalid_state`;
- `action.failed` with an error fingerprint;
- `action.timed_out` when no outcome is observed within the configured interaction SLA.

Semantic transitions must be logged explicitly: screen changes, modal open/close, lesson/mode/item changes, question changes, audio start/success/failure, service-worker update, and session completion. Do not record every raw DOM mutation.

### 2.4 Render-integrity monitoring

- Add a shared render assertion/sanitization layer that reports any value reaching user-visible UI as `undefined`, `null`, `NaN`, `[object Object]`, an empty required label, or a missing catalog reference.
- Add a narrowly scoped `MutationObserver` safety detector for newly rendered text in application roots. It must detect invalid sentinel text without transmitting full DOM content.
- Capture resource-load failures for scripts, styles, images, and audio, including URL path without query parameters and the active app version.
- A telemetry failure must never block rendering, navigation, audio, or game progress.

### 2.5 Reliable batched delivery

- Buffer events locally and send ordered batches rather than one request per event.
- Flush on a bounded interval, batch-size threshold, `visibilitychange`, and `pagehide` (`sendBeacon`/`keepalive`).
- Retry with exponential backoff and preserve unsent batches across reloads with strict size and age limits.
- Never silently discard critical errors, invalid-render events, or unresponsive-action events.
- Expose telemetry health counters: queued, sent, retried, dropped, rejected, and last successful upload time.
- Include a remote/configurable kill switch so telemetry can be disabled without breaking the game.

### 2.6 Durable backend

Implement a dedicated versioned ingestion API, for example:

- `POST /v1/events` for validated event batches;
- `POST /v1/errors` for immediate crash/critical reports;
- a protected summary endpoint for operational verification.

Use durable queryable storage suitable for session timelines and daily aggregation (Cloudflare Worker + D1 is the preferred fit for the current hosting). Store server receipt time separately from client event time. Enforce origin allowlisting, schema validation, payload and batch limits, rate limits, idempotency by `event_id`, and safe CORS behavior.

Raw events must expire automatically after 30 days. Daily aggregate reports may be retained for 180 days. GitHub Issues must not be used as the raw event database.

## 3. Required anomaly detectors

The analyzer must classify at least these patterns:

1. **Repeated activation after no result**: the same target is activated at least twice within 2 seconds and the first action has no completed state transition before the next activation.
2. **Unresponsive control**: an enabled and visible control receives intent but no `completed`, `noop`, or `failed` outcome within the configured SLA (default 750 ms; audio/network actions may define a longer SLA).
3. **Duplicate handling**: one `action_id` produces multiple incompatible outcomes or multiple state transitions.
4. **Invalid rendered value**: `undefined`, `null`, `NaN`, `[object Object]`, an empty required label, or another configured sentinel reaches visible UI.
5. **Runtime failure**: uncaught error, unhandled rejection, console error, or resource/audio load failure.
6. **Stuck visible session**: a visible session continues heartbeats after an action but makes no semantic transition for the configured threshold.
7. **Transition loop**: the same screens or modals oscillate repeatedly within a short window.
8. **Version mismatch**: HTML, application module, service worker, or telemetry event versions disagree within one session.

Every anomaly must retain a redacted timeline window before and after the event so the failure can be reconstructed without storing user-entered content.

## 4. Daily analysis and reporting

- Run automatically once per day for the previous `Asia/Bangkok` calendar day; default schedule is 03:00 Asia/Bangkok and must be configurable.
- Analyze all received production sessions, not only sessions that threw exceptions.
- Always produce a report, including on days with zero anomalies.
- Report total sessions, completed sessions, event-delivery health, app-version distribution, action count, unresponsive-action rate, repeated-activation rate, invalid-render count, crashes, broken resources, and affected-session count.
- Rank anomaly fingerprints by severity, affected sessions, frequency, and regression against the preceding 7-day baseline.
- Include redacted example timelines, stable target/action identifiers, app version, screen, first/last seen, and a proposed reproduction path.
- Publish one Markdown GitHub Issue or update one daily tracking issue with label `telemetry-daily`; create an immediate separate issue only for a new critical fingerprint or a configured severe regression.
- Daily report generation must be idempotent: rerunning the same date updates the existing report instead of creating duplicates.

## 5. Privacy and security requirements

Lucky Learning World is used by children. Data minimization is a release blocker.

The telemetry system must never collect or transmit:

- child/player names, PIN values, emails, IP addresses, precise location, or cross-site identifiers;
- free-form input, typed spelling answers, complete URLs/query strings, clipboard data, or full DOM text;
- raw `localStorage`, authentication tokens, secrets, or complete browser fingerprints.

Allowed state must be an explicit allowlist of technical enums, counters, booleans, catalog IDs, indices, and anonymized session identifiers. Answer events may record correctness and input length, but never the answer text. The server must discard the source IP rather than persist it. All logs and reports must pass automated redaction tests.

## 6. Performance and resilience budgets

- Telemetry must be non-blocking and must not change game behavior if storage, serialization, networking, or the backend fails.
- No individual event request: use bounded batches of at most 50 events and 64 KB.
- No raw high-frequency pointer-move, animation-frame, or unrestricted mutation logging.
- Core actions, critical errors, and render-integrity failures must not be sampled; optional high-frequency health events may be sampled only through explicit configuration.
- Add a queue cap and documented drop priority: discard old low-severity heartbeats before any critical or anomaly event.

## 7. Acceptance criteria

- [x] **AC-36 — Complete anonymous sessions**: Every production page lifecycle has an anonymous `session_id`, ordered sequence numbers, lifecycle events, version information, and a reconstructable server-side timeline.
- [x] **AC-37 — Action/result traceability**: Every supported control activation is logged once with a stable target and correlated to exactly one completed, no-op, failed, or timed-out outcome plus semantic state transitions.
- [x] **AC-38 — Multi-press diagnosis**: A synthetic session where the first press produces no state change and the second press succeeds is automatically classified as repeated activation after no result, with a redacted reproduction timeline.
- [x] **AC-39 — Invalid render detection**: Automated tests prove that visible `undefined`, `null`, `NaN`, `[object Object]`, empty required labels, and missing catalog references create anomaly events without exposing surrounding DOM text.
- [x] **AC-40 — Reliable delivery**: Ordered batching, offline persistence, idempotent retry, page-hide flush, queue limits, telemetry health counters, and failure isolation are covered by deterministic tests.
- [x] **AC-41 — Durable and secure ingestion**: The backend validates schema, origin, batch size, rate, and idempotency; stores queryable sessions/events; applies retention; and never exposes secrets to the browser.
- [x] **AC-42 — Daily analysis**: A scheduled job analyzes every production session from the previous Bangkok day and creates exactly one idempotent Markdown report with totals, rates, fingerprints, regressions, and redacted timelines.
- [x] **AC-43 — Child privacy**: Automated allowlist/redaction tests prove that names, PINs, answer text, query strings, raw local storage, IP addresses, and secrets are never persisted or included in reports.
- [x] **AC-44 — Production verification**: A controlled production smoke session containing one normal action, one no-op, one repeated press, one invalid render, and one synthetic error appears correctly in storage and in a manually triggered daily report before general rollout.

## 8. Required tests

- Client event-contract, sequencing, batching, retry, page-hide flush, and queue-priority unit tests.
- DOM integration tests for pointer/touch/click deduplication, action correlation, screen/modal/item transitions, and invalid render sentinels.
- Backend tests for validation, idempotency, retention, rate limiting, CORS, and redaction.
- Deterministic analyzer fixtures for every anomaly type and 7-day regression calculations.
- End-to-end synthetic session test from browser event through stored timeline to generated daily Markdown report.
- Failure-injection tests proving that broken storage/network/backend telemetry cannot break the game.

## 9. Rollout plan

1. Audit the deployed reporter Worker and establish the canonical source and storage ownership.
2. Define and test the versioned event schema and privacy allowlist before instrumenting the UI.
3. Implement client session/action/transition collection behind a kill switch.
4. Implement durable ingestion, retention, and protected operational health checks.
5. Implement anomaly detectors and the idempotent daily report.
6. Run a controlled smoke session and 48-hour shadow period; verify volume, false positives, privacy, and game performance.
7. Enable daily reporting for all production sessions.

## 10. Definition of done

- A maintainer can select any anonymous session from a daily report and understand the ordered screens, actions, outcomes, and failures without seeing private user content.
- The known classes of repeated-button, `undefined`, duplicate-handler, resource, and stuck-session problems are detected automatically.
- A daily report is produced without manual browser inspection.
- Critical telemetry failures are reported immediately, while raw events never create GitHub issue spam.
- Implementation, backend deployment, data retention, rollback, and incident-response instructions are committed and verified.

## 11. Expected implementation areas

- `telemetry.js`
- `reporter.js` or a replacement canonical reporter adapter
- `app.js` and semantic render/navigation helpers
- `platform/observability/` (Worker, schema, migrations, analyzer, deployment docs)
- `.github/workflows/` only where repository automation is required
- `tests/` client, backend, analyzer, privacy, and end-to-end coverage
- `ACCEPTANCE_CRITERIA.md`, task index, implementation plan, walkthrough, and release documentation
