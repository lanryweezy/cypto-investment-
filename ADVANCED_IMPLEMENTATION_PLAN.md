# Advanced Features Implementation Plan

## 🎯 Overview

Building real trading data, advanced charts, order types, and portfolio analytics for NexusCrypto.

**Timeline:** 4 weeks  
**Phases:** 4  
**Priority:** High

---

## 📋 Phase 1: Real Trading Data (Week 1-2)

### 1.1 Binance API Integration

**Create:** `services/binanceService.ts`

```typescript
import axios from 'axios';

interface BinancePrice {
  symbol: string;
  price: number;
  timestamp: number;
}

interface OrderBook {
  bids: [string, string][];
  asks: [string, string][];
}

class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';

  // Get real-time prices
  async getPrices(symbols: string[]): Promise<BinancePrice[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/price`);
      return response.data.filter((p: any) => 
        symbols.includes(p.symbol)
      );
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      return [];
    }
  }

  // Get order book
  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook> {
    try {
      const response = await axios.get(`${this.baseUrl}/depth`, {
        params: { symbol, limit }
      });
      return {
        bids: response.data.bids,
        asks: response.data.asks
      };
    } catch (error) {
      console.error('Failed to fetch order book:', error);
      return { bids: [], asks: [] };
    }
  }

  // Get 24h price change
  async get24hStats(symbol: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        params: { symbol }
      });
      return {
        price: parseFloat(response.data.lastPrice),
        change24h: parseFloat(response.data.priceChangePercent),
        high24h: parseFloat(response.data.highPrice),
        low24h: parseFloat(response.data.lowPrice),
        volume24h: parseFloat(response.data.volume)
      };
    } catch (error) {
      console.error('Failed to fetch 24h stats:', error);
      return null;
    }
  }

  // WebSocket for real-time prices
  subscribeToPrice(symbol: string, callback: (price: number) => void) {
    const ws = new WebSocket(`${this.wsUrl}/${symbol.toLowerCase()}@ticker`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(parseFloat(data.c)); // Current price
    };

    return ws;
  }
}

export const binanceService = new BinanceService();
```

### 1.2 Coinbase API Integration

**Create:** `services/coinbaseService.ts`

```typescript
class CoinbaseService {
  private baseUrl = 'https://api.coinbase.com/v2';

  async getPrices(symbols: string[]) {
    try {
      const prices = await Promise.all(
        symbols.map(symbol =>
          axios.get(`${this.baseUrl}/prices/${symbol}-USD/spot`)
        )
      );
      return prices.map(p => ({
        symbol: p.data.data.base,
        price: parseFloat(p.data.data.amount)
      }));
    } catch (error) {
      console.error('Failed to fetch Coinbase prices:', error);
      return [];
    }
  }

  async getOrderBook(productId: string) {
    try {
      const response = await axios.get(
        `https://api.exchange.coinbase.com/products/${productId}/book`,
        { params: { level: 2 } }
      );
      return {
        bids: response.data.bids,
        asks: response.data.asks
      };
    } catch (error) {
      console.error('Failed to fetch order book:', error);
      return { bids: [], asks: [] };
    }
  }
}

export const coinbaseService = new CoinbaseService();
```

### 1.3 Real-time Price Updates

**Update:** `services/priceService.ts`

```typescript
class PriceService {
  private priceCache = new Map();
  private subscribers = new Map();
  private updateInterval = 1000; // 1 second

  async startRealTimeUpdates(symbols: string[]) {
    // Subscribe to Binance WebSocket
    symbols.forEach(symbol => {
      const ws = binanceService.subscribeToPrice(symbol, (price) => {
        this.updatePrice(symbol, price);
        this.notifySubscribers(symbol, price);
      });
    });

    // Fallback: Poll every 5 seconds
    setInterval(() => {
      this.pollPrices(symbols);
    }, 5000);
  }

  private updatePrice(symbol: string, price: number) {
    this.priceCache.set(symbol, {
      price,
      timestamp: Date.now()
    });
  }

  private notifySubscribers(symbol: string, price: number) {
    const callbacks = this.subscribers.get(symbol) || [];
    callbacks.forEach(cb => cb(price));
  }

  subscribe(symbol: string, callback: (price: number) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol).push(callback);
  }

  getPrice(symbol: string): number | null {
    const data = this.priceCache.get(symbol);
    return data ? data.price : null;
  }
}

