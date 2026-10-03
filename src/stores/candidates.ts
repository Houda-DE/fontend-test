import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api } from '../services/api'
import { notifyAccounts } from '../composables/notifyAccounts'
import type { Candidature, CandidatureInput, CandidatureQuery, Competence, Filters, Poste, Statut } from '../types'

const FILTER_KEY = 'talentflow-filters'
export const SEARCH_DEBOUNCE_MS = 350
export const PAGE_SIZE = 6

export const defaultFilters: Filters = { query: '', statut: '', poste: '', competence: '', dateFrom: '' }

function readPersistedFilters(): Partial<Filters> {
  try {
    const raw = localStorage.getItem(FILTER_KEY)
    return raw ? (JSON.parse(raw) as Partial<Filters>) : {}
  } catch {
    return {}
  }
}

function message(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export const useCandidatesStore = defineStore('candidates', () => {
  const candidates = ref<Candidature[]>([])
  const statuses = ref<Statut[]>([])
  const positions = ref<Poste[]>([])
  const skills = ref<Competence[]>([])

  const filters = ref<Filters>({ ...defaultFilters, ...readPersistedFilters() })
  const page = ref(1)
  const total = ref(0)

  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)
  const isSaving = ref(false)
  const listError = ref('')
  const detailError = ref('')
  const actionError = ref('')
  const metadataError = ref('')
  const metadataLoaded = ref(false)

  const selected = ref<Candidature | null>(null)

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
  const hasActiveFilters = computed(() => Object.values(filters.value).some(Boolean))
  const resultLabel = computed(() => `${total.value} candidature${total.value > 1 ? 's' : ''}`)

  function persistFilters() {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify(filters.value))
    } catch {
      /* stockage indisponible : la session reste utilisable sans persistance */
    }
  }

  // --- Requêtes liste : un seul vol à la fois, les réponses obsolètes sont ignorées ---
  let listController: AbortController | undefined
  let listToken = 0

  function buildQuery(): CandidatureQuery {
    return {
      q: filters.value.query || undefined,
      statut: filters.value.statut || undefined,
      poste: filters.value.poste || undefined,
      competences_like: filters.value.competence || undefined,
      dateCandidature_gte: filters.value.dateFrom || undefined,
      _page: page.value,
      _limit: PAGE_SIZE,
      _sort: 'dateCandidature',
      _order: 'desc'
    }
  }

  async function fetchCandidates(): Promise<void> {
    const token = ++listToken
    listController?.abort()
    const controller = new AbortController()
    listController = controller

    isLoadingList.value = true
    listError.value = ''

    try {
      const response = await api.getCandidatures(buildQuery(), { signal: controller.signal })
      if (token !== listToken) return
      candidates.value = response.data
      total.value = response.total
      const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE))
      if (page.value > lastPage) {
        page.value = lastPage
        await fetchCandidates()
      }
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'cancelled') return
      if (token !== listToken) return
      listError.value = message(error, 'Impossible de charger les candidatures.')
    } finally {
      if (token === listToken) isLoadingList.value = false
    }
  }

  // --- Filtres : reset de page + debounce sur la recherche temps réel ---
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  function cancelPendingSearch() {
    clearTimeout(searchTimer)
    searchTimer = undefined
  }

  function applyFilters(changes: Partial<Filters>) {
    cancelPendingSearch()
    filters.value = { ...filters.value, ...changes }
    page.value = 1
    persistFilters()
    return fetchCandidates()
  }

  function scheduleSearch(delay = SEARCH_DEBOUNCE_MS) {
    page.value = 1
    persistFilters()
    cancelPendingSearch()
    searchTimer = setTimeout(() => {
      searchTimer = undefined
      void fetchCandidates()
    }, delay)
  }

  function resetFilters() {
    return applyFilters({ ...defaultFilters })
  }

  function setPage(next: number) {
    const bounded = Math.min(Math.max(1, next), pageCount.value)
    if (bounded === page.value) return Promise.resolve()
    page.value = bounded
    return fetchCandidates()
  }

  // --- Référentiels (statuts, postes, compétences) : chargés une fois, mis en cache ---
  async function fetchMetadata(force = false): Promise<void> {
    if (metadataLoaded.value && !force) return
    metadataError.value = ''
    try {
      const [statuts, postes, competences] = await Promise.all([
        api.getStatuts(),
        api.getPostes(),
        api.getCompetences()
      ])
      statuses.value = [...statuts].sort((a, b) => (a.ordre ?? a.id) - (b.ordre ?? b.id))
      positions.value = postes
      skills.value = competences
      metadataLoaded.value = true
    } catch (error) {
      metadataError.value = message(error, 'Impossible de charger les référentiels.')
    }
  }

  // --- Détail, mutations ---
  async function selectCandidate(id: number): Promise<void> {
    detailError.value = ''
    isLoadingDetail.value = true
    try {
      selected.value = await api.getCandidature(id)
    } catch (error) {
      detailError.value = message(error, 'Impossible de charger ce profil.')
    } finally {
      isLoadingDetail.value = false
    }
  }

  function closeCandidate() {
    selected.value = null
    detailError.value = ''
  }

  function replaceCandidate(updated: Candidature) {
    candidates.value = candidates.value.map(item => (item.id === updated.id ? updated : item))
    if (selected.value?.id === updated.id) selected.value = updated
  }

  async function patchCandidate(id: number, changes: Partial<Candidature>): Promise<boolean> {
    const previousList = candidates.value
    const previousSelected = selected.value

    candidates.value = candidates.value.map(item => (item.id === id ? { ...item, ...changes } : item))
    if (selected.value?.id === id) selected.value = { ...selected.value, ...changes }

    isSaving.value = true
    actionError.value = ''
    try {
      replaceCandidate(await api.updateCandidature(id, changes))
      if ('statut' in changes) {
        await notifyAccounts('statut-mis-a-jour', `Statut de la candidature #${id} mis à jour : ${changes.statut}.`)
      }
      return true
    } catch (error) {
      candidates.value = previousList
      selected.value = previousSelected
      actionError.value = message(error, 'La mise à jour a échoué.')
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function createCandidate(payload: CandidatureInput): Promise<Candidature | null> {
    isSaving.value = true
    actionError.value = ''
    try {
      const created = await api.createCandidature(payload)
      await fetchCandidates()
      await notifyAccounts('nouvelle-candidature', `Nouvelle candidature : ${payload.nom} pour ${payload.poste}.`)
      return created
    } catch (error) {
      actionError.value = message(error, 'La création a échoué.')
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function removeCandidate(id: number): Promise<boolean> {
    isSaving.value = true
    actionError.value = ''
    try {
      await api.deleteCandidature(id)
      if (selected.value?.id === id) closeCandidate()
      if (page.value > 1 && candidates.value.length === 1) page.value -= 1
      await fetchCandidates()
      return true
    } catch (error) {
      actionError.value = message(error, 'La suppression a échoué.')
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function initialize(): Promise<void> {
    await Promise.all([fetchMetadata(), fetchCandidates()])
  }

  function clearActionError() {
    actionError.value = ''
  }

  return {
    candidates,
    statuses,
    positions,
    skills,
    filters,
    page,
    pageCount,
    total,
    resultLabel,
    hasActiveFilters,
    selected,
    isLoadingList,
    isLoadingDetail,
    isSaving,
    listError,
    detailError,
    actionError,
    metadataError,
    fetchCandidates,
    fetchMetadata,
    applyFilters,
    scheduleSearch,
    cancelPendingSearch,
    resetFilters,
    setPage,
    selectCandidate,
    closeCandidate,
    patchCandidate,
    createCandidate,
    removeCandidate,
    clearActionError,
    initialize
  }
})