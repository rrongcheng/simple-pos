const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const port = process.env.PORT || 3000;

const dataPersist = require('../data-persist');
const escposPrinter = require('../escpos-printer');

app.use(bodyParser.json());
app.use('/', express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.get('/', function(req,res){
//   res.send('Hello World');
// });

app.use('/api/data', dataPersist);
app.use('/api/escpos-printer', escposPrinter);

app.listen(port, function () {
  console.log('Pos app listening on port '+port)
});