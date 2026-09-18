const axios = require('axios');
const { parse } = require('node-html-parser');
const fs = require('fs');

async function fetchSP500() {
  try {
    const { data } = await axios.get('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const root = parse(data);
    const table = root.querySelector('#constituents');
    const rows = table.querySelectorAll('tr').slice(1);
    
    const stocks = rows.map(row => {
      const cols = row.querySelectorAll('td');
      return {
        symbol: cols[0].text.trim().replace('.', '-'),
        name: cols[1].text.trim(),
        sector: cols[3].text.trim(),
        description: cols[1].text.trim()
      };
    });
    
    fs.writeFileSync('./data/sp500.json', JSON.stringify(stocks, null, 2));
    console.log(`Saved ${stocks.length} stocks to sp500.json`);
  } catch (err) {
    console.error('Error fetching S&P 500:', err.message);
  }
}

fetchSP500();
