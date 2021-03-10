const { Pool } = require('pg');
const {
  user, password, host, port, database,
} = require('../config/config');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   }
// });

const pool = new Pool({
  user,
  password,
  host,
  port,
  database,
});

module.exports = {
  pool,
};
