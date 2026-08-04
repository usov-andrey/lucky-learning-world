/**
 * Privacy-safe production session observability for Lucky Learning World.
 * No user-entered text, names, PINs, URLs, raw storage, IPs, or fingerprints
 * are accepted into the event contract.
 */
import { APP_VERSION, BUILD_TIMESTAMP } from "./build-info.js";

export const TELEMETRY_SCHEMA_VERSION = 1;
export const TELEMETRY_QUEUE_KEY = "lmm:telemetry:q:v1";
export const TELEMETRY_SESSION_KEY = "lmm:telemetry:session:v1";
export const TELEMETRY_EARLY_QUEUE_KEY = "lmm:telemetry:early:v1";
export const MAX_QUEUE_EVENTS = 500;
export const MAX_BATCH_EVENTS = 50;
export const MAX_BATCH_BYTES = 64 * 1024;
export const MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const DEFAULT_ACTION_SLA_MS = 750;

const CRITICAL_TYPES = new Set([
  "runtime.error",
  "runtime.unhandled_rejection",
  "resource.failed",
  "render.invalid",
  "action.timed_out",
  "anomaly.repeated_activation",
  "anomaly.duplicate_outcome"
]);

const SAFE_META_KEYS = new Set([
  "action_source", "enabled", "visible", "from", "to", "transition", "reason",
  "sentinel", "resource_path", "resource_kind", "status", "lesson_id", "mode",
  "item_index", "total_items", "realm", "result", "error_fingerprint", "error_kind",
  "device_class", "viewport_class", "initial_screen", "service_worker_version",
  "queue_size", "sent", "retried", "dropped", "rejected", "input_length",
  "correct", "audio_kind", "build_timestamp", "previous_action_id", "sla_ms",
  "level_id", "event_type", "requeued", "character_id"
]);

