var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// analyzer.js
var FAILURE_TYPES = /* @__PURE__ */ new Set([
  "runtime.error",
  "runtime.unhandled_rejection",
  "resource.failed",
  "audio.failed"
]);
var OUTCOME_TYPES = /* @__PURE__ */ new Set([
  "action.completed",
  "action.noop",
  "action.failed",
  "action.timed_out"
]);
function eventTime(event) {
  return Date.parse(event.occurred_at || event.client_time || 0) || 0;
}
__name(eventTime, "eventTime");
function metadata(event) {
  if (event.metadata && typeof event.metadata === "object") return event.metadata;
  try {
    return JSON.parse(event.payload_json || "{}");
  } catch {
    return {};
  }
}
__name(metadata, "metadata");
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
    details: { ...details, key: void 0 }
  };
}
__name(anomaly, "anomaly");
function groupSessions(events) {
  const grouped = /* @__PURE__ */ new Map();
  for (const event of events) {
    if (!grouped.has(event.session_id)) grouped.set(event.session_id, []);
    grouped.get(event.session_id).push(event);
  }
  for (const timeline of grouped.values()) timeline.sort((a, b) => (a.sequence || 0) - (b.sequence || 0) || eventTime(a) - eventTime(b));
  return grouped;
}
__name(groupSessions, "groupSessions");
function inferSessionAnomalies(timeline) {
  const anomalies = [];
  const outcomes = /* @__PURE__ */ new Map();
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
    if (previous.target_id !== current.target_id || eventTime(current) - eventTime(previous) > 2e3) continue;
    const completedBeforeRepeat = (outcomes.get(previous.action_id) || []).some(
      (outcome) => outcome.type === "action.completed" && eventTime(outcome) <= eventTime(current)
    );
    if (!completedBeforeRepeat) anomalies.push(anomaly("repeated-activation", current, { key: current.target_id }));
  }
  for (const [actionId, actionOutcomes] of outcomes) {
    if (actionOutcomes.length > 1) {
      anomalies.push(anomaly("duplicate-handling", actionOutcomes[1], { key: actionId }));
    }
  }
  const versions = new Set(timeline.map((event) => event.app_version).filter(Boolean));
  if (versions.size > 1) anomalies.push(anomaly("version-mismatch", timeline[0], { key: [...versions].sort().join("-") }));
  const transitions = timeline.filter((event) => event.type === "state.transition");
  for (let index = 3; index < transitions.length; index += 1) {
    const sample = transitions.slice(index - 3, index + 1);
    const destinations = sample.map((event) => metadata(event).to);
    if (destinations[0] === destinations[2] && destinations[1] === destinations[3] && eventTime(sample[3]) - eventTime(sample[0]) <= 1e4) {
      anomalies.push(anomaly("transition-loop", sample[3], { key: destinations.join("-") }));
      break;
    }
  }
  const visibleHeartbeats = timeline.filter((event) => event.type === "session.heartbeat");
  for (const intent of intents) {
    const hasTransition = transitions.some((event) => eventTime(event) >= eventTime(intent) && eventTime(event) - eventTime(intent) <= 3e4);
    const stillVisible = visibleHeartbeats.some((event) => eventTime(event) - eventTime(intent) >= 3e4);
    if (!hasTransition && stillVisible) {
      anomalies.push(anomaly("stuck-session", intent));
      break;
    }
  }
  return anomalies;
}
__name(inferSessionAnomalies, "inferSessionAnomalies");
function deduplicateAnomalies(anomalies) {
  const seen = /* @__PURE__ */ new Set();
  return anomalies.filter((item) => {
    const key = `${item.kind}|${item.session_id}|${item.event_id}|${item.fingerprint}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
__name(deduplicateAnomalies, "deduplicateAnomalies");
function analyzeEvents(events, { reportDate = "unknown", baseline = {} } = {}) {
  const sessions = groupSessions(events);
  const anomalies = deduplicateAnomalies([...sessions.values()].flatMap(inferSessionAnomalies));
  const actionCount = events.filter((event) => event.type === "action.intent").length;
  const completedSessions = [...sessions.values()].filter((timeline) => timeline.some((event) => event.type === "session.ended" || event.type === "game.session.completed")).length;
  const counts = {};
  for (const item of anomalies) counts[item.kind] = (counts[item.kind] || 0) + 1;
  const affectedSessions = new Set(anomalies.map((item) => item.session_id)).size;
  const versions = {};
  for (const event of events) versions[event.app_version || "unknown"] = (versions[event.app_version || "unknown"] || 0) + 1;
  const fingerprintGroups = /* @__PURE__ */ new Map();
  for (const item of anomalies) {
    if (!fingerprintGroups.has(item.fingerprint)) fingerprintGroups.set(item.fingerprint, []);
    fingerprintGroups.get(item.fingerprint).push(item);
  }
  const topFingerprints = [...fingerprintGroups.entries()].map(([fingerprint, items]) => ({
    fingerprint,
    kind: items[0].kind,
    severity: items[0].severity,
    count: items.length,
    affected_sessions: new Set(items.map((item) => item.session_id)).size,
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
__name(analyzeEvents, "analyzeEvents");
function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}
__name(percent, "percent");
function buildDailyReport(analysis) {
  const lines = [
    `# Lucky Learning World \u2014 Daily Session Analysis ${analysis.report_date}`,
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
__name(buildDailyReport, "buildDailyReport");
function bangkokDayBounds(now = /* @__PURE__ */ new Date()) {
  const bangkokNow = new Date(now.getTime() + 7 * 60 * 60 * 1e3);
  const previous = new Date(Date.UTC(bangkokNow.getUTCFullYear(), bangkokNow.getUTCMonth(), bangkokNow.getUTCDate() - 1));
  const reportDate = previous.toISOString().slice(0, 10);
  const start = /* @__PURE__ */ new Date(`${reportDate}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1e3);
  return { reportDate, start: start.toISOString(), end: end.toISOString() };
}
__name(bangkokDayBounds, "bangkokDayBounds");

// worker.js
var MAX_BODY_BYTES = 64 * 1024;
var MAX_BATCH_EVENTS = 50;
var RATE_LIMIT_MAX = 120;
var RATE_LIMIT_WINDOW_MS = 60 * 1e3;
var IDENTIFIER = /^[a-zA-Z0-9:._-]{1,160}$/;
var EVENT_TYPE = /^[a-z0-9:._-]{1,80}$/;
var rateState = /* @__PURE__ */ new Map();
function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "https://usov-andrey.github.io").split(",").map((value) => value.trim()).filter(Boolean);
}
__name(allowedOrigins, "allowedOrigins");
function isOriginAllowed(origin, env = {}) {
  if (!origin) return false;
  return allowedOrigins(env).some((allowed) => origin === allowed || allowed.endsWith(":*") && origin.startsWith(allowed.slice(0, -1)));
}
__name(isOriginAllowed, "isOriginAllowed");
function corsHeaders(origin, env) {
  const allowed = isOriginAllowed(origin, env) ? origin : allowedOrigins(env)[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
function json(body, status, origin, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin, env) }
  });
}
__name(json, "json");
function rateLimited(request) {
  const key = request.headers.get("CF-Connecting-IP") || "anonymous";
  const now = Date.now();
  const current = rateState.get(key);
  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateState.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}
__name(rateLimited, "rateLimited");
var ALLOWED_METADATA = /* @__PURE__ */ new Set([
  "action_source",
  "enabled",
  "visible",
  "from",
  "to",
  "transition",
  "reason",
  "sentinel",
  "resource_path",
  "resource_kind",
  "status",
  "lesson_id",
  "mode",
  "item_index",
  "total_items",
  "realm",
  "result",
  "error_fingerprint",
  "error_kind",
  "device_class",
  "viewport_class",
  "initial_screen",
  "service_worker_version",
  "queue_size",
  "sent",
  "retried",
  "dropped",
  "rejected",
  "input_length",
  "correct",
  "audio_kind",
  "build_timestamp",
  "previous_action_id",
  "sla_ms",
  "level_id",
  "event_type",
  "requeued",
  "character_id"
]);
function sanitizeServerMetadata(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_METADATA.has(key)) continue;
    if (typeof value === "boolean") output[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) output[key] = value;
    else if (typeof value === "string") output[key] = key === "resource_path" ? value.split("?")[0].slice(0, 180) : value.replace(/[^a-zA-Z0-9:._/-]/g, "-").slice(0, 160);
  }
  return output;
}
__name(sanitizeServerMetadata, "sanitizeServerMetadata");
function validateEvent(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) return "event must be an object";
  if (event.schema_version !== 1) return "unsupported schema_version";
  for (const field of ["event_id", "session_id"]) {
    if (typeof event[field] !== "string" || !IDENTIFIER.test(event[field])) return `${field} is invalid`;
  }
  if (!Number.isInteger(event.sequence) || event.sequence < 1) return "sequence is invalid";
  if (!event.occurred_at || Number.isNaN(Date.parse(event.occurred_at))) return "occurred_at is invalid";
  if (typeof event.type !== "string" || !EVENT_TYPE.test(event.type)) return "type is invalid";
  if (typeof event.screen !== "string" || !EVENT_TYPE.test(event.screen)) return "screen is invalid";
  if (typeof event.app_version !== "string" || event.app_version.length > 32) return "app_version is invalid";
  if (typeof event.channel !== "string" || !EVENT_TYPE.test(event.channel)) return "channel is invalid";
  if (event.action_id != null && !IDENTIFIER.test(event.action_id)) return "action_id is invalid";
  if (event.target_id != null && !IDENTIFIER.test(event.target_id)) return "target_id is invalid";
  if (event.latency_ms != null && (!Number.isInteger(event.latency_ms) || event.latency_ms < 0 || event.latency_ms > 36e5)) return "latency_ms is invalid";
  const safe = sanitizeServerMetadata(event.metadata);
  if (JSON.stringify(safe) !== JSON.stringify(event.metadata || {})) return "metadata contains disallowed or invalid fields";
  return null;
}
__name(validateEvent, "validateEvent");
function validateBatch(payload) {
  if (!payload || typeof payload !== "object" || payload.schema_version !== 1) return "unsupported payload schema";
  if (!Array.isArray(payload.events) || payload.events.length < 1 || payload.events.length > MAX_BATCH_EVENTS) return "events batch size is invalid";
  for (const event of payload.events) {
    const error = validateEvent(event);
    if (error) return error;
  }
  return null;
}
__name(validateBatch, "validateBatch");
function legacyErrorEvent(payload) {
  const fingerprint = String(payload?.fingerprint || "legacy-client-error").replace(/[^a-zA-Z0-9:._-]/g, "-").slice(0, 160) || "legacy-client-error";
  const timestamp = payload?.timestamp && !Number.isNaN(Date.parse(payload.timestamp)) ? new Date(payload.timestamp).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return {
    schema_version: 1,
    event_id: `evt_legacy_${nonce}`,
    session_id: `ses_legacy_${nonce}`,
    sequence: 1,
    occurred_at: timestamp,
    app_version: String(payload?.appVersion || "legacy").slice(0, 32),
    channel: "stable",
    type: "error.runtime",
    screen: "unknown",
    result: "failed",
    metadata: { error_fingerprint: fingerprint, error_kind: "legacy-client" }
  };
}
__name(legacyErrorEvent, "legacyErrorEvent");
async function ingestEvents(events, env) {
  const receivedAt = (/* @__PURE__ */ new Date()).toISOString();
  const statements = [];
  for (const event of events) {
    const meta = sanitizeServerMetadata(event.metadata);
    const ended = event.type === "session.ended" || event.type === "game.session.completed";
    statements.push(env.DB.prepare(`
      INSERT INTO sessions (session_id, started_at, last_seen_at, ended_at, app_version, channel, device_class, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        last_seen_at = excluded.last_seen_at,
        ended_at = COALESCE(excluded.ended_at, sessions.ended_at),
        app_version = excluded.app_version,
        status = CASE WHEN excluded.status = 'completed' THEN 'completed' ELSE sessions.status END
    `).bind(
      event.session_id,
      event.occurred_at,
      event.occurred_at,
      ended ? event.occurred_at : null,
      event.app_version,
      event.channel,
      meta.device_class || null,
      ended ? "completed" : "active"
    ));
    statements.push(env.DB.prepare(`
      INSERT OR IGNORE INTO events
      (event_id, session_id, sequence, client_time, received_at, app_version, channel, type, screen, action_id, target_id, result, latency_ms, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event.event_id,
      event.session_id,
      event.sequence,
      event.occurred_at,
      receivedAt,
      event.app_version,
      event.channel,
      event.type,
      event.screen,
      event.action_id || null,
      event.target_id || null,
      event.result || null,
      event.latency_ms || null,
      JSON.stringify(meta)
    ));
  }
  await env.DB.batch(statements);
  return { accepted: events.length };
}
__name(ingestEvents, "ingestEvents");
async function readEvents(env, start, end) {
  const result = await env.DB.prepare(`
    SELECT event_id, session_id, sequence, client_time AS occurred_at, app_version, channel,
           type, screen, action_id, target_id, result, latency_ms, payload_json
    FROM events WHERE client_time >= ? AND client_time < ? AND channel = 'stable'
    ORDER BY session_id, sequence, client_time
  `).bind(start, end).all();
  return (result.results || []).map((row) => ({ ...row, metadata: sanitizeServerMetadata(JSON.parse(row.payload_json || "{}")) }));
}
__name(readEvents, "readEvents");
async function githubRequest(env, path, init = {}) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return null;
  return fetch(`https://api.github.com/repos/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "lucky-learning-observability",
      "Content-Type": "application/json",
      ...init.headers || {}
    }
  });
}
__name(githubRequest, "githubRequest");
async function ensureDailyLabel(env) {
  const response = await githubRequest(env, "/labels", {
    method: "POST",
    body: JSON.stringify({ name: "telemetry-daily", color: "6f42c1", description: "Automated daily session anomaly analysis" })
  });
  if (response && !response.ok && response.status !== 422) throw new Error(`label-${response.status}`);
}
__name(ensureDailyLabel, "ensureDailyLabel");
async function publishDailyIssue(env, reportDate, markdown, existingNumber = null) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return null;
  await ensureDailyLabel(env);
  const title = `[telemetry] Daily session analysis ${reportDate}`;
  if (existingNumber) {
    const response2 = await githubRequest(env, `/issues/${existingNumber}`, {
      method: "PATCH",
      body: JSON.stringify({ title, body: markdown, labels: ["telemetry-daily"] })
    });
    if (!response2.ok) throw new Error(`issue-update-${response2.status}`);
    return existingNumber;
  }
  const response = await githubRequest(env, "/issues", {
    method: "POST",
    body: JSON.stringify({ title, body: markdown, labels: ["telemetry-daily"] })
  });
  if (!response.ok) throw new Error(`issue-create-${response.status}`);
  return (await response.json()).number;
}
__name(publishDailyIssue, "publishDailyIssue");
async function generateDailyReport(env, now = /* @__PURE__ */ new Date()) {
  const { reportDate, start, end } = bangkokDayBounds(now);
  const events = await readEvents(env, start, end);
  const analysis = analyzeEvents(events, { reportDate });
  const markdown = buildDailyReport(analysis);
  const existing = await env.DB.prepare("SELECT github_issue_number FROM daily_reports WHERE report_date = ?").bind(reportDate).first();
  const issueNumber = await publishDailyIssue(env, reportDate, markdown, existing?.github_issue_number || null);
  await env.DB.prepare(`
    INSERT INTO daily_reports (report_date, generated_at, metrics_json, markdown, github_issue_number)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(report_date) DO UPDATE SET generated_at = excluded.generated_at,
      metrics_json = excluded.metrics_json, markdown = excluded.markdown,
      github_issue_number = COALESCE(excluded.github_issue_number, daily_reports.github_issue_number)
  `).bind(reportDate, (/* @__PURE__ */ new Date()).toISOString(), JSON.stringify(analysis), markdown, issueNumber).run();
  await env.DB.prepare("DELETE FROM events WHERE client_time < datetime('now', '-30 days')").run();
  await env.DB.prepare("DELETE FROM daily_reports WHERE report_date < date('now', '-180 days')").run();
  return { reportDate, issueNumber, analysis };
}
__name(generateDailyReport, "generateDailyReport");
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (request.method === "OPTIONS") {
    if (!isOriginAllowed(origin, env)) return json({ error: "origin not allowed" }, 403, origin, env);
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }
  if (url.pathname === "/health" && request.method === "GET") {
    return json({ ok: true, service: "lucky-learning-observability", schema_version: 1 }, 200, origin, env);
  }
  const isLegacyError = url.pathname === "/" && request.method === "POST";
  if (!["/v1/events", "/v1/errors"].includes(url.pathname) && !isLegacyError) {
    return json({ error: "not found" }, 404, origin, env);
  }
  if (request.method !== "POST") return json({ error: "not found" }, 404, origin, env);
  if (!isOriginAllowed(origin, env)) return json({ error: "origin not allowed" }, 403, origin, env);
  if (rateLimited(request)) return json({ error: "rate limited" }, 429, origin, env);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "payload too large" }, 413, origin, env);
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "invalid JSON" }, 400, origin, env);
  }
  if (isLegacyError) payload = { schema_version: 1, events: [legacyErrorEvent(payload)] };
  const validationError = validateBatch(payload);
  if (validationError) return json({ error: validationError }, 422, origin, env);
  const result = await ingestEvents(payload.events, env);
  return json({ ok: true, ...result }, 202, origin, env);
}
__name(handleRequest, "handleRequest");
var worker_default = {
  fetch(request, env) {
    return handleRequest(request, env).catch(() => json({ error: "internal error" }, 500, request.headers.get("Origin") || "", env));
  },
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(generateDailyReport(env));
  }
};

// C:/Users/Andrey/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/Andrey/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/middleware-scheduled.ts
var scheduled = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  const url = new URL(request.url);
  if (url.pathname === "/__scheduled") {
    const cron = url.searchParams.get("cron") ?? "";
    await middlewareCtx.dispatch("scheduled", { cron });
    return new Response("Ran scheduled event");
  }
  const resp = await middlewareCtx.next(request, env);
  if (request.headers.get("referer")?.endsWith("/__scheduled") && url.pathname === "/favicon.ico" && resp.status === 500) {
    return new Response(null, { status: 404 });
  }
  return resp;
}, "scheduled");
var middleware_scheduled_default = scheduled;

// .wrangler/tmp/bundle-ZOGOXN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_scheduled_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/Andrey/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ZOGOXN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
  generateDailyReport,
  handleRequest,
  ingestEvents,
  isOriginAllowed,
  sanitizeServerMetadata,
  validateBatch,
  validateEvent
};
//# sourceMappingURL=worker.js.map
