# Stock Simulation Game

Virtual stock trading game with real-time market simulation.

## Features

- 📈 Virtual Trading - Buy and sell stocks with $100,000 virtual cash
- 📊 Real-time Prices - Live price updates every 5 seconds
- 👥 Leaderboards - Compete with other traders
- 💼 Portfolio Tracking - Monitor your holdings and P&L
- ⭐ Watchlist - Track favorite stocks
- 📜 Transaction History - Review all your trades

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Frontend**: Vue.js 3, TailwindCSS
- **Real-time**: Socket.io for live price updates

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/sagar0163/stock-sim-v2.git
cd stock-sim-v2

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# Start backend
npm run dev
```

### Running

```bash
# Backend runs on http://localhost:3000

# Open frontend
# Simply open frontend/index.html in browser
# Or serve it:
cd frontend
npx serve .
```

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Stocks
- GET /api/stocks
- GET /api/stocks/:symbol
- GET /api/stocks/search/:query

### Portfolio
- GET /api/portfolio
- POST /api/portfolio/buy
- POST /api/portfolio/sell

### Leaderboard
- GET /api/leaderboard

## Default Stocks

20 popular stocks including AAPL, GOOGL, MSFT, AMZN, TSLA, and more.

## License

MIT