const INVALID_SENTINEL_PATTERN = /(?:^|\s)(undefined|null|NaN|\[object Object\])(?:$|\s|[.,:;!?])/;

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  try {
    if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  } catch {}
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function safeStorage(kind = "localStorage") {
  try {
    const storage = globalThis[kind];
    const probe = "__lmm_telemetry_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function safeTargetId(value) {
  return String(value || "unknown")
    .replace(/[^a-zA-Z0-9:_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || "unknown";
}

function safeEnum(value, fallback = "unknown") {
  const normalized = String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z0-9:._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return normalized || fallback;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function fingerprint(value) {
  const input = String(value == null ? "" : value);
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function sanitizeMetadata(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output = {};
  for (const [key, rawValue] of Object.entries(input)) {
    if (!SAFE_META_KEYS.has(key)) continue;
    if (typeof rawValue === "boolean") output[key] = rawValue;
    else if (typeof rawValue === "number") {
      const number = safeNumber(rawValue);
      if (number !== undefined) output[key] = number;
    } else if (typeof rawValue === "string") {
      output[key] = key === "resource_path"
        ? rawValue.split("?")[0].slice(0, 180)
        : safeEnum(rawValue);
    }
  }
  return output;
}

export function findInvalidSentinel(value) {
  const text = String(value == null ? value : value);
  const match = text.match(INVALID_SENTINEL_PATTERN);
  if (match) return match[1];
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "number" && Number.isNaN(value)) return "NaN";
  return null;
}

export function normalizeDeviceClass(width) {
  const value = Number(width) || 0;
  if (value <= 767) return "phone";
  if (value <= 1180) return "tablet";
  return "desktop";
}

function loadJson(storage, key, fallback) {
  if (!storage) return fallback;
  try {
    const value = JSON.parse(storage.getItem(key) || "null");
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function saveJson(storage, key, value) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function createTelemetryEvent({
  sessionId,
  sequence,
  type,
  screen = "unknown",
  actionId = null,
  targetId = null,
  result = null,
  latencyMs = null,
  metadata = {},
  occurredAt = nowIso(),
  version = APP_VERSION,
  channel = "stable"
}) {
  const event = {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    event_id: randomId("evt"),
    session_id: safeTargetId(sessionId),
    sequence: Number(sequence),
    occurred_at: occurredAt,
    app_version: String(version).slice(0, 32),
    channel: safeEnum(channel, "stable"),
    type: safeEnum(type),
    screen: safeEnum(screen)
  };
  if (actionId) event.action_id = safeTargetId(actionId);
  if (targetId) event.target_id = safeTargetId(targetId);
  if (result) event.result = safeEnum(result);
  const latency = safeNumber(latencyMs);
  if (latency !== undefined && latency >= 0) event.latency_ms = Math.round(latency);
  const safeMetadata = sanitizeMetadata(metadata);
  if (Object.keys(safeMetadata).length) event.metadata = safeMetadata;
  return event;
}

export class ClientTelemetry {
  static initialized = false;
  static enabled = true;
  static endpoint = "";
  static channel = "stable";
  static version = APP_VERSION;
  static buildTimestamp = BUILD_TIMESTAMP;
  static sessionId = "";
  static sequence = 0;
  static screen = "unknown";
  static queue = [];
  static pendingActions = new Map();
  static lastActionByTarget = new Map();
  static lastTouchIntent = null;
  static flushTimer = null;
  static heartbeatTimer = null;
  static retryTimer = null;
  static retryAttempt = 0;
  static transport = null;
  static testRuntime = false;
  static health = { queued: 0, sent: 0, retried: 0, dropped: 0, rejected: 0, last_success_at: null };

  static configure(config = {}) {
    const globalConfig = typeof window !== "undefined"
      ? (window.LMM_TELEMETRY || {})
      : {};
    const merged = { ...globalConfig, ...config };
    ClientTelemetry.enabled = merged.enabled !== false;
    ClientTelemetry.endpoint = String(merged.endpoint || "").replace(/\/$/, "");
    ClientTelemetry.channel = safeEnum(merged.channel || "stable", "stable");
    ClientTelemetry.version = String(merged.version || APP_VERSION).slice(0, 32);
    ClientTelemetry.buildTimestamp = String(merged.buildTimestamp || BUILD_TIMESTAMP).slice(0, 40);
    if (typeof merged.transport === "function") ClientTelemetry.transport = merged.transport;
  }

  static initAutoCapture(config = {}) {
    if (ClientTelemetry.initialized || typeof window === "undefined" || typeof document === "undefined") return;
    ClientTelemetry.initialized = true;
    ClientTelemetry.configure(config);

    const local = safeStorage("localStorage");
    const session = safeStorage("sessionStorage");
    ClientTelemetry.sessionId = session?.getItem(TELEMETRY_SESSION_KEY) || randomId("ses");
    try { session?.setItem(TELEMETRY_SESSION_KEY, ClientTelemetry.sessionId); } catch {}

    const storedQueue = loadJson(local, TELEMETRY_QUEUE_KEY, []);
    const earlyQueue = loadJson(local, TELEMETRY_EARLY_QUEUE_KEY, []);
    ClientTelemetry.queue = [...storedQueue, ...earlyQueue]
      .filter(event => event && Date.now() - Date.parse(event.occurred_at || 0) <= MAX_EVENT_AGE_MS)
      .slice(-MAX_QUEUE_EVENTS);
    ClientTelemetry.sequence = ClientTelemetry.queue
      .filter(event => event.session_id === ClientTelemetry.sessionId)
      .reduce((maximum, event) => Math.max(maximum, Number(event.sequence) || 0), 0);
    try { local?.removeItem(TELEMETRY_EARLY_QUEUE_KEY); } catch {}

    ClientTelemetry.captureInteractions();
    ClientTelemetry.captureLifecycle();
    ClientTelemetry.captureFailures();
    ClientTelemetry.monitorInvalidRenders();

    const activeScreen = document.querySelector(".screen.active")?.id || "initial";
    ClientTelemetry.screen = safeEnum(activeScreen);
    ClientTelemetry.emit("session.started", {
      device_class: normalizeDeviceClass(window.innerWidth),
      viewport_class: `${normalizeDeviceClass(window.innerWidth)}-viewport`,
      initial_screen: ClientTelemetry.screen,
      service_worker_version: "unknown",
      build_timestamp: ClientTelemetry.buildTimestamp
    });

    const isTestRuntime = String(window.navigator?.userAgent || "").toLowerCase().includes("jsdom") ||
      (typeof process !== "undefined" && Boolean(process.versions?.node));
    ClientTelemetry.testRuntime = isTestRuntime;
    if (!isTestRuntime) {
      ClientTelemetry.flushTimer = window.setInterval(() => ClientTelemetry.flush(), 10000);
      ClientTelemetry.heartbeatTimer = window.setInterval(() => {
        if (document.visibilityState === "visible") ClientTelemetry.emit("session.heartbeat");
      }, 30000);
    }
    if (ClientTelemetry.queue.length) ClientTelemetry.flush();
  }

  static emit(type, metadata = {}, context = {}) {
    if (!ClientTelemetry.enabled) return null;
    const event = createTelemetryEvent({
      sessionId: ClientTelemetry.sessionId || randomId("ses"),
      sequence: ++ClientTelemetry.sequence,
      type,
      screen: context.screen || ClientTelemetry.screen,
      actionId: context.actionId,
      targetId: context.targetId,
      result: context.result,
      latencyMs: context.latencyMs,
      metadata,
      version: ClientTelemetry.version,
      channel: ClientTelemetry.channel
    });
    ClientTelemetry.enqueue(event);
    if (CRITICAL_TYPES.has(event.type)) ClientTelemetry.flush();
    return event;
  }

  static enqueue(event) {
    const lowPriority = item => item?.type === "session.heartbeat";
    while (ClientTelemetry.queue.length >= MAX_QUEUE_EVENTS) {
      const removable = ClientTelemetry.queue.findIndex(lowPriority);
      ClientTelemetry.queue.splice(removable >= 0 ? removable : 0, 1);
      ClientTelemetry.health.dropped += 1;
    }
    ClientTelemetry.queue.push(event);
    ClientTelemetry.health.queued = ClientTelemetry.queue.length;
    saveJson(safeStorage("localStorage"), TELEMETRY_QUEUE_KEY, ClientTelemetry.queue);
    if (ClientTelemetry.queue.length >= MAX_BATCH_EVENTS) ClientTelemetry.flush();
  }

  static nextBatch() {
    const batch = [];
    let bytes = 0;
    for (const event of ClientTelemetry.queue) {
      const size = JSON.stringify(event).length;
      if (batch.length && (batch.length >= MAX_BATCH_EVENTS || bytes + size > MAX_BATCH_BYTES)) break;
      if (size > MAX_BATCH_BYTES) {
        ClientTelemetry.health.rejected += 1;
        continue;
      }
      batch.push(event);
      bytes += size;
    }
    return batch;
  }

  static async flush({ beacon = false } = {}) {
    if (ClientTelemetry.testRuntime && !ClientTelemetry.transport) return { sent: 0, test: true };
    if (!ClientTelemetry.enabled || !ClientTelemetry.endpoint || !ClientTelemetry.queue.length) return { sent: 0 };
    const events = ClientTelemetry.nextBatch();
    if (!events.length) return { sent: 0 };
    const payload = JSON.stringify({ schema_version: TELEMETRY_SCHEMA_VERSION, events });
    const endpoint = `${ClientTelemetry.endpoint}/v1/events`;

    try {
      let accepted = false;
      if (beacon && typeof navigator?.sendBeacon === "function") {
        accepted = navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
      } else if (ClientTelemetry.transport) {
        await ClientTelemetry.transport(endpoint, payload);
        accepted = true;
      } else {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true
        });
        if (!response.ok) throw new Error(`telemetry-http-${response.status}`);
        accepted = true;
      }
      if (!accepted) throw new Error("telemetry-beacon-rejected");

      const sentIds = new Set(events.map(event => event.event_id));
      ClientTelemetry.queue = ClientTelemetry.queue.filter(event => !sentIds.has(event.event_id));
      ClientTelemetry.health.sent += events.length;
      ClientTelemetry.health.queued = ClientTelemetry.queue.length;
      ClientTelemetry.health.last_success_at = nowIso();
      ClientTelemetry.retryAttempt = 0;
      saveJson(safeStorage("localStorage"), TELEMETRY_QUEUE_KEY, ClientTelemetry.queue);
      return { sent: events.length };
    } catch {
      ClientTelemetry.health.retried += events.length;
      ClientTelemetry.retryAttempt += 1;
      ClientTelemetry.scheduleRetry();
      return { sent: 0, retry: true };
    }
  }

  static scheduleRetry() {
    if (ClientTelemetry.testRuntime || typeof window === "undefined" || ClientTelemetry.retryTimer) return;
    const delay = Math.min(60000, 1000 * (2 ** Math.min(ClientTelemetry.retryAttempt, 6)));
    ClientTelemetry.retryTimer = window.setTimeout(async () => {
      ClientTelemetry.retryTimer = null;
      await ClientTelemetry.flush();
    }, delay);
  }

  static captureInteractions() {
    const actionable = "button,[role='button'],[data-action],.nav-item,.realm-action-btn,.answer-btn,.tile-btn,.chip-btn,.lesson-card";
    const handler = event => {
      const target = event.target?.closest?.(actionable);
      if (!target) return;
      const source = event.type === "pointerdown" ? safeEnum(event.pointerType || "pointer") : (event.detail === 0 ? "keyboard" : "mouse");
      const targetId = ClientTelemetry.describeTarget(target);

      if (event.type === "pointerdown" && !["touch", "pen"].includes(source)) return;
      if (event.type === "click" && ClientTelemetry.lastTouchIntent &&
          ClientTelemetry.lastTouchIntent.targetId === targetId &&
          Date.now() - ClientTelemetry.lastTouchIntent.time < 900) return;

      if (event.type === "pointerdown") ClientTelemetry.lastTouchIntent = { targetId, time: Date.now() };
      ClientTelemetry.startAction(targetId, source, target);
    };
    document.addEventListener("pointerdown", handler, true);
    document.addEventListener("click", handler, true);
  }

  static describeTarget(element) {
    return safeTargetId(
      element?.dataset?.action ||
      element?.id ||
      element?.dataset?.lessonId ||
      element?.dataset?.spellingMode ||
      element?.dataset?.mathLevel ||
      element?.dataset?.mathChoice ||
      `${String(element?.tagName || "control").toLowerCase()}:${element?.getAttribute?.("role") || element?.classList?.[0] || "unknown"}`
    );
  }

  static startAction(targetId, source, element = null) {
    const startedAt = Date.now();
    const actionId = randomId("act");
    const previous = ClientTelemetry.lastActionByTarget.get(targetId);
    if (previous && startedAt - previous.startedAt <= 2000 && previous.outcome !== "completed") {
      ClientTelemetry.emit("anomaly.repeated_activation", {
        previous_action_id: previous.actionId,
        reason: "previous-action-without-completion"
      }, { actionId, targetId });
    }

    const pending = { actionId, targetId, startedAt, outcome: null, timer: null };
    pending.timer = setTimeout(() => {
      if (!ClientTelemetry.pendingActions.has(actionId)) return;
      ClientTelemetry.pendingActions.delete(actionId);
      pending.outcome = "timed-out";
      ClientTelemetry.lastActionByTarget.set(targetId, pending);
      ClientTelemetry.emit("action.timed_out", { reason: "no-semantic-outcome", sla_ms: DEFAULT_ACTION_SLA_MS }, {
        actionId,
        targetId,
        result: "timed-out",
        latencyMs: Date.now() - startedAt
      });
    }, DEFAULT_ACTION_SLA_MS);
    ClientTelemetry.pendingActions.set(actionId, pending);
    ClientTelemetry.lastActionByTarget.set(targetId, pending);
    ClientTelemetry.emit("action.intent", {
      action_source: source,
      enabled: !Boolean(element?.disabled),
      visible: element ? element.getClientRects?.().length > 0 || !element.hidden : true
    }, { actionId, targetId });
    return actionId;
  }

  static latestPendingAction() {
    return [...ClientTelemetry.pendingActions.values()].sort((a, b) => b.startedAt - a.startedAt)[0] || null;
  }

  static resolveAction(outcome, metadata = {}, explicitActionId = null) {
    const pending = explicitActionId
      ? ClientTelemetry.pendingActions.get(explicitActionId)
      : ClientTelemetry.latestPendingAction();
    if (!pending) return null;
    if (pending.outcome) {
      ClientTelemetry.emit("anomaly.duplicate_outcome", { reason: "multiple-outcomes" }, {
        actionId: pending.actionId,
        targetId: pending.targetId
      });
      return pending.actionId;
    }
    clearTimeout(pending.timer);
    pending.outcome = outcome;
    ClientTelemetry.pendingActions.delete(pending.actionId);
    ClientTelemetry.lastActionByTarget.set(pending.targetId, pending);
    ClientTelemetry.emit(`action.${outcome}`, metadata, {
      actionId: pending.actionId,
      targetId: pending.targetId,
      result: outcome,
      latencyMs: Date.now() - pending.startedAt
    });
    return pending.actionId;
  }

  static transition(transition, from, to, metadata = {}) {
    const pending = ClientTelemetry.latestPendingAction();
    const actionId = pending?.actionId || null;
    ClientTelemetry.emit("state.transition", { transition, from, to, ...metadata }, { actionId });
    if (transition === "screen") ClientTelemetry.screen = safeEnum(to);
    if (pending) ClientTelemetry.resolveAction("completed", { transition, from, to }, actionId);
  }

  static actionNoop(reason = "guarded") {
    return ClientTelemetry.resolveAction("noop", { reason });
  }

  static actionFailed(reason = "runtime-error") {
    return ClientTelemetry.resolveAction("failed", { reason });
  }

  static reportInvalidRender(value, targetId = "unknown", { required = false } = {}) {
    const sentinel = findInvalidSentinel(value) || (required && String(value || "").trim() === "" ? "empty-required" : null);
    if (!sentinel) return false;
    ClientTelemetry.emit("render.invalid", { sentinel }, { targetId });
    return true;
  }

  static monitorInvalidRenders() {
    if (typeof MutationObserver === "undefined" || !document.body) return;
    const inspect = node => {
      if (node.nodeType === 3) {
        const sentinel = findInvalidSentinel(node.nodeValue || "");
        if (sentinel) ClientTelemetry.reportInvalidRender(sentinel, ClientTelemetry.describeTarget(node.parentElement));
      } else if (node.nodeType === 1) {
        for (const textNode of node.querySelectorAll?.("*") || []) {
          const directText = [...textNode.childNodes].filter(child => child.nodeType === 3).map(child => child.nodeValue).join(" ");
          const sentinel = findInvalidSentinel(directText);
          if (sentinel) ClientTelemetry.reportInvalidRender(sentinel, ClientTelemetry.describeTarget(textNode));
        }
      }
    };
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") inspect(record.target);
        for (const node of record.addedNodes || []) inspect(node);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  }

  static captureLifecycle() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        ClientTelemetry.emit("session.hidden");
        ClientTelemetry.flush({ beacon: true });
      } else {
        ClientTelemetry.emit("session.resumed");
      }
    });
    window.addEventListener("pagehide", () => {
      ClientTelemetry.emit("session.ended");
      ClientTelemetry.flush({ beacon: true });
    });
  }

  static captureFailures() {
    if (window.__lmmReporter?.capturesFailures) return;
    window.addEventListener("error", event => {
      const target = event.target;
      if (target && target !== window) {
        const rawPath = target.src || target.href || "unknown";
        ClientTelemetry.emit("resource.failed", {
          resource_path: (() => { try { return new URL(rawPath, location.href).pathname; } catch { return "unknown"; } })(),
          resource_kind: String(target.tagName || "resource").toLowerCase()
        });
        return;
      }
      const signature = `${event.message || "error"}|${event.filename || ""}|${event.lineno || 0}`;
      ClientTelemetry.emit("runtime.error", { error_fingerprint: fingerprint(signature), error_kind: "uncaught" });
      ClientTelemetry.actionFailed("runtime-error");
    }, true);
    window.addEventListener("unhandledrejection", event => {
      const reason = event.reason?.name || typeof event.reason;
      ClientTelemetry.emit("runtime.unhandled_rejection", {
        error_fingerprint: fingerprint(reason),
        error_kind: "unhandled-rejection"
      });
      ClientTelemetry.actionFailed("unhandled-rejection");
    });
  }

  static log(level, message, details = {}) {
    const type = level === "error" ? "runtime.error" : "diagnostic.event";
    const safeCode = safeEnum(message, "diagnostic");
    return ClientTelemetry.emit(type, {
      error_fingerprint: fingerprint(safeCode),
      error_kind: level === "error" ? "manual" : "diagnostic",
      ...sanitizeMetadata(details)
    });
  }

  static getLogs() {
    return ClientTelemetry.queue.slice();
  }

  static getHealth() {
    return { ...ClientTelemetry.health, queued: ClientTelemetry.queue.length };
  }

  static clearLogs() {
    ClientTelemetry.queue = [];
    ClientTelemetry.health.queued = 0;
    try { safeStorage("localStorage")?.removeItem(TELEMETRY_QUEUE_KEY); } catch {}
  }

  static resetForTests() {
    for (const pending of ClientTelemetry.pendingActions.values()) clearTimeout(pending.timer);
    ClientTelemetry.pendingActions.clear();
    ClientTelemetry.lastActionByTarget.clear();
    ClientTelemetry.queue = [];
    ClientTelemetry.sequence = 0;
    ClientTelemetry.sessionId = "ses_test";
    ClientTelemetry.screen = "test-screen";
    ClientTelemetry.transport = null;
    ClientTelemetry.testRuntime = false;
    ClientTelemetry.endpoint = "";
    ClientTelemetry.enabled = true;
    ClientTelemetry.health = { queued: 0, sent: 0, retried: 0, dropped: 0, rejected: 0, last_success_at: null };
  }
}

ClientTelemetry.initAutoCapture();
