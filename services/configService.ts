interface ApiConfig {
  geminiApiKey: string | null;
  coinGeckoApiKey: string | null;
  cryptoCompareApiKey: string | null;
}

class ConfigService {
  private static instance: ConfigService;
  private config: ApiConfig = {
    geminiApiKey: null,
    coinGeckoApiKey: null,
    cryptoCompareApiKey: null
  };

  private constructor() {
    // Initialize from environment or localStorage
    this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): void {
    // Load from environment variables (for development)
    if (typeof process !== 'undefined' && process.env) {
      this.config = {
        geminiApiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || null,
        coinGeckoApiKey: process.env.COINGECKO_API_KEY || null,
        cryptoCompareApiKey: process.env.CRYPTOCOMPARE_API_KEY || null
      };
    }

    // If not in development environment, try to load from localStorage
    // In a real app, this would come from a secure backend
    if (!this.config.geminiApiKey && typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('nexus_api_config');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          this.config = {
            ...this.config,
            ...parsed
          };
        } catch (e) {
          console.warn('Failed to parse saved API config');
        }
      }
    }
  }

  public saveConfig(config: Partial<ApiConfig>): void {
    // Update the config
    this.config = {
      ...this.config,
      ...config
    };

    // Save to localStorage (in a real app, this would be sent to a secure backend)
    localStorage.setItem('nexus_api_config', JSON.stringify({
      geminiApiKey: this.config.geminiApiKey,
      coinGeckoApiKey: this.config.coinGeckoApiKey,
      cryptoCompareApiKey: this.config.cryptoCompareApiKey
    }));
  }

  public getApiKey(service: keyof ApiConfig): string | null {
    return this.config[service];
  }

  public hasApiKey(service: keyof ApiConfig): boolean {
    return !!this.config[service];
  }

  public clearConfig(): void {
    this.config = {
      geminiApiKey: null,
      coinGeckoApiKey: null,
      cryptoCompareApiKey: null
    };
    localStorage.removeItem('nexus_api_config');
  }
}

export const configService = ConfigService.getInstance();
export type { ApiConfig };