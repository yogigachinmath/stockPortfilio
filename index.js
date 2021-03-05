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
    const jsonres = await services.getQuote(tinker);
    res.json(jsonres);
  } catch (error) {
    next({ Error: 'QuoteError', msg: error.response.data, status: error.response.status });
  }
});

app.get('/portfolio', async (req, res, next) => {
  const portfolio = await db.fetchPortfolio();
  const quotesData = await services.fetchAllQuotes(portfolio);
  const portfolioData = await services.makePortfolio(portfolio, quotesData);
  res.json(portfolioData);
});

app.get('/history', async (req, res, next) => {
  try {
    const history = await db.getTransactionHistory();
    res.json(history);
  } catch (error) {
    console.error(error);
  }
});

app.post('/transaction', validate.validateTransactionSchema, async (req, res, next) => {
  const { ticker, type, quantity } = req.body;
  try {
    const jsonres = await services.getQuote(ticker);
    const priceOfEachShare = jsonres.iexOpen;
    const totalAmountOfAllShares = priceOfEachShare * quantity;
    const currentBalance = await db.fetchLastBalanceSheet();
    if (type === 'buy' && !currentBalance[0]) {
      res
        .status(200)
        .send('The current Balance is zero, Please add money to the account to buy stocks');
    } else if (type === 'buy' && parseFloat(currentBalance[0].accountbalance) < totalAmountOfAllShares) {
      res
        .status(200)
        .send(`Cannot Buy share as the account balance is ${currentBalance[0].accountbalance} and the totalAmount for the shares you are trying to buy ${totalAmountOfAllShares} is more than that, Please add money to the account to buy stocks`);
    } else if (type === 'buy') {
      const addStock = await services.makeTransactionAndAddStock(ticker,
        type,
        quantity,
        priceOfEachShare,
        totalAmountOfAllShares,
        parseFloat(currentBalance[0].accountbalance));
      res.json(addStock);
    } else if (type === 'sell') {
      const getStocksOfTicker = await db.fetchStockForQuote(ticker);
      if (!getStocksOfTicker.length) {
        return res.status(200).send(`No Stocks of ticker ${ticker} are Owned`);
      }
      const noOfSharesOwned = services.countNoOfShares(getStocksOfTicker);
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
    console.log(error);
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
        .json('The current Balance is zero, The amount cannot be Removed');
    } else if (type === 'remove' && parseFloat(currentBalance[0].accountbalance) - amount < 0) {
      res
        .status(200)
        .json(
          `The current Account Balance is ${currentBalance[0].accountbalance}, Low Balance!`,
        );
    } else {
      let price = currentBalance[0] ? parseFloat(currentBalance[0].accountbalance) : 0;
      if (type === 'remove') price -= amount;
      else if (type === 'add') price += amount;
      const addMoney = await services.transferAmount(
        type,
        price,
        amount,
      );
      res.status(200).json(addMoney);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.use(errorHandler);

app.get('/', async (req, res, next) => {
  res.send('welcome');
});

app.listen(process.env.PORT || 5000, () => {
  console.log('server listening on port 5000');
});

db.createTables();
