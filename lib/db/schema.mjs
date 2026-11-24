// Database schema. Applied automatically (idempotent) when the app connects,
// and by scripts/create-admin.mjs — plain JavaScript so both can import it.
// Money is stored in cents (integers) to avoid rounding errors.

/** @type {string} */
export const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  role            TEXT    NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  name            TEXT    NOT NULL,
  email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  phone           TEXT,
  client_type     TEXT,
  company         TEXT,
  nif             TEXT,
  city            TEXT,
  address         TEXT,
  locale          TEXT    NOT NULL DEFAULT 'pt',
  password_hash   TEXT    NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1,
  privacy_accepted_at TEXT,
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_login_at   TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS login_attempts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL COLLATE NOCASE,
  success     INTEGER NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS login_attempts_email ON login_attempts(email, created_at);

CREATE TABLE IF NOT EXISTS requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service     TEXT    NOT NULL,
  location    TEXT,
  description TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'novo'
              CHECK (status IN ('novo', 'em_analise', 'orcamentado', 'arquivado')),
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS requests_user ON requests(user_id);

CREATE TABLE IF NOT EXISTS quotes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  number         TEXT    NOT NULL UNIQUE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id     INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  title          TEXT    NOT NULL,
  location       TEXT,
  notes          TEXT,
  vat_rate       REAL    NOT NULL DEFAULT 23,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  vat_cents      INTEGER NOT NULL DEFAULT 0,
  total_cents    INTEGER NOT NULL DEFAULT 0,
  valid_until    TEXT,
  status         TEXT    NOT NULL DEFAULT 'rascunho'
                 CHECK (status IN ('rascunho', 'enviado', 'aceite', 'recusado', 'cancelado')),
  sent_at        TEXT,
  viewed_at      TEXT,
  decided_at     TEXT,
  decision_note  TEXT,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS quotes_user ON quotes(user_id);

CREATE TABLE IF NOT EXISTS quote_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id         INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  position         INTEGER NOT NULL,
  description      TEXT    NOT NULL,
  quantity         REAL    NOT NULL,
  unit             TEXT    NOT NULL,
  unit_price_cents INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS quote_items_quote ON quote_items(quote_id);

CREATE TABLE IF NOT EXISTS works (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id    INTEGER UNIQUE REFERENCES quotes(id) ON DELETE SET NULL,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  location    TEXT,
  status      TEXT    NOT NULL DEFAULT 'por_iniciar'
              CHECK (status IN ('por_iniciar', 'em_curso', 'concluida', 'cancelada')),
  start_date  TEXT,
  end_date    TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS works_user ON works(user_id);

CREATE TABLE IF NOT EXISTS work_updates (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id           INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  author_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message           TEXT    NOT NULL,
  visible_to_client INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS work_updates_work ON work_updates(work_id);

-- Full history of what happened (shown in the admin dashboard).
CREATE TABLE IF NOT EXISTS activity (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT    NOT NULL,
  entity      TEXT,
  entity_id   INTEGER,
  details     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS activity_client ON activity(client_id, created_at);
CREATE INDEX IF NOT EXISTS activity_created ON activity(created_at);
`;
