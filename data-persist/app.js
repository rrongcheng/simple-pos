const express = require('express');
const bodyParser = require('body-parser');
const NoSQL = require('nosql');


const app = express();
const dbTopClass = NoSQL.load('./database/top-class.nosql');
const dbSecClass = NoSQL.load('./database/sec-class.nosql');
const dbProduct = NoSQL.load('./database/product.nosql');
const dbOrder = NoSQL.load('./database/order.nosql');

var ticketCount = undefined;
(function(){
  let today = new Date();
  today = today.toLocaleDateString(); // this should us /model/Order.js => order.getOrderDate(). temply depulicate logic now.

  dbOrder.find().make(function(builder){
    builder.first();
    builder.where("date",today);
    builder.sort("ticket",true);
    builder.callback(function(err,response){
      if (err){
        throw Error(err);
      }
      if (response){
        ticketCount = parseInt(response.ticket);
      }else{
        //no ticket count found for today
        ticketCount = 0;
      }
      console.log("Today ("+ today +") ticket count start at "+ ticketCount);
    })
  })
})();

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
app.get('/api/order',function(req,res){
  // get order list
  //console.log('?id is '+ req.query.id),
  dbOrder.find().make(function(filter){
    if (req.query.editable){
      console.log('?editable is '+ req.query.editable),
      filter.where("editable",(req.query.editable == "false")?false:true)
    }
    filter.callback(function(err,response){
      if (err){
        return res.status(500).send('Failed while retrieve data from database: ' + err.toString())
      }
      return res.json(response);
    });
  })
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
        return res.status(404).send("No order found with id = " + requestOrderId);
      }

      // Found 1 record
      if (response.length === 1  ){
        // Still editable
        return res.json({"error": null,"data":response[0]});
      }

      return res.json({"error": "More than One order found with id = " + requestOrderId,"data":{}});
    });
  });
});


/**
 * Save/Create/Update order
 * If order is not exists, insert
 * if exists, update if it's editable, throw error if not.
 * 
 * Validation => /model/Order.js will handle validation such as 
 *  if status = open, then editable = true
 *  The /model/order.js is currently in pure-ui package, but it should be in separate package, and be include by others
 */
app.post('/api/order/', function(req,res){
  let order = req.body;
  //get ticket 
  if (order.ticket == undefined || order.ticket == 0){
    if (ticketCount == undefined){
      return res.status(500).send('Server not get ready. no ticketCount not loaded.');
    }
    order.ticket = ++ticketCount;
  }
  // start save
  dbOrder.insert(order,true).where("id",order.id)
  .callback(function(err,rows) {
    if (err){
      return res.status(500).send('Database error while retrieve order by id ('+ order.id +') ' + err.toString())
    }
    if(rows == 1){
      // new order saved, return the order
      return res.status(200).json(order);
    }
    if (rows == 0){
      // The order is exists. Try to update it
      return dbOrder
      .update(order)
      .where('id',order.id)
      .where("editable",true)
      .callback(function(err,count){
        if (err){
          return res.status(500).send('Database error while update order by id ('+ order.id +') ' + err.toString())
        }
        if (count == 0){
          return res.status(406).send('Order('+ order.id +') is not editable.')
        }
        if (count == 1){
          // order saved.
          return res.status(200).json(order);
        }else{
          // unexpect result
          return res.status(500).send("unexpected rows ("+ count +") affect while update order (id: "+  order.id +").");
        }
      });
    }
    return res.status(500).json("unexpected rows, the insert affect "+ rows +" rows.");
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});