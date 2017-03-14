var express = require('express'),
  mysql = require('mysql'),
  myConnection = require('express-myconnection'),
  fs = require('fs'),
  PDFDocument = require('pdfkit'),
  blobStream = require('blob-stream'),
  handlebars = require('express-handlebars')
  .create({defaultLayout: 'main'});

var app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));

var dbOptions = {  
  host: process.env.RDS_HOSTNAME,  
  user: process.env.RDS_USERNAME,
  database: process.env.RDS_DB_NAME
};

app.use(myConnection(mysql, dbOptions, 'request'));

app.get('/', function(req, res) {
  res.render('input');
});

app.post('/', function(req, resp) {
  var searchName = req.body.name;
  var doc,
    imgBlob;
  req.getConnection(function(err, conn) {
    if (err) {
      console.log('sql error', err);
    } else {
      conn.query('SELECT * FROM user WHERE firstName = ?', searchName, function(err, res) {
        if (err) {
          console.log('sql error:', err);
        } else {
          console.log(res[0]);
          var writeStream = fs.createWriteStream('file.pdf');
          doc = new PDFDocument({size: 'LEGAL'});
          doc.pipe(blobStream());
          doc.pipe(writeStream);
          imgBlob = res[0].image;
          fullName = res[0].firstName + ' ' + res[0].lastName;
          doc.text(fullName, 100, 100);
          doc.image(imgBlob, {width: 400});
          doc.end();
            conn.query(" UPDATE user SET pdf = 'file.pdf' WHERE firstName = ? ", searchName, function(err, resl) {
              if (err) {
                throw err;
                console.log('sql error:', err);
                resp.send(JSON.stringify({ result: false }));
              } else {
                if (!!resl) {
                  resp.send(JSON.stringify({ result: true }));
                }
              }
            });
          fs.unlink('file.pdf');
        }
      });
    }
  });
});

app.listen(3000, function() {
  console.log('Listen on port 3000');
});
