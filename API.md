# Stock Simulation Game - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected routes require Bearer token:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### Register
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Get Me
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { _id, username, email, balance, portfolio, watchlist }
```

### Stocks

#### Get All Stocks
```
GET /api/stocks?sector=Technology&sort=gainers&page=1&limit=20
Response: { stocks: [...], totalPages, currentPage }
```

#### Get Stock
```
GET /api/stocks/:symbol
Response: { symbol, name, price, change, changePercent, sector, ... }
```

#### Search Stocks
```
GET /api/stocks/search/:query
Response: [...]
```

### Portfolio

#### Get Portfolio
```
GET /api/portfolio
Headers: Authorization: Bearer <token>
Response: { portfolio, balance, totalValue, totalPnL }
```

#### Buy Stock
```
POST /api/portfolio/buy
Headers: Authorization: Bearer <token>
Body: { symbol: "AAPL", quantity: 10 }
Response: { message, transaction, balance }
```

#### Sell Stock
```
POST /api/portfolio/sell
Headers: Authorization: Bearer <token>
Body: { symbol: "AAPL", quantity: 5 }
Response: { message, transaction, balance }
```

### Watchlist

#### Get Watchlist
```
GET /api/watchlist
Headers: Authorization: Bearer <token>
Response: { watchlist: [...] }
```

#### Add to Watchlist
```
POST /api/watchlist/:symbol
Headers: Authorization: Bearer <token>
Response: { message, watchlist }
```

#### Remove from Watchlist
```
DELETE /api/watchlist/:symbol
Headers: Authorization: Bearer <token>
```

### Transactions

#### Get Transactions
```
GET /api/transactions?type=buy&page=1
Headers: Authorization: Bearer <token>
Response: { transactions, totalPages, currentPage, total }
```

### Leaderboard

#### Get Leaderboard
```
GET /api/leaderboard
Response: { leaderboard: [{ rank, username, portfolioValue, pnl, ... }] }
```

### Market

#### Get Market Events
```
GET /api/market/events
Response: [...]
```

#### Get Market Stats
```
GET /api/market/stats
Response: { totalStocks, marketChange, sectors }
```

## WebSocket Events

Connect to `http://localhost:3000`

### market-update
Emitted every 5 seconds with updated stock prices.

```javascript
socket.on('market-update', (stocks) => {
  console.log(stocks);
});
```

## Error Responses

```json
{ "message": "Error description" }
```

Status codes:
- 400 - Bad Request
- 401 - Unauthorized
- 404 - Not Found
- 500 - Server Error
