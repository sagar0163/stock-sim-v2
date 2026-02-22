require('dotenv').config();
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const connectDB = require('../config/db');

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, sector: 'Technology', marketCap: '2.8T', description: 'Consumer electronics and software company' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.25, sector: 'Technology', marketCap: '1.7T', description: 'Search, advertising, cloud services' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, sector: 'Technology', marketCap: '2.8T', description: 'Software, cloud computing, gaming' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, sector: 'Retail', marketCap: '1.8T', description: 'E-commerce and cloud services' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, sector: 'Automotive', marketCap: '790B', description: 'Electric vehicles and energy' },
  { symbol: 'META', name: 'Meta Platforms', price: 505.75, sector: 'Technology', marketCap: '1.3T', description: 'Social media and VR/AR' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.25, sector: 'Technology', marketCap: '2.1T', description: 'GPU and AI chips' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.40, sector: 'Finance', marketCap: '570B', description: 'Banking and financial services' },
  { symbol: 'V', name: 'Visa Inc.', price: 280.15, sector: 'Finance', marketCap: '575B', description: 'Payment processing' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.80, sector: 'Healthcare', marketCap: '378B', description: 'Pharmaceuticals and medical devices' },
  { symbol: 'UNH', name: 'UnitedHealth Group', price: 528.90, sector: 'Healthcare', marketCap: '490B', description: 'Health insurance and services' },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 104.25, sector: 'Energy', marketCap: '420B', description: 'Oil and gas exploration' },
  { symbol: 'CVX', name: 'Chevron Corp.', price: 152.60, sector: 'Energy', marketCap: '285B', description: 'Oil and gas' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 165.35, sector: 'Retail', marketCap: '445B', description: 'Retail and e-commerce' },
  { symbol: 'DIS', name: 'Walt Disney Co.', price: 112.45, sector: 'Entertainment', marketCap: '205B', description: 'Entertainment and media' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.20, sector: 'Entertainment', marketCap: '210B', description: 'Streaming services' },
  { symbol: 'T', name: 'AT&T Inc.', price: 17.85, sector: 'Telecom', marketCap: '127B', description: 'Telecommunications' },
  { symbol: 'VZ', name: 'Verizon', price: 42.30, sector: 'Telecom', marketCap: '178B', description: 'Telecommunications' },
  { symbol: 'BA', name: 'Boeing Co.', price: 215.60, sector: 'Automotive', marketCap: '130B', description: 'Aerospace and defense' },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 62.15, sector: 'Retail', marketCap: '268B', description: 'Beverages' }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing stocks
    await Stock.deleteMany({});
    console.log('🗑️  Cleared existing stocks');

    // Add new stocks with initial history
    const stocksWithHistory = STOCKS.map(s => ({
      ...s,
      previousPrice: s.price,
      priceHistory: Array.from({ length: 20 }, (_, i) => ({
        price: s.price * (1 + (Math.random() - 0.5) * 0.05),
        timestamp: new Date(Date.now() - (20 - i) * 60000)
      }))
    }));

    await Stock.insertMany(stocksWithHistory);
    console.log(`✅ Successfully seeded ${STOCKS.length} stocks!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
