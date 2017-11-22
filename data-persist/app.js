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
app.get('/api/order/:id',function(req,res){
  //console.log('id is '+ req.params.id),
  //console.log('?id is '+ req.query.id),
  let requestOrderId = req.params.id;
  
  dbOrder.find().make(function(builder) {
    builder.where('id', requestOrderId);
    builder.callback(function(err, response) {
      if (err){
        return res.json({"error":err,"data":{}});
      }
      // New order not exists
      if (response.length === 0){ 
        return res.json({"error": "No order found with id = " + requestOrderId,"data":{}});
      }

      // Found 1 record
      if (response.length === 1  ){
        // Still editable
        return res.json({"error": "No order found with id = " + requestOrderId,"data":response[0]});
      }

      return res.json({"error": "More than One order found with id = " + requestOrderId,"data":{}});
    });
  });
})

/**
 * Once Order is not , it should not be updated.
 * If order is not exists, insert
 * if exists, return existing message.
 */
app.post('/api/order/', function(req,res){
  dbOrder.find().make(function(builder) {
    builder.where('id', req.body.id);
    builder.callback(function(err, response) {
      if (err){
        return res.json({"error":err,"data":{}});
      }
      // New order not exists
      if (response.length === 0){ 
        dbOrder.insert(req.body).callback(function(err) {
          if (err){
            return res.json({"error":err,"data":{}});
          }
          return res.json({"error":null,"data":{}});
        });
      }

      // Found 1 record
      if (response.length === 1  ){
        // Still editable
        if (response[0].editable){
          dbOrder
          .update(req.body)
          .where('id',req.body.id)
          .callback(function(err,count){
            if (err){
              return res.json({"error":err,"data":{}});
            }
            if (count == 0){
              return res.json({"error": "Order is not saved.","data":{}});
            }
            if (count == 1){
              // order saved.
              return res.json({"error":null,"data":count});
            }else{
              // unexpect result
              return res.json({"error":"unexpect result","data":{}});
            }
          });
        }else{
          console.log("This order is not editable anymore.")
          return res.json({"error":"This order is not editable anymore.","data":{}});
        }
      }
    });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});