import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '../src/components/AppHeader.vue'
import { disposeTheme, initTheme } from '../src/composables/useTheme'
import CandidaturesPage from '../src/pages/CandidaturesPage.vue'
import StatutsPage from '../src/pages/StatutsPage.vue'

vi.mock('../src/services/api', () => ({
  api: {
    getCandidatures: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    getStatuts: vi.fn().mockResolvedValue([]),
    getPostes: vi.fn().mockResolvedValue([]),
    getCompetences: vi.fn().mockResolvedValue([])
  }
}))

async function mountHeader() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/candidatures', name: 'candidatures', component: CandidaturesPage },
      { path: '/statuts', name: 'statuts', component: StatutsPage }
    ]
  })
  await router.push('/candidatures')
  await router.isReady()
  return mount(AppHeader, { global: { plugins: [createPinia(), router] } })
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  disposeTheme()
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})

afterEach(() => {
  disposeTheme()
  vi.unstubAllGlobals()
})

describe('bascule de thème', () => {
  it('propose un bouton accessible qui bascule le thème du document', async () => {
    initTheme()
    const wrapper = await mountHeader()
    const button = wrapper.get('.theme-toggle')

    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('aria-label')).toBe('Passer en mode sombre')

    await button.trigger('click')

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('aria-label')).toBe('Passer en mode clair')

    await button.trigger('click')

    expect(document.documentElement.dataset.theme).toBe('light')
    wrapper.unmount()
  })
})
