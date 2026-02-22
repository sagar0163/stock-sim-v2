const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stock = require('../models/Stock');
const { auth } = require('../middleware/auth');

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    const users = await User.find({}, 'username balance portfolio createdAt');
    
    // Get current stock prices
    const stocks = await Stock.find({}, 'symbol price');
    const prices = {};
    stocks.forEach(s => {
      prices[s.symbol] = s.price;
    });
    
    // Calculate portfolio values
    const leaderboard = users.map(user => {
      const portfolioValue = user.portfolio.reduce((sum, item) => {
        const currentPrice = prices[item.symbol] || item.avgPrice;
        return sum + (currentPrice * item.quantity);
      }, 0);
      
      const totalValue = portfolioValue + user.balance;
      const invested = user.portfolio.reduce((sum, item) => sum + (item.avgPrice * item.quantity), 0);
      const pnl = totalValue - 100000;
      const pnlPercent = ((pnl / 100000) * 100);
      
      return {
        username: user.username,
        balance: user.balance,
        portfolioValue: totalValue.toFixed(2),
        invested: invested.toFixed(2),
        pnl: pnl.toFixed(2),
        pnlPercent: pnlPercent.toFixed(2),
        holdings: user.portfolio.length,
        memberSince: user.createdAt
      };
    });
    
    // Sort by portfolio value
    leaderboard.sort((a, b) => parseFloat(b.portfolioValue) - parseFloat(a.portfolioValue));
    
    // Add rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    res.json({ leaderboard: leaderboard.slice(0, 100) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's rank
router.get('/my-rank', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const stocks = await Stock.find({}, 'symbol price');
    const prices = {};
    stocks.forEach(s => {
      prices[s.symbol] = s.price;
    });
    
    const portfolioValue = user.portfolio.reduce((sum, item) => {
      const currentPrice = prices[item.symbol] || item.avgPrice;
      return sum + (currentPrice * item.quantity);
    }, 0);
    
    const totalValue = portfolioValue + user.balance;
    
    // Get rank
    const users = await User.find({}, 'balance portfolio');
    let rank = 1;
    
    for (const u of users) {
      const uPortfolioValue = u.portfolio.reduce((sum, item) => {
        const currentPrice = prices[item.symbol] || item.avgPrice;
        return sum + (currentPrice * item.quantity);
      }, 0);
      const uTotal = uPortfolioValue + u.balance;
      
      if (uTotal > totalValue) rank++;
    }
    
    res.json({
      rank,
      portfolioValue: totalValue.toFixed(2),
      balance: user.balance,
      totalTrades: user.portfolio.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
