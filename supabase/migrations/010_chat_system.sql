-- Chat System Tables
-- Supports multi-agent chat with different modes

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  mode TEXT DEFAULT 'chat', -- chat, code, project, debug
  agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  mode TEXT DEFAULT 'chat',
  agent_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Files Table (for attachments)
CREATE TABLE IF NOT EXISTS chat_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Usage Tracking
CREATE TABLE IF NOT EXISTS agent_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_files_session_id ON chat_files(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_id ON agent_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent_id ON agent_usage(agent_id);

-- RLS Policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;

-- Chat Sessions Policies
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Files Policies
CREATE POLICY "Users can view their own chat files"
  ON chat_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own chat files"
  ON chat_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat files"
  ON chat_files FOR DELETE
  USING (auth.uid() = user_id);

-- Agent Usage Policies
CREATE POLICY "Users can view their own agent usage"
  ON agent_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage agent usage"
  ON agent_usage FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update chat session timestamp
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session timestamp when new message is added
CREATE TRIGGER update_chat_session_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_timestamp();

-- Function to track agent usage
CREATE OR REPLACE FUNCTION track_agent_usage(
  p_agent_id TEXT,
  p_user_id UUID,
  p_endpoint TEXT,
  p_success BOOLEAN DEFAULT TRUE,
  p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO agent_usage (agent_id, user_id, endpoint, requests_count, success_count, error_count, total_tokens, last_used)
  VALUES (p_agent_id, p_user_id, p_endpoint, 1, CASE WHEN p_success THEN 1 ELSE 0 END, CASE WHEN p_success THEN 0 ELSE 1 END, p_tokens, NOW())
  ON CONFLICT (agent_id, user_id, endpoint)
  DO UPDATE SET
    requests_count = agent_usage.requests_count + 1,
    success_count = agent_usage.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    error_count = agent_usage.error_count + CASE WHEN p_success THEN 0 ELSE 1 END,
    total_tokens = agent_usage.total_tokens + p_tokens,
    last_used = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for agent usage
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_usage_unique 
  ON agent_usage(agent_id, user_id, endpoint);

COMMENT ON TABLE chat_sessions IS 'Stores chat conversation sessions';
COMMENT ON TABLE chat_messages IS 'Stores individual messages in chat sessions';
COMMENT ON TABLE chat_files IS 'Stores file attachments in chat';
COMMENT ON TABLE agent_usage IS 'Tracks usage statistics for AI agents';
