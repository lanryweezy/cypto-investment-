interface CacheItem<T = any> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem> = new Map();
  private maxSize: number;
  private cleanupInterval: number;

  private constructor(maxSize: number = 1000, cleanupInterval: number = 60000) { // 1000 items, cleanup every minute
    this.maxSize = maxSize;
    this.cleanupInterval = cleanupInterval;
    
    // Start periodic cleanup
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  public static getInstance(maxSize?: number, cleanupInterval?: number): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(maxSize, cleanupInterval);
    }
    return CacheService.instance;
  }

  public set<T = any>(key: string, value: T, ttl: number = 300000): void { // Default 5 minutes
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  public get<T = any>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getStats(): {
    size: number;
    maxSize: number;
    percentage: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      percentage: (this.cache.size / this.maxSize) * 100
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }

  public async getOrSet<T = any>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = 300000
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }
}

export const cacheService = CacheService.getInstance();