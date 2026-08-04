# TASK-012 Implementation Plan: Single-Source Build Version and Date

1. Introduce `build-info.js` as the authoritative application version and UTC build timestamp.
2. Render diagnostics from that module and keep HTML as a non-authoritative loading placeholder.
3. Extend release automation and exact tests so version/date/cache metadata cannot diverge again.
4. Ship the correction in `v1.4.0` with TASK-011.
