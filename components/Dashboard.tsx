import React, { useState } from 'react';
import { analyzeMarket } from '../services/geminiService';
import PriceChart from './PriceChart';
import { ArrowUpRight, Activity, DollarSign, BarChart3, Newspaper, Sparkles, Cpu, Globe } from 'lucide-react';
import { Coin, NewsItem } from '../types';

interface DashboardProps {
  coins: Coin[];
  news: NewsItem[];
  onNavigateToMarket: (coinId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ coins, news, onNavigateToMarket }) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isAiAvailable = import.meta.env.VITE_AI_ENABLED === 'true';

  const handleGenerateAnalysis = async () => {
    if (coins.length === 0 || !isAiAvailable) return;
    setLoading(true);
    const result = await analyzeMarket(coins.slice(0, 5));
    setAiSummary(result);
    setLoading(false);
  };

  const globalMarketCap = coins.reduce((acc, coin) => acc + coin.marketCap, 0);
  const totalVolume = coins.reduce((acc, coin) => acc + coin.volume24h, 0);

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay }: any) => (
      <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 animate-fade-in`} style={{animationDelay: delay}}>
          <div className={`absolute top-0 right-0 p-32 ${colorClass} opacity-5 blur-3xl rounded-full -mr-16 -mt-16 transition-opacity group-hover:opacity-10`}></div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-crypto-muted text-xs font-bold tracking-widest uppercase">{title}</p>
                      <h3 className="text-3xl font-bold text-white mt-2 font-mono tracking-tight">{value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${colorClass.replace('bg-', 'text-')} shadow-lg`}>
                      <Icon size={24} />
                  </div>
              </div>
              <div className={`flex items-center text-xs font-medium ${colorClass.replace('bg-', 'text-')} bg-white/5 w-fit px-3 py-1 rounded-full`}>
                  <ArrowUpRight size={14} className="mr-1" />
                  <span>{subtext}</span>
              </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="Global Market Cap" 
            value={`$${(globalMarketCap / 1e12).toFixed(2)}T`}
            subtext="Live Data Stream"
            icon={Globe}
            colorClass="bg-crypto-success"
            delay="0ms"
        />
        <StatCard 
            title="24h Volume" 
            value={`$${(totalVolume / 1e9).toFixed(2)}B`}
            subtext="High Activity"
            icon={Activity}
            colorClass="bg-crypto-accent"
            delay="100ms"
        />
        <StatCard 
            title="BTC Dominance" 
            value={`${coins.find(c => c.symbol === 'BTC') ? ((coins.find(c => c.symbol === 'BTC')!.marketCap / globalMarketCap) * 100).toFixed(1) : '54.2'}%`}
            subtext="Market Leader"
            icon={BarChart3}
            colorClass="bg-crypto-secondary"
            delay="200ms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          <PriceChart />
          
          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Newspaper size={20}/> 
                </div>
                <span>Global Intelligence Feed</span>
             </h3>
             <div className="space-y-4">
                {news.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="group flex gap-4 p-4 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer">
                        <div className={`w-1 self-stretch rounded-full ${item.sentiment === 'bullish' ? 'bg-crypto-success shadow-[0_0_8px_#00FF94]' : item.sentiment === 'bearish' ? 'bg-crypto-danger shadow-[0_0_8px_#FF0055]' : 'bg-gray-600'}`}></div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-200 group-hover:text-crypto-accent transition-colors">{item.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-1 mt-1 font-light">{item.summary}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-mono">
                                <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{item.source}</span>
                                <span>{item.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-1 rounded-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-crypto-secondary via-crypto-accent to-crypto-secondary animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-crypto-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="p-6 h-full flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-crypto-secondary/10 rounded-xl flex items-center justify-center border border-crypto-secondary/20">
                            <Cpu size={20} className="text-crypto-secondary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Gemini AI Core</h3>
                            <p className={`text-xs font-mono ${isAiAvailable ? 'text-crypto-accent' : 'text-crypto-danger'}`}>
                                STATUS: {isAiAvailable ? 'ONLINE' : 'OFFLINE'}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-4 w-full animate-[scan_2s_linear_infinite] pointer-events-none opacity-20"></div>
                  
                  {loading ? (
                      <div className="space-y-4 h-full flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-crypto-accent font-mono text-xs mb-2">
                             <span className="animate-spin">⟳</span> PROCESSING DATA STREAMS...
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-crypto-accent animate-[width_1.5s_ease-in-out_infinite] w-0"></div>
                          </div>
                          <div className="space-y-2 opacity-50">
                              <div className="h-2 bg-gray-800 rounded w-full"></div>
                              <div className="h-2 bg-gray-800 rounded w-3/4"></div>
                          </div>
                      </div>
                  ) : aiSummary ? (
                      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-light tracking-wide h-full overflow-y-auto pr-2 custom-scrollbar">
                          {aiSummary}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                          <Sparkles size={32} className="text-gray-700 mb-4" />
                          <p className="text-xs text-gray-500 font-mono mb-6">
                            {isAiAvailable ? 'AWAITING INPUT COMMAND' : 'AI CORE OFFLINE'}
                          </p>
                          <button 
                              onClick={handleGenerateAnalysis}
                              disabled={!isAiAvailable || coins.length === 0}
                              className="w-full py-3 bg-crypto-secondary/20 hover:bg-crypto-secondary/30 border border-crypto-secondary/50 text-crypto-secondary rounded-lg transition-all text-sm font-bold tracking-wider hover:shadow-[0_0_15px_rgba(112,0,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              INITIALIZE ANALYSIS
                          </button>
                      </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Market Movers</h4>
                    <div className="space-y-3">
                        {coins.slice(0,5).map(coin => (
                            <div 
                                key={coin.id} 
                                onClick={() => onNavigateToMarket(coin.id)}
                                className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-xs font-mono text-gray-500">#{coin.marketCap.toString().substring(0,1)}</div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{coin.symbol}</span>
                                </div>
                                <span className={`text-xs font-mono font-bold ${coin.change24h >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                                    {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
