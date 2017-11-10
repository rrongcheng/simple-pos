<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div>
    <!-- your content -->
    <div class="row">
      <div class="col-3">
        <!-- Order list -->
        <div id="unresolved_orders">
          <div class="menu">
            <div v-for="order in orders" :key="order.id">
              <q-btn v-on:click="curOrder = order">{{order.ticket}}</q-btn>
            </div>
            <div><q-btn v-on:click="newOrder">New</q-btn></div>
          </div>
          
        </div>
        <!-- Current order -->
        <div>
          <label>Order #</label>
          <span>{{curOrder.ticket}}</span>
        </div>
        <!-- Dish list -->
        <div id="dish_list" class="list">
          <div v-for="(p,index) in curOrder.productList" :key="p.id">
            <div class="row list-item">
              <div class="col-dyn">{{p.name}}</div>
              <div class="col-fix"><i class="fa fa-times-thin"></i> 1</div>
              <div class="col-fix">$ {{p.price.toFixed(2)}}</div>
              <div class="col-fix" v-on:click="removeProduct(index)"><q-btn><i class="fa fa-times"></i></q-btn></div>
            </div>
          </div>
        </div>
        <div>
          <div class="right">
            <div>
              <label>Total:</label>
              <span id="total_price">{{curOrderTotal.toFixed(2)}}</span>
            </div>
            <div id="global_discount">
              <label>Discount</label>
              <input id="discount_rate" type="number" min="0" max="100" step="5" v-model="curOrder.discount"/>
            </div>
            <div>
              <label>Payable:</label>
              <span id="payable_price">{{curOrderPayable.toFixed(2)}}</span>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-half display">
            <label>Paid:</label>
            <span id="paid">{{curOrder.paid.toString()}}</span>
          </div>
          <div class="col-dyn display outstanding">
            <label>Change:</label>
            <span id="change" v-bind:class="cssChange" class="msg" >{{curOrderChange.toFixed(2)}}</span>
          </div>
        </div>
        <!-- Keybord -->
        <div class="keybord">
          <div>
            <div class="cmd_pay row">
              <div title="Clear amount of paid."><q-btn v-on:click="paidClear">Clear</q-btn></div>
              <div title="Pay by EFT. Paid = payable"><q-btn v-on:click="paidEFT">EFT</q-btn></div>
              <div title="del last char of paid."><q-btn v-on:click="paidBack"><i class="fa fa-long-arrow-left"></i></q-btn></div>
              <div>
                  <q-btn v-on:click="printOrder">
                    <span v-if="!curOrder.printed">Save and Print</span>
                    <span v-else>Re-print</span>
                  </q-btn>
                </div>
            </div>
          </div>
          <div class="row">
            <div class="integral">
              <div v-for="num in [10,20,50,100]"><q-btn v-on:click="paidIntegral(num)">+{{num}}</q-btn></div>
            </div>
            <div class="num-pad">
              <div v-for="num in [7,8,9,4,5,6,1,2,3,0]"><q-btn v-on:click="paidInput(num)">{{num}}</q-btn></div>
              <div><q-btn v-on:click="paidInput('.')">.</q-btn></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="row inline">
          <div class="col" v-for="c in filtSecClass" :key="c.id">
            <q-btn v-on:click="curSecClass = c">{{c.name}}</q-btn>
          </div>
        </div>
        <q-list highlight>
          <q-item v-for="p in filtProduct" :key="p.id" v-on:click="addProduct(p)">
            <q-item-side avatar="/statics/boy-avatar.png" />
            <q-item-main label>{{p.name}}
              
            </q-item-main>
            <q-item-side right>$ {{p.price.toFixed(2)}}
              
            </q-item-side>
          </q-item>
        </q-list>
       
      </div>
      <div class="col-1">
        <div class="side-menu">
          <div v-for="c in topClass" :key="c.id" ><q-btn v-on:click="curTopClass = c">{{c.name}}</q-btn></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Order from '../model/Order.js'
import MyOrder from './Order'
import {
  Loading,
  QSpinnerGears,
  QBtn,
  QList,
  QListHeader,
  QItem,
  QItemSeparator,
  QItemSide,
  QItemMain,
  QItemTile,
  QChip,
  QPopover
} from 'quasar'

export default {
  components:{
    QSpinnerGears,
    QBtn,
    QList,
    QListHeader,
    QItem,
    QItemSeparator,
    QItemSide,
    QItemMain,
    QItemTile,
    QChip,
    QPopover,
    'my-order':MyOrder
  },  
  data () {
    return {
      curTopClass: null,
      curSecClass: null,
      topClass: [],
      secClass: [],
      products: [],
      ticketCounter: 1, 
      curOrder: null,
      orders:[]
    }
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
      if(this.curOrder.printed){
        alert("Error! The current order is not changeable as it's printed. Please create another one.");
        return;
      }
      this.curOrder.productList.push(product);
    },
    removeProduct : function(index){
      if(this.curOrder.printed){
        alert("Error! The current order is not changeable as it's printed. Please create another one.");
        return;
      }
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
      Loading.show({message: 'Loading '+ name});

      this.$http.get('//localhost:3000/api/'+name+'/')
      .then(response =>{
        Loading.hide();
        if (response.error){
          this.showError(response.data.error)
        }else{
          callback(response.data.data);
        }
      },err=>{
        Loading.hide();
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
}
</script>

<style>
</style>
