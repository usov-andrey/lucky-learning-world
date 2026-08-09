/**
 * Authoritative release metadata. Updated only by scripts/release.mjs.
 */
export const APP_VERSION = "v1.7.1";
// The value committed here is whatever `scripts/release.mjs` recorded on the machine
// that ran it. The GitHub Pages deploy workflow re-stamps this field with the CI
// runner's own (NTP-accurate) clock right before publishing — see
// scripts/stamp-deploy-timestamp.mjs and TASK-022 — so what ships to production
// reflects the true deploy instant even if the release was run on a clock-drifted
// dev/agent sandbox.
export const BUILD_TIMESTAMP = "2026-08-09T03:40:22.798Z";

// Lucky is in Thailand: show the build time in Bangkok local time (Asia/Bangkok,
// UTC+7, no DST) rather than UTC, so it matches what she and her parent actually see
// on the clock.
export function formatBuildLabel(version = APP_VERSION, timestamp = BUILD_TIMESTAMP) {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return `${version} (unknown build time)`;
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(parsed).map(part => [part.type, part.value])
  );
  const normalized = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} ICT`;
  return `${version} (${normalized})`;
}
