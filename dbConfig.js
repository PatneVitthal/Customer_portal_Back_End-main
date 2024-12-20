// dbConfig.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',     // Replace with your database host
  user: 'root',  // Your database username
  password: 'Mobile@123', // Your database password
  database: 'storedetails', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


module.exports = pool.promise(); // Enable promise-based methods
