const express = require('express');
const bodyParser = require('body-parser');
const axios  = require('axios');

const app = express();


app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', function(req,res){
  res.send('Visual printer');
});

app.post('/api/printer_order/',function(req,res){
  var order = req.body;
  if (!order){
    res.json({error:'no order data received.'});
    return;
  }
  console.log(order);

  axios.get('//localhost:3000/api/order/'+ order.id)
  .then(response=>{
    console.log("response");
    res.json({});
  }).catch(err=>{
    console.log(err.toString());
    //res.send('error');
    res.json({"error": err.toString()});
    //res.json({"error":err, "data":{}});
  });
});


app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
});