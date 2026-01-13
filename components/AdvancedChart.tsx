/**
 * Advanced Chart Component
 * Displays candlestick charts with volume indicators
 * Supports multiple timeframes
 */

import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { binanceService, CandleData } from '../services/binanceService';
import { Loader2 } from 'lucide-react';

interface AdvancedChartProps {
  symbol: string;
  onTimeframeChange?: (timeframe: string) => void;
}

interface ChartData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
const TIMEFRAME_LABELS: { [key: string]: string } = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '1h': '1 Hour',
  '4h': '4 Hours',
  '1d': '1 Day',
  '1w': '1 Week'
};

const AdvancedChart: React.FC<AdvancedChartProps> = ({ symbol, onTimeframeChange }) => {
  const [candles, setCandles] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    high: 0,
    low: 0,
    avg: 0,
    change: 0
  });

  // Load candlestick data
  useEffect(() => {
    const loadCandles = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await binanceService.getCandles(symbol, timeframe, 100);
        
        if (!data || data.length === 0) {
          setError('No data available');
          setCandles([]);
          return;
        }

        // Transform candle data for chart
        const chartData: ChartData[] = data.map((candle: CandleData, index: number) => {
          const prevClose = index > 0 ? data[index - 1].close : candle.open;
          const change = candle.close - prevClose;
          const changePercent = (change / prevClose) * 100;

          return {
            time: new Date(candle.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            timestamp: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
            change,
            changePercent
          };
        });

        setCandles(chartData);

        // Calculate statistics
        const closes = chartData.map(c => c.close);
        const high = Math.max(...closes);
        const low = Math.min(...closes);
        const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
        const change = chartData[chartData.length - 1].close - chartData[0].open;

        setStats({ high, low, avg, change });
      } catch (err) {
        console.error('❌ Failed to load candles:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    loadCandles();
  }, [symbol, timeframe]);

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    onTimeframeChange?.(tf);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-crypto-dark border border-crypto-accent/30 rounded p-3 text-xs">
          <p className="text-gray-400">Time: {data.time}</p>
          <p className="text-white">Open: ${data.open.toFixed(2)}</p>
          <p className="text-white">High: ${data.high.toFixed(2)}</p>
          <p className="text-white">Low: ${data.low.toFixed(2)}</p>
          <p className={data.close >= data.open ? 'text-crypto-success' : 'text-crypto-danger'}>
            Close: ${data.close.toFixed(2)}
          </p>
          <p className="text-gray-400">Volume: {(data.volume / 1e6).toFixed(2)}M</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-crypto-card rounded-lg p-6 border border-white/5">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{symbol} Chart</h3>
          <p className="text-crypto-muted text-sm">{TIMEFRAME_LABELS[timeframe]}</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <p className="text-crypto-muted text-xs uppercase">High</p>
            <p className="text-white font-bold">${stats.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-crypto-muted text-xs uppercase">Low</p>
            <p className="text-white font-bold">${stats.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-crypto-muted text-xs uppercase">Avg</p>
            <p className="text-white font-bold">${stats.avg.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-crypto-muted text-xs uppercase">Change</p>
            <p className={stats.change >= 0 ? 'text-crypto-success font-bold' : 'text-crypto-danger font-bold'}>
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              timeframe === tf
                ? 'bg-crypto-accent text-black shadow-lg shadow-crypto-accent/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-crypto-accent animate-spin" />
            <p className="text-crypto-muted">Loading chart data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-crypto-danger mb-2">⚠️ {error}</p>
            <p className="text-crypto-muted text-sm">Try a different timeframe</p>
          </div>
        </div>
      ) : candles.length === 0 ? (
        <div className="h-96 flex items-center justify-center">
          <p className="text-crypto-muted">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={candles}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a1a2e"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke="#666"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#999' }}
            />

            <YAxis
              stroke="#666"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#999' }}
              domain={['dataMin - 10', 'dataMax + 10']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* Volume bars */}
            <Bar
              yAxisId="right"
              dataKey="volume"
              fill="url(#volumeGradient)"
              name="Volume"
              opacity={0.5}
            />

            {/* Price line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#00F0FF"
              strokeWidth={2}
              dot={false}
              name="Close Price"
              isAnimationActive={false}
            />

            {/* High/Low range */}
            <Line
              type="monotone"
              dataKey="high"
              stroke="#00FF94"
              strokeWidth={1}
              dot={false}
              name="High"
              opacity={0.3}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="low"
              stroke="#FF0055"
              strokeWidth={1}
              dot={false}
              name="Low"
              opacity={0.3}
              isAnimationActive={false}
            />

            {/* Average line */}
            <ReferenceLine
              y={stats.avg}
              stroke="#FFB800"
              strokeDasharray="5 5"
              opacity={0.5}
              label={{ value: 'Avg', position: 'right', fill: '#FFB800', fontSize: 12 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-crypto-muted">Data Points</p>
            <p className="text-white font-bold">{candles.length}</p>
          </div>
          <div>
            <p className="text-crypto-muted">Total Volume</p>
            <p className="text-white font-bold">
              {(candles.reduce((sum, c) => sum + c.volume, 0) / 1e9).toFixed(2)}B
            </p>
          </div>
          <div>
            <p className="text-crypto-muted">Avg Volume</p>
            <p className="text-white font-bold">
              {(candles.reduce((sum, c) => sum + c.volume, 0) / candles.length / 1e6).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChart;
