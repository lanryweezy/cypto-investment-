# Run NexusCrypto Locally - Quick Start

## Prerequisites
- Node.js 16+ installed
- Two terminal windows

## Quick Start (2 minutes)

### Terminal 1: Start Backend
```bash
cd backend
npm install
npm start
```

Expected output:
```
🚀 NexusCrypto Backend running on port 5000
📝 API: http://localhost:5000
🔐 JWT Secret configured: Yes
```

### Terminal 2: Start Frontend
```bash
npm install
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Open in Browser

Go to: **http://localhost:5173**

## Test Authentication

### Create Account
1. Click "Don't have an account? Sign up"
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Create Account"

### Login
1. Refresh page (F5)
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"

## Verify It's Working

✅ Backend running on port 5000
✅ Frontend running on port 5173
✅ Can register new account
✅ Can login with credentials
✅ Session persists on refresh
✅ Dashboard loads after login

## Troubleshooting

### Port 5000 already in use
```bash
# Change backend port in backend/.env
PORT=5001
```

### Dependencies not installed
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### Clear cache and restart
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Next Steps

1. ✅ Authentication working locally
2. 📊 Week 2: Add real trading data
3. 📈 Week 3: Add advanced charts
4. 💳 Week 4: Add payments

---

**Ready to build?** Start with the backend and frontend running, then test the login flow!
