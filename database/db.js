/* eslint-disable no-await-in-loop */
const { query } = require('express');
const { pool } = require('./connection');
const tableQuery = require('./tablequeries');

async function fetchLastBalanceSheet() {
  const currentBalance = await pool.query(
    'select * from balancesheet ORDER BY balancesheetid DESC  limit 1 ',
  );
  return currentBalance.rows || [];
}

async function InsertMoneyTranscation(type, amount) {
  const addTransaction = await pool.query(
    'INSERT INTO transactions(transactiondate, action, amount) VALUES(current_timestamp,$1, $2) RETURNING *;',
    [type, amount],
  );
  return addTransaction.rows;
}
async function InsertStockTranscation(ticker,
  type,
  quantity,
  priceOfEachShare,
  amount) {
  const addTransaction = await pool.query(
    'INSERT INTO transactions(transactiondate, ticker, action, quantity, priceofeachshare, amount) VALUES(current_timestamp,$1, $2, $3, $4, $5) RETURNING *;',
    [ticker, type, quantity, priceOfEachShare, amount],
  );
  return addTransaction.rows;
}

async function UpdateBalanceSheet(amount, transactionid) {
  const result = await pool.query(
    'insert into balancesheet(accountbalance, transactionid) values($1, $2) returning *',
    [amount, transactionid],
  );
  return result.rows;
}

async function AddStock(ticker, quantity, transactionid) {
  const result = await pool.query(
    'insert into portfolio(ticker, quantity, transactionid) values($1,$2,$3) returning *',
    [ticker, quantity, transactionid],
  );
  return result.rows;
}

async function fetchStockForQuote(ticker) {
  try {
    const result = await pool.query(
      'select * from portfolio where ticker = $1',
      [ticker],
    );
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function updatePortfolio(queries) {
  const result = [];
  for (const query of queries) {
    const res = await pool.query(query.query, query.values);
    result.push(res);
  }
  return result;
}

async function fetchPortfolio() {
  const result = await pool.query(
    'select * from portfolio',
  );
  return result.rows;
}

async function getTransactionHistory() {
  const history = await pool.query('SELECT * from transactions order by transactionid DESC limit 50');
  return history.rows;
}

async function createTables() {
  try {
    const result = await pool.query(tableQuery);
  } catch (error) {
  // the error is thrown if the tables are present
  }
}
module.exports = {
  fetchLastBalanceSheet,
  InsertMoneyTranscation,
  InsertStockTranscation,
  UpdateBalanceSheet,
  AddStock,
  fetchStockForQuote,
  updatePortfolio,
  fetchPortfolio,
  getTransactionHistory,
  createTables,
};
