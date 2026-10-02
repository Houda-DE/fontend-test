import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../src/App.vue'
import CandidaturesPage from '../src/pages/CandidaturesPage.vue'
import StatutsPage from '../src/pages/StatutsPage.vue'
import { autreCandidature, candidature, statuts } from './fixtures'

const api = vi.hoisted(() => ({
  getCandidatures: vi.fn(),
  getCandidature: vi.fn(),
  createCandidature: vi.fn(),
  updateCandidature: vi.fn(),
  deleteCandidature: vi.fn(),
  getStatuts: vi.fn(),
  getPostes: vi.fn(),
  getCompetences: vi.fn()
}))

vi.mock('../src/services/api', async () => {
  const actual = await vi.importActual<typeof import('../src/services/api')>('../src/services/api')
  return { ...actual, api }
})

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/candidatures' },
      { path: '/candidatures', name: 'candidatures', component: CandidaturesPage },
      { path: '/statuts', name: 'statuts', component: StatutsPage },
      { path: '/:pathMatch(.*)*', redirect: '/candidatures' }
    ]
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  api.getStatuts.mockResolvedValue(statuts)
  api.getPostes.mockResolvedValue([{ id: 1, titre: 'Développeur Vue.js', description: '', competencesRequises: [] }])
  api.getCompetences.mockResolvedValue([{ id: 1, nom: 'Vue.js', categorie: 'Frontend' }])
  api.getCandidatures.mockResolvedValue({ data: [candidature, autreCandidature], total: 2 })
  api.getCandidature.mockResolvedValue(candidature)
})

async function mountAt(path: string) {
  const router = buildRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('routage', () => {
  it('redirige la racine vers /candidatures', async () => {
    const { router } = await mountAt('/')

    expect(router.currentRoute.value.name).toBe('candidatures')
    expect(router.currentRoute.value.path).toBe('/candidatures')
  })

  it('redirige une route inconnue vers /candidatures', async () => {
    const { router } = await mountAt('/inconnu')

    expect(router.currentRoute.value.name).toBe('candidatures')
  })

  it('expose les deux pages dans la navigation', async () => {
    const { wrapper } = await mountAt('/candidatures')

    const links = wrapper.findAll('.main-nav a')
    expect(links.map(link => link.text())).toEqual(['Candidatures', 'Statuts'])
  })
})

describe('page /candidatures', () => {
  it('liste les profils venus de l’API', async () => {
    const { wrapper } = await mountAt('/candidatures')

    expect(api.getCandidatures).toHaveBeenCalled()
    expect(wrapper.findAll('.candidate')).toHaveLength(2)
    expect(wrapper.text()).toContain('Sophie Martin')
    expect(wrapper.text()).toContain('2 candidatures')
  })

  it('ouvre le détail via l’URL et le ferme en revenant en arrière', async () => {
    const { wrapper, router } = await mountAt('/candidatures')

    await wrapper.findAll('.candidate')[0].trigger('click')
    await flushPromises()

    expect(api.getCandidature).toHaveBeenCalledWith(1)
    expect(router.currentRoute.value.query.candidat).toBe('1')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    router.back()
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('met à jour le statut depuis la fiche (PATCH)', async () => {
    api.updateCandidature.mockResolvedValue({ ...candidature, statut: 'Refusé' })
    const { wrapper } = await mountAt('/candidatures?candidat=1')

    await wrapper.get('#modal-status').setValue('Refusé')
    await wrapper.get('.status-edit .button').trigger('click')
    await flushPromises()

    expect(api.updateCandidature).toHaveBeenCalledWith(1, { statut: 'Refusé' })
    expect(wrapper.text()).toContain('Statut mis à jour.')
  })

  it('affiche un message d’erreur quand l’API est injoignable', async () => {
    api.getCandidatures.mockRejectedValue(new Error('Impossible de joindre l’API. Vérifiez que JSON Server est lancé.'))
    const { wrapper } = await mountAt('/candidatures')

    expect(wrapper.get('.error').text()).toContain('Impossible de joindre l’API.')
    expect(wrapper.findAll('.candidate')).toHaveLength(0)
  })

  it('propose une relance après une erreur', async () => {
    api.getCandidatures.mockRejectedValueOnce(new Error('La requête a expiré. Réessayez.'))
    const { wrapper } = await mountAt('/candidatures')
    expect(wrapper.find('.error').exists()).toBe(true)

    await wrapper.get('.error .button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.error').exists()).toBe(false)
    expect(wrapper.findAll('.candidate')).toHaveLength(2)
  })
})

describe('page /statuts', () => {
  it('construit une colonne par statut', async () => {
    const { wrapper } = await mountAt('/statuts')

    const columns = wrapper.findAll('.board-column')
    expect(columns).toHaveLength(3)
    expect(columns[0].get('.board-count').text()).toBe('1')
    expect(columns[2].find('.board-empty').exists()).toBe(true)
  })

  it('déplace une candidature via PATCH au clavier', async () => {
    api.updateCandidature.mockResolvedValue({ ...candidature, statut: 'Refusé' })
    const { wrapper } = await mountAt('/statuts')

    await wrapper.get('.board-column:nth-child(1) .board-card-move select').setValue('Refusé')
    await flushPromises()

    expect(api.updateCandidature).toHaveBeenCalledWith(1, { statut: 'Refusé' })
    expect(wrapper.get('.board-column:nth-child(3) .board-card').text()).toContain('Sophie Martin')
  })

  it('ouvre le profil d’une carte et recharge le pipeline après mise à jour', async () => {
    api.updateCandidature.mockResolvedValue({ ...candidature, statut: 'Refusé' })
    const { wrapper } = await mountAt('/statuts')

    await wrapper.get('.board-card-open').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await wrapper.get('#modal-status').setValue('Refusé')
    await wrapper.get('.status-edit .button').trigger('click')
    await flushPromises()

    expect(api.updateCandidature).toHaveBeenCalledWith(1, { statut: 'Refusé' })
    expect(api.getCandidatures).toHaveBeenCalledTimes(2)
  })

  it('affiche une erreur réseau avec une action de relance', async () => {
    api.getCandidatures.mockRejectedValue(new Error('Impossible de joindre l’API.'))
    const { wrapper } = await mountAt('/statuts')

    expect(wrapper.get('.error').text()).toContain('Impossible de joindre l’API.')
    expect(wrapper.findAll('.board-column')).toHaveLength(0)
  })
})