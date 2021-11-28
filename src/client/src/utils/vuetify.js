import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

import '../assets/gantt.css';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        primary: '#A81866'
      },
      dark: {
        primary: '#A81866'
      }
    }
  }
});
