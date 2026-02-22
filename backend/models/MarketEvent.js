const mongoose = require('mongoose');

const marketEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  sectors: [{
    type: String,
    enum: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Retail', 'Automotive', 'Entertainment', 'Telecom']
  }],
  impact: {
    type: Number,
    default: 0,
    min: -20,
    max: 20
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarketEvent', marketEventSchema);
