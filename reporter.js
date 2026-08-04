// Privacy-safe early error adapter. Loaded before ES modules so module/resource
// failures are captured without collecting user-entered text or application state.
(function () {
  "use strict";

  var QUEUE_KEY = "lmm:telemetry:early:v1";
  var SESSION_KEY = "lmm:telemetry:session:v1";
  var SEQUENCE_KEY = "lmm:telemetry:early-sequence:v1";
  var MAX_QUEUE = 50;
  var config = (typeof window !== "undefined" && (window.LMM_TELEMETRY || window.LMM_REPORTER)) || {};
  var endpoint = String(config.endpoint || "").replace(/\/$/, "");
  var channel = safeEnum(config.channel || "stable");
  var breadcrumbs = [];

  function safeEnum(value) {
    return String(value == null ? "unknown" : value)
      .toLowerCase()
      .replace(/[^a-z0-9:._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "unknown";
  }

  function stableHash(input) {
    var value = String(input == null ? "" : input);
    var hash = 5381;
    for (var i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }

  function randomId(prefix) {
    try {
      if (window.crypto && window.crypto.randomUUID) return prefix + "_" + window.crypto.randomUUID();
    } catch (e) {}
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
  }

  function readJson(storage, key, fallback) {
    try {
      var parsed = JSON.parse(storage.getItem(key) || "null");
      return parsed == null ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function getSessionId() {
    try {
      var existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var created = randomId("ses");
      sessionStorage.setItem(SESSION_KEY, created);
      return created;
    } catch (e) {
      return randomId("ses");
    }
  }

  function nextSequence() {
    try {
      var value = Number(sessionStorage.getItem(SEQUENCE_KEY) || 0) + 1;
      sessionStorage.setItem(SEQUENCE_KEY, String(value));
      return value;
    } catch (e) {
      return Date.now();
    }
  }

  function releaseVersion() {
    try {
      var scriptUrl = new URL(document.currentScript.src);
      return scriptUrl.searchParams.get("v") || "unknown";
    } catch (e) {
      return "unknown";
    }
  }

  function resourcePath(raw) {
    try {
      return new URL(raw, location.href).pathname.slice(0, 180);
    } catch (e) {
      return "unknown";
    }
  }

  function buildEvent(type, extra) {
    extra = extra || {};
    var event = {
      schema_version: 1,
      event_id: randomId("evt"),
      session_id: getSessionId(),
      sequence: nextSequence(),
      occurred_at: new Date().toISOString(),
      app_version: releaseVersion(),
      channel: channel,
      type: safeEnum(type),
      screen: safeEnum(extra.screen || "early-runtime"),
      metadata: {
        error_fingerprint: String(extra.error_fingerprint || "00000000").slice(0, 64),
        error_kind: safeEnum(extra.error_kind || "runtime")
      }
    };
    if (extra.resource_path) event.metadata.resource_path = resourcePath(extra.resource_path);
    if (extra.resource_kind) event.metadata.resource_kind = safeEnum(extra.resource_kind);
    return event;
  }

  function enqueue(event) {
    try {
      var queue = readJson(localStorage, QUEUE_KEY, []);
      queue.push(event);
      while (queue.length > MAX_QUEUE) queue.shift();
      writeJson(localStorage, QUEUE_KEY, queue);
    } catch (e) {}
  }

  function removeSent(ids) {
    try {
      var wanted = {};
      ids.forEach(function (id) { wanted[id] = true; });
      var queue = readJson(localStorage, QUEUE_KEY, []);
      writeJson(localStorage, QUEUE_KEY, queue.filter(function (event) { return !wanted[event.event_id]; }));
    } catch (e) {}
  }

  function flush() {
    if (!endpoint || typeof fetch !== "function") return;
    var queue;
    try { queue = readJson(localStorage, QUEUE_KEY, []).slice(0, 20); } catch (e) { queue = []; }
    if (!queue.length) return;
    fetch(endpoint + "/v1/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema_version: 1, events: queue }),
      keepalive: true
    }).then(function (response) {
      if (response.ok) removeSent(queue.map(function (event) { return event.event_id; }));
    }).catch(function () {});
  }

  function capture(type, signature, extra) {
    var event = buildEvent(type, Object.assign({}, extra || {}, { error_fingerprint: stableHash(signature) }));
    enqueue(event);
    flush();
  }

  try {
    window.addEventListener("error", function (event) {
      try {
        var target = event.target;
        if (target && target !== window && (target.src || target.href)) {
          var path = target.src || target.href;
          capture("resource.failed", path + "|" + target.tagName, {
            error_kind: "resource",
            resource_path: path,
            resource_kind: target.tagName || "resource"
          });
          return;
        }
        capture("runtime.error", String(event.message || "unknown") + "|" + String(event.filename || "") + "|" + String(event.lineno || 0), {
          error_kind: "uncaught"
        });
      } catch (e) {}
    }, true);

    window.addEventListener("unhandledrejection", function (event) {
      try {
        var reason = event.reason;
        capture("runtime.unhandled_rejection", String(reason && reason.name || typeof reason), {
          error_kind: "unhandled-rejection"
        });
      } catch (e) {}
    });
  } catch (e) {}

  window.__lmmReporter = {
    capturesFailures: true,
    breadcrumb: function (type, data) {
      breadcrumbs.push({ t: Date.now(), type: safeEnum(type), target_id: safeEnum(data && (data.target_id || data.screen) || "unknown") });
      while (breadcrumbs.length > 30) breadcrumbs.shift();
    },
    report: function (payload) {
      capture("runtime.error", String(payload && payload.message || "manual"), { error_kind: "manual" });
    },
    getBreadcrumbs: function () { return breadcrumbs.slice(); }
  };

  flush();
})();
