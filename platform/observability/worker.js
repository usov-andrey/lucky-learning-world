import { analyzeEvents, bangkokDayBounds, buildDailyReport } from "./analyzer.js";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_BATCH_EVENTS = 50;
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const IDENTIFIER = /^[a-zA-Z0-9:._-]{1,160}$/;
const EVENT_TYPE = /^[a-z0-9:._-]{1,80}$/;
const rateState = new Map();

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "https://usov-andrey.github.io")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin, env = {}) {
  if (!origin) return false;
  return allowedOrigins(env).some(allowed => origin === allowed || (allowed.endsWith(":*") && origin.startsWith(allowed.slice(0, -1))));
}

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

function json(body, status, origin, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin, env) }
  });
}

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

const ALLOWED_METADATA = new Set([
  "action_source", "enabled", "visible", "from", "to", "transition", "reason",
  "sentinel", "resource_path", "resource_kind", "status", "lesson_id", "mode",
  "item_index", "total_items", "realm", "result", "error_fingerprint", "error_kind",
  "device_class", "viewport_class", "initial_screen", "service_worker_version",
  "queue_size", "sent", "retried", "dropped", "rejected", "input_length", "correct",
  "audio_kind", "build_timestamp", "previous_action_id", "sla_ms", "level_id",
  "event_type", "requeued", "character_id"
]);

export function sanitizeServerMetadata(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_METADATA.has(key)) continue;
    if (typeof value === "boolean") output[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) output[key] = value;
    else if (typeof value === "string") output[key] = key === "resource_path"
      ? value.split("?")[0].slice(0, 180)
      : value.replace(/[^a-zA-Z0-9:._/-]/g, "-").slice(0, 160);
  }
  return output;
}

export function validateEvent(event) {
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
  if (event.latency_ms != null && (!Number.isInteger(event.latency_ms) || event.latency_ms < 0 || event.latency_ms > 3600000)) return "latency_ms is invalid";
  const safe = sanitizeServerMetadata(event.metadata);
  if (JSON.stringify(safe) !== JSON.stringify(event.metadata || {})) return "metadata contains disallowed or invalid fields";
  return null;
}

export function validateBatch(payload) {
  if (!payload || typeof payload !== "object" || payload.schema_version !== 1) return "unsupported payload schema";
  if (!Array.isArray(payload.events) || payload.events.length < 1 || payload.events.length > MAX_BATCH_EVENTS) return "events batch size is invalid";
  for (const event of payload.events) {
    const error = validateEvent(event);
    if (error) return error;
  }
  return null;
}

function legacyErrorEvent(payload) {
  const fingerprint = String(payload?.fingerprint || "legacy-client-error")
    .replace(/[^a-zA-Z0-9:._-]/g, "-")
    .slice(0, 160) || "legacy-client-error";
  const timestamp = payload?.timestamp && !Number.isNaN(Date.parse(payload.timestamp))
    ? new Date(payload.timestamp).toISOString()
    : new Date().toISOString();
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

export async function ingestEvents(events, env) {
  const receivedAt = new Date().toISOString();
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
      event.event_id, event.session_id, event.sequence, event.occurred_at, receivedAt,
      event.app_version, event.channel, event.type, event.screen, event.action_id || null,
      event.target_id || null, event.result || null, event.latency_ms || null, JSON.stringify(meta)
    ));
  }
  await env.DB.batch(statements);
  return { accepted: events.length };
}

async function readEvents(env, start, end) {
  const result = await env.DB.prepare(`
    SELECT event_id, session_id, sequence, client_time AS occurred_at, app_version, channel,
           type, screen, action_id, target_id, result, latency_ms, payload_json
    FROM events WHERE client_time >= ? AND client_time < ? AND channel = 'stable'
    ORDER BY session_id, sequence, client_time
  `).bind(start, end).all();
  return (result.results || []).map(row => ({ ...row, metadata: sanitizeServerMetadata(JSON.parse(row.payload_json || "{}")) }));
}

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
      ...(init.headers || {})
    }
  });
}

export async function ensureDailyLabel(env) {
  const response = await githubRequest(env, "/labels", {
    method: "POST",
    body: JSON.stringify({ name: "telemetry-daily", color: "6f42c1", description: "Automated daily session anomaly analysis" })
  });
  if (!response || response.ok || response.status === 422) return true;
  console.warn(`Daily telemetry label was not applied: label-${response.status}`);
  return false;
}

export async function publishDailyIssue(env, reportDate, markdown, existingNumber = null) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return null;
  const canApplyLabel = await ensureDailyLabel(env);
  const title = `[telemetry] Daily session analysis ${reportDate}`;
  if (existingNumber) {
    const update = { title, body: markdown };
    if (canApplyLabel) update.labels = ["telemetry-daily"];
    const response = await githubRequest(env, `/issues/${existingNumber}`, {
      method: "PATCH",
      body: JSON.stringify(update)
    });
    if (!response.ok) throw new Error(`issue-update-${response.status}`);
    return existingNumber;
  }
  const issue = { title, body: markdown };
  if (canApplyLabel) issue.labels = ["telemetry-daily"];
  const response = await githubRequest(env, "/issues", {
    method: "POST",
    body: JSON.stringify(issue)
  });
  if (!response.ok) throw new Error(`issue-create-${response.status}`);
  return (await response.json()).number;
}

export async function generateDailyReport(env, now = new Date()) {
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
  `).bind(reportDate, new Date().toISOString(), JSON.stringify(analysis), markdown, issueNumber).run();
  await env.DB.prepare("DELETE FROM events WHERE client_time < datetime('now', '-30 days')").run();
  await env.DB.prepare("DELETE FROM daily_reports WHERE report_date < date('now', '-180 days')").run();
  return { reportDate, issueNumber, analysis };
}

export async function handleRequest(request, env) {
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
  try { payload = JSON.parse(raw); } catch { return json({ error: "invalid JSON" }, 400, origin, env); }
  if (isLegacyError) payload = { schema_version: 1, events: [legacyErrorEvent(payload)] };
  const validationError = validateBatch(payload);
  if (validationError) return json({ error: validationError }, 422, origin, env);
  const result = await ingestEvents(payload.events, env);
  return json({ ok: true, ...result }, 202, origin, env);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env).catch(() => json({ error: "internal error" }, 500, request.headers.get("Origin") || "", env));
  },
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(generateDailyReport(env));
  }
};
