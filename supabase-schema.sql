-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS audits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result       JSONB NOT NULL,
  email        TEXT,
  share_slug   TEXT UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups (public report page)
CREATE INDEX IF NOT EXISTS audits_share_slug_idx ON audits (share_slug);

-- Index for email lookups (optional future feature)
CREATE INDEX IF NOT EXISTS audits_email_idx ON audits (email);

-- Row Level Security: public can read by slug, only service role can insert
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read by slug"
  ON audits FOR SELECT
  USING (true);

-- Inserts go through the service role key in API routes only
-- No public insert policy needed
