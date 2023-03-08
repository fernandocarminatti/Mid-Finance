import { createRouter, createWebHistory } from 'vue-router'
import Mid$Finance from '../views/Mid$FinanceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Mid$Finance',
      component: Mid$Finance
    },
  ]
})

export default router
