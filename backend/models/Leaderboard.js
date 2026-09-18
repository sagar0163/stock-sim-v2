const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: String,
  balance: Number,
  portfolioValue: Number,
  invested: Number,
  pnl: Number,
  pnlPercent: Number,
  holdings: Number,
  memberSince: Date,
  rank: {
    type: Number,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
