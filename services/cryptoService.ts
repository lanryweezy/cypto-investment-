import { Coin, NewsItem } from '../types';
import { MOCK_COINS, MOCK_NEWS } from '../constants';
import { configService } from './configService';
import { errorService } from './errorService';
import { cacheService } from './cacheService';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
// CryptoCompare for news (Free tier doesn't require key for basic endpoints usually, or use a public proxy if needed)
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// Add API keys to requests if available
const getHeaders = () => {
  const headers: Record<string, string> = {};
  
  const coinGeckoKey = configService.getApiKey('coinGeckoApiKey');
  if (coinGeckoKey) {
    headers['Authorization'] = `Bearer ${coinGeckoKey}`;
  }
  
  const cryptoCompareKey = configService.getApiKey('cryptoCompareApiKey');
  if (cryptoCompareKey) {
    headers['authorization'] = `Apikey ${cryptoCompareKey}`;
  }
  
  return headers;
};

// Clear cache when API keys change
const originalGetApiKey = configService.getApiKey;
configService.getApiKey = function(service: keyof import('./configService').ApiConfig): string | null {
  return originalGetApiKey.call(this, service);
};

// Export a function to clear cache when needed
export const clearCryptoCache = (): void => {
  cacheService.delete('top-coins');
  cacheService.delete('crypto-news');
};

export const fetchTopCoins = async (): Promise<Coin[]> => {
  try {
    // Try to get from cache first
    const cached = cacheService.get<Coin[]>('top-coins');
    if (cached) {
      console.log('📊 Using cached coin data');
      return cached;
    }
    
    const headers = getHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
    
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false`,
      { headers, signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        throw new Error(`CoinGecko API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const coins = data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      image: coin.image
    }));
    
    // Cache for 5 minutes
    cacheService.set('top-coins', coins, 5 * 60 * 1000);
    console.log('✅ Fetched live coin data from CoinGecko');
    
    return coins;
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' 
      ? 'API request timed out' 
      : err.message;
    console.warn(`⚠️ Coin fetch failed (${errorMsg}) - using mock data`);
    errorService.logWarning("Failed to fetch live coins, using mock data", { error: errorMsg });
    return MOCK_COINS;
  }
};

export const fetchCryptoNews = async (): Promise<NewsItem[]> => {
  try {
    // Try to get from cache first
    const cached = cacheService.get<NewsItem[]>('crypto-news');
    if (cached) {
      console.log('📰 Using cached news data');
      return cached;
    }
    
    const headers = getHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
    
    const response = await fetch(NEWS_API, { headers, signal: controller.signal });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        throw new Error(`News API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const news = data.Data.slice(0, 10).map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.body.substring(0, 150) + '...',
      source: item.source_info.name,
      time: new Date(item.published_on * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentiment: 'neutral'
    }));
    
    // Cache for 10 minutes
    cacheService.set('crypto-news', news, 10 * 60 * 1000);
    console.log('✅ Fetched live news from CryptoCompare');
    
    return news;
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' 
      ? 'API request timed out' 
      : err.message;
    console.warn(`⚠️ News fetch failed (${errorMsg}) - using mock data`);
    errorService.logWarning("Failed to fetch live news, using mock data", { error: errorMsg });
    return MOCK_NEWS;
  }
};

export const fetchCoinHistory = async (coinId: string): Promise<{ date: string; price: number }[]> => {
  try {
    const cacheKey = `coin-history-${coinId}`;
    
    // Try to get from cache first
    const cached = cacheService.get<{ date: string; price: number }[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const headers = getHeaders();
    // 30 days of history, daily interval
    const response = await fetch(`${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`, { headers });
    
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }

    const data = await response.json();
    const history = data.prices.map((item: [number, number]) => ({
      date: new Date(item[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: item[1]
    }));
    
    // Cache for 30 minutes
    cacheService.set(cacheKey, history, 30 * 60 * 1000);
    
    return history;
  } catch (err: any) {
    errorService.logWarning(`Failed to fetch history for ${coinId}, using mock fallback`, { coinId, error: err.message, stack: err.stack });
    // Generate deterministic mock data based on coinId char code sum
    const seed = coinId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 1000 + (seed % 1000);
    
    const mockHistory = Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      price: basePrice + Math.sin(i + seed) * (basePrice * 0.1) + Math.random() * (basePrice * 0.05)
    }));
    
    // Cache mock data for 5 minutes
    const cacheKey = `coin-history-${coinId}`;
    cacheService.set(cacheKey, mockHistory, 5 * 60 * 1000);
    
    return mockHistory;
  }
};

export const fetchCoinDetails = async (coinId: string): Promise<string> => {
  try {
    const cacheKey = `coin-details-${coinId}`;
    
    // Try to get from cache first
    const cached = cacheService.get<string>(cacheKey);
    if (cached) {
      return cached;
    }
     
     const headers = getHeaders();
     const response = await fetch(`${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`, { headers });
     
     if (!response.ok) {
         return ''; // Fail silently for description
     }

     const data = await response.json();
     // Safe navigation and basic HTML stripping if necessary (CoinGecko usually sends HTML in description)
     const fullDesc = data.description?.en || '';
     const stripped = fullDesc.replace(/<[^>]*>?/gm, '');
     const sentences = stripped.split('. ');
     // Return first 2-3 sentences
     const description = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
     
     // Cache for 1 hour
     cacheService.set(cacheKey, description, 60 * 60 * 1000);
     
     return description;
  } catch (err: any) {
    errorService.logWarning("Failed to fetch coin details", { coinId, error: err.message, stack: err.stack });
    return '';
  }
};
