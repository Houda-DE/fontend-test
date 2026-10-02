import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../src/App.vue'
import CandidaturesPage from '../src/pages/CandidaturesPage.vue'
import StatutsPage from '../src/pages/StatutsPage.vue'

const API_URL = process.env.LIVE_API_URL ?? 'http://localhost:3000'

/**
 * Sous jsdom, `AbortSignal` provient de jsdom et le `fetch` de Node le refuse.
 * Ce shim retire le signal : il est propre à ce fichier et n'affecte que les
 * requêtes de lecture utilisées pour vérifier le dialogue réel avec JSON Server.
 */
const nativeFetch = globalThis.fetch
globalThis.fetch = ((input: RequestInfo | URL, init: RequestInit = {}) => {
  const { signal: _signal, ...rest } = init
  return nativeFetch(input, rest)
}) as typeof fetch

/** Détection au chargement du fichier : les tests sont ignorés si l’API n’est pas lancée. */
const apiAvailable = await fetch(`${API_URL}/statuts`)
  .then(response => response.ok)
  .catch(() => false)

beforeEach(() => {
  localStorage.clear()
})

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/candidatures' },
      { path: '/candidatures', name: 'candidatures', component: CandidaturesPage },
      { path: '/statuts', name: 'statuts', component: StatutsPage }
    ]
  })
}

async function mountAt(path: string) {
  const router = buildRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
  return { wrapper, router }
}

describe.skipIf(!apiAvailable)('intégration avec JSON Server (lecture seule)', () => {
  it('charge une page de candidatures depuis GET /candidatures', async () => {
    const { wrapper } = await mountAt('/candidatures')

    await vi.waitFor(() => expect(wrapper.findAll('.candidate').length).toBeGreaterThan(0))
    expect(wrapper.text()).toContain('candidature')
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('filtre côté API et lit le total renvoyé par X-Total-Count', async () => {
    const { wrapper } = await mountAt('/candidatures')
    await vi.waitFor(() => expect(wrapper.findAll('.candidate').length).toBeGreaterThan(0))

    await wrapper.get('#filter-statut').setValue('En attente')

    await vi.waitFor(() => {
      const badges = wrapper.findAll('.candidate .status')
      expect(badges.length).toBeGreaterThan(0)
      expect(badges.every(badge => badge.text() === 'En attente')).toBe(true)
    })
    expect(wrapper.get('.list-heading').text()).toContain('page 1 sur')
  })

  it('affiche le profil chargé par GET /candidatures/:id', async () => {
    const { wrapper } = await mountAt('/candidatures')
    await vi.waitFor(() => expect(wrapper.findAll('.candidate').length).toBeGreaterThan(0))

    await wrapper.findAll('.candidate')[0].trigger('click')
    await vi.waitFor(() => expect(wrapper.find('[role="dialog"]').exists()).toBe(true))

    expect(wrapper.get('.modal-content').text()).toMatch(/@/)
  })

  it('construit les colonnes du pipeline depuis GET /statuts', async () => {
    const { wrapper } = await mountAt('/statuts')

    await vi.waitFor(() => expect(wrapper.findAll('.board-column').length).toBeGreaterThan(0))
    expect(wrapper.findAll('.board-card').length).toBeGreaterThan(0)
    expect(wrapper.find('.error').exists()).toBe(false)
  })
})
