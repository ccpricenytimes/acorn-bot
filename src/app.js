var express = require('express');
var app = express();

app.get('/', function (req, res) {
    console.log(req.query.text);
  res.send('Hello World!');
});

app.post('/', function(pReq, pRes){
    var text = pReq.data;
    console.log(text);
    pRes.send('Post Successful');
});

app.listen(1337, function () {
  console.log('Acorn listening on port 1337');
});