// @task TASK-011
// @ac AC-41 Durable and secure ingestion
// @ac AC-43 Child privacy
import test from "node:test";
import assert from "node:assert/strict";
import { handleRequest, isOriginAllowed, validateBatch, validateEvent } from "../platform/observability/worker.js";

function validEvent() {
  return {
    schema_version: 1,
    event_id: "evt_123456",
    session_id: "ses_123456",
    sequence: 1,
    occurred_at: "2026-08-04T12:00:00.000Z",
    app_version: "v1.4.0",
    channel: "stable",
    type: "session.started",
    screen: "dashboard",
    metadata: { device_class: "tablet", initial_screen: "dashboard" }
  };
}

test("TASK-011 AC-41: worker validates origin, schema, identifiers, and batch limits", () => {
  const env = { ALLOWED_ORIGINS: "https://usov-andrey.github.io,http://localhost:8000" };
  assert.equal(isOriginAllowed("https://usov-andrey.github.io", env), true);
  assert.equal(isOriginAllowed("https://attacker.example", env), false);
  assert.equal(validateEvent(validEvent()), null);
  assert.equal(validateBatch({ schema_version: 1, events: [validEvent()] }), null);
  assert.match(validateEvent({ ...validEvent(), event_id: "bad id" }), /event_id/);
});

test("TASK-011 AC-43: backend rejects private or unknown metadata fields", () => {
  for (const privateField of ["name", "pin", "answer", "url", "localStorage", "ip", "userAgent"]) {
    const candidate = validEvent();
    candidate.metadata[privateField] = "private";
    assert.match(validateEvent(candidate), /metadata/, privateField);
  }
});

test("TASK-011 AC-41: HTTP ingestion stores an idempotent session/event batch", async () => {
  const recorded = [];
  const DB = {
    prepare(sql) {
      return {
        bind(...args) {
          return { sql, args };
        }
      };
    },
    async batch(statements) {
      recorded.push(...statements);
      return [];
    }
  };
  const env = { DB, ALLOWED_ORIGINS: "https://usov-andrey.github.io" };
  const request = new Request("https://worker.example/v1/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "https://usov-andrey.github.io" },
    body: JSON.stringify({ schema_version: 1, events: [validEvent()] })
  });
  const response = await handleRequest(request, env);
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true, accepted: 1 });
  assert.equal(recorded.length, 2);
  assert.match(recorded[1].sql, /INSERT OR IGNORE INTO events/);
});

test("TASK-011 AC-41: legacy reporter payloads remain accepted during rollout", async () => {
  const recorded = [];
  const DB = {
    prepare(sql) {
      return { bind(...args) { return { sql, args }; } };
    },
    async batch(statements) {
      recorded.push(...statements);
      return [];
    }
  };
  const env = { DB, ALLOWED_ORIGINS: "https://usov-andrey.github.io" };
  const request = new Request("https://worker.example/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "https://usov-andrey.github.io" },
    body: JSON.stringify({
      timestamp: "2026-08-04T12:00:00.000Z",
      appVersion: "v1.3.2",
      fingerprint: "window-error:legacy",
      message: "must not be stored"
    })
  });
  const response = await handleRequest(request, env);
  assert.equal(response.status, 202);
  assert.equal(recorded.length, 2);
  assert.equal(recorded[1].args.at(-1), JSON.stringify({
    error_fingerprint: "window-error:legacy",
    error_kind: "legacy-client"
  }));
});
