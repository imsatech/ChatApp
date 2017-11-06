var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatAPP'
});
connection.connect(function(err) {
  if (!err) {
    console.log("Database is connected");
  } else {
    console.log("Error while connecting with database");
    throw err;
  }
});
module.exports = connection;
