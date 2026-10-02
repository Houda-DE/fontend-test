import { createRouter, createWebHistory } from 'vue-router'
import CandidaturesPage from '../pages/CandidaturesPage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/candidatures',
      name: 'candidatures',
      component: CandidaturesPage,
      meta: { title: 'Candidatures — TalentFlow' }
    },
    {
      path: '/statuts',
      name: 'statuts',
      component: () => import('../pages/StatutsPage.vue'),
      meta: { title: 'Pipeline par statut — TalentFlow' }
    },
    {
      path: '/postes',
      name: 'postes',
      component: () => import('../pages/PosteView.vue'),
      meta: { title: 'Pipeline par statut — TalentFlow' }
    },
    { path: '/:pathMatch(.*)*', redirect: '/candidatures' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})