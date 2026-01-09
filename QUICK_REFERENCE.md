# NexusCrypto - Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
npm install
npm run dev
# Open http://localhost:3000
# Login: demo@example.com / any password
```

## 🔑 Add API Keys (Optional)

1. Get free keys from:
   - CoinGecko: https://www.coingecko.com/en/api
   - CryptoCompare: https://www.cryptocompare.com/api
   - Google Gemini: https://ai.google.dev/

2. Add to `.env.local`:
```env
VITE_COINGECKO_API_KEY=your-key
VITE_CRYPTOCOMPARE_API_KEY=your-key
VITE_GEMINI_API_KEY=your-key
```

3. Restart dev server

## 📦 Build & Deploy

```bash
npm run build          # Build for production
npm run preview        # Test production build
vercel deploy --prod   # Deploy to Vercel
```

## 🔧 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npm run test:run` | Run tests |
| `npm run preview` | Preview production build |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't start | `rm -rf node_modules && npm install` |
| Port 3000 in use | `npm run dev -- --port 3001` |
| Build fails | `npx tsc --noEmit` to check errors |
| API calls fail | Check `.env.local` and API keys |
| Stuck loading | Check browser console (F12) |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app component |
| `services/` | Business logic |
| `components/` | React components |
| `types.ts` | TypeScript types |
| `constants.ts` | Mock data |
| `vite.config.ts` | Build config |

## 🌐 Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

See `VERCEL_DEPLOYMENT.md` for details.

## 📚 Documentation

- `README.md` - Full documentation
- `QUICK_START.md` - Getting started guide
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `IMPROVEMENTS_SUMMARY.md` - What was fixed

## 💡 Demo Account

- **Email:** demo@example.com
- **Password:** Any password
- **Balance:** $100,000
- **Watchlist:** BTC, ETH, SOL

## 🎯 Features

- 📊 Real-time crypto prices
- 📈 Interactive charts
- 💰 Trading simulation
- 🤖 AI-powered signals
- 📰 News feed
- 👤 Portfolio management

## 🔒 Security

- No backend required
- All data stored locally
- API keys never exposed
- CORS properly handled

## 📊 Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Google Generative AI

## 🚀 Next Steps

1. Deploy to Vercel
2. Add real API keys
3. Test all features
4. Monitor logs
5. Gather feedback

## 📞 Quick Help

**Browser Console:** F12 → Console tab  
**Network Errors:** F12 → Network tab  
**Build Errors:** Run `npm run build`  
**Type Errors:** Run `npx tsc --noEmit`  

## ⚡ Performance Tips

- Use mock data for testing
- Cache is 5-10 minutes
- Refresh page to reset
- Check Lighthouse score
- Monitor bundle size

## 🎨 Customization

Edit these files to customize:
- `constants.ts` - Mock data
- `index.css` - Global styles
- `vite.config.ts` - Build settings
- `types.ts` - Data types

## 🔄 Update Workflow

```bash
# Make changes
git add .
git commit -m "Your message"
git push

# Vercel auto-deploys on push
# Check deployment status in Vercel dashboard
```

## 📈 Monitoring

- Check Vercel logs
- Monitor error tracking
- Review performance metrics
- Track user feedback

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Print this card and keep it handy!** 📋

**Last Updated:** January 8, 2026
