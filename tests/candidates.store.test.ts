import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, toQueryString } from '../src/services/api'
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS, useCandidatesStore } from '../src/stores/candidates'
import { autreCandidature, candidature, jsonResponse, nouveauProfil, statuts } from './fixtures'

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

const page = (rows = [candidature], total = 12) => ({ data: rows, total })
const lastQuery = () => api.getCandidatures.mock.calls.at(-1)?.[0]

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
  api.getStatuts.mockResolvedValue(statuts)
  api.getPostes.mockResolvedValue([{ id: 1, titre: 'Développeur Vue.js', description: '', competencesRequises: ['Vue.js'] }])
  api.getCompetences.mockResolvedValue([{ id: 1, nom: 'Vue.js', categorie: 'Frontend' }])
  api.getCandidatures.mockResolvedValue(page())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('candidates store — chargement', () => {
  it('charge les référentiels en parallèle et les met en cache', async () => {
    const store = useCandidatesStore()

    await store.initialize()

    expect(store.statuses.map(item => item.nom)).toEqual(['En attente', 'Entretien RH', 'Refusé'])
    expect(store.positions).toHaveLength(1)
    expect(store.skills).toHaveLength(1)
    expect(store.metadataError).toBe('')

    await store.fetchMetadata()
    expect(api.getStatuts).toHaveBeenCalledTimes(1)

    await store.fetchMetadata(true)
    expect(api.getStatuts).toHaveBeenCalledTimes(2)
  })

  it('construit la requête JSON Server avec filtres, tri et pagination', async () => {
    const store = useCandidatesStore()

    await store.applyFilters({ statut: 'En attente', query: 'Vue', competence: 'Pinia', poste: 'Développeur Vue.js', dateFrom: '2024-01-20' })

    expect(lastQuery()).toMatchObject({
      statut: 'En attente',
      q: 'Vue',
      competences_like: 'Pinia',
      poste: 'Développeur Vue.js',
      dateCandidature_gte: '2024-01-20',
      _page: 1,
      _limit: PAGE_SIZE,
      _sort: 'dateCandidature',
      _order: 'desc'
    })
  })

  it('retire les filtres vides de la requête', async () => {
    const store = useCandidatesStore()

    await store.applyFilters({ statut: '', query: '', competence: '', poste: '', dateFrom: '' })

    expect(lastQuery()).toMatchObject({
      statut: undefined,
      q: undefined,
      competences_like: undefined,
      poste: undefined,
      dateCandidature_gte: undefined
    })
    expect(toQueryString(lastQuery() as Record<string, string | number | undefined>)).toBe('?_page=1&_limit=6&_sort=dateCandidature&_order=desc')
  })

  it('expose le nombre de pages grâce à X-Total-Count', async () => {
    const store = useCandidatesStore()

    await store.fetchCandidates()

    expect(store.total).toBe(12)
    expect(store.pageCount).toBe(2)
    expect(store.resultLabel).toBe('12 candidatures')
  })

  it('affiche un message d’erreur et permet de réessayer', async () => {
    const store = useCandidatesStore()
    api.getCandidatures.mockRejectedValueOnce(new ApiError('Impossible de joindre l’API.', 'network'))

    await store.fetchCandidates()
    expect(store.listError).toBe('Impossible de joindre l’API.')
    expect(store.isLoadingList).toBe(false)

    await store.fetchCandidates()
    expect(store.listError).toBe('')
    expect(store.candidates).toHaveLength(1)
  })

  it('ignore la réponse d’une requête devenue obsolète', async () => {
    const store = useCandidatesStore()
    let resolveFirst: (value: ReturnType<typeof page>) => void = () => {}
    api.getCandidatures
      .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
      .mockResolvedValueOnce(page([autreCandidature], 1))

    const first = store.fetchCandidates()
    await store.applyFilters({ query: 'Vue' })
    resolveFirst(page([candidature], 12))
    await first

    expect(store.candidates).toEqual([autreCandidature])
  })
})

describe('candidates store — filtres et pagination', () => {
  it('persiste les filtres et revient à la page 1', async () => {
    const store = useCandidatesStore()

    await store.applyFilters({ statut: 'Entretien RH' })
    await store.setPage(2)
    expect(store.page).toBe(2)

    await store.applyFilters({ poste: 'Développeur Frontend' })

    expect(store.page).toBe(1)
    expect(JSON.parse(localStorage.getItem('talentflow-filters') ?? '{}')).toMatchObject({
      statut: 'Entretien RH',
      poste: 'Développeur Frontend'
    })
  })

  it('restaure les filtres enregistrés au démarrage', () => {
    localStorage.setItem('talentflow-filters', JSON.stringify({ query: 'Vue' }))

    const store = useCandidatesStore()

    expect(store.filters.query).toBe('Vue')
  })

  it('ignore un filtre illisible dans le stockage local', () => {
    localStorage.setItem('talentflow-filters', '{oops')

    const store = useCandidatesStore()

    expect(store.filters.query).toBe('')
  })

  it('borde la pagination et ne relance rien si la page ne change pas', async () => {
    const store = useCandidatesStore()
    await store.fetchCandidates()

    await store.setPage(99)
    expect(store.page).toBe(2)

    const calls = api.getCandidatures.mock.calls.length
    await store.setPage(2)
    expect(api.getCandidatures.mock.calls.length).toBe(calls)
  })

  it('revient sur une page valide si le total rétrécit', async () => {
    const store = useCandidatesStore()
    api.getCandidatures.mockResolvedValue(page([candidature], 12))
    await store.fetchCandidates()
    await store.setPage(2)

    api.getCandidatures.mockResolvedValue(page([], 3))
    await store.fetchCandidates()

    expect(store.page).toBe(1)
  })

  it('debounce la recherche temps réel', async () => {
    vi.useFakeTimers()
    const store = useCandidatesStore()
    const calls = api.getCandidatures.mock.calls.length

    store.scheduleSearch()
    store.scheduleSearch()
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1)
    expect(api.getCandidatures.mock.calls.length).toBe(calls)

    await vi.advanceTimersByTimeAsync(10)

    expect(api.getCandidatures.mock.calls.length).toBe(calls + 1)
  })

  it('annule le debounce quand un filtre est appliqué', async () => {
    vi.useFakeTimers()
    const store = useCandidatesStore()

    store.scheduleSearch()
    await store.applyFilters({ statut: 'Accepté' })
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS + 50)

    expect(api.getCandidatures.mock.calls.length).toBe(1)
  })

  it('réinitialise tous les filtres', async () => {
    const store = useCandidatesStore()
    await store.applyFilters({ statut: 'Accepté', query: 'Vue' })

    await store.resetFilters()

    expect(store.filters).toMatchObject({ statut: '', query: '', poste: '', competence: '', dateFrom: '' })
    expect(store.hasActiveFilters).toBe(false)
  })
})

