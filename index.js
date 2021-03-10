const express = require('express');
const db = require('./database/db');
const validate = require('./validation');
const errorHandler = require('./errorHandler');
const services = require('./services/services');

const app = express();
app.use(express.json());

app.get('/quote/:tinker', async (req, res, next) => {
  const { tinker } = req.params;
  try {
    const jsonRes = await services.fetchQuote(tinker);
    res.json(jsonRes);
  } catch (error) {
    next({ Error: 'QuoteError', msg: error.response.data, status: error.response.status });
  }
});

app.get('/portfolio', async (req, res, next) => {
  try {
    const portfolio = await db.fetchPortfolio();
    const quotesData = await services.fetchAllQuotes(portfolio);
    const portfolioData = await services.makePortfolio(portfolio, quotesData);
    res.json(portfolioData);
  } catch (error) {
    next(error);
  }
});

app.get('/history', async (req, res, next) => {
  try {
    const history = await db.fetchTransactionHistory();
    res.json(history);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.post('/transaction', validate.validateTransactionSchema, async (req, res, next) => {
  const { ticker, type, quantity } = req.body;
  try {
    const jsonRes = await services.fetchQuote(ticker);
    const priceOfEachShare = jsonRes.iexOpen;
    const totalAmountOfAllShares = priceOfEachShare * quantity;
    const currentBalance = await db.fetchLastBalanceSheet();
    const getStocksOfTicker = await db.fetchStockForQuote(ticker);
    if (type === 'buy') {
      if (!currentBalance[0]) {
        res
          .status(200)
          .send('The current Balance is zero, Please add money to the account to buy stocks');
      } else if (parseFloat(currentBalance[0].accountbalance) < totalAmountOfAllShares) {
        res
          .status(200)
          .send(`Cannot Buy shares as the account balance is ${currentBalance[0].accountbalance} and the totalAmount for the shares you are trying to buy ${totalAmountOfAllShares} is more than that, Please add money to the account to buy stocks`);
      } else {
        const addStock = await services.makeTransactionAndAddStock(ticker,
          type,
          quantity,
          priceOfEachShare,
          totalAmountOfAllShares,
          parseFloat(currentBalance[0].accountbalance));
        res.json(addStock);
      }
    } else if (type === 'sell') {
      if (!getStocksOfTicker.length) {
        return res.status(200).send(`No Stocks of ticker ${ticker} are Owned`);
      }
      const noOfSharesOwned = services.countShares(getStocksOfTicker);
      if (noOfSharesOwned < quantity) {
        res.status(200).send(`There are only ${noOfSharesOwned} stocks Owned by you`);
      } else {
        const soldStocks = await services.sellStocks(
          ticker,
          type,
          quantity,
          priceOfEachShare,
          totalAmountOfAllShares,
          parseFloat(currentBalance[0].accountbalance),
          getStocksOfTicker,
          noOfSharesOwned,
        );
        res.status(200).json(soldStocks);
      }
    }
  } catch (error) {
    next(error);
  }
});

app.post('/transfer', validate.validateTransferSchema, async (req, res, next) => {
  const { type, amount } = req.body;
  try {
    const currentBalance = await db.fetchLastBalanceSheet();
    if (!currentBalance.length && type === 'remove') {
      res
        .status(200)
        .send('The current Balance is zero, The amount cannot be Removed');
    } else if (type === 'remove' && parseFloat(currentBalance[0].accountbalance) - amount < 0) {
      res
        .status(200)
        .send(
          `The current Account Balance is ${currentBalance[0].accountbalance}, Low Balance!`,
        );
    } else {
      let price = currentBalance[0] ? parseFloat(currentBalance[0].accountbalance) : 0;
      if (type === 'remove') price -= amount;
      else if (type === 'add') price += amount;
      const addMoneyToAccount = await services.transferAmount(
        type,
        price,
        amount,
      );
      res.status(200).json(addMoneyToAccount);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.use(errorHandler);

app.get('/', async (req, res, next) => {
  res.status(200).send('welcome');
});

db.createTables();

if (process.env.NODE_ENV === 'test') {
  const server = app.listen(process.env.PORT || 5001, () => {
    console.log('server listening on port 5000');
  });
  server.close(() => 'server disconnected');
} else {
  app.listen(process.env.PORT || 5000, () => {
    console.log('server listening on port 5000');
  });
}

module.exports = app;
