# Lucky Learning World Observability

This directory is the canonical source for the production telemetry Worker.

## Architecture

The browser sends privacy-filtered event batches to `/v1/events`. Cloudflare D1 stores anonymous session timelines. A Worker Cron runs at 20:00 UTC (03:00 Asia/Bangkok), analyzes the previous Bangkok day, and stores one idempotent Markdown report. GitHub issue publication is optional and activates only when a repository-scoped `GITHUB_TOKEN` secret is explicitly configured.

The Worker never stores source IP addresses, names, PINs, answer text, query strings, raw local storage, or browser fingerprints.

## One-time setup

1. Create D1: `npx wrangler d1 create lucky-learning-observability`.
2. Copy `wrangler.toml.example` to `wrangler.toml` and set the returned non-secret database ID.
3. Apply schema: `npx wrangler d1 execute lucky-learning-observability --remote --file schema.sql`.
4. Optional: set `GITHUB_TOKEN` only with a fine-grained token restricted to Issues read/write for this repository. Never reuse a personal broad-scope token or store it as a plaintext Worker variable.
5. Deploy: `npx wrangler deploy`.

## Verification

- `GET /health` returns service and schema version only.
- `POST /v1/events` accepts a valid batch from an allowed origin.
- `wrangler dev --remote --test-scheduled` plus `GET /__scheduled` performs a controlled report smoke without adding a public administrative route.
- Query `daily_reports` through authorized Wrangler/D1 access for operational verification.

Raw events expire after 30 days; daily reports expire after 180 days.
