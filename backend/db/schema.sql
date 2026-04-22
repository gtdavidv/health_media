CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS articles (
  slug             TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  summary          TEXT,
  meta_description TEXT,
  og_image         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles (created_at DESC);

-- Full-text search: title weighted higher than summary
CREATE INDEX IF NOT EXISTS articles_fts_idx ON articles USING GIN (
  (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
   setweight(to_tsvector('english', coalesce(summary, '')), 'B'))
);

CREATE TABLE IF NOT EXISTS studies (
  id         SERIAL PRIMARY KEY,
  content    TEXT NOT NULL,
  embedding  vector(384),
  title      TEXT,
  url        TEXT,
  authors    TEXT,
  journal    TEXT,
  year       INTEGER,
  doi        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS studies_embedding_idx
  ON studies USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE IF NOT EXISTS guardrails (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  content    TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO guardrails (id, content) VALUES (1, 'You are a knowledgeable and empathetic health media assistant. Provide accurate, evidence-based information. Always recommend consulting healthcare professionals for medical decisions. Be sensitive to users in crisis situations. Do not make diagnostic assessments.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS pages (
  slug       TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  in_nav     BOOLEAN NOT NULL DEFAULT false,
  is_home    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pages_is_home_idx ON pages (is_home) WHERE is_home = true;
CREATE INDEX IF NOT EXISTS pages_in_nav_idx  ON pages (in_nav)  WHERE in_nav  = true;

CREATE TABLE IF NOT EXISTS page_views (
  id        SERIAL PRIMARY KEY,
  slug      TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_events (
  id            SERIAL PRIMARY KEY,
  message_count INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Health Media'),
  ('articles_heading', 'Health Media Articles'),
  ('articles_subtitle', 'Educational resources and information about health media')
ON CONFLICT (key) DO NOTHING;