export const priceService = new PriceService();
```

---

## 📊 Phase 2: Advanced Charts (Week 2-3)

### 2.1 Candlestick Chart Component

**Create:** `components/CandlestickChart.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  timeframe: '1m' | '5m' | '1h' | '1d';
  onTimeframeChange: (tf: string) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  timeframe,
  onTimeframeChange
}) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandles();
  }, [symbol, timeframe]);

  const fetchCandles = async () => {
    setLoading(true);
    try {
      const data = await binanceService.getCandles(symbol, timeframe);
      setCandles(data);
    } catch (error) {
      console.error('Failed to fetch candles:', error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-96 bg-crypto-card rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{symbol} Chart</h3>
        <div className="flex gap-2">
          {['1m', '5m', '1h', '1d'].map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded ${
                timeframe === tf
                  ? 'bg-crypto-accent text-black'
                  : 'bg-crypto-dark text-gray-400'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin">Loading...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={candles}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0E1218',
                border: '1px solid #333'
              }}
            />
            <Legend />
            <Bar dataKey="volume" fill="#00F0FF" opacity={0.3} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#00F0FF"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
```

### 2.2 Technical Indicators

**Create:** `services/technicalIndicators.ts`

```typescript
export class TechnicalIndicators {
  // RSI (Relative Strength Index)
  static calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);

      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      } else if (i > period) {
        const avgGain = (gains * (period - 1) + (prices[i] - prices[i - 1])) / period;
        const avgLoss = (losses * (period - 1) + Math.abs(prices[i] - prices[i - 1])) / period;
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }

    return rsi;
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12.map((val, i) => val - ema26[i]);
    const signal = this.calculateEMA(macd, 9);

    return {
      macd,
      signal,
      histogram: macd.map((val, i) => val - signal[i])
    };
  }

  // Bollinger Bands
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const bands = [];

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2)) / period;
      const std = Math.sqrt(variance);

      bands.push({
        upper: sma + std * stdDev,
        middle: sma,
        lower: sma - std * stdDev
      });
    }

    return bands;
  }

  // EMA (Exponential Moving Average)
  private static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema.push(sum / period);

    // Calculate EMA
    for (let i = period; i < prices.length; i++) {
      ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
    }

    return ema;
  }
}
```

---

## 💰 Phase 3: Order Types & Portfolio Analytics (Week 3-4)

### 3.1 Order Management

**Create:** `services/orderService.ts`

```typescript
interface Order {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop-loss' | 'take-profit' | 'trailing-stop';
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  stopPrice?: number;
  trailingPercent?: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
}

class OrderService {
  private orders: Order[] = [];

  createMarketOrder(symbol: string, side: 'buy' | 'sell', quantity: number) {
    const currentPrice = priceService.getPrice(symbol);
    if (!currentPrice) throw new Error('Price not available');

    const order: Order = {
      id: `order_${Date.now()}`,
      symbol,
      type: 'market',
      side,
      quantity,
      price: currentPrice,
      status: 'filled',
      createdAt: new Date().toISOString()
    };

    this.orders.push(order);
    return order;
  }

  createLimitOrder(symbol: string, side: 'buy' | 'sell', quantity: number, price: number) {
    const order: Order = {
      id: `order_${Date.now()}`,
      symbol,
      type: 'limit',
      side,
      quantity,
      price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.orders.push(order);
    this.monitorLimitOrder(order);
    return order;
  }

  createStopLossOrder(symbol: string, quantity: number, stopPrice: number) {
    const order: Order = {
      id: `order_${Date.now()}`,
      symbol,
      type: 'stop-loss',
      side: 'sell',
      quantity,
      price: stopPrice,
      stopPrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.orders.push(order);
    this.monitorStopLoss(order);
    return order;
  }

  createTakeProfitOrder(symbol: string, quantity: number, targetPrice: number) {
    const order: Order = {
      id: `order_${Date.now()}`,
      symbol,
      type: 'take-profit',
      side: 'sell',
      quantity,
      price: targetPrice,
      stopPrice: targetPrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.orders.push(order);
    this.monitorTakeProfit(order);
    return order;
  }

  private monitorLimitOrder(order: Order) {
    const unsubscribe = priceService.subscribe(order.symbol, (price) => {
      if (order.side === 'buy' && price <= order.price) {
        this.executeOrder(order);
        unsubscribe();
      } else if (order.side === 'sell' && price >= order.price) {
        this.executeOrder(order);
        unsubscribe();
      }
    });
  }

  private monitorStopLoss(order: Order) {
    const unsubscribe = priceService.subscribe(order.symbol, (price) => {
      if (price <= order.stopPrice!) {
        this.executeOrder(order);
        unsubscribe();
      }
    });
  }

  private monitorTakeProfit(order: Order) {
    const unsubscribe = priceService.subscribe(order.symbol, (price) => {
      if (price >= order.stopPrice!) {
        this.executeOrder(order);
        unsubscribe();
      }
    });
  }

  private executeOrder(order: Order) {
    order.status = 'filled';
    notificationService.success('Order Executed', `${order.type} order filled`);
  }

  getOrders(): Order[] {
    return this.orders;
  }

  cancelOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
    }
  }
}

export const orderService = new OrderService();
```

### 3.2 Portfolio Analytics

**Create:** `services/portfolioAnalyticsService.ts`

```typescript
interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  gainPercent: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  roi: number;
}

