# 🚀 NexusCrypto - Quick Start

## What You Have

A professional cryptocurrency trading platform with:
- ✅ Secure user authentication
- ✅ Real-time market data from Binance
- ✅ Advanced technical analysis charts
- ✅ Stripe payment processing
- ✅ Beautiful, responsive UI

## Quick Start (2 Minutes)

### Terminal 1: Backend
```bash
cd backend
npm install
npm start
```

### Terminal 2: Frontend
```bash
npm install
npm run dev
```

### Browser
```
http://localhost:3001
```

## Test Credentials
- Email: `test@example.com`
- Password: `password123`

## Features

### Authentication
- User registration and login
- JWT token management
- Session persistence

### Trading Data
- Real-time prices from Binance
- WebSocket live updates
- 24h statistics and order book

### Charts
- Candlestick charts
- Multiple timeframes
- Technical indicators

### Payments
- Stripe integration
- Deposit functionality
- Payment history

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/user/profile
PUT    /api/user/profile
POST   /api/user/change-password
```

### Trading Data
```
GET    /api/trading/prices
GET    /api/trading/stats/:symbol
GET    /api/trading/orderbook/:symbol
GET    /api/trading/candles/:symbol
GET    /api/trading/movers
```

### Payments
```
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/history
GET    /api/payments/balance
```

## Deployment

### Backend (Heroku)
```bash
heroku login
heroku create your-app-name
heroku config:set JWT_SECRET=your-secret
git push heroku master
```

### Frontend (Vercel)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

## Environment Variables

**Backend (.env)**:
```env
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_your_key
```

**Frontend (.env.local)**:
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
```

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, JWT, bcryptjs
- APIs: Binance, Stripe, WebSocket

## Documentation

- **[README.md](README.md)** - Full documentation
- **[DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)** - Deployment guide

## Support

For issues, check the README.md or open an issue on GitHub.

---

**Ready to go live!** 🌟
