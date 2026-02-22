const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const portfolioItemSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 100000 // $100,000 starting balance
  },
  portfolio: [portfolioItemSchema],
  watchlist: [{
    type: String
  }],
  totalInvested: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate portfolio value
userSchema.methods.getPortfolioValue = function(stockPrices) {
  let portfolioValue = 0;
  for (const item of this.portfolio) {
    const price = stockPrices[item.symbol] || item.avgPrice;
    portfolioValue += price * item.quantity;
  }
  return portfolioValue + this.balance;
};

// Get total P&L
userSchema.methods.getTotalPnL = function(stockPrices) {
  let portfolioValue = 0;
  let totalCost = 0;
  
  for (const item of this.portfolio) {
    const currentPrice = stockPrices[item.symbol] || item.avgPrice;
    portfolioValue += currentPrice * item.quantity;
    totalCost += item.avgPrice * item.quantity;
  }
  
  return (portfolioValue + this.balance) - (totalCost + 100000);
};

module.exports = mongoose.model('User', userSchema);
