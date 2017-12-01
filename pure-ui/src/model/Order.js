const OrderStatus = {
  open: 'open',
  finish: 'finish',
  cancel: 'cancel',
}

export default {
  status: OrderStatus,
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
    return httpAgentPromise.post('//localhost:3000/api/order/',this.formateOrder(order))
    .then(response =>{
      if (response.data.error){
        throw Error(response.data.error);
      }
      return response.data;
    })
  },
  formateOrder (order){
    // to return a formated/vaild order object
    // todo: need add some validation for order, such as check if, verfiy payable change etc.
    //       currently, it just return what it get
    return {
      "id"          : order.id,
      "ticket"      : order.ticket,
      "date"        : this.getOrderDate(),
      "editable"    : order.editable,
      "discount"    : order.discount,
      "paid"        : order.paid,
      "status"      : order.status,
      "subtotal"      : order.subtotal,
      "totalDiscount" : order.totalDiscount,
      "payable"       : order.payable,
      "change"        : order.change,
      "productList" : order.productList,
    }
  },
  getOrderDate (){
    // Note: a duplicate logic in /data-persist/app.js
    let today = new Date();
    return today.toLocaleDateString();
  }
}