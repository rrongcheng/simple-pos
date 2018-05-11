const escpos   = require('escpos');
var device,printer;
const LineWidth = 35;

module.exports = {
  ready: false,
  init (){
    console.log("initate the printer ...")
    return new Promise((resolve, reject)=>{
      try{
        device = new escpos.USB();
        printer = new escpos.Printer(device);
        this.ready = true;
        resolve();
      }catch(error){
        this.ready = false;
        reject(error);
      }
    })
  },
  printOrder(order,stage){
    let printing = new Promise((resolve,reject)=>{
      if (!order){
        return reject(Error("empty order should't be printed."));
      }
      if (!this.ready){
        return reject(Error("The printer is not ready yet."));
      }
      device.open(error=>{
        if (error){
          return regject(error);
        }
        resolve();
      });
    });

    return printing.then(()=>{
      if(stage == "kitchen"){
        return this.printOrderKitchen(order);
      };
      if (stage == "receipt"){
        return this.printOrderReceipt(order);
      };
      throw Error("No stage match ["+ stage +"].")
    }).then(()=>{
      // Receipt print twice
      if (stage == "receipt"){
        return this.printOrderReceipt(order);
      };
      throw Error("No stage match ["+ stage +"].")
    }).then(()=>{

      printer.close()
    }).catch(error=>{
      device.close();
      throw Error(error);
    });
    
  },
  printOrderReceipt(order){
    console.log(order);
    var now = new Date();
    var tmp = printer.font('a').align('ct').style('bu').size(1, 1)
    .text("David's Sushi Noodle")
    .text("ABN 21055176304")
    .text("Phone: (08) 9301 4556")
    .print(now.getDate() + "/" + (now.getMonth()+1)+ "/" + now.getFullYear() + " ")
    .print(now.getHours() + ":"  )
    .print(now.getMinutes() + ":"  )
    .println(now.getSeconds() )
    .text("Tax Invoice")
    .size(2,2).text("Ticket: " + order.ticket)
    .align("LT")
    .size(1,1).text("================================")
    .size(2,2);

    for(var i = 0; i < order.productList.length; i++){
      tmp = this.printOrderItem(tmp,order.productList[i]);
    }
    return tmp.text("================================")
    .align("RT").size(1,1).text("SubTotal  $ " + order.subtotal.toFixed(2))
    .text("Discount  $ " + order.discount.toFixed(2))
    .size(2,2).text("Total  $ " + order.payable.toFixed(2))
    .size(1,1).text("GST include $ " + order.gst.toFixed(2))
    .text("Paid  $ " + order.paid)
    .println()
    .text("Change  $ " + (order.change).toFixed(2))
    .println()
    .align('ct').size(1,1).text("Thanks you!")
    .println()
    .cut(true,4);
  },
  printOrderKitchen(order){
    var now = new Date();
    var tmp = printer.font('a').align('ct').style('bu').size(1, 1)
    .text("Kitchen")
    .print(now.getDate() + "/" + (now.getMonth()+1)+ "/" + now.getFullYear() + " ")
    .print(now.getHours() + ":"  )
    .print(now.getMinutes() + ":"  )
    .println(now.getSeconds() )
    .text("This is NOT a Tax Invoice")
    .align("LT")
    .text("================================")
    .size(2,2);

    for(var i = 0; i < order.productList.length; i++){
      tmp = tmp.text((i+1)+". " + order.productList[i].name.substr(0,LineWidth));
    }
    return tmp.size(1,1).text("================================")
    .cut(true,4);
  },
  printOrderItem(printer,item){
    var numWidth = 4;
    var priceWidth = 8;
    var nameWidth = LineWidth - numWidth - priceWidth - 4;
    return printer.align("LT")
    .text((item.name + "               ").substr(0,nameWidth) + ' X 1  $' + ("      " + item.price.toFixed(2).toString()).slice(2-priceWidth));
  }
}