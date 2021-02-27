/* eslint-disable no-useless-catch */
const axios = require('axios');
const db = require('../database/db');

const url = 'https://cloud.iexapis.com/stable';
const { token } = require('../config/config');

async function transferAmount(type, price, amount) {
  const addTransaction = await db.InsertMoneyTranscation(type, amount);
  const addMoney = await db.UpdateBalanceSheet(
    price,
    addTransaction[0].transactionid,
  );
  return addMoney;
}

async function getQuote(tinker) {
  try {
    const jsonres = await axios.get(
      `${url}/stock/${tinker}/quote?token=${token}`,
    );
    return jsonres.data;
  } catch (error) {
    throw error;
  }
}

async function makeTransactionAndAddStock(
  ticker,
  type,
  quantity,
  priceOfEachShare,
  amount,
  currentBalance,
) {
  try {
    const addTransaction = await db.InsertStockTranscation(
      ticker,
      type,
      quantity,
      priceOfEachShare,
      amount,
    );
    const addStock = await db.AddStock(
      ticker,
      quantity,
      addTransaction[0].transactionid,
    );
    const updateAmount = await db.UpdateBalanceSheet(
      currentBalance - amount,
      addTransaction[0].transactionid,
    );
    return addStock;
  } catch (error) {
    throw error;
  }
}

function countNoOfShares(stocksData) {
  let count = 0;
  stocksData.forEach((stock) => {
    count += stock.quantity;
  });
  return count;
}

function makeQueries(stockData, noOfShares) {
  const queries = [];
  let shareToSell = noOfShares;
  stockData.forEach((stock) => {
    if (shareToSell && shareToSell >= stock.quantity) {
      const query = 'delete from portfolio where portfolioid = $1';
      const values = [stock.portfolioid];
      queries.push({ query, values });
      shareToSell -= stock.quantity;
    } else if (shareToSell && shareToSell < stock.quantity) {
      const query = 'update portfolio set quantity = $1 where portfolioid = $2';
      const values = [stock.quantity - shareToSell, stock.portfolioid];
      queries.push({ query, values });
      shareToSell = 0;
    }
  });
  return queries;
}

async function sellStocks(
  ticker,
  type,
  quantity,
  priceOfEachShare,
  totalAmountOfAllShares,
  currentBalance,
  stockData,
) {
  const addTransaction = await db.InsertStockTranscation(
    ticker,
    type,
    quantity,
    priceOfEachShare,
    totalAmountOfAllShares,
  );
  const queries = makeQueries(stockData, quantity);
  const result = await db.updatePortfolio(queries);
  const updateAmount = await db.UpdateBalanceSheet(
    currentBalance + totalAmountOfAllShares,
    addTransaction[0].transactionid,
  );
  return { addTransaction };
}

async function fetchAllQuotes(data) {
  const Quotes = new Set();
  data.forEach((element) => {
    Quotes.add(element.ticker);
  });
  const res = [];
  for (const quote of Quotes) {
    res.push(getQuote(quote));
  }
  const result = await Promise.all(res);
  return result.reduce((acc, quote) => {
    const quoteSymbol = quote.symbol;
    acc[0][quoteSymbol] = quote;
    return acc;
  }, [{}]);
}

function makePortfolio(portfolio, quotesData) {
  portfolio.forEach((element) => {
    const ticker = element.ticker.toUpperCase();
    element['marketCap'] = quotesData[0][ticker].marketCap;
    element['open'] = quotesData[0][ticker].iexOpen;
    element['totalValue'] = quotesData[0][ticker].iexOpen * element['quantity'];
  });
  return portfolio;
}
module.exports = {
  transferAmount,
  getQuote,
  makeTransactionAndAddStock,
  countNoOfShares,
  sellStocks,
  fetchAllQuotes,
  makePortfolio,
};
