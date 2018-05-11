<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div class="layout-padding">
    <!-- your content -->
    <div>
        <q-field>
        <q-input v-model="this_day_year" float-label="Year"/>
        <q-input v-model="this_day_month" float-label="Month"/>
        <q-input v-model="this_day_day" float-label="Day"/>
        </q-field>
    </div>
    <div class="bg-info">Total Amount for the day: $ {{this_day_amount.toFixed(2)}} </div>
    <table>
      <thead>
        <th>Date</th>
        <th>Ticket</th>
        <th>Amount</th>
        <th>Product</th>
      </thead>
      <tbody>
        <tr v-for="order in order_for_the_day" :key="order.id">
          <td>{{order.date}}</td>
          <td>{{order.ticket}}</td>
          <td>$ {{order.payable.toFixed(2)}}</td>
          <td>
            <table>
              <tr v-for="product in order.productList" :key="product.id">
                <td>{{product.name}}</td>
                <td>$ {{product.price.toFixed(2)}}</td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    
  </div>
</template>

<script>
  import {
    Alert,
    Dialog,
    Toast,
    QBtn,
    QDataTable,
    QField,
    QInput,
    QIcon,
    QCollapsible,
    QToggle,
  } from 'quasar';

  export default {
    components: {
      QBtn,
      QDataTable,
      QField,
      QInput,
      QIcon,
      QCollapsible,
      QToggle,
    },
    data () {
      return {
        orders: [],
        this_day_year: null,
        this_day_month: null,
        this_day_day: null,
      }
    },
    computed: {
      order_for_the_day: function(){
        return this.orders.filter(order=>{
          return this.is_the_day(order.date);
        // return true;
        })
      },
      this_day_amount: function(){
        return this.order_for_the_day.reduce((total,cur)=>{
          return total + cur.payable;
        },0)
      }
    },
    methods: {
      refresh (callback){
        this.$http.get('http://localhost:3000/api/data/order')
        .then(response=>{
          this.orders = response.data.sort(function(a,b){
            if(a.id && b.id){
              return a.id < b.id;
            }
            return true;
          });
        }).catch(err=>{
          Alert.create({
            color: 'negative',
            html: "Failed to load orders <br>" + err.toString(),
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
        }).then((resonse)=>{
          callback();
        });
      },
      is_the_day(order_date){
        if (!order_date){
          return false;
        }
        let ary_date = order_date.split('/');
        if (!ary_date.length || ary_date.length != 3 ){
            return false;
        }
        let year = ary_date[2];
        let month = ary_date[1];
        let day = ary_date[0];

        return this.this_day_year == year &&
               this.this_day_month == month &&
               this.this_day_day == day;
      }
    },
    created: function(){
      this.refresh();
      let current_date = new Date();
      this.this_day_year = this.this_day_year || current_date.getFullYear();
      this.this_day_month = this.this_day_month || current_date.getMonth()+1;
      this.this_day_day = this.this_day_day || current_date.getDate();
    }
  };
</script>

<style>
</style>
