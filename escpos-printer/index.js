const express = require('express');
const bodyParser = require('body-parser');
const axios  = require('axios');
const escpos   = require('escpos');
const printer = require("./printer.js");

var router = express.Router();


router.get('/', function(req,res){
  res.send('Escpos printer');
});
router.get('/printer/',function(req,res){
  try {
    const device  = new escpos.USB();
    res.json(device);
    return;
  } catch (error) {
    res.send('no usb printer found');
  }
  res.send('end');
});

router.post('/printer_order/',function(req,res){
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
  axios.get('http://localhost:3000/api/data/order/'+ order.id)
  .then(response=>{
    // printing {id:xx, templet:xx}
    return printer.printOrder(response.data,order.templet);
  }).then(()=>{
    res.status(200).send('Order printed.');
  }).catch(err=>{
    res.status(500).send(err.toString());
    //res.json({"error":err, "data":{}});
  });
});

printer.init().then(()=>{
  console.log("printer is ready.")
}).catch(error=>{
  console.log("Failed to initate printer with following error:")
  console.log(error.toString());
});


module.exports = router;