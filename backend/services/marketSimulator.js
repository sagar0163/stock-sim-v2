const Stock = require('../models/Stock');
const marketDataService = require('./marketDataService');

class MarketSimulator {
  constructor() {
    this.io = null;
    this.interval = null;
    this.volatility = 0.02; // 2% max change fallback
    this.currentStockIndex = 0;
    this.stocksPerTick = 5; // How many to fetch from real API per tick
  }
  
  setSocketIO(io) {
    this.io = io;
  }
  
  async initialize() {
    console.log('Initializing market...');
    // Only load if empty, seed.js handles the population
    const count = await Stock.countDocuments();
    if (count === 0) {
      console.log('No stocks found in DB, please run seed.js');
    } else {
      console.log(`Market initialized with ${count} stocks`);
    }
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
      
      // Determine which stocks to attempt live update for this tick
      const toUpdateLive = [];
      for (let i = 0; i < this.stocksPerTick; i++) {
        if (stocks.length > 0) {
          toUpdateLive.push(stocks[this.currentStockIndex].symbol);
          this.currentStockIndex = (this.currentStockIndex + 1) % stocks.length;
        }
      }

      for (const stock of stocks) {
        let newPrice = null;
        
        if (toUpdateLive.includes(stock.symbol)) {
          newPrice = await marketDataService.getQuote(stock.symbol);
        }

        if (newPrice === null) {
          // Fallback to random walk if no live price/cache available
          const change = (Math.random() - 0.5) * 2 * this.volatility;
          newPrice = Math.max(1, stock.price * (1 + change));
        }
        
        // Update price
        stock.previousPrice = stock.price;
        stock.price = parseFloat(newPrice.toFixed(2));
        stock.change = parseFloat((stock.price - stock.previousPrice).toFixed(2));
        stock.changePercent = parseFloat((((stock.change / stock.previousPrice) * 100) || 0).toFixed(2));
        
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
    
    const stocks = await Stock.find({});
    for (const stock of stocks) {
      if (sectors.includes(stock.sector)) {
        const newPrice = stock.price * (1 + impact / 100);
        stock.price = parseFloat(newPrice.toFixed(2));
        stock.previousPrice = stock.price;
        await stock.save();
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
