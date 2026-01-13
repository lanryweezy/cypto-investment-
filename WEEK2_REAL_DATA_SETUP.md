# Week 2: Real Trading Data - Setup Guide

## Overview

Week 2 implements real-time cryptocurrency data from Binance API. No API key required - uses public endpoints.

**Features**:
- ✅ Real-time prices from Binance
- ✅ WebSocket live updates
- ✅ 24h statistics
- ✅ Order book data
- ✅ Candlestick data
- ✅ Top gainers/losers
- ✅ Caching for performance

---

## What's Included

### Backend Services
- `backend/tradingRoutes.js` - Trading API endpoints
- Updated `backend/server.js` - Integrated trading routes

### Frontend Services
- `services/binanceService.ts` - Binance API client
- `services/realtimeDataService.ts` - Real-time data management
- Updated `App.tsx` - Real data integration

---

## Installation

### Step 1: Update Backend Dependencies

The backend already has `axios` in package.json. Verify it's installed:

```bash
cd backend
npm install
```

### Step 2: Update Backend Server

The server.js has been updated to include trading routes. No additional setup needed.

### Step 3: Frontend is Ready

All frontend services are created and integrated into App.tsx.

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REAL-TIME DATA FLOW                      │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
    ↓
realtimeDataService (manages updates)
    ↓
binanceService (API client)
    ├─ REST API (prices, stats, candles)
    └─ WebSocket (live price updates)
    ↓
Binance API (public endpoints)
    ├─ https://api.binance.com/api/v3
    └─ wss://stream.binance.com:9443/ws
```

### Data Flow

1. **App starts** → `realtimeDataService.start()`
2. **Initial load** → Fetch 24h stats for BTC, ETH, SOL, BNB, XRP
3. **WebSocket connect** → Subscribe to live price updates
4. **Real-time updates** → Prices update as they change
5. **Periodic refresh** → Full stats refresh every 30 seconds

---

## API Endpoints

### Backend Trading Endpoints

All endpoints available at `http://localhost:5000/api/trading`:

#### Get Prices
```bash
GET /api/trading/prices?symbols=BTC,ETH,SOL
```

Response:
```json
[
  { "symbol": "BTC", "price": 42500.50 },
  { "symbol": "ETH", "price": 2250.75 }
]
```

#### Get Single Price
```bash
GET /api/trading/price/BTC
```

#### Get 24h Statistics
```bash
GET /api/trading/stats/BTC
```

Response:
```json
{
  "symbol": "BTC",
  "price": 42500.50,
  "change24h": 2.5,
  "high24h": 43000,
  "low24h": 41000,
  "volume24h": 25000000000,
  "trades24h": 1234567
}
```

#### Get Order Book
```bash
GET /api/trading/orderbook/BTC?limit=20
```

Response:
```json
{
  "symbol": "BTC",
  "bids": [
    { "price": "42500.00", "quantity": "1.5" },
    { "price": "42499.00", "quantity": "2.0" }
  ],
  "asks": [
    { "price": "42501.00", "quantity": "1.0" },
    { "price": "42502.00", "quantity": "1.5" }
  ]
}
```

#### Get Candlestick Data
```bash
GET /api/trading/candles/BTC?interval=1h&limit=100
```

Intervals: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`, `1w`, `1M`

#### Get Top Movers
```bash
GET /api/trading/movers?limit=10
```

#### Get Batch Stats
```bash
POST /api/trading/stats-batch
Content-Type: application/json

{
  "symbols": ["BTC", "ETH", "SOL"]
}
```

#### Health Check
```bash
GET /api/trading/health
```

---

## Frontend Services

### BinanceService

Direct Binance API client:

```typescript
import { binanceService } from './services/binanceService';

// Get prices
const prices = await binanceService.getPrices(['BTC', 'ETH']);

// Get 24h stats
const stats = await binanceService.get24hStats('BTC');

// Get candles
const candles = await binanceService.getCandles('BTC', '1h', 100);

// Get order book
const orderBook = await binanceService.getOrderBook('BTC', 20);

// Subscribe to live prices
const unsubscribe = binanceService.subscribeToPrice('BTC', (price) => {
  console.log('BTC price:', price);
});

// Unsubscribe
unsubscribe();
```

### RealtimeDataService

High-level data management:

```typescript
import { realtimeDataService } from './services/realtimeDataService';

// Start service
await realtimeDataService.start(['BTC', 'ETH', 'SOL']);

