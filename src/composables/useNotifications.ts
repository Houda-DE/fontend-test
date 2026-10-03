import { computed, ref } from 'vue'
import { api } from '../services/api'
import { getAccount } from '../accounts'
import { useToast } from './useToast'
import type { AppNotification } from '../types'

const ACCOUNT_KEY = 'talentflow-account'
const POLL_INTERVAL_MS = 5_000

const notifications = ref<AppNotification[]>([])
const currentAccountId = ref<string>(readStoredAccount())
const isPolling = ref(false)
const lastError = ref('')

let pollTimer: ReturnType<typeof setInterval> | undefined
let knownIds = new Set<number>()
let firstFetch = true
let subscribers = 0

function readStoredAccount(): string {
  try {
    return localStorage.getItem(ACCOUNT_KEY) ?? 'marie'
  } catch {
    return 'marie'
  }
}

export function useNotifications() {
  const { notify } = useToast()

  const account = computed(() => getAccount(currentAccountId.value))
  const unreadCount = computed(() => notifications.value.filter((n) => !n.lue).length)

  async function pull(): Promise<void> {
    try {
      const items = await api.getNotifications(currentAccountId.value)
      lastError.value = ''
      const fresh = items.filter((n) => !knownIds.has(n.id))
      if (!firstFetch) {
        for (const item of fresh) {
          notify(item.message, 'success')
        }
      }
      knownIds = new Set(items.map((n) => n.id))
      notifications.value = items
      firstFetch = false
    } catch (error) {
      lastError.value = error instanceof Error ? error.message : 'Erreur de chargement'
    }
  }

  function startPolling() {
    subscribers += 1
    if (subscribers > 1) return
    firstFetch = true
    void pull()
    isPolling.value = true
    pollTimer = setInterval(() => void pull(), POLL_INTERVAL_MS)
  }

  function stopPolling() {
    subscribers = Math.max(0, subscribers - 1)
    if (subscribers > 0) return
    clearInterval(pollTimer)
    pollTimer = undefined
    isPolling.value = false
  }

  async function switchAccount(id: string): Promise<void> {
    if (id === currentAccountId.value) return
    currentAccountId.value = id
    try {
      localStorage.setItem(ACCOUNT_KEY, id)
    } catch { /* stockage indisponible */ }
    firstFetch = true
    knownIds = new Set()
    notifications.value = []
    await pull()
  }

  async function markAllRead(): Promise<void> {
    const unread = notifications.value.filter((n) => !n.lue)
    await Promise.allSettled(unread.map((n) => api.markNotificationRead(n.id)))
    notifications.value = notifications.value.map((n) => ({ ...n, lue: true }))
  }

  return {
    notifications,
    account,
    currentAccountId,
    unreadCount,
    isPolling,
    lastError,
    startPolling,
    stopPolling,
    switchAccount,
    markAllRead,
    pull
  }
}
