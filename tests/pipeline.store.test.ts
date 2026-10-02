import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../src/services/api'
import { useCandidatesStore } from '../src/stores/candidates'
import { usePipelineStore } from '../src/stores/pipeline'
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

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
  api.getStatuts.mockResolvedValue(statuts)
  api.getPostes.mockResolvedValue([])
  api.getCompetences.mockResolvedValue([])
})

describe('pipeline store', () => {
  it('construit les colonnes depuis GET /statuts et regroupe les candidatures', async () => {
    api.getCandidatures.mockResolvedValue({ data: [candidature, autreCandidature], total: 2 })
    const pipeline = usePipelineStore()

    await pipeline.load()

    expect(pipeline.columns.map(column => column.nom)).toEqual(['En attente', 'Entretien RH', 'Refusé'])
    expect(pipeline.cardsOf('En attente')).toHaveLength(1)
    expect(pipeline.cardsOf('Entretien RH')).toHaveLength(1)
    expect(pipeline.cardsOf('Refusé')).toHaveLength(0)
    expect(api.getCandidatures).toHaveBeenCalledWith({ _sort: 'dateCandidature', _order: 'desc', _limit: 50 })
  })

  it('signale une troncature quand la page ne contient pas tout le total', async () => {
    api.getCandidatures.mockResolvedValue({ data: [candidature], total: 42 })
    const pipeline = usePipelineStore()

    await pipeline.load()

    expect(pipeline.isTruncated).toBe(true)
    expect(pipeline.total).toBe(42)
  })

  it('déplace une carte de façon optimiste puis persiste le statut', async () => {
    api.getCandidatures.mockResolvedValue({ data: [candidature], total: 1 })
    api.updateCandidature.mockResolvedValue({ ...candidature, statut: 'Refusé' })
    const pipeline = usePipelineStore()
    await pipeline.load()

    const pending = pipeline.moveCandidate(1, 'Refusé')
    expect(pipeline.cardsOf('Refusé')).toHaveLength(1)
    expect(pipeline.cardsOf('En attente')).toHaveLength(0)

    await expect(pending).resolves.toBe(true)
    expect(api.updateCandidature).toHaveBeenCalledWith(1, { statut: 'Refusé' })
  })

  it('remet la carte à sa place si le PATCH échoue', async () => {
    api.getCandidatures.mockResolvedValue({ data: [candidature], total: 1 })
    api.updateCandidature.mockRejectedValue(new ApiError('Le déplacement a échoué.', 'network'))
    const pipeline = usePipelineStore()
    await pipeline.load()

    await expect(pipeline.moveCandidate(1, 'Refusé')).resolves.toBe(false)

    expect(pipeline.cardsOf('En attente')).toHaveLength(1)
    expect(pipeline.error).toBe('Le déplacement a échoué.')
    expect(pipeline.movingId).toBeNull()
  })

  it('ignore un déplacement vers le statut déjà appliqué', async () => {
    api.getCandidatures.mockResolvedValue({ data: [candidature], total: 1 })
    const pipeline = usePipelineStore()
    await pipeline.load()

    await expect(pipeline.moveCandidate(1, 'En attente')).resolves.toBe(true)
    expect(api.updateCandidature).not.toHaveBeenCalled()
  })

  it('remonte une erreur de chargement', async () => {
    api.getCandidatures.mockRejectedValue(new ApiError('Impossible de joindre l’API.', 'network'))
    const pipeline = usePipelineStore()

    await pipeline.load()

    expect(pipeline.error).toBe('Impossible de joindre l’API.')
    expect(pipeline.cards).toEqual([])
  })

  it('réutilise les référentiels déjà chargés', async () => {
    api.getCandidatures.mockResolvedValue({ data: [], total: 0 })
    const pipeline = usePipelineStore()

    await pipeline.load()
    await pipeline.load()

    expect(api.getStatuts).toHaveBeenCalledTimes(1)
  })

  it('affiche l’erreur des référentiels si aucun statut n’est disponible', async () => {
    api.getStatuts.mockRejectedValue(new ApiError('Impossible de charger les référentiels.', 'network'))
    const pipeline = usePipelineStore()

    await pipeline.load()

    expect(pipeline.error).toBe('Impossible de charger les référentiels.')
    expect(api.getCandidatures).not.toHaveBeenCalled()
  })
})

describe('partage d’état entre les deux pages', () => {
  it('expose les mêmes statuts au store candidatures', async () => {
    api.getCandidatures.mockResolvedValue({ data: [], total: 0 })
    const pipeline = usePipelineStore()
    const candidates = useCandidatesStore()

    await pipeline.load()

    expect(candidates.statuses).toEqual(pipeline.columns)
  })
})