import { ref } from 'vue'

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'talentflow-theme'
export const DARK_QUERY = '(prefers-color-scheme: dark)'

const theme = ref<Theme>('light')

let watching = false
let mediaQuery: MediaQueryList | undefined

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function storeTheme(value: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value)
  } catch {
    
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

function apply(value: Theme) {
  document.documentElement.dataset.theme = value
  theme.value = value
}

export function initTheme(): Theme {
  apply(readStoredTheme() ?? systemTheme())

  if (!watching) {
    watching = true
    mediaQuery = window.matchMedia?.(DARK_QUERY)
    mediaQuery?.addEventListener?.('change', event => {
      if (!readStoredTheme()) apply(event.matches ? 'dark' : 'light')
    })
  }

  return theme.value
}

export function setTheme(value: Theme) {
  storeTheme(value)
  apply(value)
}

export function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}
export function disposeTheme() {
  mediaQuery?.removeEventListener?.('change', () => undefined)
  mediaQuery = undefined
  watching = false
}

export function useTheme() {
  return { theme, initTheme, setTheme, toggleTheme }
}
