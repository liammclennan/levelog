var levelup = require('level');
var express = require('express');
var app = express();
var db = levelup('./log');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(allowCrossDomain);

app.get('/', function (req,res) {
    res.send('Hello');
    res.end();
});

app.post('/', function (req,res) {
    var data = Array.isArray(req.body) ? req.body : [req.body];
    var startIndex = new Date().getTime();
    var ops = data.map(function (item) {
        return {type: 'put', key: startIndex++, value: JSON.stringify(item)};
    });
    db.batch(ops, function (err) {
        if (err) {
            console.log('Oh my!', err);
            res.send(500, JSON.stringify(err));
            return;
        }
        res.sendStatus(200);
    });
});

app.get('/:from/:to', function(req, res) {
    var first=true;
    res.setHeader('Content-Type', 'application/json');
    res.write("[");
    db.createReadStream({gt:req.params.from,lt:req.params.to})
    .on('data', function (data) {
        if (!first) res.write(",");
        res.write(JSON.stringify({
            key: data.key,
            value: JSON.parse(data.value)
        }));
        first = false;
    })
    .on('error', function (err) {
        console.log('Oh my!', err)
    })
    .on('close', function () {
        res.write("]")
        res.end();
    })
    .on('end', function () {
    });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});

app.options("*", function (req, res) {
    res.header('Allow', 'OPTIONS,GET,PUT,POST,DELETE');
    res.send();
});

function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
