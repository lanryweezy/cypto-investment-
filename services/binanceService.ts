/**
 * Binance API Service
 * Provides real-time cryptocurrency data from Binance
 * No API key required for public endpoints
 */

interface PriceData {
  symbol: string;
  price: number;
}

interface OrderBookData {
  bids: [string, string][];
  asks: [string, string][];
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Stats24h {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
}

class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';
  private priceCache = new Map<string, PriceData>();
  private subscribers = new Map<string, Set<(price: number) => void>>();
  private wsConnections = new Map<string, WebSocket>();

  /**
   * Get current prices for multiple symbols
   */
  async getPrices(symbols: string[]): Promise<PriceData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/price`);
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const data = await response.json();
      
      return data
        .filter((p: any) => 
          symbols.some(s => p.symbol === `${s}USDT`)
        )
        .map((p: any) => ({
          symbol: p.symbol.replace('USDT', ''),
          price: parseFloat(p.price)
        }));
    } catch (error) {
      console.error('❌ Failed to fetch prices:', error);
      return [];
    }
  }

  /**
   * Get single price for a symbol
   */
  async getPrice(symbol: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ticker/price?symbol=${symbol}USDT`
      );
      if (!response.ok) throw new Error('Failed to fetch price');
      
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error(`❌ Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get order book data
   */
  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBookData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/depth?symbol=${symbol}USDT&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch order book');
      
      const data = await response.json();
      
      return {
        bids: data.bids.map((bid: any[]) => [bid[0], bid[1]]),
        asks: data.asks.map((ask: any[]) => [ask[0], ask[1]])
      };
    } catch (error) {
      console.error(`❌ Failed to fetch order book for ${symbol}:`, error);
      return { bids: [], asks: [] };
    }
  }

  /**
   * Get candlestick data
   */
  async getCandles(
    symbol: string,
    interval: string = '1h',
    limit: number = 100
  ): Promise<CandleData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch candles');
      
      const data = await response.json();
      
      return data.map((candle: any[]) => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[7])
      }));
    } catch (error) {
      console.error(`❌ Failed to fetch candles for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get 24h statistics
   */
  async get24hStats(symbol: string): Promise<Stats24h | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ticker/24hr?symbol=${symbol}USDT`
      );
      if (!response.ok) throw new Error('Failed to fetch 24h stats');
      
      const data = await response.json();
      
      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.quoteAssetVolume)
      };
    } catch (error) {
      console.error(`❌ Failed to fetch 24h stats for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   */
  subscribeToPrice(
    symbol: string,
    callback: (price: number) => void
  ): () => void {
    const streamName = `${symbol.toLowerCase()}usdt@ticker`;
    
    // Add callback to subscribers
    if (!this.subscribers.has(streamName)) {
      this.subscribers.set(streamName, new Set());
    }
    this.subscribers.get(streamName)!.add(callback);

    // Create WebSocket connection if not exists
    if (!this.wsConnections.has(streamName)) {
      this.createWebSocketConnection(streamName);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(streamName);
      if (subs) {
        subs.delete(callback);
        
        // Close connection if no more subscribers
        if (subs.size === 0) {
          const ws = this.wsConnections.get(streamName);
          if (ws) {
            ws.close();
            this.wsConnections.delete(streamName);
          }
          this.subscribers.delete(streamName);
        }
      }
    };
  }

  /**
   * Create WebSocket connection for real-time updates
   */
  private createWebSocketConnection(streamName: string): void {
    try {
      const ws = new WebSocket(`${this.wsUrl}/${streamName}`);

      ws.onopen = () => {
        console.log(`✅ WebSocket connected: ${streamName}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const price = parseFloat(data.c);
          
          // Call all subscribers
          const callbacks = this.subscribers.get(streamName);
          if (callbacks) {
            callbacks.forEach(callback => callback(price));
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for ${streamName}:`, error);
      };

      ws.onclose = () => {
        console.log(`⚠️ WebSocket closed: ${streamName}`);
        this.wsConnections.delete(streamName);
      };

      this.wsConnections.set(streamName, ws);
    } catch (error) {
      console.error(`❌ Failed to create WebSocket for ${streamName}:`, error);
    }
  }

  /**
   * Get multiple 24h stats at once
   */
  async getMultiple24hStats(symbols: string[]): Promise<Map<string, Stats24h>> {
    const results = new Map<string, Stats24h>();
    
    const promises = symbols.map(async (symbol) => {
      const stats = await this.get24hStats(symbol);
      if (stats) {
        results.set(symbol, stats);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get top gainers/losers
   */
  async getTopMovers(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`);
      if (!response.ok) throw new Error('Failed to fetch tickers');
      
      const data = await response.json();
      
      // Filter USDT pairs and sort by change
      return data
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .map((ticker: any) => ({
          symbol: ticker.symbol.replace('USDT', ''),
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.quoteAssetVolume)
        }))
        .sort((a: any, b: any) => Math.abs(b.change24h) - Math.abs(a.change24h))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to fetch top movers:', error);
      return [];
    }
  }

  /**
   * Close all WebSocket connections
   */
  closeAllConnections(): void {
    this.wsConnections.forEach((ws) => {
      ws.close();
    });
    this.wsConnections.clear();
    this.subscribers.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: number; total: number } {
    return {
      connected: this.wsConnections.size,
      total: this.subscribers.size
    };
  }
}

export const binanceService = new BinanceService();
export type { PriceData, OrderBookData, CandleData, Stats24h };
