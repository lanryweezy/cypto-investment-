import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchTopCoins, fetchCryptoNews, fetchCoinHistory, fetchCoinDetails } from '../../services/cryptoService';
import { MOCK_COINS, MOCK_NEWS } from '../../constants';

// Mock the fetch API
global.fetch = vi.fn();

type Mock = vi.MockInstance<any, any[]>;

describe('CryptoService', () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as Mock).mockClear();
  });

  it('should fetch top coins successfully', async () => {
    const mockResponse = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        current_price: 64230.50,
        price_change_percentage_24h: 2.4,
        market_cap: 1200000000000,
        total_volume: 35000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      }
    ];

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const coins = await fetchTopCoins();

    expect(fetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false',
      { headers: {} }
    );
    expect(coins).toHaveLength(1);
    expect(coins[0].id).toBe('bitcoin');
    expect(coins[0].name).toBe('Bitcoin');
  });

  it('should return mock coins when API fails', async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const coins = await fetchTopCoins();

    expect(coins).toEqual(MOCK_COINS);
  });

  it('should fetch crypto news successfully', async () => {
    const mockResponse = {
      Data: [
        {
          id: '1',
          title: 'Test News',
          body: 'This is a test news article',
          source_info: { name: 'Test Source' },
          published_on: Date.now() / 1000
        }
      ]
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const news = await fetchCryptoNews();

    expect(fetch).toHaveBeenCalledWith(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
      { headers: {} }
    );
    expect(news).toHaveLength(1);
    expect(news[0].title).toBe('Test News');
  });

  it('should return mock news when API fails', async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const news = await fetchCryptoNews();

    expect(news).toEqual(MOCK_NEWS);
  });

  it('should fetch coin history successfully', async () => {
    const coinId = 'bitcoin';
    const mockResponse = {
      prices: [
        [Date.now() - 86400000, 64000],
        [Date.now(), 64230.50]
      ]
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const history = await fetchCoinHistory(coinId);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`,
      { headers: {} }
    );
    expect(history).toHaveLength(2);
    expect(history[0].price).toBe(64000);
  });

  it('should return mock history when API fails', async () => {
    const coinId = 'bitcoin';
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const history = await fetchCoinHistory(coinId);

    expect(history).toHaveLength(30); // Default mock history length
    expect(history[0].date).toBe('Day 1');
  });

  it('should fetch coin details successfully', async () => {
    const coinId = 'bitcoin';
    const mockResponse = {
      description: {
        en: 'Bitcoin is a decentralized cryptocurrency.'
      }
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const details = await fetchCoinDetails(coinId);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      { headers: {} }
    );
    expect(details).toContain('Bitcoin is a decentralized cryptocurrency');
  });

  it('should return empty string when coin details API fails', async () => {
    const coinId = 'bitcoin';
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const details = await fetchCoinDetails(coinId);

    expect(details).toBe('');
  });

  it('should handle API errors gracefully', async () => {
    const coinId = 'bitcoin';
    
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(fetchCoinDetails(coinId)).resolves.toBe('');
  });
});