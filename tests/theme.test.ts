import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DARK_QUERY,
  THEME_STORAGE_KEY,
  disposeTheme,
  initTheme,
  setTheme,
  toggleTheme,
  useTheme
} from '../src/composables/useTheme'

type Listener = (event: { matches: boolean }) => void

function stubMatchMedia(matches: boolean) {
  const listeners: Listener[] = []
  const query = {
    matches,
    media: DARK_QUERY,
    addEventListener: (_type: string, listener: Listener) => listeners.push(listener),
    removeEventListener: (_type: string, listener: Listener) => {
      const index = listeners.indexOf(listener)
      if (index >= 0) listeners.splice(index, 1)
    }
  }
  vi.stubGlobal('matchMedia', vi.fn(() => query))
  return {
    query,
    emit(next: boolean) {
      query.matches = next
      listeners.forEach(listener => listener({ matches: next }))
    },
    count: () => listeners.length
  }
}

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
  disposeTheme()
})

afterEach(() => {
  disposeTheme()
  vi.unstubAllGlobals()
})

describe('useTheme', () => {
  it('suit la préférence système quand aucun choix n’est enregistré', () => {
    stubMatchMedia(true)

    initTheme()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(useTheme().theme.value).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
  })

  it('retombe sur le mode clair si le système ne demande rien', () => {
    stubMatchMedia(false)

    initTheme()

    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('donne la priorité au choix enregistré', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    stubMatchMedia(true)

    initTheme()

    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('bascule entre clair et sombre et mémorise le choix', () => {
    stubMatchMedia(false)
    initTheme()

    toggleTheme()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    toggleTheme()

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('applique un thème demandé explicitement', () => {
    stubMatchMedia(false)
    initTheme()

    setTheme('dark')

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(useTheme().theme.value).toBe('dark')
  })

  it('suit les changements de préférence système tant que l’utilisateur n’a pas choisi', () => {
    const media = stubMatchMedia(false)
    initTheme()

    media.emit(true)
    expect(document.documentElement.dataset.theme).toBe('dark')

    setTheme('light')
    media.emit(true)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('n’enregistre qu’un seul écouteur système', () => {
    const media = stubMatchMedia(false)

    initTheme()
    initTheme()

    expect(media.count()).toBe(1)
  })

  it('fonctionne sans l’API matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)

    expect(initTheme()).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
