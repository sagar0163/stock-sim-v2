const axios = require('axios');
const fs = require('fs');
const path = require('path');

class MarketDataService {
  constructor() {
    this.cacheFile = path.join(__dirname, '../data/price_cache.json');
    this.cache = new Map();
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.apiKey = process.env.FINNHUB_API_KEY || 'demo';
    this.rateLimitWait = 1000; // 1 second between requests (60 per minute)
    
    this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        for (const [key, value] of Object.entries(data)) {
          this.cache.set(key, value);
        }
        console.log(`Loaded ${this.cache.size} prices from cache`);
      }
    } catch (err) {
      console.error('Error loading price cache:', err.message);
    }
  }

  saveCache() {
    try {
      const obj = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(obj));
    } catch (err) {
      console.error('Error saving price cache:', err.message);
    }
  }

  async getQuote(symbol) {
    const cached = this.cache.get(symbol);
    const now = Date.now();

    // If cache is less than 5 minutes old, use it to save requests
    if (cached && (now - cached.timestamp < 5 * 60 * 1000)) {
      return cached.price;
    }

    // Rate limiting logic
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.rateLimitWait) {
      // If we are hitting rate limits, just return cached price (if available) or null
      if (cached) return cached.price;
      return null; // Signals to use fallback DB price
    }

    try {
      this.lastRequestTime = Date.now();
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`, {
        timeout: 5000
      });
      
      const price = response.data.c;
      
      if (price && price > 0) {
        this.cache.set(symbol, {
          price,
          timestamp: Date.now()
        });
        
        // Save cache every 10 updates to avoid too much IO
        if (Math.random() < 0.1) this.saveCache();
        
        return price;
      }
      
      return cached ? cached.price : null;
    } catch (err) {
      console.error(`Error fetching quote for ${symbol}:`, err.message);
      return cached ? cached.price : null;
    }
  }
}

module.exports = new MarketDataService();
