const FAILURE_TYPES = new Set([
  "runtime.error",
  "runtime.unhandled_rejection",
  "resource.failed",
  "audio.failed"
]);

const OUTCOME_TYPES = new Set([
  "action.completed",
  "action.noop",
  "action.failed",
  "action.timed_out"
]);

function eventTime(event) {
  return Date.parse(event.occurred_at || event.client_time || 0) || 0;
}

function metadata(event) {
  if (event.metadata && typeof event.metadata === "object") return event.metadata;
  try { return JSON.parse(event.payload_json || "{}"); } catch { return {}; }
}

function anomaly(kind, event, details = {}) {
  const meta = metadata(event);
  const key = details.key || event.target_id || meta.error_fingerprint || "unknown";
  return {
    kind,
    severity: details.severity || (kind === "invalid-render" || kind === "runtime-failure" ? "high" : "medium"),
    fingerprint: `${kind}:${key}`,
    session_id: event.session_id,
    event_id: event.event_id,
    occurred_at: event.occurred_at || event.client_time,
    target_id: event.target_id || null,
    screen: event.screen || "unknown",
    details: { ...details, key: undefined }
  };
}

function groupSessions(events) {
  const grouped = new Map();
  for (const event of events) {
    if (!grouped.has(event.session_id)) grouped.set(event.session_id, []);
    grouped.get(event.session_id).push(event);
  }
  for (const timeline of grouped.values()) timeline.sort((a, b) => (a.sequence || 0) - (b.sequence || 0) || eventTime(a) - eventTime(b));
  return grouped;
}

function inferSessionAnomalies(timeline) {
  const anomalies = [];
  const outcomes = new Map();
  const intents = [];

  for (const event of timeline) {
    const meta = metadata(event);
    if (OUTCOME_TYPES.has(event.type) && event.action_id) {
      if (!outcomes.has(event.action_id)) outcomes.set(event.action_id, []);
      outcomes.get(event.action_id).push(event);
    }
    if (event.type === "action.intent") intents.push(event);
    if (event.type === "anomaly.repeated_activation") anomalies.push(anomaly("repeated-activation", event));
    if (event.type === "render.invalid") anomalies.push(anomaly("invalid-render", event, { key: meta.sentinel || event.target_id, severity: "high" }));
    if (FAILURE_TYPES.has(event.type)) anomalies.push(anomaly("runtime-failure", event, { key: meta.error_fingerprint || event.target_id, severity: "high" }));
    if (event.type === "anomaly.duplicate_outcome") anomalies.push(anomaly("duplicate-handling", event));
  }

  for (const intent of intents) {
    const actionOutcomes = outcomes.get(intent.action_id) || [];
    if (actionOutcomes.length === 0) anomalies.push(anomaly("unresponsive-control", intent));
    if (actionOutcomes.length > 1) anomalies.push(anomaly("duplicate-handling", intent));
  }

  for (let index = 1; index < intents.length; index += 1) {
    const previous = intents[index - 1];
    const current = intents[index];
    if (previous.target_id !== current.target_id || eventTime(current) - eventTime(previous) > 2000) continue;
    const completedBeforeRepeat = (outcomes.get(previous.action_id) || []).some(outcome =>
      outcome.type === "action.completed" && eventTime(outcome) <= eventTime(current)
    );
    if (!completedBeforeRepeat) anomalies.push(anomaly("repeated-activation", current, { key: current.target_id }));
  }

  for (const [actionId, actionOutcomes] of outcomes) {
    if (actionOutcomes.length > 1) {
      anomalies.push(anomaly("duplicate-handling", actionOutcomes[1], { key: actionId }));
    }
  }

  const versions = new Set(timeline.map(event => event.app_version).filter(Boolean));
  if (versions.size > 1) anomalies.push(anomaly("version-mismatch", timeline[0], { key: [...versions].sort().join("-") }));

  const transitions = timeline.filter(event => event.type === "state.transition");
  for (let index = 3; index < transitions.length; index += 1) {
    const sample = transitions.slice(index - 3, index + 1);
    const destinations = sample.map(event => metadata(event).to);
    if (destinations[0] === destinations[2] && destinations[1] === destinations[3] && eventTime(sample[3]) - eventTime(sample[0]) <= 10000) {
      anomalies.push(anomaly("transition-loop", sample[3], { key: destinations.join("-") }));
      break;
    }
  }

  const visibleHeartbeats = timeline.filter(event => event.type === "session.heartbeat");
  for (const intent of intents) {
    const hasTransition = transitions.some(event => eventTime(event) >= eventTime(intent) && eventTime(event) - eventTime(intent) <= 30000);
    const stillVisible = visibleHeartbeats.some(event => eventTime(event) - eventTime(intent) >= 30000);
    if (!hasTransition && stillVisible) {
      anomalies.push(anomaly("stuck-session", intent));
      break;
    }
  }

  return anomalies;
}

