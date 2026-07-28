// reporter.js — browser adapter for the Lucky Games error reporter.
//
// Loaded as a CLASSIC script (NOT a module), deliberately, so it is installed
// and its handlers are live before the game's ES modules evaluate — that is the
// only way to catch a module that fails to load. It has no imports.
//
// The createReporterCore() function below is a byte-for-byte copy of the
// canonical, unit-tested source at platform/reporter/reporter-core.js. When the
// core changes, re-sync this copy. Do not edit the core logic here directly.
//
// EVERYTHING is wrapped in try/catch: a bug in the reporter must never affect
// the game. If anything throws, the game keeps running as if the reporter were
// not present.
//
// Config comes from a tiny inline snippet in each game's index.html:
//   window.LMM_REPORTER = { endpoint, channel, version }
// endpoint === "" -> queue-only mode (no network); payloads are stored and
// retried on the next page load once an endpoint is set.
(function () {
  "use strict";

  // ==========================================================================
  // BEGIN copy of reporter-core.js (keep in sync with the canonical source)
  // ==========================================================================
  var STATE_KEY_PATTERN = /^lmm/;
  var RESERVED_KEY_PATTERN = /^lmm:reporter:/;

  function stableHash(input) {
    var str = String(input == null ? "" : input);
    var hash = 5381;
    for (var i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }

  function topStackFrame(stack) {
    if (!stack || typeof stack !== "string") {
      return "";
    }
    var lines = stack
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);
    var frame = lines.find(function (line) {
      return line.startsWith("at ") || /@|:\d+:\d+/.test(line);
    });
    return frame || lines[0] || "";
  }

  function normalizeChannel(raw) {
    var value = raw == null ? "" : String(raw);
    if (!value || value === "%%CHANNEL%%") {
      return "stable";
    }
    return value;
  }

  function createReporterCore(options) {
    options = options || {};
    var config = options.config || {};
    var clock = options.clock || { now: function () { return Date.now(); }, iso: function () { return new Date().toISOString(); } };
    var storage = options.storage || null;
    var transport = options.transport || null;
    var env = options.env || function () { return {}; };
    var maxBreadcrumbs = options.maxBreadcrumbs || 30;
    var maxQueue = options.maxQueue || 20;

    var channel = normalizeChannel(config.channel);
    var queueKey = "lmm:reporter:q:" + channel;

    var breadcrumbs = [];
    var currentScreen = "";

    function safeEnv() {
      try {
        var result = env();
        return result && typeof result === "object" ? result : {};
      } catch (e) {
        return {};
      }
    }

    function pushBreadcrumb(type, data) {
      breadcrumbs.push({ t: clock.now(), type: String(type || ""), data: data == null ? null : data });
      while (breadcrumbs.length > maxBreadcrumbs) {
        breadcrumbs.shift();
      }
      if (type === "nav" && data && typeof data.screen === "string") {
        currentScreen = data.screen;
      }
    }

    function getBreadcrumbs() {
      return breadcrumbs.slice();
    }

    function fingerprintFor(message, stack) {
      return stableHash(String(message || "") + "|" + topStackFrame(stack) + "|" + channel);
    }

    function snapshotState() {
      var out = {};
      if (!storage || typeof storage.keys !== "function") {
        return out;
      }
      var keys;
      try {
        keys = storage.keys() || [];
      } catch (e) {
        return out;
      }
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (!STATE_KEY_PATTERN.test(key) || RESERVED_KEY_PATTERN.test(key)) {
          continue;
        }
        try {
          out[key] = storage.getItem(key);
        } catch (e) {
          /* skip an unreadable key */
        }
      }
      return out;
    }

    function buildPayload(input) {
      input = input || {};
      var environment = safeEnv();
      var message = String(input.message == null ? "" : input.message);
      var stack = input.stack == null ? "" : String(input.stack);
      var payload = {
        message: message,
        stack: stack,
        fingerprint: fingerprintFor(message, stack),
        version: config.version || "",
        channel: channel,
        screen: currentScreen,
        breadcrumbs: getBreadcrumbs(),
        state: snapshotState(),
        userAgent: environment.userAgent || "",
        viewport: environment.viewport || { width: 0, height: 0 },
        timestamp: clock.iso(),
      };
      if (input.extra != null) {
        payload.extra = input.extra;
      }
      return payload;
    }

    function readQueue() {
      if (!storage) {
        return [];
      }
      try {
        var raw = storage.getItem(queueKey);
        if (!raw) {
          return [];
        }
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function writeQueue(list) {
      if (!storage) {
        return;
      }
      try {
        storage.setItem(queueKey, JSON.stringify(list));
      } catch (e) {
        /* storage full or unavailable */
      }
    }

    function enqueue(payload) {
      var list = readQueue();
      list.push(payload);
      while (list.length > maxQueue) {
        list.shift();
      }
      writeQueue(list);
      return list.length;
    }

    async function flushQueue(sendFn) {
      var send = sendFn || transport;
      var list = readQueue();
      if (typeof send !== "function" || list.length === 0) {
        return { sent: 0, remaining: list.length };
      }
      var remaining = [];
      var sent = 0;
      for (var i = 0; i < list.length; i += 1) {
        try {
          await send(list[i]);
          sent += 1;
        } catch (e) {
          remaining.push(list[i]);
        }
      }
      writeQueue(remaining);
      return { sent: sent, remaining: remaining.length };
    }

    async function report(input) {
      var payload;
      try {
        payload = buildPayload(input);
      } catch (e) {
        return { ok: false };
      }
      if (typeof transport !== "function") {
        enqueue(payload);
        return { ok: false, queued: true };
      }
      try {
        await transport(payload);
        return { ok: true };
      } catch (e) {
        enqueue(payload);
        return { ok: false, queued: true };
      }
    }

    return {
      pushBreadcrumb: pushBreadcrumb,
      getBreadcrumbs: getBreadcrumbs,
      fingerprintFor: fingerprintFor,
      buildPayload: buildPayload,
      enqueue: enqueue,
      readQueue: readQueue,
      flushQueue: flushQueue,
      report: report,
      get currentScreen() {
        return currentScreen;
      },
      get queueKey() {
        return queueKey;
      },
    };
  }
  // ==========================================================================
  // END copy of reporter-core.js
  // ==========================================================================

  // --- Browser wiring --------------------------------------------------------
  // Any failure in here is swallowed so the game is never affected.
  try {
    var config = (typeof window !== "undefined" && window.LMM_REPORTER) || {};
    var endpoint = config.endpoint || "";

    // localStorage adapter that also enumerates keys for the state snapshot.
    var storage = null;
    try {
      var ls = window.localStorage;
      storage = {
        getItem: function (k) { return ls.getItem(k); },
        setItem: function (k, v) { ls.setItem(k, v); },
        removeItem: function (k) { ls.removeItem(k); },
        keys: function () {
          var out = [];
          for (var i = 0; i < ls.length; i += 1) {
            out.push(ls.key(i));
          }
          return out;
        },
      };
    } catch (e) {
      storage = null; // Safari private mode etc.
    }

    // Network transport: POST JSON to the Worker. Absent endpoint -> null,
    // which puts the core into queue-only mode.
    var transport = null;
    if (endpoint) {
      transport = function (payload) {
        return fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).then(function (response) {
          if (!response.ok) {
            throw new Error("reporter POST failed: " + response.status);
          }
        });
      };
    }

    var core = createReporterCore({
      config: { channel: config.channel || "", version: config.version || "" },
      storage: storage,
      transport: transport,
      env: function () {
        return {
          userAgent: (typeof navigator !== "undefined" && navigator.userAgent) || "",
          viewport: {
            width: (typeof window !== "undefined" && window.innerWidth) || 0,
            height: (typeof window !== "undefined" && window.innerHeight) || 0,
          },
        };
      },
    });

    function safeReport(input) {
      try {
        // report() returns a promise; swallow rejections defensively.
        var p = core.report(input);
        if (p && typeof p.catch === "function") {
          p.catch(function () {});
        }
      } catch (e) {
        /* never let the reporter throw into the game */
      }
    }

    // window.onerror — classic runtime errors, incl. errors thrown while a
    // module evaluates.
    try {
      window.addEventListener("error", function (event) {
        try {
          // Resource/script load failures: event.target is the element and
          // there is no event.error. This catches a module that fails to load.
          var target = event.target;
          if (target && (target.tagName === "SCRIPT" || target.tagName === "LINK") && target.src !== undefined) {
            safeReport({
              message: "Resource load error: " + (target.src || target.href || target.tagName),
              stack: "",
              extra: { kind: "resource", tag: target.tagName },
            });
            return;
          }
          var error = event.error;
          safeReport({
            message: (error && error.message) || event.message || "Unknown error",
            stack: (error && error.stack) || "",
            extra: { kind: "error", source: event.filename, line: event.lineno, col: event.colno },
          });
        } catch (e) {
          /* ignore */
        }
      }, true); // capture phase — required to see resource load errors
    } catch (e) {
      /* ignore */
    }

    // Unhandled promise rejections.
    try {
      window.addEventListener("unhandledrejection", function (event) {
        try {
          var reason = event.reason;
          var message = reason && reason.message ? reason.message : String(reason);
          safeReport({
            message: "Unhandled rejection: " + message,
            stack: (reason && reason.stack) || "",
            extra: { kind: "unhandledrejection" },
          });
        } catch (e) {
          /* ignore */
        }
      });
    } catch (e) {
      /* ignore */
    }

    // Public API for the game: breadcrumbs and manual reports.
    window.__lmmReporter = {
      breadcrumb: function (type, data) {
        try {
          core.pushBreadcrumb(type, data);
        } catch (e) {
          /* ignore */
        }
      },
      report: function (payload) {
        safeReport(payload);
      },
    };

    // Retry anything queued on a previous (offline) load, once we have an
    // endpoint. Runs after the current tick so it never blocks page load.
    if (endpoint) {
      try {
        setTimeout(function () {
          try {
            var p = core.flushQueue();
            if (p && typeof p.catch === "function") {
              p.catch(function () {});
            }
          } catch (e) {
            /* ignore */
          }
        }, 0);
      } catch (e) {
        /* ignore */
      }
    }
  } catch (e) {
    // The reporter failed to install. Ensure the game still finds a no-op API.
    try {
      if (!window.__lmmReporter) {
        window.__lmmReporter = { breadcrumb: function () {}, report: function () {} };
      }
    } catch (e2) {
      /* nothing more we can do */
    }
  }
})();
