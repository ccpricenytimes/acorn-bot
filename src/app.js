var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('acorn.db');
var bodyParser = require('body-parser');

// Database initialization
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='acronyms'", function(err, rows) {
    console.log('here');
  if(err !== null) {
    console.log(err);
  }
  else if(rows === undefined) {
    db.run('CREATE TABLE "acronyms" ' +
           '("id" INTEGER PRIMARY KEY AUTOINCREMENT, ' +
           '"acronym" VARCHAR(255), ' +
            '"description" VARCHAR(512),' +
           'url VARCHAR(255))', function(err) {
      if(err !== null) {
        console.log(err);
      }
      else {
        console.log("SQL Table 'Acronyms' initialized.");
      }
    });
  }
  else {
    console.log("SQL Table 'Acronyms' already initialized.");
  }
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // APP Setup
    app.get('/', function (req, res) {
        console.log(req.query.text);
        db.all('SELECT * FROM acronyms ORDER BY acronym', function(err, row) {
          if(err !== null) {
            // Express handles errors via its next function.
            // It will call the next operation layer (middleware),
            // which is by default one that handles errors.
            next(err);
          }
          else {
            console.log(row);
              res.sendStatus(200, 'Hello World!');
          }
        });



    });

    app.post('/', function(pReq, pRes){
        var text = pReq.body;
        console.log(text);
        pRes.send('Hey I\'m Acorn! :tree:  ' + text.text);
    });

    // We define a new route that will handle bookmark creation
    app.post('/define', function(req, res, next) {
        console.log(req.query);
     var acronym = "SLOP";
      var description = "Secret Life of Pets";
      var url = "http://www.nytimes.com/2016/07/08/movies/the-secret-life-of-pets-review.html?_r=0";
      var sqlSelect = "SELECT * FROM 'acronyms' WHERE acronym = '" + acronym + "'";
      db.all(sqlSelect, function(err, row) {
        if(err !== null) {
          next(err);
        }
        else {
            // Acronym is new, use it here
            if(row.length == 0) {
                res.send('that is a new acronym');
            // sqlRequest = "INSERT INTO 'acronyms' (acronym, description, url) " +
            //              "VALUES('" + acronym + "', '" + description + "', '" + url + "')";
            // db.run(sqlRequest, function(err) {
            //   if(err !== null) {
            //     next(err);
            //   }
            //   else {
            //     console.log('success!');
            //     res.sendStatus(200);
            //   }
            // });
          } else {
              res.send('Acnonym Already Exists');
          }
        }
      });

    });

    app.listen(process.env.PORT, function () {
      console.log('Acorn listening on ' + process.env.PORT);
    });

});


