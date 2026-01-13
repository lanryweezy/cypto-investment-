
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  description?: string;
  image?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  target: number;
  stopLoss: number;
  reasoning: string;
  timestamp: string;
  confidence: number;
}

export interface Position {
  coinId: string;
  symbol: string;
  amount: number;
  averageEntryPrice: number;
}

export interface Transaction {
    id: string;
    type: 'BUY' | 'SELL';
    coinId: string;
    symbol: string;
    amount: number;
    price: number;
    total: number;
    timestamp: string;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  targetPrice: number;
  type: 'above' | 'below';
  createdAt: string;
  triggered?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number; // USD Cash
  positions: Position[];
  transactions: Transaction[];
  watchlist: string[];
  isLoggedIn: boolean;
}

export type View = 'dashboard' | 'market' | 'news' | 'academy' | 'signals' | 'profile' | 'settings' | 'payment';

export interface MarketAnalysisResponse {
  sentiment: string;
  keyFactors: string[];
  futureProjection: string;
}