/**
 * Chart Analysis Component
 * Displays technical indicators and analysis
 */

import React, { useEffect, useState } from 'react';
import { binanceService, CandleData } from '../services/binanceService';
import { technicalIndicatorsService, IndicatorData } from '../services/technicalIndicatorsService';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface ChartAnalysisProps {
  symbol: string;
  timeframe?: string;
}

interface AnalysisResult {
  indicators: IndicatorData;
  signals: {
    rsiSignal: 'overbought' | 'oversold' | 'neutral';
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    bbSignal: 'overbought' | 'oversold' | 'neutral';
  };
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({ symbol, timeframe = '1h' }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeChart = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get candle data
        const candles = await binanceService.getCandles(symbol, timeframe, 100);

        if (!candles || candles.length === 0) {
          setError('No data available');
          return;
        }

        // Extract price data
        const prices = candles.map((c: CandleData) => c.close);
        const highs = candles.map((c: CandleData) => c.high);
        const lows = candles.map((c: CandleData) => c.low);
        const closes = candles.map((c: CandleData) => c.close);

        // Calculate indicators
        const indicators = technicalIndicatorsService.calculateAllIndicators(
          prices,
          highs,
          lows,
          closes
        );

        // Get signals
        const signals = technicalIndicatorsService.getSignals(indicators);

        // Determine trend
        const trend =
          signals.macdSignal === 'bullish' && indicators.rsi < 70
            ? 'bullish'
            : signals.macdSignal === 'bearish' && indicators.rsi > 30
            ? 'bearish'
            : 'neutral';

        // Calculate strength (0-100)
        const strength = Math.abs(indicators.macd.histogram) * 10;

        setAnalysis({
          indicators,
          signals,
          trend,
          strength: Math.min(strength, 100)
        });
      } catch (err) {
        console.error('❌ Failed to analyze chart:', err);
        setError('Failed to analyze chart');
      } finally {
        setLoading(false);
      }
    };

    analyzeChart();
  }, [symbol, timeframe]);

  if (loading) {
    return (
      <div className="bg-crypto-card rounded-lg p-6 border border-white/5">
        <p className="text-crypto-muted">Analyzing chart...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-crypto-card rounded-lg p-6 border border-white/5">
        <p className="text-crypto-danger flex items-center gap-2">
          <AlertCircle size={16} />
          {error || 'Analysis unavailable'}
        </p>
      </div>
    );
  }

  const { indicators, signals, trend, strength } = analysis;

  const getTrendColor = (t: string) => {
    switch (t) {
      case 'bullish':
        return 'text-crypto-success';
      case 'bearish':
        return 'text-crypto-danger';
      default:
        return 'text-crypto-muted';
    }
  };

  const getTrendBgColor = (t: string) => {
    switch (t) {
      case 'bullish':
        return 'bg-crypto-success/10 border-crypto-success/30';
      case 'bearish':
        return 'bg-crypto-danger/10 border-crypto-danger/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'overbought':
      case 'bearish':
        return 'text-crypto-danger';
      case 'oversold':
      case 'bullish':
        return 'text-crypto-success';
      default:
        return 'text-crypto-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Trend Overview */}
      <div className={`rounded-lg p-6 border ${getTrendBgColor(trend)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Market Trend</h3>
          <div className={`flex items-center gap-2 ${getTrendColor(trend)}`}>
            {trend === 'bullish' ? (
              <TrendingUp size={24} />
            ) : trend === 'bearish' ? (
              <TrendingDown size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <span className="font-bold text-lg capitalize">{trend}</span>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-crypto-muted text-sm">Signal Strength</span>
            <span className="text-white font-bold">{strength.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                trend === 'bullish'
                  ? 'bg-crypto-success'
                  : trend === 'bearish'
                  ? 'bg-crypto-danger'
                  : 'bg-crypto-muted'
              }`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/30 rounded p-3">
            <p className="text-crypto-muted text-xs uppercase mb-1">MACD</p>
            <p className={`font-bold capitalize ${getSignalColor(signals.macdSignal)}`}>
              {signals.macdSignal}
            </p>
          </div>
          <div className="bg-black/30 rounded p-3">
            <p className="text-crypto-muted text-xs uppercase mb-1">RSI</p>
            <p className={`font-bold capitalize ${getSignalColor(signals.rsiSignal)}`}>
              {signals.rsiSignal}
            </p>
          </div>
          <div className="bg-black/30 rounded p-3">
            <p className="text-crypto-muted text-xs uppercase mb-1">BB</p>
            <p className={`font-bold capitalize ${getSignalColor(signals.bbSignal)}`}>
              {signals.bbSignal}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Indicators */}
      <div className="grid grid-cols-2 gap-4">
        {/* RSI */}
        <div className="bg-crypto-card rounded-lg p-4 border border-white/5">
          <p className="text-crypto-muted text-sm uppercase mb-3">RSI (14)</p>
          <div className="mb-3">
            <p className="text-2xl font-bold text-white">{indicators.rsi.toFixed(2)}</p>
            <p className="text-xs text-crypto-muted mt-1">
              {indicators.rsi > 70
                ? 'Overbought'
                : indicators.rsi < 30
                ? 'Oversold'
                : 'Neutral'}
            </p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all ${
                indicators.rsi > 70
                  ? 'bg-crypto-danger'
                  : indicators.rsi < 30
                  ? 'bg-crypto-success'
                  : 'bg-crypto-accent'
              }`}
              style={{ width: `${indicators.rsi}%` }}
            />
          </div>
        </div>

        {/* MACD */}
        <div className="bg-crypto-card rounded-lg p-4 border border-white/5">
          <p className="text-crypto-muted text-sm uppercase mb-3">MACD</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-crypto-muted">Line</p>
              <p className="text-lg font-bold text-white">
                {indicators.macd.line.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-crypto-muted">Signal</p>
              <p className="text-lg font-bold text-white">
                {indicators.macd.signal.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-crypto-muted">Histogram</p>
              <p
                className={`text-lg font-bold ${
                  indicators.macd.histogram > 0
                    ? 'text-crypto-success'
                    : 'text-crypto-danger'
                }`}
              >
                {indicators.macd.histogram.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="bg-crypto-card rounded-lg p-4 border border-white/5">
          <p className="text-crypto-muted text-sm uppercase mb-3">Moving Averages</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-crypto-muted">SMA (20)</p>
              <p className="text-lg font-bold text-white">
                ${indicators.sma.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-crypto-muted">EMA (20)</p>
              <p className="text-lg font-bold text-white">
                ${indicators.ema.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div className="bg-crypto-card rounded-lg p-4 border border-white/5">
          <p className="text-crypto-muted text-sm uppercase mb-3">Bollinger Bands</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-crypto-muted">Upper</p>
              <p className="text-lg font-bold text-crypto-danger">
                ${indicators.bollingerBands.upper.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-crypto-muted">Middle</p>
              <p className="text-lg font-bold text-crypto-accent">
                ${indicators.bollingerBands.middle.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-crypto-muted">Lower</p>
              <p className="text-lg font-bold text-crypto-success">
                ${indicators.bollingerBands.lower.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-crypto-card rounded-lg p-4 border border-white/5">
        <p className="text-crypto-muted text-sm uppercase mb-3">Analysis Summary</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-crypto-accent mt-1">•</span>
            <span className="text-gray-300">
              {trend === 'bullish'
                ? 'Bullish momentum detected. Consider buying on dips.'
                : trend === 'bearish'
                ? 'Bearish momentum detected. Consider selling on rallies.'
                : 'No clear trend. Wait for confirmation.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-crypto-accent mt-1">•</span>
            <span className="text-gray-300">
              RSI is {indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral'}.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-crypto-accent mt-1">•</span>
            <span className="text-gray-300">
              MACD shows {signals.macdSignal} signal with{' '}
              {Math.abs(indicators.macd.histogram).toFixed(4)} histogram value.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChartAnalysis;
