<template>
  <!-- Configure "view" prop for QLayout -->
  <q-layout ref="layout" view="LHr LpR Fff" :right-breakpoint="0" :left-breakpoint="500">
    <q-toolbar slot="header">
      <q-btn flat @click="$refs.layout.toggleLeft()">
        <q-icon name="menu" />
      </q-btn>
      <q-toolbar-title>
        Current Order: ID ({{curOrder.id}}) 
      </q-toolbar-title>
    </q-toolbar>

    <!-- Navigation Tabs -->
    <q-tabs slot="navigation">
      <q-tab slot="title" 
        v-for="c in filtSecClass" :key="c.id"
        :label="c.name" 
        @click="curSecClass = c" 
      />
    </q-tabs>


    <!-- Left Side Panel-->
    <div slot="left">
      <div >
        <!-- Order list -->
        <q-btn v-on:click="newOrder" color="deep-orange" glossy   class="full-width" >New</q-btn>
        <div id="unresolved_orders">
          <div class="row">
            <div v-for="(order,index) in orders" :key="order.id">
              <q-btn v-on:click="curOrderIndex = index">{{order.ticket}}</q-btn>
            </div>
          </div>
        </div>
        <!-- Current order -->
        <div style="padding:10px;">
          <p class="caption">Current order: # {{curOrder.ticket}} 
                <q-btn v-show="!curOrder.editable" v-on:click="closeCurOrder()" class="full-width"  title="Set Discount" icon="exit_to_app" color="negative">Close without Printing</q-btn>
          </p>
          <!-- Dish list -->
          <q-scroll-area style="width: 100%; height: 370px; max-height: 30vh;" class="bg-grey-3 round-borders shadow-2">
            <table class="q-table horizontal-separator striped compact full-width" >
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-right">Qty.</th>
                  <th class="text-right">Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p,index) in curOrder.productList" :key="p.id">
                  <td data-th="Name" class="text-left">{{p.name}}</td>
                  <td data-th="Price" class="text-right">1</td>
                  <td data-th="In Stock" class="text-right">{{p.price.toFixed(2)}}</td>
                  <td>
                    <q-btn v-show="curOrder.editable" round flat small v-on:click="removeProduct(index)" icon="clear" ></q-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </q-scroll-area>
          <div class="xs-gutter" style="padding-top:10px;" >
            <div class="row xs-gutter">
              
              <div class="col-12 text-right">
                <div>
                  <label>Total:</label>
                  <span id="total_price">{{curOrderTotal.toFixed(2)}}</span>
                </div>
                <div id="global_discount" class=" row justify-between">
                  <label>Discount ({{curOrder.discount}}%):</label>
                  {{curOrderDiscount.toFixed(2)}}
                </div>
                <div>
                  <label>Payable:</label>
                  <span id="payable_price">{{curOrderPayable.toFixed(2)}}</span>
                </div>
                GST=[{{curOrderGST}}]
              </div>
            </div>
            <div class="row">
              <div class="col-6 bg-info" >
                <label>Paid:</label>
                <span id="paid">{{curOrder.paid.toString()}}</span>
              </div>
              <div class="col-6 bg-warning">
                <label>Change:</label>
                <span id="change" v-bind:class="cssChange" class="msg" >{{curOrderChange.toFixed(2)}}</span>
              </div>
            </div>
            <div class="row xs-gutter">
              <div class="col-12">
                <q-btn v-on:click="printOrder(PrintStage.kitchen)" class="full-width" icon="print">Kitchen Bill</q-btn>
              </div>
              <div class="col-12" v-show="curOrder.editable">
                <q-btn v-on:click="setDiscount" class="full-width"  title="Set Discount">Discount</q-btn>
              </div>
              <div class="col-6" v-show="curOrder.editable">
                <q-btn @click="$refs.keyboardModal.open()" class="full-width">Cash</q-btn>
              </div>
              <div class="col-6" v-show="curOrder.editable">
                <q-btn v-on:click="paidEFT" class="full-width"  title="Pay by EFT. Paid = payable">EFT</q-btn>
              </div>
              <div class="col-12" v-show="curOrderVaild">
                <q-btn v-on:click="printReceiptAndClose()" class="full-width"  title="Set Discount" icon="print">Print Receipt & Close</q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-modal ref="keyboardModal" :content-css="{padding: '20px'}">
      <div class="xs-gutter">
        <div class="row" >
          <div class="col-6 bg-info" style="padding:10px;">
            <label>Paid:</label>
            <span id="paid">{{curOrder.paid.toString()}}</span>
          </div>
          <div class="col-6">
            <div class="row justify-end">
              <q-btn @click="$refs.keyboardModal.close()" outline color="primary">Done</q-btn>
            </div>
          </div>
        </div>
        <!-- Keybord -->
        <div class="row xs-gutter">
          <div class="col-3">
            <div v-for="num in [10,20,50,100]" :key="num"><q-btn class="full-width" v-on:click="paidIntegral(num)" color="green">+{{num}}</q-btn></div>
          </div>
          <div class="col-6">
            <div class="row">
              <div class="col-4" v-for="num in [7,8,9,4,5,6,1,2,3,0]" :key="num"><q-btn class="full-width" v-on:click="paidInput(num)">{{num}}</q-btn></div>
              <div class="col-8"><q-btn class="full-width" v-on:click="paidInput('.')">.</q-btn></div>
            </div>
          </div>
          <div class="col-3">
            <div class="row">
              <q-btn icon="keyboard_backspace" class="full-width" v-on:click="paidBack" title="del last char of paid."></q-btn>
              <q-btn v-on:click="paidClear" class="full-width"  title="Clear amount of paid.">Clear</q-btn>
            </div>
          </div>
        </div>
        <!-- End of Keybord -->
      </div>
    </q-modal>
    

    <!-- Right Side Panel-->
    <div slot="right">
      <q-list link separator>
        <q-list-header><q-icon name="keyboard_arrow_down" size="2rem" color="primary" /></q-list-header>
        <q-item 
          v-for="c in topClass" :key="c.id" 
          v-on:click="curTopClass = c"
          label
        >
          {{c.name}}
        </q-item>
      </q-list>
    </div>
    
    <!-- Content -->
    <div v-show="curOrder.editable">
      <q-list link highlight separator>
        <q-item v-for="p in filtProduct" :key="p.id" v-on:click="addProduct(p)">
          <q-item-side  />
          <q-item-main label>{{p.name}}</q-item-main>
          <q-item-side right>$ {{p.price.toFixed(2)}}</q-item-side>
        </q-item>
      </q-list>
    </div>
    <div v-show="!curOrder.editable" class="row items-end justify-center " style="height:50vh">
      <div class="column "><h1>Order is not editale</h1></div>
    </div>

    <!-- Footer
    <q-toolbar slot="footer">
      ...
    </q-toolbar>
    -->
  </q-layout>
