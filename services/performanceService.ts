/**
 * Performance Monitoring Service
 * Tracks app performance metrics and optimizations
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  category: 'api' | 'render' | 'cache' | 'storage';
}

interface PerformanceStats {
  totalMetrics: number;
  averageApiTime: number;
  averageRenderTime: number;
  cacheHitRate: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 500;
  private cacheHits = 0;
  private cacheMisses = 0;

  private constructor() {
    // Initialize performance observer if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) { // Only log slow operations
              console.log(`⏱️ Slow operation: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
            }
          }
        });
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        // Performance observer not supported
      }
    }
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    duration: number,
    category: 'api' | 'render' | 'cache' | 'storage'
  ): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      category,
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐢 Slow ${category}: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Get cache hit rate (0-100)
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 0;
    return (this.cacheHits / total) * 100;
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const apiMetrics = this.metrics.filter(m => m.category === 'api');
    const renderMetrics = this.metrics.filter(m => m.category === 'render');

    const avgApiTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
      : 0;

    const avgRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
      : 0;

    const slowest = [...this.metrics].sort((a, b) => b.duration - a.duration)[0] || null;
    const fastest = [...this.metrics].sort((a, b) => a.duration - b.duration)[0] || null;

    return {
      totalMetrics: this.metrics.length,
      averageApiTime: Math.round(avgApiTime),
      averageRenderTime: Math.round(avgRenderTime),
      cacheHitRate: Math.round(this.getCacheHitRate()),
      slowestOperation: slowest,
      fastestOperation: fastest,
    };
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: 'api' | 'render' | 'cache' | 'storage'): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Log performance report
   */
  logReport(): void {
    const stats = this.getStats();
    console.group('📊 Performance Report');
    console.log(`Total Metrics: ${stats.totalMetrics}`);
    console.log(`Average API Time: ${stats.averageApiTime}ms`);
    console.log(`Average Render Time: ${stats.averageRenderTime}ms`);
    console.log(`Cache Hit Rate: ${stats.cacheHitRate}%`);
    if (stats.slowestOperation) {
      console.log(`Slowest: ${stats.slowestOperation.name} (${stats.slowestOperation.duration.toFixed(2)}ms)`);
    }
    if (stats.fastestOperation) {
      console.log(`Fastest: ${stats.fastestOperation.name} (${stats.fastestOperation.duration.toFixed(2)}ms)`);
    }
    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    category: 'api' | 'render' | 'cache' | 'storage' = 'api'
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, category);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name} (failed)`, duration, category);
      throw error;
    }
  }

  /**
   * Measure sync operation
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    category: 'api' | 'render' | 'cache' | 'storage' = 'api'
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, category);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name} (failed)`, duration, category);
      throw error;
    }
  }
}

export const performanceService = PerformanceService.getInstance();
