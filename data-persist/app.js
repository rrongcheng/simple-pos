const express = require('express');
const bodyParser = require('body-parser');
const NoSQL = require('nosql');



const app = express();
const dbTopClass = NoSQL.load('./database/top-class.nosql');
const dbSecClass = NoSQL.load('./database/sec-class.nosql');
const dbProduct = NoSQL.load('./database/product.nosql');
const dbOrder = NoSQL.load('./database/order.nosql');


app.use(bodyParser.json());
app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req,res){
  res.send('Hello World');
});

app.get('/api/top-class/',function(req,res){
  dbTopClass.find().make(function(filter) {
    filter.sort('order',false);
    filter.callback(function(err, response) {
      res.json({"error":err,"data":response});
    });
  });
});
app.get('/api/sec-class/',function(req,res){
  dbSecClass.find().make(function(filter) {
    filter.sort('order',false);
    filter.callback(function(err, response) {
      res.json({"error":err,"data":response});
    });
  });
});
app.get('/api/product/',function(req,res){
  dbProduct.find().make(function(filter) {
    filter.sort('name',false);
    filter.callback(function(err, response) {
      res.json({"error":err,"data":response});
    });
  });
});

/**
 * Once Order is created, it should not be updated.
 * If order is not exists, insert
 * if exists, return existing message.
 */
app.post('/api/order/', function(req,res){
  console.log(req.body);
  res.json({"error":null,"data":{}})
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});