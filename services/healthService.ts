/**
 * Health Check Service
 * Monitors app health and API availability
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  apis: {
    coingecko: boolean;
    cryptocompare: boolean;
    gemini: boolean;
  };
  performance: {
    loadTime: number;
    memoryUsage?: number;
  };
}

class HealthService {
  private static instance: HealthService;
  private startTime: number = Date.now();
  private lastStatus: HealthStatus | null = null;

  private constructor() {}

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  /**
   * Check if an API endpoint is reachable
   */
  private async checkApiHealth(url: string, timeout: number = 3000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 405; // 405 = Method Not Allowed (still means API is up)
    } catch (error) {
      return false;
    }
  }

  /**
   * Get overall app health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const [coingeckoHealth, cryptocompareHealth, geminiHealth] = await Promise.all([
      this.checkApiHealth('https://api.coingecko.com/api/v3/ping'),
      this.checkApiHealth('https://min-api.cryptocompare.com/data/v2/news/?lang=EN'),
      this.checkApiHealth('https://generativelanguage.googleapis.com/'),
    ]);

    const healthyApis = [coingeckoHealth, cryptocompareHealth, geminiHealth].filter(Boolean).length;
    const loadTime = Date.now() - this.startTime;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyApis === 0) {
      status = 'unhealthy';
    } else if (healthyApis < 3) {
      status = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      apis: {
        coingecko: coingeckoHealth,
        cryptocompare: cryptocompareHealth,
        gemini: geminiHealth,
      },
      performance: {
        loadTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
      },
    };

    this.lastStatus = healthStatus;
    return healthStatus;
  }

  /**
   * Get last known health status
   */
  getLastStatus(): HealthStatus | null {
    return this.lastStatus;
  }

  /**
   * Log health status to console
   */
  async logHealthStatus(): Promise<void> {
    const status = await this.getHealthStatus();
    console.group('🏥 App Health Status');
    console.log(`Status: ${status.status.toUpperCase()}`);
    console.log(`Timestamp: ${status.timestamp}`);
    console.table(status.apis);
    console.log(`Load Time: ${status.performance.loadTime}ms`);
    if (status.performance.memoryUsage) {
      console.log(`Memory Usage: ${(status.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    console.groupEnd();
  }
}

export const healthService = HealthService.getInstance();
