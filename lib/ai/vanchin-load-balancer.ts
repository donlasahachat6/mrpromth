// Vanchin AI Load Balancer - 39 API Key Pairs
// Automatically balances requests across all available endpoints

interface VanchinKeyPair {
  apiKey: string;
  endpoint: string;
  requestCount: number;
  lastUsed: number;
  isHealthy: boolean;
}

class VanchinLoadBalancer {
  private keyPairs: VanchinKeyPair[] = [];
  private currentIndex = 0;
  private baseUrl = process.env.VANCHIN_BASE_URL || 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints';

  constructor() {
    this.initializeKeyPairs();
  }

  private initializeKeyPairs() {
    // Load all 39 key pairs from environment variables
    for (let i = 1; i <= 39; i++) {
      const apiKey = process.env[`VANCHIN_API_KEY_${i}`];
      const endpoint = process.env[`VANCHIN_ENDPOINT_${i}`];

      if (apiKey && endpoint) {
        this.keyPairs.push({
          apiKey,
          endpoint,
          requestCount: 0,
          lastUsed: 0,
          isHealthy: true,
        });
      }
    }

    console.log(`✅ Vanchin Load Balancer initialized with ${this.keyPairs.length} key pairs`);
  }

  // Get next available key pair using round-robin strategy
  getNextKeyPair(): VanchinKeyPair | null {
    if (this.keyPairs.length === 0) {
      console.error('❌ No Vanchin API keys available');
      return null;
    }

    // Filter healthy keys
    const healthyKeys = this.keyPairs.filter(k => k.isHealthy);
    if (healthyKeys.length === 0) {
      console.warn('⚠️ No healthy keys, resetting all to healthy');
      this.keyPairs.forEach(k => k.isHealthy = true);
      return this.getNextKeyPair();
    }

    // Round-robin selection
    const keyPair = healthyKeys[this.currentIndex % healthyKeys.length];
    this.currentIndex = (this.currentIndex + 1) % healthyKeys.length;

    // Update usage stats
    keyPair.requestCount++;
    keyPair.lastUsed = Date.now();

    return keyPair;
  }

  // Get least used key pair
  getLeastUsedKeyPair(): VanchinKeyPair | null {
    const healthyKeys = this.keyPairs.filter(k => k.isHealthy);
    if (healthyKeys.length === 0) return null;

    return healthyKeys.reduce((least, current) => 
      current.requestCount < least.requestCount ? current : least
    );
  }

  // Mark key as unhealthy (e.g., after error)
  markUnhealthy(endpoint: string) {
    const keyPair = this.keyPairs.find(k => k.endpoint === endpoint);
    if (keyPair) {
      keyPair.isHealthy = false;
      console.warn(`⚠️ Marked endpoint ${endpoint} as unhealthy`);
      
      // Auto-recover after 5 minutes
      setTimeout(() => {
        keyPair.isHealthy = true;
        console.log(`✅ Endpoint ${endpoint} recovered`);
      }, 5 * 60 * 1000);
    }
  }

  // Get usage statistics
  getStats() {
    return {
      total: this.keyPairs.length,
      healthy: this.keyPairs.filter(k => k.isHealthy).length,
      totalRequests: this.keyPairs.reduce((sum, k) => sum + k.requestCount, 0),
      keyPairs: this.keyPairs.map(k => ({
        endpoint: k.endpoint.slice(-10),
        requests: k.requestCount,
        healthy: k.isHealthy,
        lastUsed: k.lastUsed ? new Date(k.lastUsed).toISOString() : 'never',
      })),
    };
  }

  // Make API call with automatic failover
  async call(messages: any[], options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}) {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const keyPair = this.getNextKeyPair();
      if (!keyPair) {
        throw new Error('No available Vanchin API keys');
      }

      try {
        const url = `${this.baseUrl}/${keyPair.endpoint}/chat/completions`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyPair.apiKey}`,
          },
          body: JSON.stringify({
            model: options.model || 'gpt-4o-mini',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: options.stream || false,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Vanchin API error: ${response.status} - ${error}`);
        }

        return response;
      } catch (error) {
        console.error(`❌ Attempt ${attempt + 1} failed with endpoint ${keyPair.endpoint}:`, error);
        lastError = error as Error;
        this.markUnhealthy(keyPair.endpoint);
        
        // Wait before retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw new Error(`All Vanchin API attempts failed: ${lastError?.message}`);
  }
}

// Singleton instance
export const vanchinLoadBalancer = new VanchinLoadBalancer();
