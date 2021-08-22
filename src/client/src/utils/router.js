import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/Home.vue')
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../components/Signin.vue')
  },
  {
    path: '/list/:objectname',
    name: 'list',
    component: () => import('../components/List.vue'),
    props: true
  },
  {
    path: '/info/:objectname/:objectid',
    name: 'infomation',
    component: () => import('../components/Detail.vue'),
    props: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router