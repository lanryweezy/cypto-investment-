import React, { useState, useMemo, useEffect } from 'react';
import { generateFutureProjection, generateTradingSignal } from '../services/geminiService';
import { fetchCoinHistory, fetchCoinDetails } from '../services/cryptoService';
import { Coin, UserProfile, PriceAlert, Signal } from '../types';
import { Sparkles, TrendingUp, AlertTriangle, Loader2, Info, Target, BarChart2, FileText, Search, Bell, BellRing, Trash2, Plus, X, Cpu, Zap, ArrowLeftRight, Star, SortAsc, SortDesc } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, ReferenceLine, Label } from 'recharts';
import TradingPanel from './TradingPanel';

interface MarketAnalysisProps {
  coins: Coin[];
  user: UserProfile | null;
  onExecuteTrade: (coinId: string, type: 'BUY' | 'SELL', amount: number) => Promise<void>;
  selectedCoinId: string | null;
  onSelectCoin: (id: string) => void;
  alerts: PriceAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  onToggleWatchlist: (symbol: string) => void;
}

const NotificationToast = ({ message, onClose, type }: { message: string, onClose: () => void, type: 'success' | 'warning' }) => (
    <div className={`fixed bottom-6 right-6 p-1 rounded-xl shadow-2xl animate-bounce-in z-50 overflow-hidden`}>
      <div className={`absolute inset-0 opacity-20 ${type === 'success' ? 'bg-crypto-success' : 'bg-crypto-accent'}`}></div>
      <div className="relative bg-[#05060A]/90 backdrop-blur-xl border border-white/10 rounded-lg p-4 flex items-center gap-4 min-w-[300px]">
        <div className={`p-2 rounded-lg ${type === 'success' ? 'text-crypto-success bg-crypto-success/10' : 'text-crypto-accent bg-crypto-accent/10'}`}>
           {type === 'success' ? <BellRing size={20} /> : <AlertTriangle size={20} />}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-sm tracking-wide uppercase ${type === 'success' ? 'text-crypto-success' : 'text-crypto-accent'}`}>Alert Triggered</h4>
          <p className="text-xs text-gray-300 font-mono mt-1">{message}</p>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors text-gray-400"><X size={14}/></button>
      </div>
    </div>
);

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ 
    coins, 
    user, 
    onExecuteTrade, 
    selectedCoinId, 
    onSelectCoin,
    alerts, 
    setAlerts,
    onToggleWatchlist
}) => {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [projection, setProjection] = useState<string>('');
  const [historyData, setHistoryData] = useState<{ date: string; price: number }[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'gainers' | 'losers'>('rank');
  const [aiSignal, setAiSignal] = useState<Signal | null>(null);
  
  // Tabs for right panel
  const [activeTab, setActiveTab] = useState<'analysis' | 'trade'>('analysis');

  // Comparison State
  const [comparisonId, setComparisonId] = useState<string>('none');
  const [comparisonData, setComparisonData] = useState<{ date: string; price: number }[]>([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Alert & Live Price State
  const [alertTarget, setAlertTarget] = useState<string>('');
  const [livePrice, setLivePrice] = useState<number>(0);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'warning'} | null>(null);

  const sortedCoins = useMemo(() => {
    let result = [...coins];
    if (sortBy === 'gainers') {
        result.sort((a, b) => b.change24h - a.change24h);
    } else if (sortBy === 'losers') {
        result.sort((a, b) => a.change24h - b.change24h);
    } else {
        result.sort((a, b) => b.marketCap - a.marketCap);
    }
    return result;
  }, [coins, sortBy]);

  const filteredCoins = sortedCoins.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sync prop selection with local state
  useEffect(() => {
    if (selectedCoinId) {
        const coin = coins.find(c => c.id === selectedCoinId);
        if (coin && coin.id !== selectedCoin?.id) {
            handleAnalyze(coin);
        }
    } else if (coins.length > 0 && !selectedCoin) {
        // Default select first if nothing selected
        handleAnalyze(coins[0]);
    }
  }, [selectedCoinId, coins]); 

  // Initialize live price when coin is selected
  useEffect(() => {
    if (selectedCoin) {
        setLivePrice(selectedCoin.price);
        // Do not reset tab here to preserve user context if they are trading
    }
  }, [selectedCoin]);

  // Simulate live price updates and check alerts
  useEffect(() => {
    if (!selectedCoin) return;

    const interval = setInterval(() => {
        setLivePrice(prev => {
            const change = 1 + (Math.random() * 0.004 - 0.002);
            const newPrice = prev * change;

            const triggered = alerts.find(a => 
                !a.triggered && 
                a.coinId === selectedCoin.id && 
                ((a.type === 'above' && newPrice >= a.targetPrice) || 
                 (a.type === 'below' && newPrice <= a.targetPrice))
            );

            if (triggered) {
                setNotification({
                    message: `${selectedCoin.symbol} hit $${newPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}`,
                    type: triggered.type === 'above' ? 'success' : 'warning'
                });
                setAlerts(current => current.map(a => a.id === triggered.id ? {...a, triggered: true} : a));
            }

            return newPrice;
        });
    }, 2000); 

    return () => clearInterval(interval);
  }, [selectedCoin, alerts]);

  const handleAnalyze = async (coin: Coin) => {
    setSelectedCoin(coin);
    onSelectCoin(coin.id); // Update parent state
    setLoading(true);
    setProjection('');
    setHistoryData([]);
    setDescription('');
    setAlertTarget('');
    setAiSignal(null);
    
    // Reset comparison
    setComparisonId('none');
    setComparisonData([]);

    try {
      const [aiResult, historyResult, descResult, signalResult] = await Promise.all([
        generateFutureProjection(coin),
        fetchCoinHistory(coin.id),
        fetchCoinDetails(coin.id),
        generateTradingSignal(coin)
      ]);

      setProjection(aiResult);
      setHistoryData(historyResult);
      setDescription(descResult);
      setAiSignal(signalResult);
    } catch (e) {
      console.error("Analysis failed", e);
      setProjection("Error generating analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleComparison = async (targetId: string) => {
    if (targetId === comparisonId) return;
    setComparisonId(targetId);
    if (targetId === 'none') {
        setComparisonData([]);
        return;
    }
    setLoadingComparison(true);
    try {
        const data = await fetchCoinHistory(targetId);
        setComparisonData(data);
    } catch (e) {
        console.error("Failed to load comparison data", e);
    } finally {
        setLoadingComparison(false);
    }
  };

  const handleAddAlert = () => {
    if (!selectedCoin || !alertTarget) return;
    const price = parseFloat(alertTarget);
    if (isNaN(price) || price <= 0) return;

    const type = price > livePrice ? 'above' : 'below';
    
    const newAlert: PriceAlert = {
        id: Math.random().toString(36).substr(2, 9),
        coinId: selectedCoin.id,
        targetPrice: price,
        type,
        createdAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        triggered: false
    };

    setAlerts(prev => [...prev, newAlert]);
    setAlertTarget('');
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const currentCoinAlerts = useMemo(() => {
    return selectedCoin ? alerts.filter(a => a.coinId === selectedCoin.id) : [];
  }, [selectedCoin, alerts]);

  const chartData = useMemo(() => {
    if (!historyData.length) return [];
    if (comparisonId === 'none' || !comparisonData.length) {
        return historyData.map(d => ({ ...d, type: 'price' }));
    }
    const basePrimary = historyData[0].price;
    const baseCompare = comparisonData[0]?.price || 1;
    return historyData.map((d, i) => {
        const comp = comparisonData[i];
        return {
            date: d.date,
            type: 'percent',
            price: ((d.price - basePrimary) / basePrimary) * 100,
            comparePrice: comp ? ((comp.price - baseCompare) / baseCompare) * 100 : 0,
            originalPrice: d.price,
            originalCompare: comp?.price
        };
    });
  }, [historyData, comparisonData, comparisonId]);

  const isError = projection.startsWith('⚠️') || projection.includes('unavailable') || projection.includes('Error');

  return (
    <div className="space-y-6">
        {notification && (
            <NotificationToast 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification(null)} 
            />
        )}

        <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Market Intelligence</h2>
                <div className="text-xs text-crypto-accent font-mono mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-crypto-accent animate-pulse"></span>
                    AI NEURAL NET: ACTIVE
                </div>
            </div>
            <div className="text-xs text-gray-500 font-mono">v2.4.0-Stable</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coin List */}
            <div className="lg:col-span-1 glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[800px]">
                <div className="p-4 border-b border-white/5 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="SEARCH ASSETS..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-sm text-white rounded-xl pl-10 pr-4 py-3 focus:ring-1 focus:ring-crypto-accent focus:border-crypto-accent/50 outline-none font-mono placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['rank', 'gainers', 'losers'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setSortBy(type)}
                                className={`px-2 py-1 text-[10px] uppercase font-bold rounded-lg border flex-1 transition-all ${sortBy === type ? 'bg-white/10 text-white border-white/20' : 'text-gray-500 border-transparent hover:bg-white/5'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="divide-y divide-white/5 overflow-y-auto flex-1 custom-scrollbar">
                    {filteredCoins.length > 0 ? (
                        filteredCoins.map(coin => (
                        <div 
                            key={coin.id}
                            onClick={() => handleAnalyze(coin)}
                            className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${selectedCoin?.id === coin.id ? 'bg-crypto-accent/5 border-l-2 border-crypto-accent' : 'border-l-2 border-transparent'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {coin.image ? (
                                        <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full opacity-80" />
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs">
                                            {coin.symbol[0]}
                                        </div>
                                    )}
                                    <div>
                                        <div className={`font-bold text-sm ${selectedCoin?.id === coin.id ? 'text-crypto-accent' : 'text-gray-300'}`}>{coin.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{coin.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-white font-mono tracking-tight">${coin.price.toLocaleString()}</div>
                                    <div className={`text-[10px] font-mono ${coin.change24h >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                                        {coin.change24h > 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-xs font-mono">
                            NO ASSETS FOUND IN DATABASE
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis Panel */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 min-h-[600px] flex flex-col relative">
                {!selectedCoin ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                        <div className="w-24 h-24 bg-crypto-accent/5 rounded-full flex items-center justify-center mb-6 border border-crypto-accent/20 animate-pulse-slow">
                             <Cpu size={40} className="text-crypto-accent opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-300 mb-2 tracking-widest uppercase">Select Asset Target</h3>
                        <p className="max-w-md text-gray-600 text-sm font-mono">Initialize market analysis protocol by selecting a cryptocurrency from the list.</p>
                    </div>
                ) : (
                    <div className="space-y-6 flex-1 flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                             <div className="flex items-center gap-4">
                                {selectedCoin.image && <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12 rounded-full ring-2 ring-white/10" />}
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedCoin.name}</h3>
                                        <span className={`text-xl font-mono font-bold ${livePrice > selectedCoin.price ? 'text-crypto-success text-glow' : livePrice < selectedCoin.price ? 'text-crypto-danger' : 'text-gray-300'}`}>
                                            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-3">
                                 {user && (
                                     <button 
                                        onClick={() => onToggleWatchlist(selectedCoin.symbol)}
                                        className={`p-2 rounded-lg transition-colors border ${user.watchlist.includes(selectedCoin.symbol) ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}
                                        title={user.watchlist.includes(selectedCoin.symbol) ? "Remove from Watchlist" : "Add to Watchlist"}
                                     >
                                         <Star size={16} fill={user.watchlist.includes(selectedCoin.symbol) ? "currentColor" : "none"} />
                                     </button>
                                 )}
                                 <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                    <button 
                                        onClick={() => setActiveTab('analysis')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'analysis' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        ANALYSIS
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('trade')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'trade' ? 'bg-crypto-secondary text-white' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <ArrowLeftRight size={12}/> TRADE
                                    </button>
                                 </div>
                                 <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-crypto-secondary/10 border border-crypto-secondary/20 group relative cursor-help">
                                    <Sparkles size={14} className="text-crypto-secondary" />
                                    <span className="text-xs font-bold text-crypto-secondary tracking-wide uppercase">AI Report</span>
                                    <div className="absolute top-full mt-2 right-0 w-48 bg-black border border-white/10 p-2 rounded text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        Generated via Gemini 2.5 Flash
                                    </div>
                                 </div>
                             </div>
                        </div>

                        {activeTab === 'trade' ? (
                            <div className="flex-1 animate-fade-in">
                                <TradingPanel 
                                    coin={selectedCoin} 
                                    currentPrice={livePrice} 
                                    user={user} 
                                    onExecuteTrade={(type, amount) => onExecuteTrade(selectedCoin.id, type, amount)} 
                                />
                                
                                <div className="mt-6 bg-black/20 border border-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <BarChart2 size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Live Price Action (30d)</span>
                                        </div>
                                    </div>
                                    <div className="h-[200px] w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPriceTrade" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="date" hide />
                                            <YAxis orientation="right" tick={{fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={40} />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', color: '#fff' }} />
                                            <Area type="monotone" dataKey="price" stroke="#00F0FF" strokeWidth={2} fill="url(#colorPriceTrade)" />
                                        </AreaChart>
                                      </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        ) : loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-crypto-accent blur-xl opacity-20 animate-pulse"></div>
                                    <Loader2 size={40} className="text-crypto-accent animate-spin relative z-10" />
                                </div>
                                <div className="text-center font-mono space-y-2">
                                    <h4 className="text-sm text-crypto-accent animate-pulse">ESTABLISHING NEURAL LINK...</h4>
                                    <p className="text-xs text-gray-500">Decrypting market patterns for {selectedCoin.symbol}</p>
                                </div>
                            </div>
                        ) : isError ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-red-500/5 rounded-xl border border-red-500/20">
                                <AlertTriangle size={32} className="text-red-500 mb-4" />
                                <h3 className="text-lg font-bold text-red-400 mb-2 uppercase tracking-widest">Analysis Failed</h3>
                                <p className="text-gray-400 text-sm max-w-md mb-6">{projection}</p>
                                <button 
                                    onClick={() => handleAnalyze(selectedCoin)}
                                    className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30 transition-colors uppercase text-xs font-bold tracking-wider"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none space-y-6 animate-fade-in">
                                
                                {/* 30 Day Trend Chart */}
                                {historyData.length > 0 && (
                                  <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <BarChart2 size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Price Action (30d)</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                                            <select 
                                                value={comparisonId}
                                                onChange={(e) => toggleComparison(e.target.value)}
                                                className="bg-transparent text-[10px] text-gray-300 border-none outline-none cursor-pointer p-1 font-mono uppercase"
                                                disabled={loadingComparison}
                                            >
                                                <option value="none" className="bg-black">Compare: None</option>
                                                {selectedCoin.id !== 'bitcoin' && <option value="bitcoin" className="bg-black">vs Bitcoin</option>}
                                                {selectedCoin.id !== 'ethereum' && <option value="ethereum" className="bg-black">vs Ethereum</option>}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="h-[200px] w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                        {comparisonId === 'none' ? (
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="date" hide />
                                                <YAxis orientation="right" tick={{fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={40} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', color: '#fff' }} />
                                                <Area type="monotone" dataKey="price" stroke="#00F0FF" strokeWidth={2} fill="url(#colorPrice)" />
                                                {aiSignal && aiSignal.type === 'BUY' && (
                                                    <ReferenceArea 
                                                        y1={aiSignal.entry * 0.98} 
                                                        y2={aiSignal.entry * 1.02} 
                                                        fill="rgba(0, 255, 148, 0.1)" 
                                                        strokeOpacity={0}
                                                    >
                                                        <Label value="AI BUY ZONE" position="insideTopRight" fill="#00FF94" fontSize={10} fontWeight="bold" />
                                                    </ReferenceArea>
                                                )}
                                                {aiSignal && aiSignal.type === 'SELL' && (
                                                    <ReferenceArea 
                                                        y1={aiSignal.entry * 0.98} 
                                                        y2={aiSignal.entry * 1.02} 
                                                        fill="rgba(255, 0, 85, 0.1)" 
                                                        strokeOpacity={0}
                                                    >
                                                        <Label value="AI SELL ZONE" position="insideTopRight" fill="#FF0055" fontSize={10} fontWeight="bold" />
                                                    </ReferenceArea>
                                                )}
                                                {aiSignal && (
                                                    <ReferenceLine 
                                                        y={aiSignal.entry} 
                                                        stroke={aiSignal.type === 'BUY' ? '#00FF94' : '#FF0055'} 
                                                        strokeDasharray="3 3"
                                                        label={{ 
                                                            value: `AI ENTRY`, 
                                                            position: 'right', 
                                                            fill: aiSignal.type === 'BUY' ? '#00FF94' : '#FF0055',
                                                            fontSize: 10
                                                        }} 
                                                    />
                                                )}
                                            </AreaChart>
                                        ) : (
                                            <AreaChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="date" hide />
                                                <YAxis orientation="right" tick={{fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={40} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', color: '#fff' }} />
                                                <Area type="monotone" dataKey="price" stroke="#00F0FF" strokeWidth={2} fill="none" />
                                                <Area type="monotone" dataKey="comparePrice" stroke="#7000FF" strokeWidth={2} fill="none" strokeDasharray="4 4"/>
                                            </AreaChart>
                                        )}
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                )}

                                {/* Alerts */}
                                <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-crypto-accent">
                                      <Bell size={16} />
                                      <span className="text-xs font-bold uppercase tracking-wider">Price Triggers</span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mb-4">
                                    <div className="relative flex-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</span>
                                      <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={alertTarget}
                                        onChange={(e) => setAlertTarget(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 text-sm text-white rounded-lg pl-6 pr-4 py-2 focus:ring-1 focus:ring-crypto-accent outline-none font-mono"
                                      />
                                    </div>
                                    <button 
                                      onClick={handleAddAlert}
                                      disabled={!alertTarget}
                                      className="px-4 py-2 bg-crypto-accent/20 hover:bg-crypto-accent/30 text-crypto-accent border border-crypto-accent/20 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    {currentCoinAlerts.map(alert => (
                                        <div key={alert.id} className={`flex justify-between items-center p-2 rounded border transition-colors ${alert.triggered ? 'bg-white/5 border-white/5 opacity-50' : 'bg-black/40 border-white/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-8 rounded-full ${alert.type === 'above' ? 'bg-crypto-success' : 'bg-crypto-danger'}`}></div>
                                                <div>
                                                    <div className="text-xs font-mono font-bold text-gray-200">
                                                        {alert.type === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase">{alert.triggered ? 'TRIGGERED' : 'ACTIVE'}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeAlert(alert.id)} className="text-gray-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                  </div>
                                </div>

                                {/* AI Projection Box */}
                                <div className="relative rounded-xl overflow-hidden border border-crypto-secondary/30 p-6 bg-gradient-to-br from-[#0a0514] to-black">
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <Zap size={60} className="text-crypto-secondary" />
                                    </div>
                                    
                                    <h4 className="flex items-center gap-2 text-crypto-secondary font-bold mb-4 text-sm tracking-widest uppercase">
                                        <Cpu size={18}/> Neural Prediction
                                    </h4>
                                    
                                    <div className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-line relative z-10">
                                        {projection}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                    <div className="p-4 bg-crypto-success/5 border border-crypto-success/20 rounded-xl relative group cursor-help">
                                        <h5 className="text-crypto-success font-bold mb-1 uppercase flex items-center gap-2">
                                            Support Zone <Info size={12}/>
                                        </h5>
                                        <span className="text-gray-400">${(selectedCoin.price * 0.92).toFixed(2)} - ${(selectedCoin.price * 0.95).toFixed(2)}</span>
                                        <div className="absolute bottom-full mb-2 left-0 w-full bg-black border border-white/10 p-2 rounded text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            Price level where the asset historically has difficulty falling below.
                                        </div>
                                    </div>
                                    <div className="p-4 bg-crypto-danger/5 border border-crypto-danger/20 rounded-xl relative group cursor-help">
                                        <h5 className="text-crypto-danger font-bold mb-1 uppercase flex items-center gap-2">
                                            Resistance <Info size={12}/>
                                        </h5>
                                        <span className="text-gray-400">${(selectedCoin.price * 1.1).toFixed(2)}</span>
                                        <div className="absolute bottom-full mb-2 left-0 w-full bg-black border border-white/10 p-2 rounded text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            Price level where the asset historically has difficulty rising above.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MarketAnalysis;