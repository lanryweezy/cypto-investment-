# NexusCrypto - Advanced AI-Powered Crypto Trading Platform

A modern, feature-rich cryptocurrency trading platform built with React, TypeScript, and Vite. Includes real-time market data, AI-powered analysis, trading simulation, and comprehensive portfolio management.

## ✨ Features

### 📊 Dashboard
- Real-time cryptocurrency prices (top 15 coins)
- Market overview with 24h changes
- Latest crypto news feed
- Portfolio summary and quick stats
- Live market indicators

### 📈 Market Analysis
- Interactive price charts (30-day history)
- Detailed coin information
- Buy/Sell trading interface
- Price alerts and notifications
- Watchlist management
- Technical indicators

### 💰 Trading
- Simulate buy/sell orders
- Track open positions
- Calculate average entry prices
- View complete transaction history
- Real-time balance updates
- Portfolio performance metrics

### 🎓 Academy
- Educational content about cryptocurrencies
- Trading strategies and guides
- Risk management tutorials
- Market analysis lessons

### 🤖 AI Signals
- AI-powered trading signals (Google Gemini)
- Market sentiment analysis
- Automated recommendations
- Pattern recognition

### 👤 Profile & Settings
- User profile management
- Trading history
- Watchlist management
- Portfolio analytics
- Account settings

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd nexuscrypto

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 and login with:
- **Email:** demo@example.com
- **Password:** Any password

### Build for Production

```bash
npm run build
npm run preview  # Test production build
```

---

## 🔑 API Keys (Optional)

The app works with mock data by default. To use real data, add API keys:

### 1. CoinGecko API (Free)
```bash
# Get key from: https://www.coingecko.com/en/api
# Add to .env.local:
VITE_COINGECKO_API_KEY=your-key-here
```

### 2. CryptoCompare API (Free)
```bash
# Get key from: https://www.cryptocompare.com/api
# Add to .env.local:
VITE_CRYPTOCOMPARE_API_KEY=your-key-here
```

### 3. Google Gemini API (Free)
```bash
# Get key from: https://ai.google.dev/
# Add to .env.local:
VITE_GEMINI_API_KEY=your-key-here
```

Restart dev server after adding keys.

---

## 📁 Project Structure

```
nexuscrypto/
├── components/
│   ├── Academy.tsx              # Educational content
│   ├── ApiSettings.tsx          # API configuration
│   ├── Dashboard.tsx            # Main dashboard
│   ├── ErrorBoundary.tsx        # Error handling
│   ├── Login.tsx                # Authentication
│   ├── MarketAnalysis.tsx       # Market charts & analysis
│   ├── NewsFeed.tsx             # Crypto news
│   ├── PriceChart.tsx           # Chart component
│   ├── Profile.tsx              # User profile
│   ├── Settings.tsx             # App settings
│   ├── Sidebar.tsx              # Navigation
│   ├── Signals.tsx              # Trading signals
│   ├── SubscriptionManager.tsx  # Subscription plans
│   └── TradingPanel.tsx         # Trading interface
├── services/
│   ├── analyticsService.ts      # Event tracking
│   ├── authService.ts           # Authentication
│   ├── cacheService.ts          # Data caching
│   ├── configService.ts         # Configuration
│   ├── cryptoService.ts         # Crypto API calls
│   ├── databaseService.ts       # Data persistence
│   ├── errorService.ts          # Error logging
│   ├── geminiService.ts         # AI integration
│   ├── healthService.ts         # Health monitoring
│   ├── paymentService.ts        # Payment processing
│   └── securityService.ts       # Security utilities
├── types.ts                     # TypeScript types
├── constants.ts                 # Mock data & constants
├── App.tsx                      # Main app component
├── index.tsx                    # React entry point
├── index.html                   # HTML template
├── vite.config.ts               # Build configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables:
   - `VITE_COINGECKO_API_KEY`
   - `VITE_CRYPTOCOMPARE_API_KEY`
   - `VITE_GEMINI_API_KEY`
4. Deploy!

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Other Platforms

The app can be deployed to any static hosting:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

Just run `npm run build` and deploy the `dist` folder.

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
# API Keys (optional - app works without them)
VITE_GEMINI_API_KEY=your-key
VITE_COINGECKO_API_KEY=your-key
VITE_CRYPTOCOMPARE_API_KEY=your-key

# Development
VITE_DEBUG=true
```

### Vite Configuration

Edit `vite.config.ts` to customize:
- Build output directory
- Development server port
- Asset optimization
- Code splitting strategy

---

## 📊 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **Recharts** | Charts & graphs |
| **Lucide React** | Icons |
| **Google Generative AI** | AI features |

---

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with cyan accents
- **Glassmorphism**: Frosted glass effect panels
- **Responsive**: Mobile, tablet, and desktop optimized
- **Animations**: Smooth transitions and loading states
- **Accessibility**: WCAG compliant

---

## 🐛 Troubleshooting

### App won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 3000 in use
```bash
npm run dev -- --port 3001
```

### Build fails
```bash
npx tsc --noEmit  # Check TypeScript errors
rm -rf dist       # Clear cache
npm run build
```

### API calls failing
- Check browser console (F12)
- Verify API keys in `.env.local`
- Check network tab for failed requests
- App uses mock data as fallback

---

## 📈 Performance

- **Code Splitting**: Separate vendor bundles
- **Minification**: Terser compression
- **Caching**: 5-10 minute API response cache
- **Lazy Loading**: Components load on demand
- **Asset Optimization**: Automatic image optimization

---

## 🔒 Security

- **No Backend Required**: All data stored locally
- **API Key Protection**: Keys never exposed in frontend
- **CORS Handling**: Proper error handling for blocked requests
- **Input Validation**: All user inputs validated
- **Error Boundaries**: Graceful error handling

---

## 📚 Documentation

- `QUICK_START.md` - Getting started guide
- `VERCEL_DEPLOYMENT.md` - Deployment instructions
- `types.ts` - TypeScript type definitions
- `constants.ts` - Mock data and constants

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 💡 Tips

- Use demo account to explore without setup
- Check browser console (F12) for debug info
- Mock data used when APIs unavailable
- All data stored in browser localStorage
- Refresh page to reset to initial state

---

## 🚀 Next Steps

1. **Add Backend API**
   - Create serverless functions
   - Handle API calls server-side
   - Add authentication

2. **Database Integration**
   - Connect to Supabase or Firebase
   - Persist user data
   - Store trading history

3. **Real-time Updates**
   - WebSocket for live prices
   - Push notifications
   - Live trading alerts

4. **Advanced Features**
   - Portfolio optimization
   - Risk analysis
   - Backtesting engine
   - Strategy automation

---

## 📞 Support

Having issues? Check:
1. Browser console for error messages
2. Network tab for failed API calls
3. `.env.local` for missing API keys
4. `VERCEL_DEPLOYMENT.md` for deployment issues

---

**Built with ❤️ for crypto traders**

Happy Trading! 🚀
