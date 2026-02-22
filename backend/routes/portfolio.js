const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

// Get user's portfolio
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get current prices
    const stocks = await Stock.find({}, 'symbol price changePercent');
    const prices = {};
    stocks.forEach(s => {
      prices[s.symbol] = { price: s.price, changePercent: s.changePercent };
    });
    
    // Calculate portfolio with current values
    const portfolio = user.portfolio.map(item => {
      const currentPrice = prices[item.symbol]?.price || item.avgPrice;
      const currentValue = currentPrice * item.quantity;
      const invested = item.avgPrice * item.quantity;
      const pnl = currentValue - invested;
      const pnlPercent = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : 0;
      
      return {
        ...item.toObject(),
        currentPrice,
        currentValue,
        pnl: pnl.toFixed(2),
        pnlPercent
      };
    });
    
    const totalValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0) + user.balance;
    const totalInvested = portfolio.reduce((sum, item) => sum + (item.avgPrice * item.quantity), 0);
    const totalPnL = (totalValue - user.balance - totalInvested) + (totalInvested - 100000);
    
    res.json({
      portfolio,
      balance: user.balance,
      totalValue: totalValue.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      totalPnL: totalPnL.toFixed(2),
      initialBalance: 100000
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buy stock
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    
    if (!symbol || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    const totalCost = stock.price * quantity;
    
    const user = await User.findById(req.user.id);
    
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // Deduct balance
    user.balance -= totalCost;
    
    // Update portfolio
    const existingItem = user.portfolio.find(p => p.symbol === stock.symbol);
    if (existingItem) {
      // Update average price
      const totalShares = existingItem.quantity + quantity;
      const totalValue = (existingItem.avgPrice * existingItem.quantity) + (stock.price * quantity);
      existingItem.avgPrice = totalValue / totalShares;
      existingItem.quantity = totalShares;
    } else {
      user.portfolio.push({
        symbol: stock.symbol,
        name: stock.name,
        quantity: quantity,
        avgPrice: stock.price
      });
    }
    
    // Record transaction
    const transaction = new Transaction({
      userId: user._id,
      symbol: stock.symbol,
      name: stock.name,
      type: 'buy',
      quantity: quantity,
      price: stock.price,
      total: totalCost,
      balanceAfter: user.balance
    });
    await transaction.save();
    
    await user.save();
    
    res.json({
      message: 'Purchase successful',
      transaction: {
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        price: stock.price,
        total: totalCost
      },
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sell stock
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    
    if (!symbol || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    const user = await User.findById(req.user.id);
    const portfolioItem = user.portfolio.find(p => p.symbol === stock.symbol);
    
    if (!portfolioItem || portfolioItem.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient shares' });
    }
    
    const totalValue = stock.price * quantity;
    
    // Add to balance
    user.balance += totalValue;
    
    // Update portfolio
    portfolioItem.quantity -= quantity;
    if (portfolioItem.quantity === 0) {
      user.portfolio = user.portfolio.filter(p => p.symbol !== stock.symbol);
    }
    
    // Record transaction
    const transaction = new Transaction({
      userId: user._id,
      symbol: stock.symbol,
      name: stock.name,
      type: 'sell',
      quantity: quantity,
      price: stock.price,
      total: totalValue,
      balanceAfter: user.balance
    });
    await transaction.save();
    
    await user.save();
    
    res.json({
      message: 'Sale successful',
      transaction: {
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        price: stock.price,
        total: totalValue
      },
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's stock (specific holding)
router.get('/:symbol', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    const holding = user.portfolio.find(p => p.symbol === stock.symbol);
    
    if (!holding) {
      return res.json({ owned: false, message: 'You do not own this stock' });
    }
    
    const currentValue = stock.price * holding.quantity;
    const invested = holding.avgPrice * holding.quantity;
    const pnl = currentValue - invested;
    
    res.json({
      owned: true,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice: stock.price,
      currentValue,
      pnl,
      pnlPercent: ((pnl / invested) * 100).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
