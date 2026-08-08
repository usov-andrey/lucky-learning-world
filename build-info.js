/**
 * Authoritative release metadata. Updated only by scripts/release.mjs.
 */
export const APP_VERSION = "v1.6.0";
export const BUILD_TIMESTAMP = "2026-08-08T13:21:12.299Z";

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
