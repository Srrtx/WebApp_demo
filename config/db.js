const mysql = require("mysql2");

const con = mysql.createConnection({
  host: '127.0.0.1', // Use IPv4 to avoid ECONNREFUSED errors on localhost
  user: 'root',
  password: '', // Ensure your password is correct
  database: 'webdb'
});

module.exports = con;
