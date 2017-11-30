<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div class="layout-padding">
    <!-- your content -->
    <q-collapsible label="Options">
      <q-field
        icon="title"
        label="Data Table Title"
        :label-width="4"
      >
        <q-input v-model="config.title" />
      </q-field>
      <q-field
        icon="title"
        label="Defaultly open Product List"
        :label-width="4"
      >
        <q-toggle v-model="openCollasp" checked-icon="visibility" unchecked-icon="visibility_off"/>
      </q-field>
    </q-collapsible>
     printer.PrintStage.receipt = {{printer.PrintStage.receipt}}
    <q-data-table 
      :data="orders" 
      :config="config"
      :columns="columns" 
      @refresh="refresh"
    >
      <template slot="col-editable" slot-scope="cell">
        <div class="row justify-between">
          <q-btn outline @click="printOrder(cell.row.id,printer.PrintStage.kitchen)">K</q-btn>
          <q-btn outline 
            v-if="cell.data"
            @click="printOrder(cell.row.id,printer.PrintStage.receipt)">R</q-btn>
        </div>
        
      </template>
      <template slot="col-productList" slot-scope="cell">
        <q-collapsible label="Products" :opened="openCollasp">
          <div v-for="item in cell.data" :key="item.id">{{item.name}} - {{item.price}}</div>
        </q-collapsible>
      </template>
    </q-data-table>
  </div>
</template>

<script>
  import Printer from '../model/Printer.js'
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
        openCollasp: true,
        printer: Printer,
        config: {
          title: 'Data Table',
          refresh: true,
          noHeader: false,
          columnPicker: true,
          leftStickyColumns: 0,
          rightStickyColumns: 0,
          rowHeight: '',
          responsive: true,
          pagination: {
            rowsPerPage: 10,
            options: [5, 10, 15, 30, 50, 500]
          }
        },
        columns: [
          {
            label: 'ID',
            field: 'id',
            width: '90px',
            classes: 'bg-orange-2',
            sort : true,
            type: 'string',
            format (value){
              return value.slice(0,4) + '-' + value.slice(4,6) + '-' + value.slice(6,8) + ' ' + value.slice(8,10) + ':' + value.slice(10,12) + ':' + value.slice(12,14) + ':' + value.slice(14);
            }
          },
          {
            label: 'Ticket',
            field: 'ticket',
            width: '30px',
            sort: false,
            type: 'number'
          },
          {
            label: 'Print',
            field: 'editable',
            width: '60px'
          },
          {
            label: 'productList',
            field: 'productList',
            width: '200px',
          },
          {
            label: 'Discount',
            field: 'discount',
            width: '35px',
            sort: true,
            type: 'number',
            style: 'text-align: right',
            format (value){
              let discount = parseInt(value);
              if(discount>0){
                return "<span class='text-deep-orange'>" + value + "%</span>";
              }
              return '';
            }
          },
          {
            label: 'Payable',
            field: 'payable',
            width: '40px',
            sort: true,
            type: 'number',
            style: 'text-align: right',
            classes: 'bg-orange-4',
            format (value){
              return '$ ' + parseInt(value).toFixed(2);
            }
          },
          {
            label: 'Paid',
            field: 'paid',
            width: '40px',
            sort: true,
            type: 'number',
            style: 'text-align: right',
            format (value){
              return '$ ' + parseInt(value).toFixed(2);
            }
          },
          {
            label: 'Change',
            field: 'change',
            width: '45px',
            sort: true,
            type: 'number',
            style: 'text-align: right',
            format (value){
              return '$ ' + parseInt(value).toFixed(2);
            }
          },
        ],
      }
    },
    methods: {
      refresh (callback){
        this.$http.get('//localhost:3000/api/order')
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
      printOrder(id,stage){
        return this.printer.printerOrder(this.$http,id,stage)
        .then(response=>{
          Toast.create.positive("Order ["+ id +"] is printed as ["+ stage +"].");
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
        }); 
      }
    },
    created: function(){
      this.refresh();
    }
  }
</script>

<style>
</style>
