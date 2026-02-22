const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const { sector, sort, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (sector) {
      query.sector = sector;
    }
    
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'gainers') sortOption.changePercent = -1;
    else if (sort === 'losers') sortOption.changePercent = 1;
    else sortOption.symbol = 1;
    
    const stocks = await Stock.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Stock.countDocuments(query);
    
    res.json({
      stocks,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stock by symbol
router.get('/:symbol', async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search stocks
router.get('/search/:query', async (req, res) => {
  try {
    const stocks = await Stock.find({
      $or: [
        { symbol: { $regex: req.params.query, $options: 'i' } },
        { name: { $regex: req.params.query, $options: 'i' } }
      ]
    }).limit(10);
    
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sectors
router.get('/meta/sectors', async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector');
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get movers (top gainers/losers)
router.get('/movers', async (req, res) => {
  try {
    const gainers = await Stock.find().sort({ changePercent: -1 }).limit(5);
    const losers = await Stock.find().sort({ changePercent: 1 }).limit(5);
    
    res.json({ gainers, losers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all stock prices (for portfolio calculation)
router.get('/prices/all', async (req, res) => {
  try {
    const stocks = await Stock.find({}, 'symbol price');
    const prices = {};
    stocks.forEach(s => {
      prices[s.symbol] = s.price;
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
