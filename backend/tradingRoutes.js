/**
 * Trading Routes
 * Provides real-time cryptocurrency data endpoints
 * Proxies Binance API for better performance and caching
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BINANCE_API = 'https://api.binance.com/api/v3';

// Cache for price data (5 second TTL)
const priceCache = new Map();
const CACHE_TTL = 5000;

/**
 * Get current prices for multiple symbols
 * GET /api/trading/prices?symbols=BTC,ETH,SOL
 */
router.get('/prices', async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({ error: 'symbols parameter required' });
    }

    const symbolList = symbols.split(',').map(s => s.toUpperCase());
    
    // Check cache
    const cacheKey = `prices_${symbolList.join(',')}`;
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // Fetch from Binance
    const response = await axios.get(`${BINANCE_API}/ticker/price`);
    const allPrices = response.data;

    const prices = allPrices
      .filter(p => symbolList.some(s => p.symbol === `${s}USDT`))
      .map(p => ({
        symbol: p.symbol.replace('USDT', ''),
        price: parseFloat(p.price)
      }));

    // Cache result
    priceCache.set(cacheKey, {
      data: prices,
      timestamp: Date.now()
    });

    res.json(prices);
  } catch (error) {
    console.error('❌ Failed to fetch prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

/**
 * Get single price
 * GET /api/trading/price/BTC
 */
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const response = await axios.get(
      `${BINANCE_API}/ticker/price?symbol=${symbol.toUpperCase()}USDT`
    );

    res.json({
      symbol: symbol.toUpperCase(),
      price: parseFloat(response.data.price)
    });
  } catch (error) {
    console.error(`❌ Failed to fetch price for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

/**
 * Get 24h statistics
 * GET /api/trading/stats/BTC
 */
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const response = await axios.get(
      `${BINANCE_API}/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`
    );

    const data = response.data;

    res.json({
      symbol: symbol.toUpperCase(),
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume24h: parseFloat(data.quoteAssetVolume),
      trades24h: data.count
    });
  } catch (error) {
    console.error(`❌ Failed to fetch stats for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Get order book
 * GET /api/trading/orderbook/BTC?limit=20
 */
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 20 } = req.query;
    
    const response = await axios.get(
      `${BINANCE_API}/depth?symbol=${symbol.toUpperCase()}USDT&limit=${limit}`
    );

    res.json({
      symbol: symbol.toUpperCase(),
      bids: response.data.bids.map(bid => ({
        price: parseFloat(bid[0]),
        quantity: parseFloat(bid[1])
      })),
      asks: response.data.asks.map(ask => ({
        price: parseFloat(ask[0]),
        quantity: parseFloat(ask[1])
      }))
    });
  } catch (error) {
    console.error(`❌ Failed to fetch orderbook for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch orderbook' });
  }
});

/**
 * Get candlestick data
 * GET /api/trading/candles/BTC?interval=1h&limit=100
 */
router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    
    const response = await axios.get(
      `${BINANCE_API}/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=${limit}`
    );

    const candles = response.data.map(candle => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[7])
    }));

    res.json({
      symbol: symbol.toUpperCase(),
      interval,
      candles
    });
  } catch (error) {
    console.error(`❌ Failed to fetch candles for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch candles' });
  }
});

/**
 * Get top gainers/losers
 * GET /api/trading/movers?limit=10
 */
router.get('/movers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`);
    
    const movers = response.data
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        symbol: ticker.symbol.replace('USDT', ''),
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteAssetVolume)
      }))
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, parseInt(limit));

    res.json(movers);
  } catch (error) {
    console.error('❌ Failed to fetch movers:', error.message);
    res.status(500).json({ error: 'Failed to fetch movers' });
  }
});

/**
 * Get multiple 24h stats
 * POST /api/trading/stats-batch
 * Body: { symbols: ['BTC', 'ETH', 'SOL'] }
 */
router.post('/stats-batch', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'symbols array required' });
    }

    const promises = symbols.map(symbol =>
      axios.get(`${BINANCE_API}/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`)
        .then(response => {
          const data = response.data;
          return {
            symbol: symbol.toUpperCase(),
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            volume24h: parseFloat(data.quoteAssetVolume)
          };
        })
        .catch(error => {
          console.error(`Failed to fetch stats for ${symbol}:`, error.message);
          return null;
        })
    );

    const results = await Promise.all(promises);
    const stats = results.filter(s => s !== null);

    res.json(stats);
  } catch (error) {
    console.error('❌ Failed to fetch batch stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Health check for trading service
 * GET /api/trading/health
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${BINANCE_API}/ping`);
    res.json({
      status: 'ok',
      binance: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      binance: 'disconnected',
      error: error.message
    });
  }
});

export default router;
