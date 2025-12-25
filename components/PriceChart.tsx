import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DATA } from '../constants';
import { Maximize2, MoreHorizontal } from 'lucide-react';

const PriceChart: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Market Performance</h3>
            <p className="text-xs text-crypto-muted font-mono mt-1">BTC vs ETH • 30 Day Interval</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex gap-4 mr-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-crypto-accent shadow-[0_0_8px_#00F0FF]"></span>
                    <span className="text-xs font-medium text-gray-300">Bitcoin</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-crypto-secondary shadow-[0_0_8px_#7000FF]"></span>
                    <span className="text-xs font-medium text-gray-300">Ethereum</span>
                </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><Maximize2 size={16}/></button>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7000FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7000FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis 
                orientation="right" 
                tick={{fontSize: 11, fill: '#64748B', fontFamily: 'JetBrains Mono'}} 
                axisLine={false} 
                tickLine={false} 
                domain={['auto', 'auto']} 
            />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: 'rgba(5, 6, 10, 0.9)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'Inter' }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Area 
                type="monotone" 
                dataKey="btc" 
                stroke="#00F0FF" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBtc)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', shadow: '0 0 10px #00F0FF' }}
            />
            <Area 
                type="monotone" 
                dataKey="eth" 
                stroke="#7000FF" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEth)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;