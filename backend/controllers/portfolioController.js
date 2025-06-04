const Portfolio = require('../models/Portfolio');
const yahooFinance = require('yahoo-finance2').default;
const PortfolioHistory = require('../models/portfolioHistorySchema');

// Fetch stock data
const fetchStockData = async (symbol) => {
  try {
    if (!symbol) {
      throw new Error('Stock symbol is undefined or invalid.');
    }
    const data = await yahooFinance.quote(symbol); // Fetch stock data
    if (!data || !data.regularMarketPrice) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }
    return {
      currentPrice: data.regularMarketPrice,
      symbol: data.symbol,
    };
  } catch (error) {
    console.error(`Error fetching data for symbol "${symbol}":`, error.message);
    return null;
  }
};

// Get all stocks with live price
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find();
    const enrichedPortfolio = await Promise.all(
      portfolio.map(async (stock) => {
        const liveData = await fetchStockData(stock.symbol); // Use fetchStockData
        if (!liveData) {
          console.warn(`Skipping stock with symbol "${stock.symbol}" due to missing data.`);
          return { 
            ...stock._doc, 
            currentPrice: null, 
            currentValue: null, 
            profitLoss: null 
          };
        }
        const currentPrice = liveData.currentPrice;
        const currentValue = currentPrice * stock.quantity;
        const profitLoss = (currentPrice - stock.buyPrice) * stock.quantity;

        // Include the stock name in the response
        const stockName = stock.stock || 'Unknown'; // Use the `stock` field or fallback to 'Unknown'

        return { 
          ...stock._doc, 
          stock: stockName, // Add stock name
          currentPrice, 
          currentValue, 
          profitLoss 
        };
      })
    );

    res.json(enrichedPortfolio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a stock
const addStock = async (req, res) => {
  try {
    const { stock, symbol, quantity, buyPrice } = req.body; // Include stock name
    const userId= req.user.id;
    
    if (!stock || !symbol || !quantity || !buyPrice) {
      return res.status(400).json({ message: 'Stock name, symbol, quantity, and buy price are required.' });
    }

    const newStock = new Portfolio({  userId ,stock, symbol, quantity, buyPrice });
    const savedStock = await newStock.save();
    res.status(201).json(savedStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a stock
const deleteStock = async (req, res) => {
  try {
    const stockId = req.params.id;
    if (!stockId) {
      return res.status(400).json({ message: 'Stock ID is required.' });
    }
    await Portfolio.findByIdAndDelete(stockId);
    res.json({ message: 'Stock removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const porthistpost= async (req, res) => {
	try {
	  const newHistory = new PortfolioHistory({
		userId: req.user.id,
		totalValue: req.body.totalValue
	  });
	  
	  await newHistory.save();
	  res.json(newHistory);
	} catch (error) {
	  res.status(500).send('Server Error');
	}
  };
 const porthistget=async (req, res) => {
	try {
	  // Get records from the last 30 days
	  const thirtyDaysAgo = new Date();
	  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	  
	  const history = await PortfolioHistory.find({
		userId: req.user.id,
		timestamp: { $gte: thirtyDaysAgo }
	  }).sort({ timestamp: 1 });
	  
	  res.json(history);
	} catch (error) {
	  res.status(500).send('Server Error');
	}
  };

module.exports = { getPortfolio, addStock, deleteStock ,porthistget,porthistpost};
