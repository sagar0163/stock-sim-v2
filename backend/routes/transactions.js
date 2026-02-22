const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

// Get user's transactions
router.get('/', auth, async (req, res) => {
  try {
    const { type, symbol, page = 1, limit = 20 } = req.query;
    
    let query = { userId: req.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }
    
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction summary
router.get('/summary', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    
    const buys = transactions.filter(t => t.type === 'buy');
    const sells = transactions.filter(t => t.type === 'sell');
    
    const totalBought = buys.reduce((sum, t) => sum + t.total, 0);
    const totalSold = sells.reduce((sum, t) => sum + t.total, 0);
    
    res.json({
      totalTransactions: transactions.length,
      totalBought: totalBought.toFixed(2),
      totalSold: totalSold.toFixed(2),
      netInvestment: (totalBought - totalSold).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
