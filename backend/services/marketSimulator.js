const Stock = require('../models/Stock');

// Simulated stock data
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

class MarketSimulator {
  constructor() {
    this.io = null;
    this.interval = null;
    this.volatility = 0.02; // 2% max change
  }
  
  setSocketIO(io) {
    this.io = io;
  }
  
  async initialize() {
    console.log('Initializing market...');
    
    for (const stock of STOCKS) {
      const existing = await Stock.findOne({ symbol: stock.symbol });
      if (!existing) {
        await Stock.create(stock);
      }
    }
    
    console.log(`Market initialized with ${STOCKS.length} stocks`);
  }
  
  start(intervalMs = 5000) {
    if (this.interval) {
      console.log('Market simulator already running');
      return;
    }
    
    console.log(`Starting market simulator (interval: ${intervalMs}ms)`);
    
    this.interval = setInterval(async () => {
      await this.updatePrices();
    }, intervalMs);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Market simulator stopped');
    }
  }
  
  async updatePrices() {
    try {
      const stocks = await Stock.find({});
      
      for (const stock of stocks) {
        // Random price movement
        const change = (Math.random() - 0.5) * 2 * this.volatility;
        const newPrice = Math.max(1, stock.price * (1 + change));
        
        // Update price
        stock.previousPrice = stock.price;
        stock.price = parseFloat(newPrice.toFixed(2));
        stock.change = parseFloat((stock.price - stock.previousPrice).toFixed(2));
        stock.changePercent = parseFloat((((stock.change / stock.previousPrice) * 100)).toFixed(2));
        
        // Add to history
        stock.priceHistory.push({
          price: stock.price,
          timestamp: new Date()
        });
        
        // Keep only last 100 price points
        if (stock.priceHistory.length > 100) {
          stock.priceHistory = stock.priceHistory.slice(-100);
        }
        
        stock.volume += Math.floor(Math.random() * 10000);
        
        await stock.save();
      }
      
      // Emit update via Socket.IO
      if (this.io) {
        const stocksUpdate = await Stock.find({}, 'symbol name price change changePercent volume sector');
        this.io.emit('market-update', stocksUpdate);
      }
      
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }
  
  // Trigger a market event
  async triggerEvent(type, sectors, impact) {
    console.log(`Market event: ${type} - ${sectors.join(', ')} - ${impact}%`);
    
    for (const symbol of STOCKS) {
      if (sectors.includes(symbol.sector)) {
        const stock = await Stock.findOne({ symbol: symbol.symbol });
        if (stock) {
          const newPrice = stock.price * (1 + impact / 100);
          stock.price = parseFloat(newPrice.toFixed(2));
          stock.previousPrice = stock.price;
          await stock.save();
        }
      }
    }
    
    if (this.io) {
      const stocksUpdate = await Stock.find({}, 'symbol name price change changePercent');
      this.io.emit('market-update', stocksUpdate);
      this.io.emit('market-event', { type, sectors, impact });
    }
  }
}

module.exports = new MarketSimulator();
