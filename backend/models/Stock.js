const mongoose = require('mongoose');

const pricePointSchema = new mongoose.Schema({
  price: Number,
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  previousPrice: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  sector: {
    type: String,
    required: true,
    enum: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Retail', 'Automotive', 'Entertainment', 'Telecom']
  },
  marketCap: {
    type: String,
    default: "N/A"
  },
  description: {
    type: String,
    default: ""
  },
  priceHistory: [pricePointSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update change before saving
stockSchema.pre('save', function(next) {
  if (this.previousPrice === 0) {
    this.previousPrice = this.price;
  }
  this.change = this.price - this.previousPrice;
  this.changePercent = this.previousPrice > 0 
    ? ((this.change / this.previousPrice) * 100).toFixed(2) 
    : 0;
  this.lastUpdated = new Date();
  next();
});

// Index for search
stockSchema.index({ name: 'text', symbol: 'text' });

module.exports = mongoose.model('Stock', stockSchema);
