// @task TASK-011
// @ac AC-38 Multi-press diagnosis
// @ac AC-42 Daily analysis
// @ac AC-43 Child privacy
import test from "node:test";
import assert from "node:assert/strict";
import { analyzeEvents, bangkokDayBounds, buildDailyReport } from "../platform/observability/analyzer.js";

function event(sequence, type, overrides = {}) {
  return {
    event_id: `evt_${sequence}`,
    session_id: "ses_daily",
    sequence,
    occurred_at: `2026-08-03T10:00:0${sequence}Z`,
    app_version: "v1.4.0",
    channel: "stable",
    type,
    screen: "word",
    metadata: {},
    ...overrides
  };
}

test("TASK-011 AC-38 and AC-42: daily analyzer finds repeated/no-result and invalid-render sessions", () => {
  const events = [
    event(1, "session.started"),
    event(2, "action.intent", { action_id: "act_1", target_id: "btn-next" }),
    event(3, "action.intent", { action_id: "act_2", target_id: "btn-next" }),
    event(4, "state.transition", { action_id: "act_2", metadata: { transition: "item", from: "1", to: "2" } }),
    event(5, "action.completed", { action_id: "act_2", target_id: "btn-next", result: "completed" }),
    event(6, "render.invalid", { target_id: "score-label", metadata: { sentinel: "undefined" } }),
    event(7, "session.ended")
  ];
  const analysis = analyzeEvents(events, { reportDate: "2026-08-03" });
  const kinds = new Set(analysis.anomalies.map(item => item.kind));
  assert.ok(kinds.has("repeated-activation"));
  assert.ok(kinds.has("unresponsive-control"));
  assert.ok(kinds.has("invalid-render"));
  assert.equal(analysis.total_sessions, 1);
  assert.equal(analysis.completed_sessions, 1);

  const markdown = buildDailyReport(analysis);
  assert.match(markdown, /Daily Session Analysis 2026-08-03/);
  assert.match(markdown, /Repeated activation rate/);
  assert.doesNotMatch(markdown, /private-answer|child-secret-name|1234/);
});

test("TASK-011 AC-42: Bangkok day boundaries select the previous local calendar day", () => {
  const bounds = bangkokDayBounds(new Date("2026-08-04T20:30:00Z"));
  assert.equal(bounds.reportDate, "2026-08-04");
  assert.equal(bounds.start, "2026-08-03T17:00:00.000Z");
  assert.equal(bounds.end, "2026-08-04T17:00:00.000Z");
});
