require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Stock = require('../models/Stock');

const commands = {
  'list': async () => {
    const stocks = await Stock.find({}, 'symbol name price changePercent sector');
    console.log('\n📈 Market Status:');
    console.log('='.repeat(60));
    stocks.forEach(s => {
      const change = s.changePercent >= 0 ? '+' : '';
      console.log(`${s.symbol:8} $${s.price.toFixed(2):8} ${change}${s.changePercent}%  ${s.sector}`);
    });
    console.log('='.repeat(60));
  },
  
  'reset': async () => {
    await Stock.updateMany({}, { 
      price: 100, 
      previousPrice: 100,
      change: 0,
      changePercent: 0,
      priceHistory: []
    });
    console.log('✅ All stock prices reset to $100');
  },
  
  'crash': async () => {
    await Stock.updateMany({}, { $mul: { price: 0.8 } });
    console.log('📉 Market crashed! All prices down 20%');
  },
  
  'boom': async () => {
    await Stock.updateMany({}, { $mul: { price: 1.2 } });
    console.log('📈 Market boom! All prices up 20%');
  },
  
  'sector': async (sector, change) => {
    await Stock.updateMany({ sector }, { $mul: { price: 1 + change } });
    console.log(`✅ ${sector} sector adjusted by ${change * 100}%`);
  }
};

const run = async () => {
  await connectDB();
  
  const cmd = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  if (commands[cmd]) {
    if (cmd === 'sector' && arg1 && arg2) {
      await commands[cmd](arg1, parseFloat(arg2));
    } else if (cmd === 'sector') {
      console.log('Usage: node admin.js sector <sector_name> <change_percent>');
      console.log('Example: node admin.js sector Technology 0.1');
    } else {
      await commands[cmd]();
    }
  } else {
    console.log('Available commands:');
    console.log('  node admin.js list          - Show all stocks');
    console.log('  node admin.js reset         - Reset all prices to $100');
    console.log('  node admin.js crash         - Crash market (-20%)');
    console.log('  node admin.js boom          - Boom market (+20%)');
    console.log('  node admin.js sector <s> <c> - Adjust sector by %');
  }
  
  process.exit(0);
};

run();
