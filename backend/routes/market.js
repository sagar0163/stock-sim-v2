const express = require('express');
const router = express.Router();
const MarketEvent = require('../models/MarketEvent');
const Stock = require('../models/Stock');
const { auth } = require('../middleware/auth');

// Get active market events
router.get('/events', async (req, res) => {
  try {
    const events = await MarketEvent.find({ active: true }).sort({ startTime: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create market event (admin only - simplified for now)
router.post('/events', auth, async (req, res) => {
  try {
    const { title, description, type, sectors, impact, duration } = req.body;
    
    const event = new MarketEvent({
      title,
      description,
      type,
      sectors,
      impact,
      endTime: new Date(Date.now() + (duration || 3600000)) // 1 hour default
    });
    
    await event.save();
    
    // Apply impact to stocks
    if (sectors && impact) {
      await Stock.updateMany(
        { sector: { $in: sectors } },
        { $mul: { price: 1 + (impact / 100) } }
      );
    }
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End event
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const event = await MarketEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.active = false;
    await event.save();
    
    res.json({ message: 'Event ended' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get market stats
router.get('/stats', async (req, res) => {
  try {
    const stocks = await Stock.find({});
    
    const totalStocks = stocks.length;
    const avgChange = stocks.reduce((sum, s) => sum + parseFloat(s.changePercent), 0) / totalStocks;
    
    const sectors = {};
    stocks.forEach(s => {
      if (!sectors[s.sector]) {
        sectors[s.sector] = { count: 0, avgChange: 0, changes: [] };
      }
      sectors[s.sector].count++;
      sectors[s.sector].changes.push(parseFloat(s.changePercent));
    });
    
    Object.keys(sectors).forEach(sector => {
      const changes = sectors[sector].changes;
      sectors[sector].avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
      delete sectors[sector].changes;
    });
    
    res.json({
      totalStocks,
      marketChange: avgChange.toFixed(2),
      sectors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
