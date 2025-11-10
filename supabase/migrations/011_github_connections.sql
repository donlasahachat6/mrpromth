-- GitHub Connections Table
-- Stores GitHub OAuth tokens for users

CREATE TABLE IF NOT EXISTS github_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  github_user_id TEXT NOT NULL,
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  avatar_url TEXT,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_github_connections_user_id ON github_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_github_user_id ON github_connections(github_user_id);

-- RLS Policies
ALTER TABLE github_connections ENABLE ROW LEVEL SECURITY;

-- Users can only read their own GitHub connection
CREATE POLICY "Users can view own GitHub connection"
  ON github_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own GitHub connection
CREATE POLICY "Users can insert own GitHub connection"
  ON github_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own GitHub connection
CREATE POLICY "Users can update own GitHub connection"
  ON github_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own GitHub connection
CREATE POLICY "Users can delete own GitHub connection"
  ON github_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_github_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER github_connections_updated_at
  BEFORE UPDATE ON github_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_github_connections_updated_at();
