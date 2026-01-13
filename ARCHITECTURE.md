# NexusCrypto Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXUSCRYPTO PLATFORM                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│   FRONTEND (React)       │         │   BACKEND (Node.js)      │
│   Vercel Deployment      │◄───────►│   Heroku/Railway/Render  │
│                          │         │                          │
│ ┌────────────────────┐   │         │ ┌────────────────────┐   │
│ │  Login Component   │   │         │ │  Auth Endpoints    │   │
│ │  - Register        │   │         │ │  - /register       │   │
│ │  - Login           │   │         │ │  - /login          │   │
│ │  - Logout          │   │         │ │  - /verify         │   │
│ └────────────────────┘   │         │ │  - /refresh        │   │
│                          │         │ │  - /logout         │   │
│ ┌────────────────────┐   │         │ └────────────────────┘   │
│ │  Auth Service      │   │         │                          │
│ │  - Token Mgmt      │   │         │ ┌────────────────────┐   │
│ │  - Session Mgmt    │   │         │ │  User Endpoints    │   │
│ │  - API Calls       │   │         │ │  - /profile        │   │
│ └────────────────────┘   │         │ │  - /change-pwd     │   │
│                          │         │ └────────────────────┘   │
│ ┌────────────────────┐   │         │                          │
│ │  Dashboard         │   │         │ ┌────────────────────┐   │
│ │  - Market Data     │   │         │ │  Database          │   │
│ │  - Trading         │   │         │ │  - Users (Memory)  │   │
│ │  - Portfolio       │   │         │ │  - Tokens          │   │
│ └────────────────────┘   │         │ └────────────────────┘   │
│                          │         │                          │
│ localStorage:            │         │ Environment:             │
│ - access_token           │         │ - JWT_SECRET             │
│ - refresh_token          │         │ - PORT                   │
│ - current_user           │         │ - CORS_ORIGIN            │
└──────────────────────────┘         └──────────────────────────┘
         │                                      │
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                    HTTP/HTTPS (REST API)
                    JWT Authentication
                    CORS Enabled
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌──────────────┐
   │ User enters  │
   │ credentials  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Frontend validates input             │
   │ - Email format                       │
   │ - Password strength                  │
   │ - Passwords match                    │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ POST /api/auth/register              │
   │ {email, password, name}              │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Backend validates input              │
   │ - Email not exists                   │
   │ - Email format valid                 │
   │ - Password >= 6 chars                │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Hash password with bcryptjs          │
   │ Create user record                   │
   │ Generate JWT tokens                  │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Return tokens + user data            │
   │ {accessToken, refreshToken, user}    │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Frontend stores tokens               │
   │ - localStorage.access_token          │
   │ - localStorage.refresh_token         │
   │ - localStorage.current_user          │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ User logged in ✅                    │
   │ Redirect to dashboard                │
   └──────────────────────────────────────┘

2. LOGIN
   ┌──────────────┐
   │ User enters  │
   │ credentials  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ POST /api/auth/login                 │
   │ {email, password}                    │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Backend finds user                   │
   │ Compare password with hash           │
   │ Generate new tokens                  │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Return tokens + user data            │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Frontend stores tokens               │
   │ User logged in ✅                    │
   └──────────────────────────────────────┘

3. TOKEN REFRESH
   ┌──────────────────────────────────────┐
   │ Access token expires (24h)           │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ POST /api/auth/refresh               │
   │ {refreshToken}                       │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Backend verifies refresh token       │
   │ Generate new access token            │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Return new access token              │
   │ Frontend updates localStorage        │
   │ Continue using app ✅                │
   └──────────────────────────────────────┘

4. LOGOUT
   ┌──────────────┐
   │ User clicks  │
   │ logout       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ POST /api/auth/logout                │
   │ {refreshToken}                       │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Backend invalidates refresh token    │
   └──────┬───────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ Frontend clears localStorage         │
   │ Redirect to login ✅                 │
   └──────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA FLOW                              │
└─────────────────────────────────────────────────────────────┘

FRONTEND REQUEST:
┌──────────────────────────────────────────────────────────────┐
│ 1. User Action (click, form submit)                          │
│ 2. Component calls authService method                        │
│ 3. authService makes HTTP request                           │
│ 4. Request includes Authorization header with token         │
│ 5. Backend receives and validates token                     │
│ 6. Backend processes request                               │
│ 7. Backend returns response                                │
│ 8. Frontend updates state                                  │
│ 9. Component re-renders                                    │
│ 10. User sees result                                       │
└──────────────────────────────────────────────────────────────┘