class PortfolioAnalyticsService {
  calculateMetrics(portfolio: any, transactions: any[]): PortfolioMetrics {
    const totalValue = this.calculateTotalValue(portfolio);
    const totalInvested = this.calculateTotalInvested(transactions);
    const totalGain = totalValue - totalInvested;
    const gainPercent = (totalGain / totalInvested) * 100;

    const winRate = this.calculateWinRate(transactions);
    const sharpeRatio = this.calculateSharpeRatio(transactions);
    const maxDrawdown = this.calculateMaxDrawdown(transactions);
    const roi = this.calculateROI(totalValue, totalInvested);

    return {
      totalValue,
      totalInvested,
      totalGain,
      gainPercent,
      winRate,
      sharpeRatio,
      maxDrawdown,
      roi
    };
  }

  private calculateTotalValue(portfolio: any): number {
    let total = 0;
    for (const [symbol, position] of Object.entries(portfolio)) {
      const price = priceService.getPrice(symbol);
      if (price) {
        total += (position as any).amount * price;
      }
    }
    return total;
  }

  private calculateTotalInvested(transactions: any[]): number {
    return transactions
      .filter(t => t.type === 'BUY')
      .reduce((sum, t) => sum + t.total, 0);
  }

  private calculateWinRate(transactions: any[]): number {
    const trades = transactions.filter(t => t.type === 'SELL');
    if (trades.length === 0) return 0;

    const wins = trades.filter(t => t.profit > 0).length;
    return (wins / trades.length) * 100;
  }

  private calculateSharpeRatio(transactions: any[]): number {
    // Simplified Sharpe Ratio calculation
    const returns = transactions.map(t => t.profit || 0);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  private calculateMaxDrawdown(transactions: any[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    for (const t of transactions) {
      cumulative += t.profit || 0;
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  private calculateROI(totalValue: number, totalInvested: number): number {
    if (totalInvested === 0) return 0;
    return ((totalValue - totalInvested) / totalInvested) * 100;
  }
}

export const portfolioAnalyticsService = new PortfolioAnalyticsService();
```

---

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install axios recharts
```

### Step 2: Add Environment Variables

```env
VITE_BINANCE_API_KEY=your-key
VITE_COINBASE_API_KEY=your-key
```

### Step 3: Update Services

Copy all service files to `services/` folder

### Step 4: Update Components

Create new components for charts and orders

---

## 🚀 Implementation Timeline

| Week | Tasks | Status |
|------|-------|--------|
| Week 1 | Binance/Coinbase API, Real-time prices | 📋 Ready |
| Week 2 | Candlestick charts, Technical indicators | 📋 Ready |
| Week 3 | Order types, Portfolio analytics | 📋 Ready |
| Week 4 | Testing, Optimization, Deployment | 📋 Ready |

---

## ✅ Deliverables

- ✅ Real trading data from Binance & Coinbase
- ✅ Real-time price updates via WebSocket
- ✅ Advanced candlestick charts
- ✅ Technical indicators (RSI, MACD, Bollinger Bands)
- ✅ Multiple timeframes (1m, 5m, 1h, 1d)
- ✅ Order types (Market, Limit, Stop-Loss, Take-Profit)
- ✅ Portfolio analytics (Sharpe Ratio, Max Drawdown, ROI, Win Rate)
- ✅ Price alerts
- ✅ Order monitoring

---

## 📝 Next Steps

1. Review this implementation plan
2. Confirm you want to proceed
3. I'll start building Phase 1
4. We'll deploy each phase incrementally

**Ready to build?** 🚀
