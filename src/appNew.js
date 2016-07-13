var express = require('express');
var app = express();
var google = require('googleapis');
var bodyParser = require('body-parser');
var api = require('./sheetsApi');

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // APP Setup
    app.get('/', function (req, res) {
      console.log('running basic get');
      var getList = function(auth) {
      var sheets = google.sheets('v4');
      sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: '1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc',
        range: 'Acronym Data!A2:D',
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var rows = response.values;
        if (rows.length == 0) {
          console.log('No data found.');
        } else {
          var strToSend = '';
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            strToSend = strToSend + 'Acronym: ' + row[1] + '\n';
          }
          res.send(strToSend);
        }

      });
    };

    api(getList);
    });

    app.post('/', function(pReq, pRes) {

        // Some Text Definitions
        var hello = "Hello " + pReq.body.user_name + " I\'m Acorn. :tree: \n";
        var confused = "\n Confused? Type `/acorn help`";
        var lookupHelp = '\nTo look up an acronym type:' + '``` /acorn *acronym* ```\n';
        var defineHelp = '\n To define an acronym type:' +
            '```/acorn define *MYACRONYM*, The Definition of My Acronym, http://www.optionalSiteToExplainMore.com ```' +
            '\n Remember the `,` in between';

        // If first word is 'define', split by , and try to insert into DB
        // If first word is 'help' give list of help items
        var query = pReq.body.text;
        var commandSplit = query.split(' ');
        var command = commandSplit[0].toUpperCase();
        console.log("INITIAL QUERY", query);
        console.log("COMMAND IS", command);


        // DEFINE AN ACRONYM
        if (command == 'DEFINE') {
            var definition = query.split(',');
            if (definition.length < 2) {
                pRes.send('Your definition is malformed. Please Try again' + confused);
            } else {
                    var acronym = definition[0].split(' ')[1]; // get rid of define
                    var description = definition[1];
                    var url = '';
                    if(definition.length === 3) {
                        var url = definition[2];
                    }
                    console.log('Acronym to define: ', acronym);
                    var sqlSelect = "SELECT * FROM 'acronyms' WHERE acronym = '" + acronym.toUpperCase() + "'";

                     // db.all(sqlSelect, function(err, row) {
                     //   if(err !== null) {
                     //    pRes.send('Database Error');
                     //   }
                     //   else {
                     //       // Acronym is new, add it
                     //       if(row.length == 0) {
                     //        console.log('Addding new acronym', acronym);
                     //        console.log('Description is', description);
                     //        console.log('URL is', url);
                     //       sqlRequest = "INSERT INTO 'acronyms' (acronym, description, url) " +
                     //                    "VALUES('" + acronym.toUpperCase() + "', '" + description + "', '" + url + "')";
                     //       db.run(sqlRequest, function(err) {
                     //         if(err !== null) {
                     //          pRes.send('Database Error');
                     //         }
                     //         else {
                     //           console.log('success!');
                     //           pRes.send( acronym + ' has been added to the dictionary.' + lookupHelp);
                     //         }
                     //       }); // end acronym insert
                     //     } else {
                     //        var acronymText = commandSplit[1].split(',')[0];
                     //         pRes.send('Acnonym Already Exists. \n You can search with ```/acorn ' + acrnoymText + ' ```' + confused);
                     //     }
                     //   }
                     // }); // end duplicate check for acronym insert
            }

        } else if(command == 'HELP') {
            var helpText = hello +
            'I am a simple acronym bot' +
            lookupHelp + defineHelp;
            pRes.send(helpText);

        } else if(command == 'DELETE') {
            var acronym = commandSplit[1]; // get rid of define
            var sqlSelect = "DELETE FROM 'acronyms' WHERE acronym = '" + acronym.toUpperCase() + "'";
            console.log('SQL: ', sqlSelect);
          //   db.all(sqlSelect, function(err, row) {
          //     if(err !== null) {
          //       console.log(err);
          //       pRes.send('Database Error');
          //     }
          //     else {
          //       console.log(row);
          //       pRes.send(acronym + ' successfully Deleted');
          //     }
          // });

        } else {
            pRes.send('got to acronym lookup');
            console.log('acronym lookup');
        //   var getAcronym = function(auth) {
        //   var sheets = google.sheets('v4');
        //   sheets.spreadsheets.values.get({
        //     auth: auth,
        //     spreadsheetId: '1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc',
        //     range: 'Acronym Data!A2:D',
        //   }, function(err, response) {
        //     if (err) {
        //       console.log('The API returned an error: ' + err);
        //       return;
        //     }
        //     var rows = response.values;
        //     if (rows.length == 0) {
        //       console.log('No data found.');
        //     } else {
        //       var foundAc = '';
        //       var foundDes = '';
        //       var foundUrl = '';
        //       for (var i = 0; i < rows.length; i++) {
        //         var row = rows[i];
        //         if(row[1].toUpperCase() == query.toUpperCase()) {
        //           foundAc = row[1];
        //           foundDes = row[2];
        //           foundUrl = row[3];
        //           break;
        //         }
        //       }
        //       if(foundAc == '') {
        //         pRes.send( query.toUpperCase() + ' is not defined.' + defineHelp);
        //       } else {
        //           var msg = hello + foundAc.toUpperCase() + " is " + foundDes;

        //           if(foundUrl !== '' && foundUrl !== undefined) {
        //               msg = msg + "\n Check out this URL: " + foundUrl;
        //           }
        //           pRes.send(msg);
        //       }
        //     }

        //   });
        // };

        // api(getAcronym);
    } // end acronym lookup

    });


    app.listen(process.env.PORT, function () {
      console.log('Acorn listening on ' + process.env.PORT);

      /**
       * Print the names and majors of students in a sample spreadsheet:
       * https://docs.google.com/spreadsheets/d/1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc/edit
       */
      var listAcronyms = function (auth) {
        var google = require('googleapis');
        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
          auth: auth,
          spreadsheetId: '1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc',
          range: 'Acronym Data!A2:D',
        }, function(err, response) {
          if (err) {
            console.log('The API returned an error: ' + err);
            return;
          }
          var rows = response.values;
          if (rows.length == 0) {
            console.log('No data found.');
          } else {
            console.log('Acronym, Definition, URL:');
            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              // Print all columns
              console.log('%s, %s, %s', row[0], row[1], row[2]);
            }
          }
        });
      }
      console.log('about to call API');
      api(listAcronyms);
    }); // end of server setup
