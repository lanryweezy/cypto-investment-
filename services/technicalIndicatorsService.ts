/**
 * Technical Indicators Service
 * Calculates various technical indicators for trading analysis
 */

interface IndicatorData {
  rsi: number;
  macd: { line: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  sma: number;
  ema: number;
}

class TechnicalIndicatorsService {
  /**
   * Calculate Relative Strength Index (RSI)
   * Measures momentum and overbought/oversold conditions
   */
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Default to neutral

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    let gains = 0;
    let losses = 0;

    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        gains += changes[i];
      } else {
        losses += Math.abs(changes[i]);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < changes.length; i++) {
      if (changes[i] > 0) {
        avgGain = (avgGain * (period - 1) + changes[i]) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
      }
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return isNaN(rsi) ? 50 : rsi;
  }

  /**
   * Calculate Moving Average Convergence Divergence (MACD)
   * Identifies trend changes and momentum
   */
  calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { line: number; signal: number; histogram: number } {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    const macdLine = fastEMA - slowEMA;

    // Calculate signal line (EMA of MACD)
    const macdValues = [];
    for (let i = slowPeriod - 1; i < prices.length; i++) {
      const fast = this.calculateEMA(prices.slice(0, i + 1), fastPeriod);
      const slow = this.calculateEMA(prices.slice(0, i + 1), slowPeriod);
      macdValues.push(fast - slow);
    }

    const signalLine = this.calculateEMA(macdValues, signalPeriod);
    const histogram = macdLine - signalLine;

    return {
      line: isNaN(macdLine) ? 0 : macdLine,
      signal: isNaN(signalLine) ? 0 : signalLine,
      histogram: isNaN(histogram) ? 0 : histogram
    };
  }

  /**
   * Calculate Bollinger Bands
   * Identifies volatility and potential support/resistance levels
   */
  calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDevMultiplier: number = 2
  ): { upper: number; middle: number; lower: number } {
    if (prices.length < period) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    const recentPrices = prices.slice(-period);
    const middle = recentPrices.reduce((a, b) => a + b, 0) / period;

    const variance =
      recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) /
      period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: middle + stdDev * stdDevMultiplier,
      middle,
      lower: middle - stdDev * stdDevMultiplier
    };
  }

  /**
   * Calculate Simple Moving Average (SMA)
   * Smooths price data to identify trends
   */
  calculateSMA(prices: number[], period: number = 20): number {
    if (prices.length < period) return prices[prices.length - 1];

    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((a, b) => a + b, 0) / period;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   * Gives more weight to recent prices
   */
  calculateEMA(prices: number[], period: number = 20): number {
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  /**
   * Calculate Average True Range (ATR)
   * Measures volatility
   */
  calculateATR(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14
  ): number {
    if (highs.length < period) return 0;

    const trueRanges = [];

    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }

    const atr =
      trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
    return atr;
  }

  /**
   * Calculate Stochastic Oscillator
   * Compares closing price to price range
   */
  calculateStochastic(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14
  ): { k: number; d: number } {
    if (highs.length < period) return { k: 50, d: 50 };

    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const recentCloses = closes.slice(-period);

    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);

    const k =
      ((recentCloses[recentCloses.length - 1] - lowestLow) /
        (highestHigh - lowestLow)) *
      100;

    // D is 3-period SMA of K
    const d = k; // Simplified for now

    return {
      k: isNaN(k) ? 50 : k,
      d: isNaN(d) ? 50 : d
    };
  }

  /**
   * Calculate all indicators at once
   */
  calculateAllIndicators(
    prices: number[],
    highs: number[],
    lows: number[],
    closes: number[]
  ): IndicatorData {
    return {
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bollingerBands: this.calculateBollingerBands(prices),
      sma: this.calculateSMA(prices),
      ema: this.calculateEMA(prices)
    };
  }

  /**
   * Get indicator signals
   */
  getSignals(indicators: IndicatorData): {
    rsiSignal: 'overbought' | 'oversold' | 'neutral';
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    bbSignal: 'overbought' | 'oversold' | 'neutral';
  } {
    return {
      rsiSignal:
        indicators.rsi > 70
          ? 'overbought'
          : indicators.rsi < 30
          ? 'oversold'
          : 'neutral',
      macdSignal:
        indicators.macd.histogram > 0
          ? 'bullish'
          : indicators.macd.histogram < 0
          ? 'bearish'
          : 'neutral',
      bbSignal: 'neutral' // Simplified
    };
  }
}

export const technicalIndicatorsService = new TechnicalIndicatorsService();
export type { IndicatorData };