describe('candidates store — détail et écritures', () => {
  it('charge le détail d’une candidature', async () => {
    const store = useCandidatesStore()
    api.getCandidature.mockResolvedValue(candidature)

    await store.selectCandidate(1)

    expect(store.selected).toEqual(candidature)
    expect(store.isLoadingDetail).toBe(false)
  })

  it('remonte l’erreur de détail sans casser la liste', async () => {
    const store = useCandidatesStore()
    await store.fetchCandidates()
    api.getCandidature.mockRejectedValue(new ApiError('La ressource demandée est introuvable.', 'http', 404))

    await store.selectCandidate(999)

    expect(store.detailError).toBe('La ressource demandée est introuvable.')
    expect(store.selected).toBeNull()
    expect(store.candidates).toHaveLength(1)
  })

  it('applique un statut de façon optimiste puis confirme', async () => {
    const store = useCandidatesStore()
    api.getCandidatures.mockResolvedValue(page([candidature], 1))
    await store.fetchCandidates()
    api.updateCandidature.mockResolvedValue({ ...candidature, statut: 'Entretien RH' })

    await expect(store.patchCandidate(1, { statut: 'Entretien RH' })).resolves.toBe(true)

    expect(api.updateCandidature).toHaveBeenCalledWith(1, { statut: 'Entretien RH' })
    expect(store.candidates[0].statut).toBe('Entretien RH')
  })

  it('restaure l’état précédent si la mise à jour optimiste échoue', async () => {
    const store = useCandidatesStore()
    api.getCandidatures.mockResolvedValue(page([candidature], 1))
    await store.fetchCandidates()
    api.updateCandidature.mockRejectedValue(new ApiError('La requête a expiré. Réessayez.', 'timeout'))

    await expect(store.patchCandidate(1, { statut: 'Accepté' })).resolves.toBe(false)

    expect(store.candidates[0].statut).toBe('En attente')
    expect(store.actionError).toBe('La requête a expiré. Réessayez.')
    expect(store.isSaving).toBe(false)
  })

  it('ajoute un commentaire via PATCH', async () => {
    const store = useCandidatesStore()
    const commentaire = { id: 9, auteur: 'Marie Recruteuse', date: '2024-02-02T10:00:00Z', contenu: 'À convoquer' }
    api.updateCandidature.mockResolvedValue({ ...candidature, commentaires: [commentaire] })

    await expect(store.patchCandidate(1, { commentaires: [commentaire] })).resolves.toBe(true)

    expect(api.updateCandidature).toHaveBeenCalledWith(1, { commentaires: [commentaire] })
  })

  it('crée une candidature puis recharge la page courante', async () => {
    const store = useCandidatesStore()
    api.createCandidature.mockResolvedValue({ id: 13, ...nouveauProfil })

    const created = await store.createCandidate(nouveauProfil)

    expect(created?.id).toBe(13)
    expect(api.createCandidature).toHaveBeenCalledWith(nouveauProfil)
    expect(api.getCandidatures).toHaveBeenCalledTimes(1)
    expect(store.actionError).toBe('')
  })

  it('signale un échec de création', async () => {
    const store = useCandidatesStore()
    api.createCandidature.mockRejectedValue(new ApiError('La création a échoué.', 'http', 422))

    await expect(store.createCandidate(nouveauProfil)).resolves.toBeNull()
    expect(store.actionError).toBe('La création a échoué.')
  })

  it('supprime une candidature, ferme le détail et recharge la liste', async () => {
    const store = useCandidatesStore()
    api.getCandidatures.mockResolvedValue(page([candidature], 1))
    await store.fetchCandidates()
    api.getCandidature.mockResolvedValue(candidature)
    await store.selectCandidate(1)
    api.deleteCandidature.mockResolvedValue({})
    api.getCandidatures.mockResolvedValue(page([], 0))

    await expect(store.removeCandidate(1)).resolves.toBe(true)

    expect(api.deleteCandidature).toHaveBeenCalledWith(1)
    expect(store.selected).toBeNull()
    expect(store.candidates).toEqual([])
  })

  it('remonte un échec de suppression', async () => {
    const store = useCandidatesStore()
    api.deleteCandidature.mockRejectedValue(new ApiError('La suppression a échoué.', 'network'))

    await expect(store.removeCandidate(1)).resolves.toBe(false)
    expect(store.actionError).toBe('La suppression a échoué.')
  })
})