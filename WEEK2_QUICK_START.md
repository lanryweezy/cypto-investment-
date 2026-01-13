# Week 2: Real Trading Data - Quick Start

## What's New

✅ Real-time prices from Binance
✅ WebSocket live updates
✅ 24h statistics
✅ Order book data
✅ Candlestick data

---

## Run Locally (2 Minutes)

### Terminal 1: Backend
```bash
cd backend
npm install
npm start
```

### Terminal 2: Frontend
```bash
npm run dev
```

### Browser
```
http://localhost:5173
```

---

## What You'll See

1. **Dashboard** - Real-time prices for BTC, ETH, SOL, BNB, XRP
2. **Live Updates** - Prices update as they change
3. **24h Stats** - Change percentage, high/low, volume
4. **Real Data** - All data from Binance API

---

## Test Endpoints

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

---

## Files Created

### Backend
- `backend/tradingRoutes.js` - Trading API endpoints

### Frontend
- `services/binanceService.ts` - Binance API client
- `services/realtimeDataService.ts` - Real-time data management

### Updated
- `backend/server.js` - Added trading routes
- `App.tsx` - Real data integration

---

## Key Features

### Real-Time Prices
```typescript
// Prices update automatically via WebSocket
// No polling needed
// Efficient bandwidth usage
```

### 24h Statistics
```typescript
// Price change percentage
// High/low prices
// Trading volume
// Number of trades
```

### Order Book
```typescript
// Bid/ask prices
// Order quantities
// Market depth
```

### Candlestick Data
```typescript
// Open, high, low, close
// Volume
// Multiple timeframes (1m, 5m, 1h, 4h, 1d, 1w, 1M)
```

---

## Performance

- ✅ Real-time updates via WebSocket
- ✅ Caching reduces API calls
- ✅ Batch operations for efficiency
- ✅ No API key required
- ✅ Public Binance endpoints

---

## Troubleshooting

### No real-time updates
- Check browser console for errors
- Verify WebSocket connection
- Check network tab in DevTools

### Prices not updating
- Verify Binance API is accessible
- Check internet connection
- Try refreshing page

### Backend errors
- Check dependencies: `cd backend && npm install`
- Check logs: `npm start`
- Verify port 5000 is free

---

## Next Steps

1. ✅ Run locally and verify real-time prices
2. ✅ Test all API endpoints
3. ✅ Deploy to production
4. ✅ Monitor for issues

---

## Deployment

### Backend
```bash
git add backend/
git commit -m "Add trading routes"
git push heroku main
```

### Frontend
```bash
git add services/ App.tsx
git commit -m "Add real trading data"
git push origin main
# Vercel auto-deploys
```

---

## Documentation

- **[WEEK2_REAL_DATA_SETUP.md](WEEK2_REAL_DATA_SETUP.md)** - Detailed setup guide
- **[WEEK2_QUICK_START.md](WEEK2_QUICK_START.md)** - This file

---

**Ready to build?** Start with the quick start above! 🚀
