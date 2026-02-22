const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stock = require('../models/Stock');
const { auth } = require('../middleware/auth');

// Get user's watchlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.watchlist.length === 0) {
      return res.json({ watchlist: [] });
    }
    
    const stocks = await Stock.find({ symbol: { $in: user.watchlist } });
    
    res.json({ watchlist: stocks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to watchlist
router.post('/:symbol', auth, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    const stock = await Stock.findOne({ symbol });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (user.watchlist.includes(symbol)) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }
    
    user.watchlist.push(symbol);
    await user.save();
    
    res.json({ message: 'Added to watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from watchlist
router.delete('/:symbol', auth, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    const user = await User.findById(req.user.id);
    
    if (!user.watchlist.includes(symbol)) {
      return res.status(400).json({ message: 'Stock not in watchlist' });
    }
    
    user.watchlist = user.watchlist.filter(s => s !== symbol);
    await user.save();
    
    res.json({ message: 'Removed from watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
