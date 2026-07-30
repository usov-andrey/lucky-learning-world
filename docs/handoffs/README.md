# Handoffs

This directory stores durable context transfers between agents or work sessions.

- Prefer `YYYY-MM-DD-<topic>-handoff.md`; a task key may replace the date when it is the primary identifier.
- Record the goal and current status, decisions and assumptions, changed files and commits, verification, and remaining work or blockers.
- Keep the handoff self-contained, concise, and free of secrets, personal data, internal URLs, tokens, and runtime output.
- Use worklogs, proposals, and task specifications for their own purposes; a handoff is the current operational context needed to resume work safely.

## Sensitive handoffs

If a handoff contains personal data, credentials, internal URLs, or other sensitive information, do not add it to Git. Store it under `docs/handoffs/local/`, which is ignored, and ask the user for explicit confirmation before sharing, committing, or moving it to the tracked handoff directory. When in doubt, treat the handoff as sensitive.

## Sensitive handoffs

If a handoff contains personal data, credentials, internal URLs, or other sensitive information, do not add it to Git. Store it under `docs/handoffs/local/`, which is ignored, and ask the user for explicit confirmation before sharing, committing, or moving it to the tracked handoff directory. When in doubt, treat the handoff as sensitive.
