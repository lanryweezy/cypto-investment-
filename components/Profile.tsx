import React from 'react';
import { User, Wallet, LogOut, Settings, CreditCard, History, TrendingUp, PieChart, ShieldCheck, Briefcase, Star, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfile, Coin } from '../types';

interface ProfileProps {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    currentPrices: Coin[];
    onToggleWatchlist: (symbol: string) => void;
}

const mockPortfolioHistory = [
  { day: 'Mon', value: 95000 },
  { day: 'Tue', value: 98000 },
  { day: 'Wed', value: 96500 },
  { day: 'Thu', value: 99000 },
  { day: 'Fri', value: 101000 },
  { day: 'Sat', value: 102500 },
  { day: 'Sun', value: 104500 },
];

const Profile: React.FC<ProfileProps> = ({ user, setUser, currentPrices, onToggleWatchlist }) => {

  const handleLogin = () => {
    setUser({
      id: 'user_123',
      name: 'Cyber_Nomad',
      email: 'nomad@nexus.ai',
      balance: 100000,
      positions: [],
      transactions: [],
      watchlist: ['BTC', 'SOL'],
      isLoggedIn: true
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleExport = () => {
    if (!user) return;
    
    // Prepare CSV data
    const headers = ['Type', 'Asset', 'Amount', 'Price', 'Total', 'Date'];
    const rows = user.transactions.map(tx => [
        tx.type,
        tx.symbol,
        tx.amount.toFixed(6),
        tx.price.toFixed(2),
        tx.total.toFixed(2),
        tx.timestamp
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexus_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-24 h-24 relative">
             <div className="absolute inset-0 bg-crypto-accent blur-xl opacity-20 animate-pulse"></div>
             <div className="w-full h-full bg-black border border-crypto-accent/30 rounded-2xl flex items-center justify-center relative z-10">
                <Wallet size={40} className="text-crypto-accent" />
             </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Identify Yourself</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm">Link your digital signature to access personalized analytics and portfolio tracking.</p>
        </div>
        <button 
          onClick={handleLogin}
          className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-wide uppercase text-sm"
        >
          Initialize Session
        </button>
      </div>
    );
  }

  // Calculate Portfolio Stats
  const portfolioValue = user.positions.reduce((acc, pos) => {
      const currentPrice = currentPrices.find(c => c.id === pos.coinId)?.price || pos.averageEntryPrice;
      return acc + (pos.amount * currentPrice);
  }, 0);
  
  const totalNetWorth = user.balance + portfolioValue;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass-panel p-8 rounded-2xl border border-crypto-accent/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-crypto-accent/5 to-transparent pointer-events-none"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-xl overflow-hidden">
             <div className="w-full h-full bg-gradient-to-br from-crypto-secondary to-blue-600 flex items-center justify-center text-3xl font-bold text-white">
                 {user.name[0]}
             </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
            <p className="text-gray-400 font-mono text-sm">{user.email}</p>
            <div className="flex gap-3 mt-4">
                <span className="px-3 py-1 bg-crypto-success/10 text-crypto-success text-[10px] font-bold uppercase rounded border border-crypto-success/20 flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified ID
                </span>
                <span className="px-3 py-1 bg-crypto-accent/10 text-crypto-accent text-[10px] font-bold uppercase rounded border border-crypto-accent/20">
                    Pro Trader
                </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
            <button onClick={handleExport} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-transparent hover:border-white/20">
              <Download size={16} /> Export Data
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-transparent hover:border-red-500/30">
              <LogOut size={16} /> Disconnect
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            {/* Portfolio Value & Chart */}
            <div className="glass-panel p-8 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Net Worth</h3>
                        <div className="text-5xl font-bold text-white font-mono tracking-tighter text-glow">${totalNetWorth.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                             <div className="text-[10px] text-gray-500 uppercase font-mono">Cash</div>
                             <div className="text-lg font-mono text-white">${user.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] text-gray-500 uppercase font-mono">Invested</div>
                             <div className="text-lg font-mono text-crypto-accent">${portfolioValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                        </div>
                    </div>
                </div>
                
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockPortfolioHistory}>
                            <defs>
                                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" tick={{fontSize: 10, fill: '#64748B'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                itemStyle={{ color: '#00FF94' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#00FF94" strokeWidth={2} fillOpacity={1} fill="url(#colorPortfolio)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Active Positions Table */}
             <div className="glass-panel p-8 rounded-2xl overflow-hidden">
                <h3 className="text-sm font-bold mb-6 text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16} className="text-crypto-secondary" /> Active Positions
                </h3>
                {user.positions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b border-white/5 uppercase font-mono">
                                    <th className="p-3">Asset</th>
                                    <th className="p-3 text-right">Qty</th>
                                    <th className="p-3 text-right">Avg Entry</th>
                                    <th className="p-3 text-right">Current</th>
                                    <th className="p-3 text-right">PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.positions.map(pos => {
                                    const currentPrice = currentPrices.find(c => c.id === pos.coinId)?.price || pos.averageEntryPrice;
                                    const value = pos.amount * currentPrice;
                                    const cost = pos.amount * pos.averageEntryPrice;
                                    const pnl = value - cost;
                                    const pnlPercent = (pnl / cost) * 100;
                                    
                                    return (
                                        <tr key={pos.coinId} className="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                                            <td className="p-3 font-bold text-white">{pos.symbol}</td>
                                            <td className="p-3 text-right text-gray-300 font-mono">{pos.amount.toFixed(4)}</td>
                                            <td className="p-3 text-right text-gray-400 font-mono">${pos.averageEntryPrice.toLocaleString()}</td>
                                            <td className="p-3 text-right text-white font-mono">${currentPrice.toLocaleString()}</td>
                                            <td className={`p-3 text-right font-mono font-bold ${pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                        NO ACTIVE POSITIONS
                    </div>
                )}
            </div>

            <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-sm font-bold mb-6 text-white uppercase tracking-wider flex items-center gap-2">
                    <History size={16} className="text-crypto-accent" /> Recent Transactions
                </h3>
                <div className="space-y-4">
                    {user.transactions.length > 0 ? (
                        user.transactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'BUY' ? 'bg-crypto-success/10 text-crypto-success' : 'bg-crypto-danger/10 text-crypto-danger'}`}>
                                        {tx.type === 'BUY' ? <TrendingUp size={18} /> : <LogOut size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{tx.type} {tx.symbol}</div>
                                        <div className="text-xs text-gray-500 font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono text-sm">{tx.type === 'BUY' ? '+' : '-'}{tx.amount.toFixed(4)} {tx.symbol}</div>
                                    <div className="text-xs text-gray-500 font-mono">${tx.total.toLocaleString()}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-8 text-gray-500 font-mono text-sm">NO HISTORY</div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="glass-panel p-8 rounded-2xl">
                <div className="flex items-center gap-2 mb-6 text-white">
                    <PieChart size={16} className="text-crypto-secondary" /> 
                    <h3 className="text-sm font-bold uppercase tracking-wider">Allocation</h3>
                </div>
                {user.positions.length > 0 ? (
                    <>
                    <div className="flex items-center justify-center py-6 relative">
                        <div className="w-40 h-40 rounded-full border-[6px] border-crypto-accent border-r-crypto-secondary border-b-crypto-success relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-white">100%</div>
                        </div>
                    </div>
                    <div className="space-y-3 text-xs mt-4">
                        {user.positions.map((pos, i) => (
                            <div key={pos.coinId} className="flex justify-between items-center text-gray-400">
                                <span className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-crypto-accent' : i % 3 === 1 ? 'bg-crypto-secondary' : 'bg-crypto-success'}`}></div> 
                                    {pos.symbol}
                                </span>
                                <span className="font-mono text-white">
                                    {((pos.amount * pos.averageEntryPrice / portfolioValue) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                        <PieChart size={48} className="mb-4 opacity-20" />
                        <span className="text-xs font-mono uppercase">Portfolio Empty</span>
                    </div>
                )}
            </div>
            
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Watchlist</h3>
                <div className="space-y-2">
                    {user.watchlist.map(symbol => {
                        const coin = currentPrices.find(c => c.symbol === symbol);
                        return (
                            <div key={symbol} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-b border-white/5 last:border-0 group">
                                <span className="font-bold text-gray-200 text-sm">{symbol}</span>
                                <div className="flex items-center gap-3">
                                    {coin ? (
                                        <div className="text-right">
                                            <div className="text-xs text-white">${coin.price.toLocaleString()}</div>
                                            <div className={`text-[10px] font-mono ${coin.change24h >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                                                {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-[10px]">OFFLINE</span>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); onToggleWatchlist(symbol); }} className="text-yellow-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Star size={12} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <button className="w-full mt-6 py-3 border border-dashed border-gray-700 text-gray-500 rounded-xl hover:border-crypto-accent hover:text-crypto-accent transition-colors text-xs font-bold uppercase tracking-widest">
                        + Track Asset
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;