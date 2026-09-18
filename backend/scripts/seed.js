require('dotenv').config();
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const connectDB = require('../config/db');
const fs = require('fs');
const path = require('path');

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing stocks
    await Stock.deleteMany({});
    console.log('🗑️  Cleared existing stocks');

    const sp500Path = path.join(__dirname, '../data/sp500.json');
    let STOCKS = [];
    if (fs.existsSync(sp500Path)) {
      STOCKS = JSON.parse(fs.readFileSync(sp500Path, 'utf8'));
    } else {
      console.warn('⚠️ sp500.json not found, falling back to basic stocks');
      STOCKS = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, sector: 'Technology', marketCap: '2.8T', description: 'Consumer electronics and software company' }
      ];
    }

    // Add new stocks with initial history
    const stocksWithHistory = STOCKS.map(s => {
      // Default starting price to 100 if unknown, else use what's there
      const basePrice = s.price || 100;
      return {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector || 'Unknown',
        marketCap: s.marketCap || 'Unknown',
        description: s.description || s.name,
        price: basePrice,
        previousPrice: basePrice,
        priceHistory: Array.from({ length: 20 }, (_, i) => ({
          price: basePrice * (1 + (Math.random() - 0.5) * 0.05),
          timestamp: new Date(Date.now() - (20 - i) * 60000)
        }))
      };
    });

    await Stock.insertMany(stocksWithHistory);
    console.log(`✅ Successfully seeded ${STOCKS.length} stocks!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