// Subscribe to updates
const unsubscribe = realtimeDataService.subscribe({
  onUpdate: (coins) => {
    console.log('Coins updated:', coins);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});

// Get current data
const btc = realtimeDataService.getCoin('BTC');
const allCoins = realtimeDataService.getAllCoins();

// Get top gainers/losers
const gainers = realtimeDataService.getTopGainers(5);
const losers = realtimeDataService.getTopLosers(5);

// Get status
const status = realtimeDataService.getStatus();

// Stop service
realtimeDataService.stop();

// Unsubscribe
unsubscribe();
```

---

## Testing

### Test Backend Endpoints

```bash
# Get prices
curl "http://localhost:5000/api/trading/prices?symbols=BTC,ETH,SOL"

# Get BTC stats
curl "http://localhost:5000/api/trading/stats/BTC"

# Get order book
curl "http://localhost:5000/api/trading/orderbook/BTC?limit=20"

# Get candles
curl "http://localhost:5000/api/trading/candles/BTC?interval=1h&limit=100"

# Get top movers
curl "http://localhost:5000/api/trading/movers?limit=10"

# Health check
curl "http://localhost:5000/api/trading/health"
```

### Test Frontend

1. Run backend: `cd backend && npm start`
2. Run frontend: `npm run dev`
3. Open `http://localhost:5173`
4. Check browser console for logs
5. Verify prices update in real-time

---

## Performance

### Caching
- Price cache: 5 second TTL
- Reduces API calls
- Improves response time

### WebSocket
- Live price updates
- No polling needed
- Efficient bandwidth usage

### Batch Operations
- Get multiple stats at once
- Parallel requests
- Faster data loading

---

## Troubleshooting

### Backend won't start
```bash
# Check dependencies
cd backend
npm install

# Check for errors
npm start
```

### No real-time updates
- Check browser console for errors
- Verify WebSocket connection: `wss://stream.binance.com:9443/ws`
- Check network tab in DevTools

### Prices not updating
- Verify Binance API is accessible
- Check internet connection
- Try refreshing page

### High latency
- Check network connection
- Verify backend is running locally
- Check Binance API status

---

## Configuration

### Change Tracked Symbols

Edit `App.tsx`:

```typescript
// Change from:
await realtimeDataService.start(['BTC', 'ETH', 'SOL', 'BNB', 'XRP']);

// To:
await realtimeDataService.start(['BTC', 'ETH', 'SOL', 'DOGE', 'LINK']);
```

### Change Update Interval

Edit `services/realtimeDataService.ts`:

```typescript
// Change from:
this.updateInterval = setInterval(() => {
  this.refreshData(symbols);
}, 30000); // 30 seconds

// To:
this.updateInterval = setInterval(() => {
  this.refreshData(symbols);
}, 60000); // 60 seconds
```

### Change Cache TTL

Edit `backend/tradingRoutes.js`:

```typescript
// Change from:
const CACHE_TTL = 5000; // 5 seconds

// To:
const CACHE_TTL = 10000; // 10 seconds
```

---

## Deployment

### Backend Deployment

No changes needed - just deploy updated server.js

```bash
git add backend/
git commit -m "Add trading routes for real data"
git push heroku main
```

### Frontend Deployment

```bash
git add services/binanceService.ts services/realtimeDataService.ts App.tsx
git commit -m "Add real trading data integration"
git push origin main
# Vercel auto-deploys
```

---

## Security

### No API Keys Required
- Uses public Binance endpoints
- No authentication needed
- Safe for frontend

### Rate Limiting
- Binance has rate limits
- Caching reduces requests
- WebSocket is efficient

### Data Validation
- All responses validated
- Error handling implemented
- Graceful fallbacks

---

## Monitoring

### Check Service Status

```typescript
const status = realtimeDataService.getStatus();
console.log(status);
// {
//   running: true,
//   coinsTracked: 5,
//   subscribers: 1,
//   wsConnections: { connected: 5, total: 5 }
// }
```

### Check Backend Health

```bash
curl http://localhost:5000/api/trading/health
```

---

## Next Steps

### Immediate
1. Run backend: `cd backend && npm start`
2. Run frontend: `npm run dev`
3. Verify real-time prices update
4. Check browser console for logs

### This Week
1. Test all endpoints
2. Verify performance
3. Deploy to production
4. Monitor for issues

### Next Week (Week 3)
1. Add advanced charts
2. Implement technical indicators
3. Add timeframe switching
4. Deploy and test

---

## File Structure

```
backend/
├── server.js              (updated)
├── tradingRoutes.js       (new)
└── package.json           (no changes)

frontend/
├── services/
│   ├── binanceService.ts  (new)
│   └── realtimeDataService.ts (new)
├── App.tsx                (updated)
└── types.ts               (no changes)
```

---

## API Reference

### Binance Service Methods

```typescript
// Get prices
getPrices(symbols: string[]): Promise<PriceData[]>

// Get single price
getPrice(symbol: string): Promise<number | null>

// Get order book
getOrderBook(symbol: string, limit?: number): Promise<OrderBookData>

// Get candles
getCandles(symbol: string, interval?: string, limit?: number): Promise<CandleData[]>

// Get 24h stats
get24hStats(symbol: string): Promise<Stats24h | null>

// Subscribe to price
subscribeToPrice(symbol: string, callback: (price: number) => void): () => void

// Get multiple stats
getMultiple24hStats(symbols: string[]): Promise<Map<string, Stats24h>>

// Get top movers
getTopMovers(limit?: number): Promise<any[]>

// Close connections
closeAllConnections(): void

// Get status
getConnectionStatus(): { connected: number; total: number }
```

### Realtime Data Service Methods

```typescript
// Start service
start(symbols?: string[]): Promise<void>

// Stop service
stop(): void

// Subscribe to updates
subscribe(subscriber: DataSubscriber): () => void

// Get coin
getCoin(symbol: string): CoinData | undefined

// Get all coins
getAllCoins(): CoinData[]

// Get coin by ID
getCoinById(id: string): CoinData | undefined

// Get top gainers
getTopGainers(limit?: number): CoinData[]

// Get top losers
getTopLosers(limit?: number): CoinData[]

// Get status
getStatus(): { running: boolean; coinsTracked: number; subscribers: number; wsConnections: any }
```

---

## Summary

**Week 2 real trading data is complete and ready to use.**

You have:
- ✅ Real-time prices from Binance
- ✅ WebSocket live updates
- ✅ 24h statistics
- ✅ Order book data
- ✅ Candlestick data
- ✅ Top gainers/losers
- ✅ Caching for performance
- ✅ Error handling
- ✅ Complete documentation

**Ready to test and deploy.** 🚀

---

**Next**: Week 3 - Advanced Charts 📈
