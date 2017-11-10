const express = require('express');
const bodyParser = require('body-parser');
const escpos   = require('escpos');
const NoSQL = require('nosql');



const app = express();
const dbTopClass = NoSQL.load('./database/top-class.nosql');
const dbSecClass = NoSQL.load('./database/sec-class.nosql');
const dbProduct = NoSQL.load('./database/product.nosql');
const dbOrder = NoSQL.load('./database/order.nosql');

function printOrder(order){
  if (!order){
    console.log("empty order should't be printed.");
    return {"error":"empty order should't be printed."}
  }
  var device;
  try {
    device  = new escpos.USB();
  } catch (error) {
    console.log(error);
    return {"error":error}
  }
  
  var now = new Date();

  if (!device){
    console.log('No printer found.')
  }else{
    const printer = new escpos.Printer(device);

    device.open(function(){
      var tmp = printer.font('a').align('ct').style('bu').size(1, 1)
      .text("David's Sushi Noodle")
      .text("ABN ")
      .text("Phone: (08) 9301 4556")
      .print(now.getDate() + "/" + (now.getMonth()+1)+ "/" + now.getFullYear() + " ")
      .print(now.getHours() + ":"  )
      .print(now.getMinutes() + ":"  )
      .println(now.getSeconds() )
      .text("Tax Invoice")
      .align("LT")
      .text("================================");

      for(var i = 0; i < order.productList.length; i++){
        tmp = printOrderItem(tmp,order.productList[i]);
      }
      tmp.text("================================")
      .align("RT").text("SubTotal  $ " + order.subtotal.toFixed(2))
      .text("Discount  $ " + order.discount.toFixed(2))
      .size(2,2).text("Total  $ " + order.total.toFixed(2))
      .size(1,1).text("GST include $ " + (order.total/1.1*0.1).toFixed(2))
      .text("Paid  $ " + order.paid)
      .println()
      .size(2,2).text("Change  $ " + (order.change).toFixed(2))
      .println()
      .align('ct').size(1,1).text("Thanks you!")
      .println()
      .cut(true,4)
      .close();

      return {"error":null}
    });
  }
}
function printOrderItem(printer,item){
  var lineWidth = 35;
  var numWidth = 4;
  var priceWidth = 8;
  var nameWidth = lineWidth - numWidth - priceWidth - 4;
  return printer.align("LT")
  .text((item.name + "               ").substr(0,nameWidth) + ' X 1  $' + ("      " + item.price.toFixed(2).toString()).slice(2-priceWidth));
}

app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', function(req,res){
  res.send('Hello World');
});
app.get('/api/printer/',function(req,res){
  try {
    const device  = new escpos.USB();
    res.json(device);
    return;
  } catch (error) {
    res.send('no usb printer found');
  }
  res.send('end');
});
app.post('/api/printer_order/',function(req,res){
  var order = req.body;
  if (!order){
    res.json({error:'no order data received.'});
    return;
  }
  dbOrder.find().make(function(builder){
    builder.where('id', order.id);
    builder.callback(function(err,response){
      if(err){
        res.json({error:err});
        return;
      }
      console.log(response)
      if (response.length == 0){
        // For order not saved, save it and then print
        order.printed = true;
        dbOrder.insert(order).callback(function(err){
          if(err){
            console.log(err);
            res.json({error:"err to insert order"});
            return;
          }
          printOrder(order);
        });
      }else{
        // For order exists, print order
        printOrder(order);
      }
      res.json(order);
    });
  });
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


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});