function deduplicateAnomalies(anomalies) {
  const seen = new Set();
  return anomalies.filter(item => {
    const key = `${item.kind}|${item.session_id}|${item.event_id}|${item.fingerprint}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function analyzeEvents(events, { reportDate = "unknown", baseline = {} } = {}) {
  const sessions = groupSessions(events);
  const anomalies = deduplicateAnomalies([...sessions.values()].flatMap(inferSessionAnomalies));
  const actionCount = events.filter(event => event.type === "action.intent").length;
  const completedSessions = [...sessions.values()].filter(timeline => timeline.some(event => event.type === "session.ended" || event.type === "game.session.completed")).length;
  const counts = {};
  for (const item of anomalies) counts[item.kind] = (counts[item.kind] || 0) + 1;
  const affectedSessions = new Set(anomalies.map(item => item.session_id)).size;
  const versions = {};
  for (const event of events) versions[event.app_version || "unknown"] = (versions[event.app_version || "unknown"] || 0) + 1;

  const fingerprintGroups = new Map();
  for (const item of anomalies) {
    if (!fingerprintGroups.has(item.fingerprint)) fingerprintGroups.set(item.fingerprint, []);
    fingerprintGroups.get(item.fingerprint).push(item);
  }
  const topFingerprints = [...fingerprintGroups.entries()].map(([fingerprint, items]) => ({
    fingerprint,
    kind: items[0].kind,
    severity: items[0].severity,
    count: items.length,
    affected_sessions: new Set(items.map(item => item.session_id)).size,
    regression_ratio: Number(baseline[fingerprint]) > 0 ? items.length / Number(baseline[fingerprint]) : null,
    example: items[0]
  })).sort((a, b) => b.affected_sessions - a.affected_sessions || b.count - a.count);

  return {
    report_date: reportDate,
    total_sessions: sessions.size,
    completed_sessions: completedSessions,
    total_events: events.length,
    action_count: actionCount,
    affected_sessions: affectedSessions,
    unresponsive_action_rate: actionCount ? (counts["unresponsive-control"] || 0) / actionCount : 0,
    repeated_activation_rate: actionCount ? (counts["repeated-activation"] || 0) / actionCount : 0,
    invalid_render_count: counts["invalid-render"] || 0,
    runtime_failure_count: counts["runtime-failure"] || 0,
    counts,
    versions,
    anomalies,
    top_fingerprints: topFingerprints
  };
}

function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

export function buildDailyReport(analysis) {
  const lines = [
    `# Lucky Learning World — Daily Session Analysis ${analysis.report_date}`,
    "",
    "## Summary",
    "",
    `- Sessions: **${analysis.total_sessions}** (${analysis.completed_sessions} completed)`,
    `- Events: **${analysis.total_events}**`,
    `- Actions: **${analysis.action_count}**`,
    `- Affected sessions: **${analysis.affected_sessions}**`,
    `- Unresponsive action rate: **${percent(analysis.unresponsive_action_rate)}**`,
    `- Repeated activation rate: **${percent(analysis.repeated_activation_rate)}**`,
    `- Invalid renders: **${analysis.invalid_render_count}**`,
    `- Runtime/resource failures: **${analysis.runtime_failure_count}**`,
    "",
    "## App versions",
    "",
    ...Object.entries(analysis.versions).map(([version, count]) => `- \`${version}\`: ${count} events`),
    "",
    "## Ranked anomalies",
    ""
  ];
  if (!analysis.top_fingerprints.length) lines.push("No anomalies detected.");
  else {
    lines.push("| Severity | Kind | Fingerprint | Count | Sessions | Example screen/target |", "|---|---|---|---:|---:|---|");
    for (const item of analysis.top_fingerprints.slice(0, 20)) {
      lines.push(`| ${item.severity} | ${item.kind} | \`${item.fingerprint}\` | ${item.count} | ${item.affected_sessions} | \`${item.example.screen}/${item.example.target_id || "unknown"}\` |`);
    }
  }
  lines.push("", "## Privacy", "", "This report contains anonymous technical identifiers and redacted enums only. It contains no names, PINs, answer text, URLs with query strings, raw storage, or IP addresses.");
  return lines.join("\n");
}

export function bangkokDayBounds(now = new Date()) {
  const bangkokNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const previous = new Date(Date.UTC(bangkokNow.getUTCFullYear(), bangkokNow.getUTCMonth(), bangkokNow.getUTCDate() - 1));
  const reportDate = previous.toISOString().slice(0, 10);
  const start = new Date(`${reportDate}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { reportDate, start: start.toISOString(), end: end.toISOString() };
}
