import Vue from 'vue';
import './utils/axios';
import router from "./utils/router";
import vuetify from './utils/vuetify';
import App from './App.vue';
import uiconfig from './utils/UIConfig';

Vue.config.productionTip = false
Vue.use(uiconfig);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
