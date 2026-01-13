/**
 * Real-Time Data Service
 * Manages real-time cryptocurrency data updates
 * Combines WebSocket and REST API calls
 */

import { binanceService, Stats24h } from './binanceService';

interface CoinData extends Stats24h {
  id: string;
  symbol: string;
  name: string;
  image?: string;
}

interface DataSubscriber {
  onUpdate: (coins: CoinData[]) => void;
  onError?: (error: Error) => void;
}

class RealtimeDataService {
  private coins: Map<string, CoinData> = new Map();
  private subscribers: Set<DataSubscriber> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private wsUnsubscribers: Map<string, () => void> = new Map();
  private isRunning = false;

  /**
   * Start real-time data updates
   */
  async start(symbols: string[] = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP']): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting real-time data service...');

    try {
      // Initial load
      await this.loadInitialData(symbols);

      // Subscribe to WebSocket updates
      this.subscribeToWebSocket(symbols);

      // Periodic refresh (every 30 seconds)
      this.updateInterval = setInterval(() => {
        this.refreshData(symbols);
      }, 30000);

      console.log('✅ Real-time data service started');
    } catch (error) {
      console.error('❌ Failed to start real-time data service:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop real-time data updates
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('🛑 Stopping real-time data service...');

    // Clear interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Unsubscribe from WebSocket
    this.wsUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.wsUnsubscribers.clear();

    // Close Binance connections
    binanceService.closeAllConnections();

    this.isRunning = false;
    console.log('✅ Real-time data service stopped');
  }

  /**
   * Load initial data for symbols
   */
  private async loadInitialData(symbols: string[]): Promise<void> {
    try {
      const stats = await binanceService.getMultiple24hStats(symbols);

      stats.forEach((stat, symbol) => {
        this.coins.set(symbol, {
          id: symbol.toLowerCase(),
          symbol,
          name: this.getSymbolName(symbol),
          ...stat
        });
      });

      this.notifySubscribers();
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      throw error;
    }
  }

  /**
   * Subscribe to WebSocket price updates
   */
  private subscribeToWebSocket(symbols: string[]): void {
    symbols.forEach(symbol => {
      try {
        const unsubscribe = binanceService.subscribeToPrice(
          symbol,
          (price: number) => {
            const coin = this.coins.get(symbol);
            if (coin) {
              coin.price = price;
              this.notifySubscribers();
            }
          }
        );

        this.wsUnsubscribers.set(symbol, unsubscribe);
      } catch (error) {
        console.error(`❌ Failed to subscribe to ${symbol}:`, error);
      }
    });
  }

  /**
   * Refresh data periodically
   */
  private async refreshData(symbols: string[]): Promise<void> {
    try {
      const stats = await binanceService.getMultiple24hStats(symbols);

      stats.forEach((stat, symbol) => {
        const coin = this.coins.get(symbol);
        if (coin) {
          Object.assign(coin, stat);
        }
      });

      this.notifySubscribers();
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
      this.notifySubscribersError(error as Error);
    }
  }

  /**
   * Subscribe to data updates
   */
  subscribe(subscriber: DataSubscriber): () => void {
    this.subscribers.add(subscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(): void {
    const coinsArray = Array.from(this.coins.values());
    this.subscribers.forEach(subscriber => {
      try {
        subscriber.onUpdate(coinsArray);
      } catch (error) {
        console.error('❌ Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Notify subscribers of errors
   */
  private notifySubscribersError(error: Error): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber.onError) {
        try {
          subscriber.onError(error);
        } catch (err) {
          console.error('❌ Error in error callback:', err);
        }
      }
    });
  }

  /**
   * Get current coin data
   */
  getCoin(symbol: string): CoinData | undefined {
    return this.coins.get(symbol);
  }

  /**
   * Get all coins
   */
  getAllCoins(): CoinData[] {
    return Array.from(this.coins.values());
  }

  /**
   * Get coin by ID
   */
  getCoinById(id: string): CoinData | undefined {
    return Array.from(this.coins.values()).find(coin => coin.id === id);
  }

  /**
   * Get top gainers
   */
  getTopGainers(limit: number = 5): CoinData[] {
    return Array.from(this.coins.values())
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, limit);
  }

  /**
   * Get top losers
   */
  getTopLosers(limit: number = 5): CoinData[] {
    return Array.from(this.coins.values())
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, limit);
  }

  /**
   * Get service status
   */
  getStatus(): {
    running: boolean;
    coinsTracked: number;
    subscribers: number;
    wsConnections: { connected: number; total: number };
  } {
    return {
      running: this.isRunning,
      coinsTracked: this.coins.size,
      subscribers: this.subscribers.size,
      wsConnections: binanceService.getConnectionStatus()
    };
  }

  /**
   * Get symbol name
   */
  private getSymbolName(symbol: string): string {
    const names: { [key: string]: string } = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      SOL: 'Solana',
      BNB: 'Binance Coin',
      XRP: 'Ripple',
      ADA: 'Cardano',
      DOGE: 'Dogecoin',
      LINK: 'Chainlink',
      MATIC: 'Polygon',
      AVAX: 'Avalanche'
    };
    return names[symbol] || symbol;
  }
}

export const realtimeDataService = new RealtimeDataService();
export type { CoinData, DataSubscriber };
