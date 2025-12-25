import React, { useState } from 'react';
import { generateTradingSignal } from '../services/geminiService';
import { Signal, Coin, UserProfile } from '../types';
import { Zap, Target, ShieldAlert, Search, Activity, Lock, Unlock, Radio, PlayCircle } from 'lucide-react';

interface SignalsProps {
  coins: Coin[];
  user: UserProfile | null;
  onExecuteTrade: (coinId: string, type: 'BUY' | 'SELL', amount: number) => Promise<void>;
}

const Signals: React.FC<SignalsProps> = ({ coins, user, onExecuteTrade }) => {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loadingSignal, setLoadingSignal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCoins = coins.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGetSignal = async (coin: Coin) => {
    setLoadingSignal(true);
    setSignal(null);
    const result = await generateTradingSignal(coin);
    setSignal(result);
    setLoadingSignal(false);
  };

  const handleExecuteSignal = async () => {
      if (!signal || !user) return;
      
      const coinSymbol = signal.pair.split('/')[0];
      const coin = coins.find(c => c.symbol === coinSymbol);
      if (!coin) return;

      setExecuting(true);
      // Simulate buying 5% of balance for buy signals or 50% of holdings for sell
      let amount = 0;
      if (signal.type === 'BUY') {
          const spend = user.balance * 0.05; // Use 5% of balance
          amount = spend / signal.entry;
      } else {
          const pos = user.positions.find(p => p.coinId === coin.id);
          if (pos) {
              amount = pos.amount * 0.5;
          }
      }

      if (amount > 0) {
        await onExecuteTrade(coin.id, signal.type, amount);
      }
      
      setExecuting(false);
      alert("Signal Executed: Trade Placed");
  };

  const getConfidenceColor = (score: number) => {
      if (score >= 80) return 'text-crypto-success';
      if (score >= 60) return 'text-yellow-400';
      return 'text-crypto-danger';
  };

  const getConfidenceBg = (score: number) => {
      if (score >= 80) return 'bg-crypto-success';
      if (score >= 60) return 'bg-yellow-400';
      return 'bg-crypto-danger';
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white tracking-wide">
                    <Zap className="text-crypto-secondary" />
                    <span>AI Signal Processor</span>
                </h2>
                <p className="text-gray-400 text-xs font-mono mt-1 tracking-widest uppercase">Predictive Algorithmic Trading</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-crypto-secondary/10 rounded-full border border-crypto-secondary/20 text-[10px] font-mono text-crypto-secondary animate-pulse">
                <Radio size={12} /> LIVE SCANNING
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Asset Selector */}
            <div className="glass-panel rounded-2xl p-4 flex flex-col h-full border-crypto-secondary/20">
                <div className="mb-4 space-y-2">
                    <h3 className="font-bold text-gray-300 uppercase text-xs tracking-wider flex items-center gap-2">
                        <Search size={14} /> Target Acquisition
                    </h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="SEARCH PAIR (e.g. BTC)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-sm text-white rounded-xl pl-4 pr-3 py-3 focus:ring-1 focus:ring-crypto-secondary outline-none font-mono transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {filteredCoins.length > 0 ? (
                        filteredCoins.map(coin => (
                        <button
                            key={coin.id}
                            onClick={() => handleGetSignal(coin)}
                            className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-[10px] text-gray-400 group-hover:text-white transition-colors">
                                    {coin.symbol[0]}
                                </div>
                                <div className="text-left">
                                    <div className="text-gray-200 font-bold text-sm group-hover:text-crypto-secondary transition-colors">{coin.symbol}</div>
                                    <div className="text-[10px] text-gray-600 font-mono group-hover:text-gray-500">USD PAIR</div>
                                </div>
                            </div>
                            <span className={`text-xs font-mono ${coin.change24h >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                                {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                            </span>
                        </button>
                    ))
                    ) : (
                        <div className="text-center text-gray-500 text-xs font-mono py-8">NO MATCHES FOUND</div>
                    )}
                </div>
            </div>

            {/* Signal Display */}
            <div className="lg:col-span-2 h-full">
                {loadingSignal ? (
                    <div className="h-full flex flex-col items-center justify-center glass-panel rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-crypto-secondary/5 animate-pulse"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 border-4 border-crypto-secondary/30 border-t-crypto-secondary rounded-full animate-spin mb-8"></div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-widest">ANALYZING</h3>
                            <p className="text-crypto-secondary font-mono text-xs tracking-[0.2em] animate-pulse">RUNNING PREDICTIVE MODELS...</p>
                        </div>
                    </div>
                ) : signal ? (
                    <div className="glass-panel rounded-2xl p-8 h-full relative overflow-hidden border border-crypto-secondary/30 flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-crypto-secondary/10 blur-[80px] rounded-full pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                             <div>
                                <div className="text-gray-500 font-mono text-xs mb-1 uppercase tracking-wider">Asset Pair</div>
                                <h3 className="text-5xl font-bold text-white tracking-tighter">{signal.pair}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`px-6 py-3 ${signal.type === 'BUY' ? 'bg-crypto-success text-black' : 'bg-crypto-danger text-white'} rounded-xl font-bold font-mono tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-2`}>
                                    {signal.type === 'BUY' ? <Unlock size={18}/> : <Lock size={18}/>}
                                    {signal.type} ORDER
                                </div>
                                {user && (
                                    <button 
                                        onClick={handleExecuteSignal}
                                        disabled={executing}
                                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-white transition-all flex items-center gap-2 font-bold text-sm tracking-wide"
                                    >
                                        <PlayCircle size={20} className={executing ? "animate-spin" : ""} />
                                        AUTO-EXECUTE
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gray-600"></div>
                                <div className="text-gray-500 text-[10px] mb-2 font-mono uppercase tracking-wider">Entry Zone</div>
                                <div className="text-3xl font-mono text-white group-hover:text-crypto-accent transition-colors">${signal.entry.toFixed(2)}</div>
                            </div>
                            <div className="bg-crypto-success/5 p-6 rounded-2xl border border-crypto-success/20 relative overflow-hidden group">
                                 <div className="absolute top-0 left-0 w-1 h-full bg-crypto-success"></div>
                                <div className="text-crypto-success text-[10px] mb-2 flex items-center gap-1 font-mono uppercase tracking-wider"><Target size={12}/> Target</div>
                                <div className="text-3xl font-mono text-crypto-success text-glow">${signal.target.toFixed(2)}</div>
                            </div>
                            <div className="bg-crypto-danger/5 p-6 rounded-2xl border border-crypto-danger/20 relative overflow-hidden group">
                                 <div className="absolute top-0 left-0 w-1 h-full bg-crypto-danger"></div>
                                <div className="text-crypto-danger text-[10px] mb-2 flex items-center gap-1 font-mono uppercase tracking-wider"><ShieldAlert size={12}/> Stop Loss</div>
                                <div className="text-3xl font-mono text-crypto-danger text-glow">${signal.stopLoss.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-2xl border border-white/5 flex-1 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-300 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={16} className="text-crypto-secondary"/> AI Reasoning Model
                                </h4>
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/5">
                                    <div className="flex h-2 w-2 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getConfidenceBg(signal.confidence)} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${getConfidenceBg(signal.confidence)}`}></span>
                                    </div>
                                    <span className={`text-[10px] font-bold ${getConfidenceColor(signal.confidence)} font-mono`}>
                                        {signal.confidence}% SCORE
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed text-sm font-light border-l-2 border-crypto-secondary/30 pl-4 mb-6">
                                {signal.reasoning}
                            </p>

                            {/* Confidence Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider">
                                    <span>Signal Strength</span>
                                    <span className={getConfidenceColor(signal.confidence)}>
                                        {signal.confidence >= 80 ? 'STRONG CONVICTION' : signal.confidence >= 60 ? 'MODERATE' : 'WEAK'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${getConfidenceBg(signal.confidence)} transition-all duration-1000 ease-out`} 
                                        style={{ width: `${signal.confidence}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                                    Generated at {new Date(signal.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${getConfidenceColor(signal.confidence)} tracking-wide`}>
                                        {signal.confidence >= 80 ? 'HIGH CONFIDENCE' : 'STANDARD RISK'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                     <div className="h-full flex flex-col items-center justify-center glass-panel rounded-2xl p-8 text-gray-600 border-dashed border-2 border-white/5 bg-black/20">
                        <div className="p-6 bg-white/5 rounded-full mb-6">
                            <Zap size={48} className="text-gray-700" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-500 mb-2">AWAITING TARGET SELECTION</h3>
                        <p className="font-mono text-xs tracking-widest text-gray-600">SELECT AN ASSET TO INITIATE SIGNAL PROTOCOL</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Signals;