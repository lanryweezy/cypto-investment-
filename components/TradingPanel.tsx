import React, { useState, useEffect } from 'react';
import { Coin, UserProfile } from '../types';
import { RefreshCw, ArrowRightLeft, DollarSign, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

interface TradingPanelProps {
  coin: Coin;
  user: UserProfile | null;
  onExecuteTrade: (type: 'BUY' | 'SELL', amount: number) => Promise<void>;
  currentPrice: number;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ coin, user, onExecuteTrade, currentPrice }) => {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [amountUSD, setAmountUSD] = useState<string>('');
  const [amountCoin, setAmountCoin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset inputs when order type changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [orderType]);

  const handleUSDChange = (val: string) => {
    setAmountUSD(val);
    if (!val || isNaN(parseFloat(val))) {
        setAmountCoin('');
        return;
    }
    const coinQty = parseFloat(val) / currentPrice;
    setAmountCoin(coinQty.toFixed(6));
  };

  const handleCoinChange = (val: string) => {
    setAmountCoin(val);
    if (!val || isNaN(parseFloat(val))) {
        setAmountUSD('');
        return;
    }
    const usdVal = parseFloat(val) * currentPrice;
    setAmountUSD(usdVal.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!user) {
        setError("Please login to trade.");
        return;
    }
    
    const usdValue = parseFloat(amountUSD);
    const coinQty = parseFloat(amountCoin);

    if (isNaN(usdValue) || usdValue <= 0) {
        setError("Invalid amount.");
        return;
    }

    if (orderType === 'BUY') {
        if (usdValue > user.balance) {
            setError("Insufficient USD balance.");
            return;
        }
    } else {
        const position = user.positions.find(p => p.coinId === coin.id);
        const currentQty = position?.amount || 0;
        if (coinQty > currentQty) {
            setError(`Insufficient ${coin.symbol} balance.`);
            return;
        }
    }

    setIsSubmitting(true);
    setError(null);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await onExecuteTrade(orderType, coinQty);
    
    setSuccess(`${orderType} Order Executed Successfully`);
    setAmountUSD('');
    setAmountCoin('');
    setIsSubmitting(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const maxBuy = user ? user.balance : 0;
  const position = user?.positions.find(p => p.coinId === coin.id);
  const maxSell = position ? position.amount * currentPrice : 0;

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {/* Background glow based on order type */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-20 transition-colors duration-500 ${orderType === 'BUY' ? 'bg-crypto-success' : 'bg-crypto-danger'}`}></div>

        <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-crypto-accent"/> 
                    Spot Trading
                </h3>
                <div className="flex bg-black/60 rounded-lg p-1 border border-white/10">
                    <button 
                        onClick={() => setOrderType('BUY')}
                        className={`px-6 py-1.5 rounded-md text-xs font-bold transition-all ${orderType === 'BUY' ? 'bg-crypto-success text-black shadow-[0_0_10px_rgba(0,255,148,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        BUY
                    </button>
                    <button 
                        onClick={() => setOrderType('SELL')}
                        className={`px-6 py-1.5 rounded-md text-xs font-bold transition-all ${orderType === 'SELL' ? 'bg-crypto-danger text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        SELL
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
                    <span>Avail Balance</span>
                    <span className="text-white">
                        {orderType === 'BUY' 
                            ? `$${user?.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`
                            : `${position?.amount.toFixed(6) || '0.000000'} ${coin.symbol}`
                        }
                    </span>
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</div>
                    <input 
                        type="number" 
                        value={amountUSD}
                        onChange={(e) => handleUSDChange(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-16 py-3 text-white focus:ring-1 focus:ring-crypto-accent outline-none font-mono transition-all group-hover:bg-white/10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">USD</div>
                </div>

                <div className="flex justify-center">
                    <div className="p-2 bg-white/5 rounded-full text-gray-500">
                        <ArrowRightLeft size={14} className="rotate-90" />
                    </div>
                </div>

                <div className="relative group">
                    <input 
                        type="number" 
                        value={amountCoin}
                        onChange={(e) => handleCoinChange(e.target.value)}
                        placeholder="0.000000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-16 py-3 text-white focus:ring-1 focus:ring-crypto-accent outline-none font-mono transition-all group-hover:bg-white/10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">{coin.symbol}</div>
                </div>

                {/* Percentage Sliders */}
                <div className="flex justify-between gap-2 mt-2">
                    {[0.25, 0.5, 0.75, 1].map((pct) => (
                        <button
                            key={pct}
                            onClick={() => {
                                const max = orderType === 'BUY' ? maxBuy : maxSell;
                                handleUSDChange((max * pct).toString());
                            }}
                            className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400 hover:text-crypto-accent transition-colors border border-transparent hover:border-white/10"
                        >
                            {pct * 100}%
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs animate-pulse">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}
                
                {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-xs animate-bounce-in">
                        <TrendingUp size={14} /> {success}
                    </div>
                )}

                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !user}
                    className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-4
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                        ${!user ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : ''}
                        ${user && orderType === 'BUY' ? 'bg-crypto-success text-black hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]' : ''}
                        ${user && orderType === 'SELL' ? 'bg-crypto-danger text-white hover:shadow-[0_0_20px_rgba(255,0,85,0.4)]' : ''}
                    `}
                >
                    {isSubmitting ? (
                        <RefreshCw size={18} className="animate-spin" />
                    ) : !user ? (
                        "LOGIN TO TRADE"
                    ) : (
                        `${orderType} ${coin.symbol}`
                    )}
                </button>
                
                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
                    <span>Fee (0.1%)</span>
                    <span>${(parseFloat(amountUSD || '0') * 0.001).toFixed(2)}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TradingPanel;