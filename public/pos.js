
function Order(newId,ticket){
  this.id = newId;
  this.ticket = ticket
  this.productList = [];
  this.discount=0;
  this.paid = 0;
  //Todo: Once the order is printed, it can NOT be updated.
  this.printed = false; 
}


var defaultOrder = new Order();

var vm = new Vue({
  el:'#pos',
  data: {
    curTopClass: null,
    curSecClass: null,
    topClass: [],
    secClass: [],
    products: [],
    ticketCounter: 1, 
    curOrder: null,
    orders:[]
  },
  computed:{
    cCurTopClass : function(){
      return this.curTopClass || this.topClass[0];
    },
    cCurSecClass : function(){
      if (this.curSecClass && this.cCurTopClass && this.curSecClass.topId == this.cCurTopClass.id) { 
        return this.curSecClass;
      }
      if (this.filtSecClass.length> 0){ return this.
        filtSecClass[0];}
      return null;
    },
    filtSecClass: function(){
      return !this.cCurTopClass? this.secClass : this.secClass.filter(function(sec){
        return sec.topId === this.cCurTopClass.id;
      },this);
    },
    filtProduct: function(){
      if (this.cCurSecClass){
        return this.products.filter(function(p){
          return (p.classId === this.cCurSecClass.id);
        },this);
      }else{
        return this.product;
      }
    },
    curOrderTotal: function(){
      return (!this.curOrder)?null: this.curOrder.productList.reduce(function(total,ele){
        return total + ele.price;
      },0);
    },
    curOrderPayable: function(){
      return this.curOrderTotal * (1-this.curOrder.discount/100);
    },
    curOrderChange: function(){
      return this.curOrder.paid - this.curOrderPayable;
    },
    cssChange: function(){
      if (this.curOrderChange < 0 ){ return 'msg-error';} 
      if (this.curOrderChange == 0 ){ return 'msg-good';} 
      if (this.curOrderChange > 0 ){ return 'msg-warning';} 
      return '';
    }
  },
  methods: {
    showError: function(msg){
      alert(msg);
    },
    addProduct: function(product){
      if (!this.curOrder){
        alert("No current order! Please create a new order by click New button on top right corner");
        return;
      }
      if(!this.curOrder.productList){
        alert("Error! Invaild Order type, no product list found for current order! ");
        return;
      }
      this.curOrder.productList.push(product);
    },
    removeProduct : function(index){
      if(this.curOrder.productList){
        this.curOrder.productList.splice(index,1);
      }
    },
    newOrder: function(){
      this.orders.push(new Order(this.getNowAsId(),this.getNextTicket()));
      this.curOrder = this.orders[this.orders.length - 1];
    },
    getNowAsId: function () {
      var now = new Date();
      return now.toISOString().replace(/[^0-9]/g, "")
    },
    getNextTicket: function(){
      if (this.ticketCounter > 99){
        this.ticketCounter = 1;
      }
      return this.ticketCounter++;
    },
    printOrder: function(){
      //todo save  print order, 
      this.$http.post('/api/printer_order/',{
        "id" : this.curOrder.newId,
        "ticket" : this.curOrder.ticket,
        "productList" : this.curOrder.productList,
        "subtotal" : this.curOrderTotal,
        "discount" : this.curOrder.discount,
        "total" : this.curOrderPayable,
        "paid" : this.curOrder.paid,
        "change" : this.curOrderChange
      })
      .then(response => {
        if(response.error){
          this.showError(response.error);
          return;
        }
        // if success
        //this.curOrder.printed = true;
      }, error=>{
        this.showError(error);
      })
      
    },
    paidClear: function(){
      this.curOrder.paid = "0";
    },
    paidEFT: function(){
      // manual EFT
      this.curOrder.paid = this.curOrderPayable;
    },
    paidIntegral: function(num){
      this.curOrder.paid = "" + (parseFloat(this.curOrder.paid) + num).toFixed(2);
    },
    paidInput: function(num){
      var strPaid = this.curOrder.paid.toString().replace(/^0+/,'');
      var pointIndex = strPaid.indexOf(".");
      if (pointIndex>=0){
        if (num == "."){
          // only one "." allowed
          return strPaid;
        }
        if( (strPaid.length - 1 - pointIndex)>=2 ){
          // only 2 digi after "." 
          return strPaid;
        }
      }
      this.curOrder.paid = "" + strPaid + num;
    },
    paidBack : function(){
      this.curOrder.paid = this.curOrder.paid.toString().slice(0,-1);
    },
    loadDate : function(name,callback){
      this.$http.get('/api/'+name+'/')
      .then(response =>{
        if (response.body.error){
          this.showError(response.body.error)
        }else{
          callback(response.body.data);
        }
      },err=>{
        this.showError(err)
      });
    },
  },
  created: function(){
    this.newOrder();
    this.loadDate('top-class', data=>this.topClass = data);
    this.loadDate('sec-class', data=>this.secClass = data);
    this.loadDate('product', data=>this.products = data);
  }
})
