import { CacheEntry } from './types';

class MetricsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cacheDuration: number;

  constructor(cacheDuration: number) {
    this.cacheDuration = cacheDuration;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data as T;
    }
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const metricsCache = new MetricsCache(5 * 60 * 1000); // 5 minutes