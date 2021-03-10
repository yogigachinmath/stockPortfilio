/* eslint-disable no-useless-catch */
const axios = require('axios');
const db = require('../database/db');

const url = 'https://cloud.iexapis.com/stable';
const { token } = require('../config/config');

async function transferAmount(type, price, amount) {
  try {
    const addTransaction = await db.makeTransferTransaction(type, amount);
    const addMoney = await db.updateBalanceSheet(
      price,
      addTransaction[0].transactionid,
    );
    return addMoney;
  } catch (error) {
    throw error;
  }
}

async function fetchQuote(tinker) {
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
    const addTransaction = await db.makeStockTransaction(
      ticker,
      type,
      quantity,
      priceOfEachShare,
      amount,
    );
    const addStock = await db.addStock(
      ticker,
      quantity,
      addTransaction[0].transactionid,
    );
    const updateAmount = await db.updateBalanceSheet(
      currentBalance - amount,
      addTransaction[0].transactionid,
    );
    return addStock;
  } catch (error) {
    throw error;
  }
}

function countShares(stocksData) {
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
  try {
    const addTransaction = await db.makeStockTransaction(
      ticker,
      type,
      quantity,
      priceOfEachShare,
      totalAmountOfAllShares,
    );
    const queries = makeQueries(stockData, quantity);
    const result = await db.updatePortfolio(queries);
    const updateAmount = await db.updateBalanceSheet(
      currentBalance + totalAmountOfAllShares,
      addTransaction[0].transactionid,
    );
    return { addTransaction };
  } catch (error) {
    throw error;
  }
}

async function fetchAllQuotes(data) {
  try {
    const Quotes = new Set();
    data.forEach((quote) => {
      Quotes.add(quote.ticker);
    });
    const result = await Promise.all(Array.from(Quotes).map((quote) => fetchQuote(quote)));
    return result.reduce((acc, quote) => {
      const quoteSymbol = quote.symbol;
      acc[0][quoteSymbol] = quote;
      return acc;
    }, [{}]);
  } catch (error) {
    throw error;
  }
}

function makePortfolio(portfolio, quotesData) {
  const portfolioData = portfolio;
  portfolio.forEach((element, index) => {
    const ticker = element.ticker.toUpperCase();
    portfolioData[index].marketCap = quotesData[0][ticker].marketCap;
    portfolioData[index].open = quotesData[0][ticker].iexOpen;
    portfolioData[index].totalValue = quotesData[0][ticker].iexOpen * element.quantity;
  });
  return portfolioData;
}

module.exports = {
  transferAmount,
  fetchQuote,
  makeTransactionAndAddStock,
  countShares,
  sellStocks,
  fetchAllQuotes,
  makePortfolio,
};
