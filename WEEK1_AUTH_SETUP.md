# Week 1: Real Authentication Setup Guide

## Overview
This guide walks you through setting up and testing the real authentication system for NexusCrypto.

## What's Included

### Backend (Node.js + Express)
- User registration with validation
- User login with JWT tokens
- Token verification and refresh
- Password hashing with bcryptjs
- User profile management
- Password change functionality

### Frontend (React + TypeScript)
- Login/Register UI component
- Real auth service integration
- Token management
- Session persistence
- Auto-login on app start

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Two terminal windows (one for backend, one for frontend)

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `cors` - Cross-origin requests
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `nodemon` - Auto-reload during development

### 1.2 Create Backend Environment File

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
```

### 1.3 Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚀 NexusCrypto Backend running on port 5000
📝 API: http://localhost:5000
🔐 JWT Secret configured: Yes
```

## Step 2: Frontend Setup

### 2.1 Update Frontend Environment

The `.env.local` file already has `VITE_API_URL=http://localhost:5000` configured.

### 2.2 Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The app should start at `http://localhost:5173`

## Step 3: Test Authentication

### 3.1 Test Registration

1. Open `http://localhost:5173` in your browser
2. Click "Don't have an account? Sign up"
3. Fill in the registration form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Create Account"

Expected result: You should be logged in and see the dashboard

### 3.2 Test Login

1. Click the profile button (top right)
2. Look for a logout option (or refresh the page)
3. You should see the login screen again
4. Enter your credentials:
   - Email: `test@example.com`
   - Password: `password123`
5. Click "Sign In"

Expected result: You should be logged in again

### 3.3 Test Token Persistence

1. After logging in, refresh the page (F5)
2. You should remain logged in (no login screen)

Expected result: Session persists across page refreshes

## Step 4: Backend API Endpoints

All endpoints are available at `http://localhost:5000`

### Authentication Endpoints

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user_1234567890",
    "email": "john@example.com",
    "name": "John Doe",
    "balance": 100000
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Token
```bash
POST /api/auth/verify
Authorization: Bearer <accessToken>
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

#### Logout
```bash
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

### User Endpoints

#### Get Profile
```bash
GET /api/user/profile
Authorization: Bearer <accessToken>
```

#### Update Profile
```bash
PUT /api/user/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "New Name"
}
```

#### Change Password
```bash
POST /api/user/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

#### Health Check
```bash
GET /api/health
```

## Step 5: Testing with cURL

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

## Step 6: Troubleshooting

### Backend won't start
- Check if port 5000 is already in use: `netstat -an | grep 5000`
- Try a different port: Edit `backend/.env` and change `PORT=5001`

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check `VITE_API_URL` in `.env.local` is set to `http://localhost:5000`
- Check browser console for CORS errors

### Login fails with "Invalid credentials"
- Verify you registered first
- Check email and password are correct
- Backend stores users in memory (resets on restart)

### Token errors
- Tokens expire after 24 hours (access) or 7 days (refresh)
- Refresh token automatically when access token expires
- Clear localStorage if having issues: `localStorage.clear()`

## Step 7: Production Deployment

### Deploy Backend

Choose one of these options:

#### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set CORS_ORIGIN=https://your-vercel-domain.vercel.app

# Deploy
git push heroku main
```

#### Option 2: Railway
1. Go to https://railway.app
2. Connect your GitHub repo
3. Set environment variables
4. Deploy

#### Option 3: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Update Frontend

1. Get your backend URL from deployment (e.g., `https://your-app.herokuapp.com`)
2. Update `.env.production`:
   ```env
   VITE_API_URL=https://your-app.herokuapp.com
   ```
3. Push to GitHub
4. Vercel auto-deploys

## Step 8: Security Checklist

Before production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production` on backend
- [ ] Enable HTTPS on backend
- [ ] Set `CORS_ORIGIN` to your frontend domain only
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` files to Git
- [ ] Enable rate limiting on API endpoints
- [ ] Add input validation on all endpoints
- [ ] Use HTTPS for all API calls
- [ ] Implement password reset functionality
- [ ] Add email verification for registration

## Step 9: Next Steps

After authentication is working:

1. **Week 2**: Integrate real trading data (Binance API)
2. **Week 3**: Add advanced charts
3. **Week 4**: Implement payments (Stripe)

## File Structure

```
backend/
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env.example        # Environment template
└── .env                # Your environment (don't commit)

frontend/
├── services/
│   └── authService.ts  # Auth logic
├── components/
│   └── Login.tsx       # Login UI
├── .env.local          # Local development
├── .env.production     # Production
└── App.tsx             # Main app
```

## Key Files Modified

- `services/authService.ts` - Real API integration
- `components/Login.tsx` - Login/Register UI
- `App.tsx` - Auth flow integration
- `.env.local` - API URL configuration
- `.env.production` - Production API URL
- `backend/server.js` - Authentication backend
- `backend/package.json` - Dependencies

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs: `npm start`
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Status**: ✅ Week 1 Authentication Complete

**Next**: Deploy backend and test in production
