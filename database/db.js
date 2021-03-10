const { pool } = require('./connection');
const tableQuery = require('./tablequeries');

async function fetchLastBalanceSheet() {
  try {
    const currentBalance = await pool.query(
      'select * from balancesheet ORDER BY balancesheetid DESC  limit 1 ',
    );
    return currentBalance.rows || [];
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}

async function makeTransferTransaction(type, amount) {
  try {
    const addTransaction = await pool.query(
      'INSERT INTO transactions(transactiondate, action, amount) VALUES(current_timestamp,$1, $2) RETURNING *;',
      [type, amount],
    );
    return addTransaction.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}
async function makeStockTransaction(
  ticker,
  type,
  quantity,
  priceOfEachShare,
  amount,
) {
  try {
    const addTransaction = await pool.query(
      'INSERT INTO transactions(transactiondate, ticker, action, quantity, priceofeachshare, amount) VALUES(current_timestamp,$1, $2, $3, $4, $5) RETURNING *;',
      [ticker, type, quantity, priceOfEachShare, amount],
    );
    return addTransaction.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}

async function updateBalanceSheet(amount, transactionid) {
  try {
    const result = await pool.query(
      'insert into balancesheet(accountbalance, transactionid) values($1, $2) returning *',
      [amount, transactionid],
    );
    return result.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}

async function addStock(ticker, quantity, transactionid) {
  try {
    const result = await pool.query(
      'insert into portfolio(ticker, quantity, transactionid) values($1,$2,$3) returning *',
      [ticker, quantity, transactionid],
    );
    return result.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}

async function fetchStockForQuote(ticker) {
  try {
    const result = await pool.query(
      'select * from portfolio where ticker = $1',
      [ticker],
    );
    return result.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}
async function updatePortfolio(queries) {
  try {
    const result = await Promise.all(queries.map((item) => pool.query(item.query, item.values)));
    return result;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}

async function fetchPortfolio() {
  try {
    const result = await pool.query('select * from portfolio');
    return result.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
}

async function fetchTransactionHistory() {
  try {
    const history = await pool.query(
      'SELECT * from transactions order by transactionid DESC limit 50',
    );
    return history.rows;
  } catch (error) {
    throw new Error({ Error: 'dbError', msg: error });
  }
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
  makeTransferTransaction,
  makeStockTransaction,
  updateBalanceSheet,
  addStock,
  fetchStockForQuote,
  updatePortfolio,
  fetchPortfolio,
  fetchTransactionHistory,
  createTables,
};
