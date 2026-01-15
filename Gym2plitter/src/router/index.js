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
    },
    {
       path: '/test',
       name: 'Test',
       component: Test
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
      beforeEnter: (to, from, next) => {
        const isAdmin = localStorage.getItem('admin') === 'true'

        if (isAdmin) {
          next() 
        } else {
          next('/adminPrijava')
        }
      }
    },
    {
      path: '/vjezbaMaker',
      name: 'VjezbaMaker',
      component: VjezbaMarer,
      beforeEnter: (to, from, next) => {
      const isAdmin = localStorage.getItem('admin') === 'true'

        if (isAdmin) {
          next() 
        } else {
          next('/adminPrijava')
        }
      }
    },
    {
      path: '/splitMaker',
      name: 'SplitMaker',
      component: SplitMaker,
      beforeEnter: (to, from, next) => {
      const isAdmin = localStorage.getItem('admin') === 'true'

        if (isAdmin) {
          next() 
        } else {
          next('/adminPrijava')
        }
      }
    },
    {
       path: '/SplitBiranje',
       name: 'SplitBiranje',
       component: SplitBiranje,
    },
    {
       path: '/Split',
       name: 'Split',
       component: Split,
    },
    {
       path: '/UserSplitovi',
       name: 'UserSplitovi',
       component: UserSplitovi,
    },
    {
      path: '/UrediDan/:danId',
      name: 'UrediDan',
      component: UrediDan,
      props: true
    },
    {
       path: '/UserVjezbaMaker',
       name: 'UserVjezbaMaker',
       component: UserVjezbaMaker,
    },
    {
      path: '/kalendar',
      name: 'kalendar',
      component: Kalendar,
    }, 
    {
      path: '/hranaMaker',
      name: 'HranaMaker',
      component: HranaMaker,
      beforeEnter: (to, from, next) => {
      const isAdmin = localStorage.getItem('admin') === 'true'

        if (isAdmin) {
          next() 
        } else {
          next('/adminPrijava')
        }
      }
    }, 
    {
      path: '/obrokMaker',
      name: 'ObrokMaker',
      component: ObrokMaker,
      beforeEnter: (to, from, next) => {
      const isAdmin = localStorage.getItem('admin') === 'true'

        if (isAdmin) {
          next() 
        } else {
          next('/adminPrijava')
        }
      }
    },
    {
       path: '/kalkulatorTest',
       name: 'kalkulatorTest',
       component: kalkulatorTest
    }, 
    {
       path: '/hranaBiranje',
       name: 'hranaBiranje',
       component: hranaBiranje
    },   
    {
      path: '/prehrana',
      name: 'prehrana',
      component: Prehrana
    },
    {
      path:'/UserHranaMaker',
      name: 'UserHranaMaker',
      component: UserHranaMaker
    }
  ],
})



export default router