<template>
  <!-- Configure "view" prop for QLayout -->
  <q-layout ref="layout" view="lhh lpr lFf" reveal>
    <q-toolbar slot="header" class="glossy" color="cyan">
      <!-- opens drawer below -->
      <q-btn flat @click="$refs.layout.toggleLeft()">
        <q-icon name="menu" />
      </q-btn>
      
      <q-toolbar-title>
        DEMO
      </q-toolbar-title>
    </q-toolbar>

    <!-- Navigation Tabs
    <q-tabs slot="navigation">
      <q-route-tab slot="title" icon="view_quilt" to="/layout/about" replace hide="icon" label="About" />
      <q-route-tab slot="title" icon="view_day" to="/layout/toolbar" replace hide="icon" label="Toolbar" />
      <q-route-tab slot="title" icon="view_day" to="/layout/tabs" replace label="Tabs" />
      <q-route-tab slot="title" icon="input" to="/layout/drawer" replace label="Drawer" />
    </q-tabs>
    -->

    <!-- Left Side Panel -->
    <div slot="left">
      <!--
        Use <q-side-link> component
        instead of <q-item> for
        internal vue-router navigation
      -->

      <q-list no-border link inset-delimiter>
        <q-list-header>Essential Links</q-list-header>
        
        <q-side-link item to="/pos">
          <q-item-side icon="add_shopping_cart" />
          <q-item-main label="Pos" sublabel="main pos" />
        </q-side-link>
        <q-side-link item to="/order">
          <q-item-side icon="list" />
          <q-item-main label="Orders" sublabel="List orders" />
        </q-side-link>
        <q-side-link item to="/cashcounter">
          <q-item-side icon="pan_tool" />
          <q-item-main label="Cash Counter" sublabel="Help you to count cash" />
        </q-side-link>
        <q-side-link item to="/daily">
          <q-item-side icon="pan_tool" />
          <q-item-main label="Daily Sale" sublabel="Total sale amount per day" />
        </q-side-link>

      </q-list>
    </div>
    

    <!-- Right Side Panel
    <div slot="right">
      ...
    </div>
    -->

    <router-view />

    <!-- Footer
    <q-toolbar slot="footer">
      ...
    </q-toolbar>
    -->
  </q-layout>
</template>

<script>

import {
  QLayout,
  QIcon,
  QBtn,
  QToolbar,
  QToolbarTitle,
  QList,
  QListHeader,
  QSideLink,
  QItemSide,
  QItemMain
} from 'quasar'

export default {
  components: {
    QLayout,
    QIcon,
    QBtn,
    QToolbar,
    QToolbarTitle,
    QList,
    QListHeader,
    QSideLink,
    QItemSide,
    QItemMain
  },
  data () {
    return {}
  }
}
</script>

<style>
</style>
