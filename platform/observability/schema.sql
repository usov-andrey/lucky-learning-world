CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  ended_at TEXT,
  app_version TEXT NOT NULL,
  channel TEXT NOT NULL,
  device_class TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  client_time TEXT NOT NULL,
  received_at TEXT NOT NULL,
  app_version TEXT NOT NULL,
  channel TEXT NOT NULL,
  type TEXT NOT NULL,
  screen TEXT NOT NULL,
  action_id TEXT,
  target_id TEXT,
  result TEXT,
  latency_ms INTEGER,
  payload_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_events_client_time ON events(client_time);
CREATE INDEX IF NOT EXISTS idx_events_session_sequence ON events(session_id, sequence);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

CREATE TABLE IF NOT EXISTS daily_reports (
  report_date TEXT PRIMARY KEY,
  generated_at TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  markdown TEXT NOT NULL,
  github_issue_number INTEGER
);

CREATE TABLE IF NOT EXISTS critical_fingerprints (
  fingerprint TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  occurrences INTEGER NOT NULL DEFAULT 1,
  github_issue_number INTEGER
);
