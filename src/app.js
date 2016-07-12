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

    app.post('/', function(pReq, pRes) {

        // If first word is 'define', split by , and try to insert into DB
        // If first word is 'help' give list of help items
        var query = pReq.body.text;
        var commandSplit = query.split(' ');
        var command = commandSplit[0].toUpperCase();
        var acorn = commandSplit[1].split(',')[0];
        console.log("INITIAL QUERY", query);
        console.log("COMMAND IS", command);


        // DEFINE AN ACRONYM
        if (command == 'DEFINE') {
            var definition = query.split(',');
            if (definition.length < 2) {
                pRes.send('Your definition is malformed. Please Try again');
            } else {
                    var acronym = definition[0].split(' ')[1]; // get rid of define
                    var description = definition[1];
                    var url = '';
                    if(definition.length === 3) {
                        var url = definition[2];
                    }
                    console.log('Acronym to define: ', acronym);
                    var sqlSelect = "SELECT * FROM 'acronyms' WHERE acronym = '" + acronym.toUpperCase() + "'";
                     db.all(sqlSelect, function(err, row) {
                       if(err !== null) {
                         next(err);
                       }
                       else {
                           // Acronym is new, add it
                           if(row.length == 0) {
                            console.log('Addding new acronym', acronym);
                            console.log('Description is', description);
                            console.log('URL is', url);
                           sqlRequest = "INSERT INTO 'acronyms' (acronym, description, url) " +
                                        "VALUES('" + acronym.toUpperCase() + "', '" + description + "', '" + url + "')";
                           db.run(sqlRequest, function(err) {
                             if(err !== null) {
                               next(err);
                             }
                             else {
                               console.log('success!');
                               pRes.send( acronym + ' has been added to the dictionary. \n You can search for it with  ```/acorn ' + acronym + ' ```');
                             }
                           }); // end acronym insert
                         } else {
                             pRes.send('Acnonym Already Exists. \n You can search with ```/acorn ' + acorn + ' ```');
                         }
                       }
                     }); // end duplicate check for acronym insert
            }

        } else if(command == 'HELP') {
            var helpText = 'Hello my name is acorn :tree: \n' +
            'I am a simple acronym bot \n' +
            'To look up an acronym say' +
            '``` /acorn NYT ```' +
            'To define an acronym say' +
            '``` /acorn define NYT, The New York Times, http://www.nytimes.com ```'

        } else {
            console.log('acronym lookup');
        var sqlSelect = "SELECT * FROM 'acronyms' WHERE acronym = '" + query.toUpperCase() + "'";
        db.all(sqlSelect, function(err, row) {
          if(err !== null) {
            next(err);
          }
          else {
              // Acronym is new, use it here
              if(row.length == 0) {
                  pRes.send( query + ' is not defined. \n To define acronym: ```/acorn define NYT, The New York Times, http://www.nytimes.com ```');
            } else {
                var msg = 'Hey I\'m Acorn! :tree:  \n' + query.toUpperCase() + " is " + row[0].description;

                if(url !== '') {
                    msg = msg + "\n Check out this URL: " + row[0].url;
                }
                pRes.send(msg);
            }
        }
    });
    } // end acronym lookup

    });


    app.listen(process.env.PORT, function () {
      console.log('Acorn listening on ' + process.env.PORT);
    });

});


