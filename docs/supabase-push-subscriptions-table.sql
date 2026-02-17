-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to enable push notifications for admin PWA/desktop.
-- Required for: new reservation notifications when the admin app is closed.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: allow RLS but permit service role (api uses service role key)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do all" ON push_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);
