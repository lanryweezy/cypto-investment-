# NexusCrypto - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (check with `node --version`)
- npm or yarn package manager

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

3. **Login with demo account**
   - Email: `demo@example.com`
   - Password: Any password (demo mode)
   - Or register a new account

### Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

---

## 📋 Features

### Dashboard
- Real-time cryptocurrency prices
- Market overview with top 15 coins
- Latest crypto news feed
- Portfolio summary

### Market Analysis
- Detailed price charts (30-day history)
- Buy/Sell trading interface
- Price alerts
- Watchlist management

### Trading
- Execute buy/sell orders
- Track positions and transactions
- Calculate average entry prices
- Real-time balance updates

### Academy
- Educational content about crypto
- Trading strategies
- Risk management guides

### Signals
- AI-powered trading signals
- Market sentiment analysis
- Automated recommendations

### Profile
- View trading history
- Manage watchlist
- Update profile settings
- View portfolio performance

---

## 🔑 API Keys (Optional)

The app works with or without API keys. Without them, it uses mock data.

### To add real data:

1. **CoinGecko API** (Free)
   - Visit: https://www.coingecko.com/en/api
   - Get free API key
   - Add to `.env.local`: `VITE_COINGECKO_API_KEY=your-key`

2. **CryptoCompare API** (Free)
   - Visit: https://www.cryptocompare.com/api
   - Get free API key
   - Add to `.env.local`: `VITE_CRYPTOCOMPARE_API_KEY=your-key`

3. **Google Gemini API** (Free)
   - Visit: https://ai.google.dev/
   - Get free API key
   - Add to `.env.local`: `VITE_GEMINI_API_KEY=your-key`

4. **Restart dev server** after adding keys

---

## 📁 Project Structure

```
nexuscrypto/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── MarketAnalysis.tsx
│   ├── TradingPanel.tsx
│   ├── Login.tsx
│   └── ...
├── services/           # Business logic
│   ├── cryptoService.ts
│   ├── authService.ts
│   ├── databaseService.ts
│   └── ...
├── types.ts            # TypeScript types
├── constants.ts        # Mock data & constants
├── App.tsx             # Main app component
├── index.tsx           # React entry point
├── vite.config.ts      # Build configuration
└── package.json        # Dependencies
```

---

## 🛠️ Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `npm run test:run` | Run tests once |
| `npm test` | Run tests in watch mode |

---

## 🐛 Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 3000 already in use
```bash
# Use different port
npm run dev -- --port 3001
```

### Build fails
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clear build cache
rm -rf dist
npm run build
```

### API calls failing
- Check browser console (F12)
- Verify API keys in `.env.local`
- Check network tab for failed requests
- App will use mock data as fallback

---

## 📊 Demo Account

**Email:** demo@example.com  
**Password:** Any password  
**Starting Balance:** $100,000  
**Watchlist:** BTC, ETH, SOL

---

## 🚀 Deploying to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_COINGECKO_API_KEY`
   - `VITE_CRYPTOCOMPARE_API_KEY`
   - `VITE_GEMINI_API_KEY`
4. Deploy!

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 💡 Tips

- Use demo account to explore features without setup
- Check browser console (F12) for helpful debug messages
- Mock data is used when APIs are unavailable
- All data is stored in browser localStorage
- Refresh page to reset to initial state

---

## 🤝 Support

Having issues? Check:
1. Browser console for error messages
2. Network tab for failed API calls
3. `.env.local` file for missing API keys
4. `VERCEL_DEPLOYMENT.md` for deployment issues

---

**Happy Trading! 🚀**
