<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div class="layout-padding">
    <!-- your content -->
    <div class="bg-blue text-white" style="padding:10px;"><h4>Total: {{totalAmount.toFixed(2)}}</h4></div>
    
    
    <div class="row sm-gutter">
      <div class="col">
        <p class="caption">Sliver Coin</p>
          <q-field  label="5 c">
            <q-input type="number" min="0" v-model="aud.c5.qty" />
          </q-field>
          <q-field  label="10 c">
            <q-input type="number" min="0" v-model="aud.c10.qty" />
          </q-field>
          <q-field  label="20 c">
            <q-input type="number"  min="0" v-model="aud.c20.qty" />
          </q-field>
          <q-field  label="50 c">
            <q-input type="number" min="0"  v-model="aud.c50.qty" />
          </q-field>
      </div>
      <div class="col">
        <p class="caption">Gold Coin</p>
          <q-field  label="$1">
            <q-input type="number"  min="0" v-model="aud.g1.qty" />
          </q-field>
          <q-field  label="$2">
            <q-input type="number" min="0"  v-model="aud.g2.qty" />
          </q-field>
      </div>
      <div class="col">
        <p class="caption">Note</p>
          <q-field  label="$5">
            <q-input type="number" min="0"  v-model="aud.n5.qty" />
          </q-field>
          <q-field  label="$10">
            <q-input type="number" min="0"  v-model="aud.n10.qty" />
          </q-field>
          <q-field  label="$20">
            <q-input type="number" min="0"  v-model="aud.n20.qty" />
          </q-field>
          <q-field  label="$50">
            <q-input type="number" min="0"  v-model="aud.n50.qty" />
          </q-field>
          <q-field  label="$100">
            <q-input type="number" min="0"  v-model="aud.n100.qty" />
          </q-field>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QField,
  QInput
} from 'quasar'

export default {
  components:{
    QField,
    QInput
  },
  data () {
    return {
      aud: {
        c5: {value:0.05,qty:0},
        c10: {value:0.1,qty:0},
        c20: {value:0.2,qty:0},
        c50: {value:0.5,qty:0},
        g1: {value:1,qty:0},
        g2: {value:2,qty:0},
        n5: {value:5,qty:0},
        n10: {value:10,qty:0},
        n20: {value:20,qty:0},
        n50: {value:50,qty:0},
        n100: {value:100,qty:0}
      }
    }
  },
  computed:{
    totalAmount: function(){
      let total = 0;
      for(var key in this.aud){
        if(!this.aud.hasOwnProperty(key)) continue;
        console.log('key.value = '+this.aud[key].value)
        console.log('key.qty = '+this.aud[key].qty)
        total += this.aud[key].value * this.aud[key].qty;
      }
      return total;
    }
  }
}
</script>

<style>
</style>
