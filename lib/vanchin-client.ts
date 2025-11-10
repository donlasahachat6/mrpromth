/**
 * Vanchin AI Client
 * Wrapper for calling Vanchin API with load balancing and error handling
 */

import { getVanchinLoadBalancer } from './vanchin-load-balancer';

const VANCHIN_BASE_URL = (process.env.VANCHIN_BASE_URL || 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints').trim();

export interface VanchinChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface VanchinChatRequest {
  messages: VanchinChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface VanchinChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call Vanchin API with automatic load balancing and failover
 */
export async function callVanchinAPI(
  request: VanchinChatRequest,
  maxRetries: number = 3
): Promise<VanchinChatResponse> {
  const loadBalancer = getVanchinLoadBalancer();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const key = loadBalancer.getNextKey();
    
    if (!key) {
      throw new Error('No Vanchin API keys available');
    }

    try {
      const url = `${VANCHIN_BASE_URL}/chat/completions`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          model: key.endpoint,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vanchin API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Mark key as successful
      loadBalancer.markKeySuccess(key.index);
      
      return data;
    } catch (error) {
      console.error(`[Vanchin Client] Attempt ${attempt + 1} failed with key ${key.index}:`, error);
      
      // Mark key as failed
      loadBalancer.markKeyFailed(key.index);
      
      lastError = error as Error;
      
      // If this is not the last attempt, continue to next key
      if (attempt < maxRetries - 1) {
        continue;
      }
    }
  }

  throw new Error(`Failed to call Vanchin API after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Call Vanchin API with streaming support
 */
export async function* streamVanchinAPI(
  request: VanchinChatRequest
): AsyncGenerator<string, void, unknown> {
  const loadBalancer = getVanchinLoadBalancer();
  const key = loadBalancer.getNextKey();
  
  if (!key) {
    throw new Error('No Vanchin API keys available');
  }

  try {
    const url = `${VANCHIN_BASE_URL}/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key.apiKey}`,
      },
      body: JSON.stringify({
        ...request,
        model: key.endpoint,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vanchin API error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed === '' || trimmed === 'data: [DONE]') {
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (error) {
            console.error('[Vanchin Client] Failed to parse SSE data:', error);
          }
        }
      }
    }

    // Mark key as successful
    loadBalancer.markKeySuccess(key.index);
  } catch (error) {
    console.error(`[Vanchin Client] Streaming failed with key ${key.index}:`, error);
    loadBalancer.markKeyFailed(key.index);
    throw error;
  }
}

/**
 * Get available model count (number of API keys)
 */
export function getAvailableModelCount(): number {
  const loadBalancer = getVanchinLoadBalancer();
  return loadBalancer.getKeyCount();
}

/**
 * Get load balancer statistics
 */
export function getLoadBalancerStats() {
  const loadBalancer = getVanchinLoadBalancer();
  return loadBalancer.getStats();
}
