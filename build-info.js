/**
 * Authoritative release metadata. Updated only by scripts/release.mjs.
 */
export const APP_VERSION = "v1.4.0";
export const BUILD_TIMESTAMP = "2026-08-04T13:10:31Z";

export function formatBuildLabel(version = APP_VERSION, timestamp = BUILD_TIMESTAMP) {
  const parsed = new Date(timestamp);
  const normalized = Number.isNaN(parsed.getTime())
    ? "unknown build time"
    : `${parsed.toISOString().slice(0, 16).replace("T", " ")} UTC`;
  return `${version} (${normalized})`;
}
