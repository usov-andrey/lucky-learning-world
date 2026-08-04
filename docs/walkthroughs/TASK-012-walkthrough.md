# TASK-012 Walkthrough: Single-Source Build Metadata

Released in `v1.4.0` on 2026-08-04.

- `build-info.js` is now the only runtime source for version and UTC build timestamp.
- Parent diagnostics format the label directly from that module.
- The historical `2026-07-27` overwrite was removed.
- Release automation and exact tests now keep build metadata, cache busters, and the service-worker cache aligned.
