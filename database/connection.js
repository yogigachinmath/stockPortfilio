const { Pool } = require('pg');
const {
  user, password, host, port, database,
} = require('../config/config');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

module.exports = {
  pool,
};
