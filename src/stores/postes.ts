import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { notifyAccounts } from '../composables/notifyAccounts'
import type { Poste, PosteInput } from '../types'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const usePostesStore = defineStore('postes', () => {
  const postes = ref<Poste[]>([])
  const counts = ref<Record<string, number>>({})
  const filters = ref({ query: '', skill: '' })
  const isLoadingList = ref(false)
  const isSaving = ref(false)
  const listError = ref('')
  const actionError = ref('')

  const skills = computed(() =>
    [...new Set(postes.value.flatMap(p => p.competencesRequises))].sort()
  )

  const filtered = computed(() => {
    const q = filters.value.query.trim().toLowerCase()
    return postes.value.filter(p =>
      (!q || p.titre.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!filters.value.skill || p.competencesRequises.includes(filters.value.skill))
    )
  })

  const hasActiveFilters = computed(() => !!(filters.value.query || filters.value.skill))
  const resultLabel = computed(() => {
    const n = filtered.value.length
    return `${n} poste${n > 1 ? 's' : ''}`
  })

  async function initialize() {
    isLoadingList.value = true
    listError.value = ''
    try {
      const [p, c] = await Promise.all([
        http<Poste[]>('/postes'),
        http<{ poste: string }[]>('/candidatures')
      ])
      postes.value = p
      counts.value = c.reduce<Record<string, number>>((acc, x) => {
        acc[x.poste] = (acc[x.poste] ?? 0) + 1
        return acc
      }, {})
    } catch (e) {
      listError.value = e instanceof Error ? e.message : 'Erreur inconnue'
    } finally {
      isLoadingList.value = false
    }
  }

  async function createPoste(payload: PosteInput) {
    isSaving.value = true
    actionError.value = ''
    try {
      const created = await http<Poste>('/postes', { method: 'POST', body: JSON.stringify(payload) })
      postes.value.push(created)
      await notifyAccounts('nouveau-poste', `Nouveau poste publié : ${created.titre}.`)
      return created
    } catch (e) {
      actionError.value = e instanceof Error ? e.message : 'Erreur inconnue'
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function removePoste(id: Poste['id']) {
    isSaving.value = true
    actionError.value = ''
    try {
      await http(`/postes/${id}`, { method: 'DELETE' })
      postes.value = postes.value.filter(p => p.id !== id)
      return true
    } catch (e) {
      actionError.value = e instanceof Error ? e.message : 'Erreur inconnue'
      return false
    } finally {
      isSaving.value = false
    }
  }

  function resetFilters() {
    filters.value = { query: '', skill: '' }
  }

  return {
    postes, counts, filters, skills, filtered, hasActiveFilters, resultLabel,
    isLoadingList, isSaving, listError, actionError,
    initialize, createPoste, removePoste, resetFilters
  }
})