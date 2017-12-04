const express = require('express');
const bodyParser = require('body-parser');
const axios  = require('axios');
const escpos   = require('escpos');

const app = express();

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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req,res){
  res.send('Escpos printer');
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
    return res.status(422).send("No order data received.");
  }
  if (!order.id){
    return res.status(422).send("No order id received.");
  };
  if (!order.templet){
    return res.status(422).send("No print templet received.");
  };
  axios.get('http://localhost:3000/api/order/'+ order.id)
  .then(response=>{
    // printing {id:xx, templet:xx}
    printOrder(order);

    res.status(200).send('Order printed.');
  }).catch(err=>{
    res.status(err.response.status).json(err.response.data);
    //res.json({"error":err, "data":{}});
  });
});

app.listen(4000, function () {
  console.log('Example app listening on port 3000!')
});