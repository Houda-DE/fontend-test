import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, toQueryString } from '../src/services/api'
import { candidature, jsonResponse, nouveauProfil } from './fixtures'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toQueryString', () => {
  it('ignore les valeurs vides et encode les valeurs', () => {
    expect(toQueryString({ q: 'Vue.js', statut: '', poste: undefined, _page: 2 })).toBe('?q=Vue.js&_page=2')
  })

  it('renvoie une chaîne vide quand aucun paramètre', () => {
    expect(toQueryString({ q: '' })).toBe('')
  })
})

describe('api.getCandidatures', () => {
  it('envoie les query params JSON Server et lit X-Total-Count', async () => {
    fetchMock.mockResolvedValue(jsonResponse([candidature], { headers: { 'X-Total-Count': '12' } }))

    const result = await api.getCandidatures({ statut: 'En attente', q: 'Vue', _page: 1, _limit: 6 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/candidatures?statut=En+attente&q=Vue&_page=1&_limit=6')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result.total).toBe(12)
    expect(result.data).toEqual([candidature])
  })

  it('retombe sur la taille de la page si l’en-tête est absent', async () => {
    fetchMock.mockResolvedValue(jsonResponse([candidature]))

    const result = await api.getCandidatures()

    expect(result.total).toBe(1)
  })

  it('remonte une erreur explicite sur 404', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'not found' }, { status: 404 }))

    await expect(api.getCandidature(999)).rejects.toMatchObject({
      kind: 'http',
      status: 404,
      message: 'La ressource demandée est introuvable.'
    })
  })
})

describe('api réseau', () => {
  it('traduit un échec réseau en message actionnable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(api.getStatuts()).rejects.toMatchObject({
      kind: 'network',
      message: 'Impossible de joindre l’API. Vérifiez que JSON Server est lancé.'
    })
  })

  it('signale le timeout quand la requête dépasse le délai', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
    )

    const pending = api.getCandidatures({ _page: 1 }, { timeout: 50 })
    const assertion = expect(pending).rejects.toMatchObject({ kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(60)
    await assertion
    vi.useRealTimers()
  })

  it('distingue une requête annulée par l’interface', async () => {
    const controller = new AbortController()
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
    )

    const pending = api.getCandidatures({}, { signal: controller.signal })
    controller.abort()

    await expect(pending).rejects.toMatchObject({ kind: 'cancelled' })
  })
})

describe('api écriture', () => {
  it('envoie un POST avec le corps JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 13, ...nouveauProfil }))

    await api.createCandidature(nouveauProfil)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/candidatures$/)
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual(nouveauProfil)
  })

  it('envoie un PATCH partiel sur une candidature', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...candidature, statut: 'Entretien RH' }))

    const updated = await api.updateCandidature(1, { statut: 'Entretien RH' })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ statut: 'Entretien RH' })
    expect(updated.statut).toBe('Entretien RH')
  })

  it('accepte une réponse DELETE sans corps utile', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await expect(api.deleteCandidature(1)).resolves.toEqual({})
  })

  it('remonte une erreur de parsing sur une réponse illisible', async () => {
    fetchMock.mockResolvedValue(new Response('pas du json', { status: 200 }))

    await expect(api.getCandidature(1)).rejects.toBeInstanceOf(ApiError)
  })
})