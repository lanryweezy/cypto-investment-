import { Coin, NewsItem } from './types';

export const MOCK_COINS: Coin[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 64230.50, change24h: 2.4, marketCap: 1200000000000, volume24h: 35000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3450.12, change24h: -1.2, marketCap: 400000000000, volume24h: 15000000000, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', price: 145.60, change24h: 5.7, marketCap: 65000000000, volume24h: 4000000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 590.20, change24h: 0.5, marketCap: 87000000000, volume24h: 1200000000, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.62, change24h: 1.1, marketCap: 34000000000, volume24h: 1500000000, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: -0.8, marketCap: 16000000000, volume24h: 400000000, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', price: 35.40, change24h: 3.2, marketCap: 13000000000, volume24h: 600000000, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.12, change24h: -4.5, marketCap: 17000000000, volume24h: 900000000, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
];

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'SEC Approves New Crypto ETF', summary: 'The Securities and Exchange Commission has given the green light to a new spot ETF...', source: 'CryptoDaily', time: '2h ago', sentiment: 'bullish' },
  { id: '2', title: 'Network Upgrade Scheduled for ETH', summary: 'Ethereum developers confirm the Pectra upgrade date...', source: 'BlockchainWire', time: '4h ago', sentiment: 'neutral' },
  { id: '3', title: 'Market Volatility Increases Ahead of Fed Meeting', summary: 'Traders represent caution as macro economic data looms...', source: 'FinTech Today', time: '6h ago', sentiment: 'bearish' },
];

// Mock historical data for charts
export const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  name: `Day ${i + 1}`,
  btc: 60000 + Math.random() * 5000,
  eth: 3200 + Math.random() * 300,
}));
