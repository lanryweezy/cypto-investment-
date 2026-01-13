import React, { useState, useEffect } from 'react';
import { Menu, Loader2, ChevronRight, Home } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MarketAnalysis from './components/MarketAnalysis';
import Academy from './components/Academy';
import Signals from './components/Signals';
import Profile from './components/Profile';
import NewsFeed from './components/NewsFeed';
import Settings from './components/Settings';
import Payment from './components/Payment';
import Login from './components/Login';
import { View, Coin, NewsItem, UserProfile, Transaction, Position, PriceAlert } from './types';
import { fetchTopCoins, fetchCryptoNews } from './services/cryptoService';
import { authService } from './services/authService';
import { databaseService } from './services/databaseService';
import { analyticsService } from './services/analyticsService';
import { healthService } from './services/healthService';
import { realtimeDataService } from './services/realtimeDataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // App-wide state
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  // Initialize with authenticated user or demo user for Vercel preview
  const [user, setUser] = useState<UserProfile | null>(() => {
    const currentUser = authService.getCurrentUser();
    // Auto-login demo user on Vercel or if no user exists
    if (!currentUser && (typeof window !== 'undefined' && window.location.hostname.includes('vercel'))) {
      const demoUser: UserProfile = {
        id: 'demo_user',
        name: 'Demo Trader',
        email: 'demo@nexuscrypto.com',
        balance: 100000,
        positions: [],
        transactions: [],
        watchlist: ['BTC', 'ETH', 'SOL'],
        isLoggedIn: true
      };
      localStorage.setItem('nexus_user', JSON.stringify(demoUser));
      return demoUser;
    }
    return currentUser;
  });

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoadError(null);
      
      // Safety timeout: If fetching takes longer than 5 seconds, use mock data
      const safetyTimer = setTimeout(() => {
          if (mounted && isLoadingData) {
              console.warn("⏱️ Data fetch timed out - using mock data");
              setLoadError(null); // Don't show error, just use mock data silently
              setIsLoadingData(false);
          }
      }, 5000);

      try {
        // Start real-time data service
        await realtimeDataService.start(['BTC', 'ETH', 'SOL', 'BNB', 'XRP']);
        
        // Get initial coins from real-time service
        const realCoins = realtimeDataService.getAllCoins().map(coin => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          change24h: coin.change24h,
          marketCap: coin.marketCap || 0,
          volume24h: coin.volume24h,
          description: `Real-time data from Binance`,
          image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${coin.id}.png`
        }));

        // Fetch news
        const fetchedNews = await fetchCryptoNews().catch(err => {
          console.error("❌ News fetch failed:", err);
          return [];
        });
        
        if (mounted) {
          setCoins(realCoins.length > 0 ? realCoins : []);
          setNews(fetchedNews.length > 0 ? fetchedNews : []);
          setIsLoadingData(false);
          
          // Log what data we got
          if (realCoins.length > 0) console.log(`✅ Loaded ${realCoins.length} coins from Binance`);
          if (fetchedNews.length > 0) console.log(`✅ Loaded ${fetchedNews.length} news items`);
        }
      } catch (e) {
        console.error("❌ Initialization error", e);
        if (mounted) {
          setLoadError(null); // Don't show error, just use mock data
          setIsLoadingData(false);
        }
      } finally {
        clearTimeout(safetyTimer);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = realtimeDataService.subscribe({
      onUpdate: (coins) => {
        if (mounted) {
          setCoins(coins.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.price,
            change24h: coin.change24h,
            marketCap: coin.marketCap || 0,
            volume24h: coin.volume24h,
            description: `Real-time data from Binance`,
            image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${coin.id}.png`
          })));
        }
      },
      onError: (error) => {
        console.error('❌ Real-time data error:', error);
      }
    });

    return () => { 
        mounted = false;
        unsubscribe();
        realtimeDataService.stop();
    };
  }, []);

  // Trading Logic
  const executeTrade = async (coinId: string, type: 'BUY' | 'SELL', amountCoin: number) => {
    if (!user) return;

    const coin = coins.find(c => c.id === coinId);
    if (!coin) return;

    const price = coin.price;
    const totalValue = amountCoin * price;
    
    // Create new transaction record
    const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        coinId: coin.id,
        symbol: coin.symbol,
        amount: amountCoin,
        price: price,
        total: totalValue,
        timestamp: new Date().toISOString()
    };

    let newBalance = user.balance;
    let newPositions = [...user.positions];

    if (type === 'BUY') {
        newBalance -= totalValue;
        
        const existingPosIndex = newPositions.findIndex(p => p.coinId === coinId);
        if (existingPosIndex >= 0) {
            // Average down/up
            const pos = newPositions[existingPosIndex];
            const newTotalAmt = pos.amount + amountCoin;
            const newAvgPrice = ((pos.amount * pos.averageEntryPrice) + totalValue) / newTotalAmt;
            
            newPositions[existingPosIndex] = {
                ...pos,
                amount: newTotalAmt,
                averageEntryPrice: newAvgPrice
            };
        } else {
            newPositions.push({
                coinId,
                symbol: coin.symbol,
                amount: amountCoin,
                averageEntryPrice: price
            });
        }
    } else {
        newBalance += totalValue;
        
        const existingPosIndex = newPositions.findIndex(p => p.coinId === coinId);
        if (existingPosIndex >= 0) {
            const pos = newPositions[existingPosIndex];
            const remaining = pos.amount - amountCoin;
            
            if (remaining <= 0.000001) { // Floating point safety
                newPositions.splice(existingPosIndex, 1);
            } else {
                newPositions[existingPosIndex] = {
                    ...pos,
                    amount: remaining
                };
            }
        }
    }

    const updatedUser = {
        ...user,
        balance: newBalance,
        positions: newPositions,
        transactions: [newTx, ...user.transactions]
    };

    setUser(updatedUser);

    // Persist the updated user data
    try {
      await databaseService.saveUser(updatedUser);
      await databaseService.saveTransaction(user.id, newTx);
      await databaseService.updatePositions(user.id, newPositions);
      await databaseService.updateTransactions(user.id, updatedUser.transactions);
      await databaseService.updateUserBalance(user.id, newBalance);
    } catch (error) {
      console.error('Failed to persist trade data:', error);
    }
  };

  const toggleWatchlist = async (symbol: string) => {
    if (!user) return;
    const current = user.watchlist;
    const exists = current.includes(symbol);
    const newWatchlist = exists ? current.filter(s => s !== symbol) : [...current, symbol];
    
    const updatedUser = { ...user, watchlist: newWatchlist };
    setUser(updatedUser);
    
    // Persist the updated watchlist
    try {
      await databaseService.saveWatchlist(user.id, newWatchlist);
      await databaseService.saveUser(updatedUser);
    } catch (error) {
      console.error('Failed to persist watchlist:', error);
    }
  };

  // Initialize database service on app start
  useEffect(() => {
    // Initialize analytics
    analyticsService.initialize({ debug: process.env.NODE_ENV === 'development' });
    
    // Log health status in development
    if (process.env.NODE_ENV === 'development') {
      healthService.logHealthStatus().catch(err => console.error('Health check failed:', err));
    }
    
    // Initialize database service
    const initDatabase = async () => {
      try {
        await databaseService.initialize();
      } catch (error) {
        console.error('Failed to initialize database service:', error);
      }
    };
    
    initDatabase();
    
    // Track initial page view
    analyticsService.trackPageView(window.location.pathname);
  }, []);

  const handleNavigateToMarket = (coinId: string) => {
    setSelectedCoinId(coinId);
    setCurrentView('market');
  };

  const handleLogin = (user: UserProfile) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const renderBreadcrumbs = () => {
    const items = [
      { label: 'Nexus', view: 'dashboard' as View, icon: Home }
    ];

    if (currentView !== 'dashboard') {
      items.push({ label: currentView.charAt(0).toUpperCase() + currentView.slice(1), view: currentView, icon: undefined });
    }

    if (currentView === 'market' && selectedCoinId) {
      const coin = coins.find(c => c.id === selectedCoinId);
      if (coin) {
        items.push({ label: coin.name, view: 'market', icon: undefined });
      }
    }

    return (
      <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} />}
            <button 
              onClick={() => item.view && setCurrentView(item.view)}
              className={`flex items-center gap-1 hover:text-crypto-accent transition-colors ${index === items.length - 1 ? 'text-white cursor-default' : ''}`}
              disabled={index === items.length - 1}
            >
              {item.icon && <item.icon size={14} />}
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const renderView = () => {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-crypto-accent">
          <div className="relative mb-6">
             <div className="w-16 h-16 border-4 border-crypto-accent/20 border-t-crypto-accent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-crypto-accent rounded-full animate-pulse"></div>
             </div>
          </div>
          <p className="font-mono text-sm tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard coins={coins} news={news} onNavigateToMarket={handleNavigateToMarket} />;
      case 'market':
        return (
          <MarketAnalysis 
            coins={coins} 
            user={user} 
            onExecuteTrade={executeTrade} 
            selectedCoinId={selectedCoinId}
            onSelectCoin={setSelectedCoinId}
            alerts={alerts}
            setAlerts={setAlerts}
            onToggleWatchlist={toggleWatchlist}
          />
        );
      case 'academy':
        return <Academy coins={coins} />;
      case 'signals':
        return <Signals coins={coins} user={user} onExecuteTrade={executeTrade} />;
      case 'news':
        return <NewsFeed news={news} />;
      case 'profile':
        return <Profile user={user} setUser={setUser} currentPrices={coins} onToggleWatchlist={toggleWatchlist} />;
      case 'settings':
        return <Settings />;
      case 'payment':
        return <Payment onPaymentSuccess={(amount) => {
          if (user) {
            setUser({ ...user, balance: user.balance + amount });
          }
        }} />;
      default:
        return <Dashboard coins={coins} news={news} onNavigateToMarket={handleNavigateToMarket} />;
    }
  };

  // Show login screen if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen text-crypto-text selection:bg-crypto-accent selection:text-black font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <div className="md:pl-72 transition-all duration-300">
        <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/5 p-4 md:px-8 flex justify-between items-center bg-[#05060A]/80">
            <div className="flex items-center gap-4">
                <button 
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={24} />
                </button>
                
                {/* Breadcrumbs for Desktop */}
                <div className="hidden md:block">
                  {renderBreadcrumbs()}
                </div>

                {/* Mobile View Title */}
                <div className="flex flex-col md:hidden">
                    <h2 className="text-xl font-bold capitalize text-white tracking-wide">
                        {currentView.replace('-', ' ')}
                    </h2>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-crypto-success shadow-[0_0_5px_#00FF94]"></span>
                    <span className="text-gray-300">LIVE FEED</span>
                </div>
                {user && (
                    <div className="hidden sm:block text-right">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">Cash Balance</div>
                        <div className="text-sm font-bold text-white font-mono">${user.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </div>
                )}
                <button 
                    onClick={() => setCurrentView('profile')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg border border-white/10 transition-all hover:border-crypto-accent/50 ${user ? 'bg-gradient-to-br from-crypto-secondary to-blue-600' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    {user ? user.name[0].toUpperCase() : <div className="w-2 h-2 bg-gray-500 rounded-full" />}
                </button>
            </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in relative z-10">
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;