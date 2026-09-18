const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const { auth } = require('../middleware/auth');

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    // Fetch top 100 from Leaderboard collection
    const leaderboard = await Leaderboard.find({})
      .sort({ rank: 1 })
      .limit(100)
      .lean();
      
    // The previous implementation formatted strings with .toFixed(2) in response
    // We can do that or leave as numbers. Let's make sure it matches original format if needed.
    // original: portfolioValue: totalValue.toFixed(2), etc.
    const formattedLeaderboard = leaderboard.map(entry => ({
      ...entry,
      portfolioValue: entry.portfolioValue.toFixed(2),
      invested: entry.invested.toFixed(2),
      pnl: entry.pnl.toFixed(2),
      pnlPercent: entry.pnlPercent.toFixed(2)
    }));
    
    res.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's rank
router.get('/my-rank', auth, async (req, res) => {
  try {
    const userRankInfo = await Leaderboard.findOne({ _id: req.user.id }).lean();
    
    if (!userRankInfo) {
      // User might be new and leaderboard hasn't updated yet.
      return res.json({
        rank: null,
        portfolioValue: "100000.00",
        balance: 100000,
        totalTrades: 0
      });
    }
    
    res.json({
      rank: userRankInfo.rank,
      portfolioValue: userRankInfo.portfolioValue.toFixed(2),
      balance: userRankInfo.balance,
      totalTrades: userRankInfo.holdings // In original code it returns user.portfolio.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
