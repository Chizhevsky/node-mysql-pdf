var express = require('express'),
  mysql = require('mysql'),
  myConnection = require('express-myconnection');

var app = express();

var dbOptions = {
  host: 'localhost',
  user: 'user',
  password: 'root',
  database: 'test'
};

app.use(myConnection, (mysql, dbOptions, 'request'));

app.get('/', function(req, res) {

});

app.post('/', function(req, res) {
  var reqObj = req.body;
  req.getConnection(function(err, conn) {
    if (err) {
      console.error('sql connection error: ', err);
    } else {
      var select = '';//sql-код для поиска имени
      var query = conn.query(select, /*что-то ещё возможно*/ function(err, result) {
        if (err) console.error('sql error', err);
        var namesId = result.namesId;
        res.json('name_id': namesId);
      });
    }
  })
});
