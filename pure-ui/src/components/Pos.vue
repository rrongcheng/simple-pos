<template>
  <!-- Configure "view" prop for QLayout -->
  <q-layout ref="layout" view="LHr LpR Fff" :right-breakpoint="0" :left-breakpoint="500">
    <q-toolbar slot="header">
      <q-btn flat @click="$refs.layout.toggleLeft()">
        <q-icon name="menu" />
      </q-btn>
      <q-toolbar-title>
        Title
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
            <div v-for="order in orders" :key="order.id">
              <q-btn v-on:click="curOrder = order">{{order.ticket}}</q-btn>
            </div>
          </div>
        </div>
        <!-- Current order -->
        <div style="padding:10px;">
          <p class="caption">Current order: # {{curOrder.ticket}}</p>
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
                  <td><q-btn round flat small v-on:click="removeProduct(index)" icon="clear" ></q-btn></td>
                </tr>
              </tbody>
            </table>
          </q-scroll-area>
          <div class="xs-gutter" style="padding-top:10px;" >
            <div class="row  xs-gutter">
              <div class="col-5">
                <q-btn v-on:click="saveOrder">
                  <span v-if="!curOrder.printed">Save and Print</span>
                  <span v-else>Re-print</span>
                </q-btn>
              </div>
              <div class="col-7 text-right">
                <div>
                  <label>Total:</label>
                  <span id="total_price">{{curOrderTotal.toFixed(2)}}</span>
                </div>
                <div id="global_discount" class=" row justify-between">
                  <label>Discount ({{curOrder.discount}}%):</label>
                  {{curOrderDiscournt.toFixed(2)}}
                </div>
                <div>
                  <label>Payable:</label>
                  <span id="payable_price">{{curOrderPayable.toFixed(2)}}</span>
                </div>
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

            <!-- Keybord -->
              
              <div class="row xs-gutter">
                <div class="col-3">
                  <div v-for="num in [10,20,50,100]" :key="num"><q-btn class="full-width" v-on:click="paidIntegral(num)" color="green">+{{num}}</q-btn></div>
                </div>
                <div class="col-6">
                  <div class="row">
                    <div class="col-4" v-for="num in [7,8,9,4,5,6,1,2,3,0]" :key="num"><q-btn class="full-width" v-on:click="paidInput(num)">{{num}}</q-btn></div>
                    <div class="col-8"><q-btn v-on:click="paidInput('.')">.</q-btn></div>
                  </div>
                </div>
                <div class="col-3">
                  <div class="row">
                    <q-btn icon="keyboard_backspace" class="full-width" v-on:click="paidBack" title="del last char of paid."></q-btn>
                    <q-btn v-on:click="paidClear" class="full-width"  title="Clear amount of paid.">Clear</q-btn>
                    <q-btn v-on:click="paidEFT" class="full-width"  title="Pay by EFT. Paid = payable">EFT</q-btn>
                    <q-btn v-on:click="setDiscount" class="full-width"  title="Set Discount">Disc</q-btn>
                  </div>
                </div>
              </div>
            <!-- End of Keybord -->
              
          </div>

        </div>
      </div>
    </div>
    

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
    <div>
      <q-list link highlight separator>
        <q-item v-for="p in filtProduct" :key="p.id" v-on:click="addProduct(p)">
          <q-item-side  />
          <q-item-main label>{{p.name}}
            
          </q-item-main>
          <q-item-side right>$ {{p.price.toFixed(2)}}
            
          </q-item-side>
        </q-item>
      </q-list>
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
import MyOrder from './Order'
import {
  Dialog,
  QLayout,
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

export default {
  components:{
    QLayout,
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
      return this.curOrderTotal - this.curOrderDiscournt;
    },
    curOrderChange: function(){
      return this.curOrder.paid - this.curOrderPayable;
    },
    curOrderDiscournt: function(){
      return this.curOrderTotal * this.curOrder.discount/100;
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
    getFullCurOrder: function(){
      return {
        "id"          : this.curOrder.id,
        "ticket"      : this.curOrder.ticket,
        "productList" : this.curOrder.productList,
        "discount"    : this.curOrder.discount,
        "paid"        : this.curOrder.paid,

        "subtotal"      : this.curOrderTotal,
        "totalDiscount" : this.curOrderDiscournt,
        "payable"       : this.curOrderPayable,
        "change"        : this.curOrderChange,
      }
    },
    saveOrder: function(){
      /*
        Save order, then print it.
        If order is saved, re-print it.
      */
      this.$http.post('//localhost:3000/api/order/',this.getFullCurOrder())
      .then(response =>{
        this.showError('ok');
      }, error=>{
        this.showError(error);
      })
    },
    printOrder: function(){
      
      //todo save  print order, 
      this.$http.post('/api/printer_order/',this.getFullCurOrder())
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
    this.newOrder();
    this.loadDate('top-class', data=>this.topClass = data);
    this.loadDate('sec-class', data=>this.secClass = data);
    this.loadDate('product', data=>this.products = data);
  }
}
</script>

<style>

</style>
