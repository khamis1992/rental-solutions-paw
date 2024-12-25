export interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}