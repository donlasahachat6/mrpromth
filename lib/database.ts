import { createClient } from '@supabase/supabase-js'
import { unifiedDb, isSupabaseConfigured } from './database/unified-db'
import { ENV } from '@/lib/env'

// Get Supabase configuration
const { url: supabaseUrl, anonKey: supabaseAnonKey } = ENV.getSupabaseConfig();
const { serviceRoleKey: supabaseServiceRoleKey } = ENV.getServiceRoleConfig();

// Ensure Supabase is configured (skip during build)
if (!ENV.isBuildTime()) {
  isSupabaseConfigured();
}

// Export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServiceRoleSupabaseClient() {
  // During build time, return placeholder client
  if (ENV.isBuildTime()) {
    return createClient('https://placeholder.supabase.co', 'placeholder-service-key');
  }
  
  if (!ENV.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Service role key not configured');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

// Chat Sessions
export async function createChatSession(userId: string, title?: string) {
  return await unifiedDb.createChatSession(userId, title);
}

export async function getChatSessions(userId: string) {
  return await unifiedDb.getChatSessions(userId);
}

export async function getChatSession(sessionId: string) {
  return await unifiedDb.getChatSession(sessionId);
}

export async function updateChatSession(sessionId: string, updates: { title?: string; metadata?: any }) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChatSession(sessionId: string) {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// Messages
export async function saveMessage(
  sessionId: string,
  sender: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
) {
  return await unifiedDb.createChatMessage(sessionId, sender, content);
}

export async function getMessages(sessionId: string) {
  return await unifiedDb.getChatMessages(sessionId);
}

// Prompts
export async function createPrompt(
  userId: string,
  title: string,
  content: string,
  description?: string,
  tags?: string[],
  isPublic?: boolean
) {
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: userId,
      title,
      content,
      description: description || '',
      tags: tags || [],
      is_public: isPublic || false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPrompts(userId: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPrompt(promptId: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single();

  if (error) throw error;
  return data;
}

export async function updatePrompt(
  promptId: string,
  updates: {
    title?: string;
    content?: string;
    description?: string;
    tags?: string[];
    is_public?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', promptId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePrompt(promptId: string) {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId);

  if (error) throw error;
}

// API Keys
export async function saveApiKey(
  userId: string,
  provider: string,
  encryptedKey: string,
  displayName?: string
) {
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      provider,
      encrypted_key: encryptedKey,
      display_name: displayName || provider
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getApiKeys(userId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getApiKey(keyId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApiKey(keyId: string) {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId);

  if (error) throw error;
}

// User Profiles
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    display_name?: string;
    avatar_url?: string;
    preferences?: any;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
