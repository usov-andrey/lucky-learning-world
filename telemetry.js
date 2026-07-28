/**
 * Automated Client Telemetry & Diagnostics Logger for Lucky's Learning World
 * Automatically captures errors, console output, PWA SW status, and UI lifecycle logs.
 * Persists sliding buffer in localStorage['lucky_telemetry_logs'].
 */
export class ClientTelemetry {
  static LOG_KEY = "lucky_telemetry_logs";
  static MAX_ENTRIES = 100;

  static log(level, message, details = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      details,
      url: typeof window !== "undefined" ? window.location.href : "node",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "node"
    };

    try {
      const existing = JSON.parse(localStorage.getItem(ClientTelemetry.LOG_KEY) || "[]");
      existing.push(entry);
      if (existing.length > ClientTelemetry.MAX_ENTRIES) {
        existing.shift();
      }
      localStorage.setItem(ClientTelemetry.LOG_KEY, JSON.stringify(existing));
    } catch {}

    if (level === "error") {
      console.error(`[Telemetry] ${message}`, details || "");
    }
  }

  static getLogs() {
    try {
      return JSON.parse(localStorage.getItem(ClientTelemetry.LOG_KEY) || "[]");
    } catch {
      return [];
    }
  }

  static clearLogs() {
    try {
      localStorage.removeItem(ClientTelemetry.LOG_KEY);
    } catch {}
  }

  static initAutoCapture() {
    if (typeof window === "undefined") return;

    // Intercept uncaught errors
    window.onerror = function (msg, url, line, col, error) {
      ClientTelemetry.log("error", `Uncaught Exception: ${msg}`, { url, line, col, stack: error?.stack });
    };

    // Intercept unhandled promise rejections
    window.onunhandledrejection = function (e) {
      ClientTelemetry.log("error", `Unhandled Rejection: ${e.reason}`, { reason: String(e.reason) });
    };

    // Log page load lifecycle event
    ClientTelemetry.log("info", "Client Session Started", {
      path: window.location.pathname,
      referrer: document.referrer,
      screen: `${window.innerWidth}x${window.innerHeight}`
    });
  }
}

// Auto-initialize telemetry on script load
ClientTelemetry.initAutoCapture();
