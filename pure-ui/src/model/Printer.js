export default  {
  PrintStage: {
    kitchen: "kitchen",
    receipt: "receipt"
  },
  printerOrder(http,orderId,printStage){
    console.log('test printer.js')
    console.log('http is ');
    console.log(http)
    return http.post('//localhost:4000/api/printer_order/',{id:orderId, templet:printStage})
    .then(response => {
      if(response.data.error){
      throw Error(response.error);
      }
      // if success
      return response.data;
    })
  },
  test(){
    console.log('test printer.js')
  }
};