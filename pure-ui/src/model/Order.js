const OrderStatus = {
  open: 'open',
  finish: 'finish',
  cancel: 'cancel',
}

export default {
  status: OrderStatus,
  getEditableOrder(httpAgentPromise){
    return httpAgentPromise.get('/api/data/order?editable=true')
    .then(response=>{
      return response.data;
    });
  },
  getNewOrder (httpAgentPromise,newId){
    // save order, 
    /**
     * return a Promise
     * create a new order, try to save it, if the new id is exists, throw error
     */

    return this.saveOrder(httpAgentPromise,this.getEmptyOrder(newId))
  },
  saveOrder (httpAgentPromise, order){
    // save order, return a Promise
    return httpAgentPromise.post('/api/data/order/',this.formateOrder(order))
    .then(response =>{
      if (response.data.error){
        throw Error(response.data.error);
      }
      return response.data;
    })
  },
  getEmptyOrder (id){
    return {
      id: id || 0,
      ticket: 0,
      "date"        : this.getOrderDate(),
      productList: [],
      discount: 0,
      paid: 0,
      editable: true,
      status: OrderStatus.open
    };
  },
  formateOrder (order){
    // to return a formated/vaild order object
    // todo: need add some validation for order, such as check if, verfiy payable change etc.
    //       currently, it just return what it get
    let formatedOrder = {
      "id"          : order.id,
      "ticket"      : order.ticket,
      "editable"    : order.editable,
      "discount"    : order.discount,
      "paid"        : order.paid,
      "status"      : order.status,
      "payable"       : order.payable,
      "change"        : order.change,
      "productList" : order.productList,
    }
    formatedOrder.date = this.getOrderDate();
    formatedOrder.subtotal = this.getSubTotal(formatedOrder);
    formatedOrder.gst = this.getGST(formatedOrder.payable);
    formatedOrder.totalDiscount = this.getdiscount(formatedOrder.subtotal,formatedOrder.discount);
    formatedOrder.payable = this.getPayable(formatedOrder.subtotal,formatedOrder.totalDiscount);
    formatedOrder.change = this.getChange(formatedOrder.subtotal,formatedOrder.paid);

    return formatedOrder;
  },
  getOrderDate (){
    // Note: a duplicate logic in /data-persist/app.js
    let today = new Date();
    return today.toLocaleDateString();
  },
  getSubTotal(order){
    return (!order.productList)?0: order.productList.reduce(function(total,ele){
      return total + ele.price;
    },0);
  },
  getPayable(subtotal, totalDiscount){
    return subtotal - totalDiscount;
  },
  getChange(curOrderPayable, paid){
    return paid-curOrderPayable
  },
  getdiscount(subtotal,discountRate){
    return this.roundNumber(subtotal * discountRate/100);
  },
  getGST(payable){
    return this.roundNumber(payable/1.1*0.1);
  },
  roundNumber(value){
    return Math.round(value*100)/100;
  }
}