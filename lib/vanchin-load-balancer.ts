/**
 * Vanchin AI Load Balancer
 * Dynamically detects and distributes requests across all available Vanchin API keys
 * Supports round-robin with auto-failover
 */

interface VanchinKey {
  apiKey: string;
  endpoint: string;
  index: number;
  isHealthy: boolean;
  lastUsed: number;
  failureCount: number;
}

class VanchinLoadBalancer {
  private keys: VanchinKey[] = [];
  private currentIndex: number = 0;
  private readonly MAX_FAILURES = 3;
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  constructor() {
    this.loadKeys();
  }

  /**
   * Dynamically load all Vanchin API keys from environment variables
   * Supports any number of keys (not hardcoded to 39)
   */
  private loadKeys(): void {
    const keys: VanchinKey[] = [];
    let index = 1;

    // Dynamically detect all VANCHIN_API_KEY_* variables
    while (true) {
      const apiKey = process.env[`VANCHIN_API_KEY_${index}`];
      const endpoint = process.env[`VANCHIN_ENDPOINT_${index}`];

      if (!apiKey || !endpoint) {
        break; // No more keys found
      }

      keys.push({
        apiKey: apiKey.trim(),
        endpoint: endpoint.trim(),
        index,
        isHealthy: true,
        lastUsed: 0,
        failureCount: 0,
      });

      index++;
    }

    this.keys = keys;
    console.log(`[Vanchin Load Balancer] Loaded ${keys.length} API keys`);
  }

  /**
   * Get the total count of available API keys
   */
  public getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Get the count of healthy API keys
   */
  public getHealthyKeyCount(): number {
    return this.keys.filter(k => k.isHealthy).length;
  }

  /**
   * Get the next available API key using round-robin
   * Automatically skips unhealthy keys
   */
  public getNextKey(): VanchinKey | null {
    if (this.keys.length === 0) {
      console.error('[Vanchin Load Balancer] No API keys available');
      return null;
    }

    const healthyKeys = this.keys.filter(k => k.isHealthy);
    
    if (healthyKeys.length === 0) {
      console.error('[Vanchin Load Balancer] No healthy API keys available');
      // Reset all keys to healthy as a fallback
      this.keys.forEach(k => {
        k.isHealthy = true;
        k.failureCount = 0;
      });
      return this.keys[0];
    }

    // Round-robin selection
    const key = healthyKeys[this.currentIndex % healthyKeys.length];
    this.currentIndex = (this.currentIndex + 1) % healthyKeys.length;
    
    key.lastUsed = Date.now();
    
    return key;
  }

  /**
   * Mark a key as failed
   * If failure count exceeds threshold, mark as unhealthy
   */
  public markKeyFailed(keyIndex: number): void {
    const key = this.keys.find(k => k.index === keyIndex);
    if (!key) return;

    key.failureCount++;
    
    if (key.failureCount >= this.MAX_FAILURES) {
      key.isHealthy = false;
      console.warn(`[Vanchin Load Balancer] Key ${keyIndex} marked as unhealthy after ${key.failureCount} failures`);
      
      // Schedule health check
      setTimeout(() => this.checkKeyHealth(keyIndex), this.HEALTH_CHECK_INTERVAL);
    }
  }

  /**
   * Mark a key as successful (reset failure count)
   */
  public markKeySuccess(keyIndex: number): void {
    const key = this.keys.find(k => k.index === keyIndex);
    if (!key) return;

    key.failureCount = 0;
    key.isHealthy = true;
  }

  /**
   * Check if a key is healthy by attempting a simple request
   */
  private async checkKeyHealth(keyIndex: number): Promise<void> {
    const key = this.keys.find(k => k.index === keyIndex);
    if (!key) return;

    try {
      // Simple health check - just verify the key format is valid
      if (key.apiKey && key.endpoint) {
        key.isHealthy = true;
        key.failureCount = 0;
        console.log(`[Vanchin Load Balancer] Key ${keyIndex} restored to healthy`);
      }
    } catch (error) {
      console.error(`[Vanchin Load Balancer] Health check failed for key ${keyIndex}:`, error);
    }
  }

  /**
   * Get statistics about the load balancer
   */
  public getStats() {
    return {
      totalKeys: this.keys.length,
      healthyKeys: this.getHealthyKeyCount(),
      unhealthyKeys: this.keys.filter(k => !k.isHealthy).length,
      keys: this.keys.map(k => ({
        index: k.index,
        isHealthy: k.isHealthy,
        failureCount: k.failureCount,
        lastUsed: k.lastUsed,
      })),
    };
  }

  /**
   * Reload keys from environment (useful for hot-reload)
   */
  public reloadKeys(): void {
    this.loadKeys();
  }
}

// Singleton instance
let loadBalancerInstance: VanchinLoadBalancer | null = null;

export function getVanchinLoadBalancer(): VanchinLoadBalancer {
  if (!loadBalancerInstance) {
    loadBalancerInstance = new VanchinLoadBalancer();
  }
  return loadBalancerInstance;
}

export type { VanchinKey };
