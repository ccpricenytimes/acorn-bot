var express = require('express');
var app = express();
var google = require('googleapis');
var bodyParser = require('body-parser');
var api = require('./sheetsApi');
var globalLogs = '';

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // APP Setup
    app.get('/', function (req, res) {
      console.log('running basic get');
      var errorCallback = function(str) {
        res.send('BROKEN: ' + str);
      };
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

    api(getList, errorCallback);
    });

    app.post('/', function(pReq, pRes) {

        // Some Text Definitions
        var line = "\n-------------------------------------------------------------------------------------------------\n";
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
        var userName= pReq.body.user_name;
        var command = commandSplit[0].toUpperCase();
        console.log("INITIAL QUERY", query);
        console.log("COMMAND IS", command);


        // DEFINE AN ACRONYM
        if (command == 'DEFINE') {
          console.log(query);
            var definition = query.split(',');
            console.log(definition);
            if (definition.length < 2) {
                pRes.send('Your definition is malformed. :grimacing: Please Try again' + confused);
            } else {
                    var acronym = definition[0].split(' ')[1]; // get rid of define
                    var description = definition[1];
                    var url = '';
                    if(definition.length === 3) {
                        var url = definition[2];
                    }
                    var numRows = 0;
                    console.log('Acronym to define: ', acronym);
                    var insertCallback = function(auth) {
                      console.log('entering insert');
                      var google = require('googleapis');
                      var sheets = google.sheets('v4');
                      var range = 'Acronym Data!A' + numRows +':E' + numRows;
                      var id = numRows - 2;
                      var options = {

                      }
                      sheets.spreadsheets.values.update({
                        "auth": auth,
                        "spreadsheetId": '1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc',
                        "valueInputOption": "RAW",
                        "range": range,
                        "resource": {
                          "range": range,
                          "majorDimension": "ROWS",
                          "values": [[id, acronym, description, url, userName]]
                        }
                      }, function(err, response) {
                        if (err) {
                          console.log('The API returned an error: ' + err);
                          return;
                        }
                        console.log('success!');
                        pRes.send( acronym + ' has been added to the dictionary. :information_desk_person:' + lookupHelp + line);
                      });
                    };
                    var insertAcronym = function (auth) {
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
                        var acronymText = commandSplit[1].split(',')[0];
                        var rows = response.values;
                        console.log('number of rows', rows.length);
                        numRows = rows.length + 2;
                        var found = false;
                        for (var i = 0; i < rows.length; i++) {
                          var row = rows[i];
                          console.log(row[1], acronymText);
                          if(row[1].toUpperCase() == acronymText.toUpperCase()) {
                            found = true;
                            break;
                          }
                        }
                        if (found) {
                          pRes.send('Acnonym Already Exists. :upside_down_face: \n You can search with ```/acorn ' + acronymText + ' ```' + confused + line);
                        } else {
                          api(insertCallback);
                        }
                      });
                    };
                    api(insertAcronym);
            }

        } else if(command == 'HELP') {
            var helpText = hello +
            'I am a simple acronym bot :robot_face:' +
            lookupHelp + defineHelp +
            '\n Please Note: & are not currently supported in acronyms or definitions' + line;
            pRes.send(helpText);

        } else {
            console.log('acronym lookup');
          var getAcronym = function(auth) {
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
              var foundAc = '';
              var foundDes = '';
              var foundUrl = '';
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if(row[1].toUpperCase() == query.toUpperCase()) {
                  foundAc = row[1];
                  foundDes = row[2];
                  foundUrl = row[3];
                  break;
                }
              }
              if(foundAc == '') {
                pRes.send( query.toUpperCase() + ' is not defined. :unicorn_face:' + defineHelp + line);
              } else {
                  var msg = hello + "\n------\n" + foundAc.toUpperCase() + " is " + foundDes + " :books:";

                  if(foundUrl !== '' && foundUrl !== undefined) {
                      msg = msg + "\n Check out this URL: " + foundUrl;
                  }
                  msg = msg + line;
                  pRes.send(msg);
              }
            }

          });
        };

        api(getAcronym);
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
      };
      console.log('about to call API');
      api(listAcronyms);
    }); // end of server setup