</template>

<script>
import Order from '../model/Order.js'
import Printer from '../model/Printer.js'

import {
  date,
  Alert,
  Dialog,
  Toast,
  QLayout,
  QModal,
  QScrollArea,
  QIcon,
  QToolbar,
  QToolbarTitle,
  QSideLink,
  Loading,
  QSpinnerGears,
  QTab,
  QTabs,
  QTabPane,
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

const {formatDate} = date;

export default {
  components:{
    QLayout,
    QModal,
    QScrollArea,
    QIcon,
    QToolbar,
    QToolbarTitle,
    QSideLink,
    QSpinnerGears,
    QTab,
    QTabs,
    QTabPane,
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
  },  
  data () {
    return {
      curTopClass: null,
      curSecClass: null,
      topClass: [],
      secClass: [],
      products: [],
      ticketCounter: 1, 
      curOrderIndex: null,
      orders:[],
      PrintStage: Printer.PrintStage
    }
  },
  computed:{
    curOrder: function(){
      return this.orders[this.curOrderIndex] || Order.getEmptyOrder();
    },
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
      return (!this.curOrder)?null: Order.getSubTotal(this.curOrder);
    },
    curOrderPayable: function(){
      return Order.getPayable(this.curOrderTotal, this.curOrderDiscount);
    },
    curOrderChange: function(){
      return Order.getChange(this.curOrderPayable, this.curOrder.paid);
    },
    curOrderDiscount: function(){
      return Order.getdiscount(this.curOrderTotal, this.curOrder.discount);
    },
    curOrderGST: function(){
      return Order.getGST(this.curOrderPayable);
    },
    curOrderVaild: function(){
      if (this.curOrderPayable <= 0){
        return false;
      }
      if(this.curOrderChange < 0){
        return false;
      }
      return true;
    },
    cssChange: function(){
      if (this.curOrderChange < 0 ){ return 'msg-error';} 
      if (this.curOrderChange == 0 ){ return 'msg-good';} 
      if (this.curOrderChange > 0 ){ return 'msg-warning';} 
      return '';
    }
  },
  methods: {
    showError: function(msg,title){
      Dialog.create({
        title: title || "Error",
        message:msg
      });
    },
    showMsg: function(msg,title){
      Dialog.create({
        title: title,
        message:msg
      });
    },
    addProduct: function(product){
      if (!this.curOrder){
        Toast.create({
          html: 'Message to display',
          bgcolor: 'negative'
        });
        alert("No current order! Please create a new order by click New button on top right corner");
        return;
      }
      if(!this.curOrder.productList){
        alert("Error! Invaild Order type, no product list found for current order! ");
        return;
      }
      if(!this.curOrder.editable){
        alert("Error! The current order is not changeable as it's saved. Please create another one.");
        return;
      }
      this.curOrder.productList.push(product);
    },
    removeProduct : function(index){
      if(!this.curOrder.editable){
        alert("Error! The current order is not changeable as it's saved. Please create another one.");
        return;
      }
      if(this.curOrder.productList){
        this.curOrder.productList.splice(index,1);
      }
    },
    newOrder: function(){
      Order.getNewOrder(this.$http,this.getNowAsId())
      .then(newOrder=>{
        this.orders.push(newOrder);
        this.curOrderIndex = this.orders.length - 1;
      }).catch(error=>{
        // todo retry with another id
        console.error(error);
      });     
    },
    closeCurOrder: function(){
      this.orders = this.orders.filter((item,index) => {
        return index != this.curOrderIndex;
      });
      //this.orders.$remove(this.curOrderIndex);
      if (this.orders.length < 1){
        this.newOrder();
      }
    },
    getNowAsId: function () {
      return formatDate(Date.now(),"YYYYMMDDHHmmssSSS");
    },
    getNextTicket: function(){
      if (this.ticketCounter > 99){
        this.ticketCounter = 1;
      }
      return this.ticketCounter++;
    },
    printReceiptAndClose: function(){
      // validation
      if (this.curOrderVaild){
        // order is not editable after print receipt regardless if printing success
        this.curOrder.editable = false;
        this.printOrder(this.PrintStage.receipt)
        .then(response => {
          if(response){
            // printing success, close current order
            this.closeCurOrder();
          }
        });
      }
    },
    printOrder: function(stage){
      // save order
      return Order.saveOrder(this.$http,this.curOrder)
      .then(response =>{
        if (response.data.error){
          throw Error(response.data.error);
        }
        // done save, print the order
        Toast.create['positive']("Current order saved");
      }).catch(error=>{
        // As the printer will directly print the order in database, ingnore the failure of save order
        //Toast.create['warning']("On save order: <br>" + error.toString());
      }).then(response=>{
        //print order, 
        return Printer.printerOrder(this.$http,this.curOrder.id, stage)
        .then(response=>{
          Toast.create['positive']("Current order is printed.");
          return response;
        });    
      }).catch(error=>{
        Alert.create({
          color: 'negative',
          html: "Printing failed <br>" + error.toString(),
          position: "top-center",
          actions:[
            {
              label: "See Detail",
              handler (){
                Dialog.create({message: JSON.stringify(error)})
              }
            }
          ]
        });
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
      this.curOrder.paid = "" + (parseFloat(this.curOrder.paid) + num);
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

      this.$http.get('/api/data/'+name+'/')
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
    loadOrder: function(){
      return Order.getEditableOrder(this.$http)
      .then(orderList=>{
        this.orders = orderList.sort((a,b)=>{
          return a.id > b.id; 
        });
      }).catch(error=>{
        Alert.create({
          color: 'negative',
          html: "Failed to load editable orders<br>" + error.toString(),
          position: "top-center",
          actions:[
            {
              label: "See Detail",
              handler (){
                Dialog.create({message: JSON.stringify(error)})
              }
            }
          ]
        });
      });
    },
    setDiscount: function(){
      Dialog.create({
        title: 'Discount',
        message: 'Set discount on whole bill',
        form: {
          discount: {
            type: 'slider',
            label: 'Discount %',
            model: 10,
            min: 5,
            max: 10,
            step: 5,
            snap: true,
            markers: true,
            withLabel: true
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'OK',
            handler: (data)=> {
              this.curOrder.discount = data.discount;
            }
          }
        ]
      });
    }
  },
  created: function(){
    this.loadDate('top-class', data=>this.topClass = data);
    this.loadDate('sec-class', data=>this.secClass = data);
    this.loadDate('product', data=>this.products = data);
    this.loadOrder().then(()=>{
      if (this.orders.length == 0){
        this.newOrder();
      }else{
        this.curOrderIndex = 0;
      }
    });
  }
}
</script>

<style>

</style>
