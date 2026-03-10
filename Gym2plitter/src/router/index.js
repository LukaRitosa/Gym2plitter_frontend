import { createRouter, createWebHistory } from 'vue-router'
import Registracija from '../views/Registracija.vue'
import Prijava from '../views/Prijava.vue'
import Pocetna from '../views/Pocetna.vue'
import Test from '../views/Test.vue'
import adminPrijava from '../views/AdminPrijava.vue'
import Admin from '../views/Admin.vue'
import VjezbaMarer from '../views/VjezbaMaker.vue'
import SplitMaker from '../views/SplitMaker.vue'
import SplitBiranje from '../views/SplitBiranje.vue'
import Split from '../views/Split.vue'
import UserSplitovi from '../views/UserSplitovi.vue'
import UrediDan from '@/views/UrediDan.vue'
import UserVjezbaMaker from '@/views/UserVjezbaMaker.vue'
import Kalendar from '@/views/Kalendar.vue'
import HranaMaker from '@/views/HranaMaker.vue'
import ObrokMaker from '@/views/ObrokMaker.vue'
import kalkulatorTest from '@/views/kalkulatorTest.vue'
import hranaBiranje from '@/views/hranaBiranje.vue'
import Prehrana from '@/views/Prehrana.vue'
import UserHranaMaker from '@/views/UserHranaMaker.vue'
import UserObrokMaker from '@/views/UserObrokMaker.vue'
import UserSplitMaker from '@/views/UserSplitMaker.vue'

import PROBA from '@/views/PROBA.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Prijava',
      component: Prijava,
    },
    {
      path: '/registracija',
      name: 'Registracija',
      component: Registracija,
    },
    {
      path: '/pocetna',
      name: 'Pocetna',
      component: Pocetna,
      meta: {requiresAuth: true}
    },
    {
      path: '/test',
      name: 'Test',
      component: Test,
      meta: {requiresAuth: true}
    },
    {
      path: '/adminPrijava',
      name: 'adminPrijava',
      component: adminPrijava,
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      meta: { requiresAdmin: true }
    },
    {
      path: '/vjezbaMaker',
      name: 'VjezbaMaker',
      component: VjezbaMarer,
      meta: { requiresAdmin: true }
    },
    {
      path: '/splitMaker',
      name: 'SplitMaker',
      component: SplitMaker,
      meta: { requiresAdmin: true }
    },
    {
      path: '/SplitBiranje',
      name: 'SplitBiranje',
      component: SplitBiranje,
      meta: {requiresAuth: true}
    },
    {
      path: '/Split',
      name: 'Split',
      component: Split,
      meta: {requiresAuth: true}
    },
    {
      path: '/UserSplitovi',
      name: 'UserSplitovi',
      component: UserSplitovi,
      meta: {requiresAuth: true}
    },
    {
      path: '/UrediDan/:danId',
      name: 'UrediDan',
      component: UrediDan,
      props: true,
      meta: {requiresAuth: true}
    },
    {
      path: '/UserVjezbaMaker',
      name: 'UserVjezbaMaker',
      component: UserVjezbaMaker,
      meta: {requiresAuth: true}
    },
    {
      path: '/kalendar',
      name: 'kalendar',
      component: Kalendar,
      meta: {requiresAuth: true}
    }, 
    {
      path: '/hranaMaker',
      name: 'HranaMaker',
      component: HranaMaker,
      meta: { requiresAdmin: true }
    }, 
    {
      path: '/obrokMaker',
      name: 'ObrokMaker',
      component: ObrokMaker,
      meta: { requiresAdmin: true }
    },
    {
       path: '/kalkulatorTest',
       name: 'kalkulatorTest',
       component: kalkulatorTest,
       meta: {requiresAuth: true}
    }, 
    {
       path: '/hranaBiranje',
       name: 'hranaBiranje',
       component: hranaBiranje,
       meta: {requiresAuth: true}
    },   
    {
      path: '/prehrana',
      name: 'prehrana',
      component: Prehrana,
      meta: {requiresAuth: true}
    },
    {
      path:'/UserHranaMaker',
      name: 'UserHranaMaker',
      component: UserHranaMaker,
      meta: {requiresAuth: true}
    },
    {
      path:'/UserObrokMaker',
      name: 'UserObrokMaker',
      component: UserObrokMaker,
      meta: {requiresAuth: true}
    },
    {
      path:'/UserSplitMaker',
      name: 'UserSplitMaker',
      component: UserSplitMaker,
      meta: {requiresAuth: true}
    },
    {
      path:'/proba',
      name: 'proba',
      component: PROBA
    }
  ],
})

router.beforeEach((to, from, next)=>{
  const token= localStorage.getItem("token")
  const isAdmin= localStorage.getItem("admin")=== "true"

  if(to.meta.requiresAuth && !token){
    next("/")
    return
  }

  if(to.meta.requiresAdmin && !isAdmin){
    next("/adminPrijava")
    return
  }
  next()
  return
})



export default router