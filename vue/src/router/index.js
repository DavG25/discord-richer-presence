import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/profiles',
    name: 'Profiles',
    component: function () {
      return import('../views/Profiles.vue')
    }
  },
  {
    path: '/triggers',
    name: 'Triggers',
    component: function () {
      return import('../views/Triggers.vue')
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: function () {
      return import('../views/Settings.vue')
    }
  }
]

const router = new VueRouter({
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  mode: 'history',
  base: process.env.BASE_URL,
  linkExactActiveClass: "is-active",
  routes
})

export default router