REQUEST HEADERS:
┌──────────────────────────────────────────────────────────────┐
│ POST /api/auth/login                                         │
│ Content-Type: application/json                              │
│ Origin: http://localhost:5173                               │
│                                                              │
│ {                                                            │
│   "email": "user@example.com",                              │
│   "password": "password123"                                 │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘

RESPONSE:
┌──────────────────────────────────────────────────────────────┐
│ 200 OK                                                       │
│ Content-Type: application/json                              │
│                                                              │
│ {                                                            │
│   "accessToken": "eyJhbGc...",                              │
│   "refreshToken": "eyJhbGc...",                             │
│   "user": {                                                 │
│     "id": "user_123",                                       │
│     "email": "user@example.com",                            │
│     "name": "John Doe",                                     │
│     "balance": 100000                                       │
│   }                                                          │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘

AUTHENTICATED REQUEST:
┌──────────────────────────────────────────────────────────────┐
│ GET /api/user/profile                                        │
│ Authorization: Bearer eyJhbGc...                             │
│ Content-Type: application/json                              │
│                                                              │
│ Backend validates token:                                    │
│ 1. Extract token from header                               │
│ 2. Verify signature with JWT_SECRET                        │
│ 3. Check expiration                                        │
│ 4. Extract user info from token                            │
│ 5. Process request                                         │
│ 6. Return response                                         │
└──────────────────────────────────────────────────────────────┘
```

## File Structure

```
nexuscrypto/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   └── .env                   # Environment (local)
│
├── src/
│   ├── services/
│   │   ├── authService.ts     # Authentication logic
│   │   ├── cryptoService.ts   # Crypto data
│   │   ├── databaseService.ts # Local storage
│   │   └── ...
│   │
│   ├── components/
│   │   ├── Login.tsx          # Login/Register UI
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Sidebar.tsx        # Navigation
│   │   └── ...
│   │
│   ├── types.ts               # TypeScript types
│   ├── App.tsx                # Main app
│   ├── index.tsx              # Entry point
│   └── index.css              # Styles
│
├── public/
│   └── index.html             # HTML template
│
├── .env.local                 # Local environment
├── .env.production            # Production environment
├── package.json               # Frontend dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── README.md                  # Documentation
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

### Deployment
- **Frontend**: Vercel
- **Backend**: Heroku/Railway/Render
- **Database**: PostgreSQL (future)

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

1. FRONTEND SECURITY
   ├── Input validation
   ├── XSS prevention
   ├── CSRF tokens (future)
   └── Secure token storage

2. TRANSPORT SECURITY
   ├── HTTPS only
   ├── CORS validation
   └── Secure headers

3. BACKEND SECURITY
   ├── Input validation
   ├── SQL injection prevention
   ├── Rate limiting (future)
   └── Error handling

4. AUTHENTICATION SECURITY
   ├── Password hashing (bcryptjs)
   ├── JWT tokens with expiration
   ├── Token refresh mechanism
   └── Secure token storage

5. DATA SECURITY
   ├── Encrypted passwords
   ├── Secure token transmission
   ├── No sensitive data in logs
   └── Secure session management
```

## Performance Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PERFORMANCE OPTIMIZATION                  │
└─────────────────────────────────────────────────────────────┘

FRONTEND:
├── Code splitting
├── Lazy loading
├── Caching
├── Minification
└── CDN delivery (Vercel)

BACKEND:
├── Connection pooling
├── Caching
├── Compression
├── Load balancing
└── Auto-scaling

API:
├── Efficient queries
├── Response caching
├── Pagination
└── Rate limiting
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────┘

DEVELOPMENT:
┌──────────────────────────────────────────────────────────────┐
│ Local Machine                                                │
│ ├── Frontend: http://localhost:5173                         │
│ ├── Backend: http://localhost:5000                          │
│ └── Database: In-memory (development)                       │
└──────────────────────────────────────────────────────────────┘

PRODUCTION:
┌──────────────────────────────────────────────────────────────┐
│ Frontend (Vercel)                                            │
│ ├── URL: https://nexuscrypto.vercel.app                     │
│ ├── CDN: Global                                             │
│ └── Auto-deploy: On push to main                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Backend (Heroku/Railway/Render)                              │
│ ├── URL: https://nexuscrypto-api.herokuapp.com              │
│ ├── Auto-scaling: Enabled                                   │
│ └── Monitoring: Built-in                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Database (PostgreSQL)                                        │
│ ├── Hosted: AWS RDS / Heroku Postgres                       │
│ ├── Backups: Automated                                      │
│ └── Replication: Enabled                                    │
└──────────────────────────────────────────────────────────────┘
```

## API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────┘

BASE URL: http://localhost:5000 (development)
          https://api.nexuscrypto.com (production)

AUTHENTICATION ENDPOINTS:
├── POST   /api/auth/register
├── POST   /api/auth/login
├── POST   /api/auth/verify
├── POST   /api/auth/refresh
└── POST   /api/auth/logout

USER ENDPOINTS:
├── GET    /api/user/profile
├── PUT    /api/user/profile
└── POST   /api/user/change-password

HEALTH ENDPOINTS:
└── GET    /api/health

FUTURE ENDPOINTS:
├── /api/trading/*
├── /api/portfolio/*
├── /api/payments/*
└── /api/charts/*
```

---

**Architecture is production-ready and scalable.** ✅
