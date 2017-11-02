export default function Order(newId,ticket){
    this.id = newId;
    this.ticket = ticket
    this.productList = [];
    this.discount=0;
    this.paid = 0;
    //Todo: Once the order is printed, it can NOT be updated.
    this.printed = false; 
  }