var express = require('express');
var app = express();
var google = require('googleapis');
var bodyParser = require('body-parser');
var api = require('./sheetsApi');
var logger = console;

// Sheets Data
// https://docs.google.com/spreadsheets/d/1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc/edit
var spreadsheetId = '1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc';

    var verifySlack = function(token) {
      if(token == process.env.SLACK_VERIFY_TOKEN) {
        return true;
      } else {
        return false;
      }
    }

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // APP Setup
    app.get('/', function (req, res) {
      logger.info('running basic get');
      var getList = function(auth) {
      var sheets = google.sheets('v4');
      sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: 'Acronym Data!A2:D',
      }, function(err, response) {
        if (err) {
          logger.info('The API returned an error: ' + err);
          return;
        }
        var rows = response.values;
        if (rows.length == 0) {
          logger.info('No data found.');
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
        var line = "\n-------------------------------------------------------------------------------------------------\n";
        var hello = "Hello " + pReq.body.user_name + " I\'m Acorn. :tree: \n";
        var confused = "\n Confused? Type `/acorn help`";
        var lookupHelp = '\nTo look up an acronym type:' + '``` /acorn acronym ```\n';
        var defineHelp = '\n To define an acronym type:' +
            '```/acorn define MYACRONYM, The Definition of My Acronym, http://www.optionalSiteToExplainMore.com ```' +
            '\n Remember the `,` in between';
        var funFact = "\nFun Fact: You can add emojis to your definitions by typing them in slack format :simple_smile: \n";

        var query = pReq.body.text;
        var commandSplit = query.split(' ');
        var command = commandSplit[0].toUpperCase();
        var userName= pReq.body.user_name;
        logger.info("INITIAL QUERY", query);
        logger.info("COMMAND IS", command);
        if(!verifySlack(pReq.body.token)) {
            pRes.send('You Are Not a Valid User');
        } else if (command == 'DEFINE') {
          // Define an Acronym
          logger.info(query);
            var definition = query.split(',');
            logger.info(definition);
            if (definition.length < 2) {
                pRes.send('Your definition is malformed. :grimacing: Please Try again' + confused);
            } else {
                    var acronym = definition[0].split(' ')[1].toUpperCase(); // get rid of define
                    var description = definition[1].trim();
                    var url = '';
                    if(definition.length === 3) {
                        var url = definition[2].trim();
                    }
                    var numRows = 0;
                    logger.info('Acronym to define: ', acronym);
                    var insertAcronym = function(auth) {
                      logger.info('entering insert');
                      var google = require('googleapis');
                      var sheets = google.sheets('v4');
                      var range = 'Acronym Data!A' + numRows +':E' + numRows;
                      var id = numRows - 2;
                      var options = {

                      }
                      sheets.spreadsheets.values.update({
                        "auth": auth,
                        "spreadsheetId": spreadsheetId,
                        "valueInputOption": "RAW",
                        "range": range,
                        "resource": {
                          "range": range,
                          "majorDimension": "ROWS",
                          "values": [[id, acronym, description, url, userName]]
                        }
                      }, function(err, response) {
                        if (err) {
                          logger.info('The API returned an error: ' + err);
                          return;
                        }
                        logger.info('success!');
                        pRes.send( acronym + ' has been added to the dictionary. :information_desk_person:' + lookupHelp + line);
                      });
                    };
                    var duplicateSearch = function (auth) {
                      var google = require('googleapis');
                      var sheets = google.sheets('v4');
                      sheets.spreadsheets.values.get({
                        auth: auth,
                        spreadsheetId: spreadsheetId,
                        range: 'Acronym Data!A2:D',
                      }, function(err, response) {
                        if (err) {
                          logger.info('The API returned an error: ' + err);
                          return;
                        }
                        var acronymText = commandSplit[1].split(',')[0];
                        var rows = response.values;
                        logger.info('number of rows', rows.length);
                        numRows = rows.length + 2;
                        var found = false;
                        for (var i = 0; i < rows.length; i++) {
                          var row = rows[i];
                          if(row[1].toUpperCase() == acronymText.toUpperCase()) {
                            found = true;
                            break;
                          }
                        }
                        if (found) {
                          pRes.send('Acnonym Already Exists. :upside_down_face: \n You can search with ```/acorn ' + acronymText + ' ```' + confused + line);
                        } else {
                          api(insertAcronym);
                        }
                      });
                    };
                    api(duplicateSearch);
            }

        } else if(command == 'HELP' || command == 'ACORN') {
            var helpText = hello +
            'I am a simple acronym bot :robot_face:' +
            lookupHelp + defineHelp +
            '\n Please Note: & are not currently supported in acronyms or definitions' + funFact + line;
            pRes.send(helpText);

        } else if(command == 'SHOW-LIST') {
          pRes.send('Here is the full list of acronyms: \n https://docs.google.com/spreadsheets/d/1j07CCJR3Ff1KfFeNUmsAryM6Ra7z_Qp_SKMWaRpiYZc/edit?usp=sharing' + line);
        } else {
            logger.info('acronym lookup');
          var getAcronym = function(auth) {
          var sheets = google.sheets('v4');
          sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: 'Acronym Data!A2:D',
          }, function(err, response) {
            if (err) {
              logger.info('The API returned an error: ' + err);
              return;
            }
            var rows = response.values;
            if (rows.length == 0) {
              logger.info('No data found.');
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
                  var msg = hello + "\n------\n" + " :books: " + foundAc.toUpperCase() + " is " + foundDes;

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
      logger.info('Acorn listening on ' + process.env.PORT);

      var listAcronyms = function (auth) {
        var google = require('googleapis');
        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
          auth: auth,
          spreadsheetId: spreadsheetId,
          range: 'Acronym Data!A2:D',
        }, function(err, response) {
          if (err) {
            logger.info('The API returned an error: ' + err);
            return;
          }
          var rows = response.values;
          if (rows.length == 0) {
            logger.info('No data found!!!!');
          } else {
            logger.info('Call made successfully');
            //logger.info('Acronym, Definition, URL:');
            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              // Print all columns
              //logger.info('%s, %s, %s', row[0], row[1], row[2]);
            }
          }
        });
      };
      logger.info('about to call API');
      api(listAcronyms);
    }); // end of server setup
