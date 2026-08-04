# TASK-011 Implementation Plan: Session Observability and Daily Anomaly Analysis

1. Replace the overlapping client loggers with a privacy-safe session event contract and early crash adapter.
2. Correlate control intent with semantic application outcomes and detect invalid visible render values.
3. Add durable batch ingestion, D1 schema, retention, anomaly analysis, and idempotent daily GitHub reporting under `platform/observability/`.
4. Add deterministic client, analyzer, backend, privacy, and end-to-end tests.
5. Deploy the Worker and D1 bindings when Cloudflare credentials are available, release `v1.4.0`, then verify production ingestion and a controlled daily report.

## Safety gates

- No child names, PINs, answer text, query strings, raw local storage, IP addresses, or browser fingerprints may enter event payloads.
- Telemetry failures must never block the game.
- The client endpoint stays disabled until the deployed backend passes its health and ingestion smoke tests.
