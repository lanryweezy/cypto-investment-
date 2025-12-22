import { Coin, NewsItem } from '../types';
import { MOCK_COINS, MOCK_NEWS } from '../constants';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
// CryptoCompare for news (Free tier doesn't require key for basic endpoints usually, or use a public proxy if needed)
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

export const fetchTopCoins = async (): Promise<Coin[]> => {
  try {
    const response = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false`);
    
    if (!response.ok) {
        throw new Error(`CoinGecko API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      image: coin.image
    }));
  } catch (err) {
    console.warn("Failed to fetch live coins, using mock data:", err);
    return MOCK_COINS;
  }
};

export const fetchCryptoNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(NEWS_API);
    
    if (!response.ok) {
        throw new Error(`News API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // CryptoCompare structure: { Data: [ { id, title, body, source_info: { name }, published_on } ] }
    return data.Data.slice(0, 10).map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.body.substring(0, 150) + '...',
      source: item.source_info.name,
      time: new Date(item.published_on * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentiment: 'neutral' // API doesn't provide pre-calculated sentiment for free, defaulting to neutral
    }));
  } catch (err) {
    console.warn("Failed to fetch live news, using mock data:", err);
    return MOCK_NEWS;
  }
};

export const fetchCoinHistory = async (coinId: string): Promise<{ date: string; price: number }[]> => {
  try {
    // 30 days of history, daily interval
    const response = await fetch(`${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }

    const data = await response.json();
    return data.prices.map((item: [number, number]) => ({
      date: new Date(item[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: item[1]
    }));
  } catch (err) {
    console.warn(`Failed to fetch history for ${coinId}, using mock fallback`, err);
    // Generate deterministic mock data based on coinId char code sum
    const seed = coinId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 1000 + (seed % 1000);
    
    return Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      price: basePrice + Math.sin(i + seed) * (basePrice * 0.1) + Math.random() * (basePrice * 0.05)
    }));
  }
};

export const fetchCoinDetails = async (coinId: string): Promise<string> => {
  try {
     const response = await fetch(`${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`);
     
     if (!response.ok) {
         return ''; // Fail silently for description
     }

     const data = await response.json();
     // Safe navigation and basic HTML stripping if necessary (CoinGecko usually sends HTML in description)
     const fullDesc = data.description?.en || '';
     const stripped = fullDesc.replace(/<[^>]*>?/gm, '');
     const sentences = stripped.split('. ');
     // Return first 2-3 sentences
     return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
  } catch (err) {
    console.warn("Failed to fetch coin details", err);
    return '';
  }
};
