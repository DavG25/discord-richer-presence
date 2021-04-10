import Vue from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './router'
import store from './store'

// SCSS + Bulma
import '@/assets/sass/main.scss'
// Bulma Dark Theme
import '@/assets/css/bulmaswatch.min.css'

// Fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas)
Vue.component('FontAwesomeIcon', FontAwesomeIcon)

// Toast notification
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
Vue.use(VueToast)

// Vue Meta
import Meta from 'vue-meta'
Vue.use(Meta)

// Triggers plugin
import Triggers from '@/plugins/triggers'
Vue.use(Triggers, { store })

// User data loader plugin
import UserData from '@/plugins/userData'
Vue.use(UserData, { store })

// Electron events handler plugin
import ElectronEvents from '@/plugins/ipcEvents'
Vue.use(ElectronEvents, { store, router })

// Tooltips
import VTooltip from 'v-tooltip'
Vue.use(VTooltip, {
  /* defaultBoundariesElement: document.body, */
})

// Vue moment
Vue.use(require('vue-moment'))

// Google Analytics
import VueGtag from "vue-gtag"
Vue.use(VueGtag, {
  config: { id: "G-KNTXB9L0MG" }
})

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
// Add 'has-navbar-fixed-top' class to body to provide the appropriate padding to the page
Vue.nextTick()
  .then(function () {
    document.body.classList.add('has-navbar-fixed-top')
  })