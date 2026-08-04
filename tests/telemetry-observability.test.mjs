// @task TASK-011
// @ac AC-36 Complete anonymous sessions
// @ac AC-37 Action and outcome traceability
// @ac AC-38 Multi-press diagnosis
// @ac AC-39 Invalid render detection
// @ac AC-40 Reliable telemetry delivery
// @ac AC-43 Child privacy
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ClientTelemetry,
  createTelemetryEvent,
  findInvalidSentinel,
  sanitizeMetadata
} from "../telemetry.js";

test("TASK-011 AC-36 and AC-43: event schema is ordered and strips private fields", () => {
  const metadata = sanitizeMetadata({
    lesson_id: "or-saying-er",
    item_index: 3,
    answer: "private-answer",
    name: "Lucky",
    pin: "1234",
    url: "https://example.test/?secret=yes",
    localStorage: "everything"
  });
  assert.deepEqual(metadata, { lesson_id: "or-saying-er", item_index: 3 });

  const event = createTelemetryEvent({
    sessionId: "ses_example",
    sequence: 7,
    type: "session.heartbeat",
    screen: "word",
    metadata
  });
  assert.equal(event.session_id, "ses_example");
  assert.equal(event.sequence, 7);
  assert.equal(event.type, "session.heartbeat");
  assert.doesNotMatch(JSON.stringify(event), /private-answer|Lucky|1234|secret=yes|localStorage/);
});

test("TASK-011 AC-39: invalid visible sentinel values are identified without DOM text", () => {
  assert.equal(findInvalidSentinel("Score: undefined"), "undefined");
  assert.equal(findInvalidSentinel("null"), "null");
  assert.equal(findInvalidSentinel(Number.NaN), "NaN");
  assert.equal(findInvalidSentinel("Value [object Object]."), "[object Object]");
  assert.equal(findInvalidSentinel("A defined value"), null);
});

test("TASK-011 AC-37 and AC-38: repeated intent after no result is logged and the next action completes once", () => {
  ClientTelemetry.resetForTests();
  const first = ClientTelemetry.startAction("btn-next", "touch");
  const second = ClientTelemetry.startAction("btn-next", "touch");
  ClientTelemetry.resolveAction("completed", { transition: "item", from: "1", to: "2" }, second);

  const types = ClientTelemetry.queue.map(event => event.type);
  assert.ok(types.includes("anomaly.repeated_activation"));
  assert.equal(ClientTelemetry.queue.filter(event => event.type === "action.completed" && event.action_id === second).length, 1);
  assert.ok(ClientTelemetry.pendingActions.has(first));
  ClientTelemetry.resetForTests();
});

test("TASK-011 AC-40: event batches flush once and update delivery health", async () => {
  ClientTelemetry.resetForTests();
  const deliveries = [];
  ClientTelemetry.configure({
    endpoint: "https://telemetry.example",
    transport: async (endpoint, payload) => deliveries.push({ endpoint, payload })
  });
  ClientTelemetry.emit("session.started", { device_class: "tablet" });
  ClientTelemetry.emit("action.intent", { action_source: "touch" }, { actionId: "act_one", targetId: "btn-start" });
  const result = await ClientTelemetry.flush();

  assert.equal(result.sent, 2);
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].endpoint, "https://telemetry.example/v1/events");
  assert.equal(JSON.parse(deliveries[0].payload).events.length, 2);
  assert.equal(ClientTelemetry.getHealth().queued, 0);
});

test("TASK-011 AC-43: early reporter contains no raw storage snapshot or input capture", () => {
  const reporter = fs.readFileSync(new URL("../reporter.js", import.meta.url), "utf8");
  assert.doesNotMatch(reporter, /snapshotState|localStorage\.length|playerName|input\.value|answerText/);
  assert.match(reporter, /error_fingerprint/);
  assert.match(reporter, /resource_path/);
});
