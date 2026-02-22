# Stock Simulation Game - Technical Specification

## Project Overview
- **Name**: Stock Simulation Game
- **Type**: Trading simulation webapp
- **Core Functionality**: Virtual stock trading platform where users buy/sell stocks with fake money, compete on leaderboards, and experience simulated market dynamics
- **Target Users**: Aspiring traders, finance students, casual gamers

## Tech Stack
- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: Vue.js 3 + TailwindCSS
- **Real-time**: Socket.io for live price updates
- **Auth**: JWT tokens

## Data Models

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  balance: Number,        // Virtual cash (default: $100,000)
  portfolio: [{
    symbol: String,
    quantity: Number,
    avgPrice: Number
  }],
  watchlist: [String],
  createdAt: Date
}
```

### Stock
```javascript
{
  symbol: String,         // e.g., "AAPL"
  name: String,          // e.g., "Apple Inc."
  price: Number,
  previousPrice: Number,
  change: Number,         // Daily change %
  volume: Number,
  sector: String,
  priceHistory: [{
    price: Number,
    timestamp: Date
  }]
}
```

### Transaction
```javascript
{
  userId: ObjectId,
  symbol: String,
  type: String,          // "buy" or "sell"
  quantity: Number,
  price: Number,
  total: Number,
  timestamp: Date
}
```

### MarketEvent
```javascript
{
  title: String,
  description: String,
  impact: Object,        // How it affects different sectors
  startTime: Date,
  endTime: Date,
  active: Boolean
}
```

## Core Features

### 1. Authentication
- User registration
- Login with JWT
- Session management

### 2. Dashboard
- Portfolio value overview
- Daily P&L
- Top movers
- Market news feed

### 3. Stock Market
- Real-time price updates (simulated)
- Stock search
- Filter by sector
- Price charts

### 4. Trading
- Buy stocks (market order)
- Sell stocks
- Order confirmation
- Insufficient funds checks

### 5. Portfolio
- Holdings list
- Individual stock performance
- Total value calculation
- P&L per position

### 6. Watchlist
- Add/remove stocks
- Quick buy from watchlist

### 7. Transaction History
- All buy/sell orders
- Filter by type/date

### 8. Leaderboard
- Top traders by portfolio value
- Daily/Weekly/All-time

### 9. Market Simulation
- Random price fluctuations
- Sector-specific trends
- Market events (news)
- AI traders (optional)

## UI/UX Design

### Color Palette
- **Primary**: `#0ea5e9` (sky blue - finance vibes)
- **Success**: `#10b981` (green - gains)
- **Danger**: `#ef4444` (red - losses)
- **Background**: `#0f172a` (dark slate)
- **Surface**: `#1e293b` (card background)
- **Text**: `#f1f5f9`

### Layout
- Sidebar navigation
- Main content area with grid
- Responsive design

### Components
- Stock cards with sparkline charts
- Portfolio donut chart
- Price ticker
- Trade modal
- Leaderboard table

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Stocks
- GET /api/stocks (list all)
- GET /api/stocks/:symbol (details)
- GET /api/stocks/search?q=...

### Portfolio
- GET /api/portfolio
- POST /api/portfolio/buy
- POST /api/portfolio/sell

### Watchlist
- GET /api/watchlist
- POST /api/watchlist/:symbol
- DELETE /api/watchlist/:symbol

### Transactions
- GET /api/transactions

### Leaderboard
- GET /api/leaderboard

### Market
- GET /api/market/events
- POST /api/market/events (admin)

## Acceptance Criteria
1. Users can register and login
2. Users start with $100,000 virtual cash
3. Stock prices update in real-time
4. Users can buy/sell stocks
5. Portfolio value updates correctly
6. Transaction history is tracked
7. Leaderboard shows top traders
8. Market events affect prices
9. Responsive UI works on mobile
