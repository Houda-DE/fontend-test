import type {
  AppNotification,
  AppNotificationInput,
  Candidature,
  CandidatureInput,
  CandidatureQuery,
  Competence,
  ListResponse,
  Poste,
  Statut
} from '../types'

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const DEFAULT_TIMEOUT = 8_000

export type ApiErrorKind = 'network' | 'timeout' | 'cancelled' | 'http' | 'parsing'

/** Erreur normalisée : l'UI ne connaît que `message` et `kind`. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null

  constructor(message: string, kind: ApiErrorKind, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export interface SendOptions extends Omit<RequestInit, 'signal'> {
  timeout?: number
  signal?: AbortSignal
}

type QueryValue = string | number | undefined | null

/** Construit la query string JSON Server, en ignorant les valeurs vides. */
export function toQueryString(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

function httpError(status: number): ApiError {
  if (status === 404) return new ApiError('La ressource demandée est introuvable.', 'http', status)
  if (status >= 500) return new ApiError(`L’API a répondu par une erreur serveur (${status}).`, 'http', status)
  return new ApiError(`Requête refusée par l’API (${status}).`, 'http', status)
}

async function send(path: string, { timeout = DEFAULT_TIMEOUT, signal, ...init }: SendOptions = {}): Promise<Response> {
  const controller = new AbortController()
  let expired = false

  const forwardAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', forwardAbort, { once: true })
  }

  const timer = timeout > 0
    ? setTimeout(() => { expired = true; controller.abort() }, timeout)
    : undefined

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers
      }
    })
  } catch {
    if (signal?.aborted) throw new ApiError('Requête annulée.', 'cancelled')
    if (expired) throw new ApiError('La requête a expiré. Réessayez.', 'timeout')
    throw new ApiError('Impossible de joindre l’API. Vérifiez que JSON Server est lancé.', 'network')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const body = await response.text()
  if (!body) return undefined as T
  try {
    return JSON.parse(body) as T
  } catch {
    throw new ApiError('L’API a renvoyé une réponse illisible.', 'parsing', response.status)
  }
}

async function request<T>(path: string, options?: SendOptions): Promise<T> {
  const response = await send(path, options)
  if (!response.ok) throw httpError(response.status)
  return readJson<T>(response)
}

/** Retourne la page de résultats et le total global (en-tête `X-Total-Count`). */
async function list<T>(path: string, query: string, options?: SendOptions): Promise<ListResponse<T>> {
  const response = await send(`${path}${query}`, options)
  if (!response.ok) throw httpError(response.status)
  const data = await readJson<T[]>(response)
  const rows = Array.isArray(data) ? data : []
  const header = response.headers.get('X-Total-Count')
  const total = header === null ? Number.NaN : Number(header)
  return { data: rows, total: Number.isFinite(total) ? total : rows.length }
}

export const api = {
  getCandidatures(query: CandidatureQuery = {}, options?: SendOptions): Promise<ListResponse<Candidature>> {
    return list<Candidature>('/candidatures', toQueryString(query as Record<string, QueryValue>), options)
  },

  getCandidature(id: number, options?: SendOptions): Promise<Candidature> {
    return request<Candidature>(`/candidatures/${id}`, options)
  },

  createCandidature(payload: CandidatureInput, options?: SendOptions): Promise<Candidature> {
    return request<Candidature>('/candidatures', { ...options, method: 'POST', body: JSON.stringify(payload) })
  },

  updateCandidature(id: number, changes: Partial<Candidature>, options?: SendOptions): Promise<Candidature> {
    return request<Candidature>(`/candidatures/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(changes) })
  },

  deleteCandidature(id: number, options?: SendOptions): Promise<unknown> {
    return request<unknown>(`/candidatures/${id}`, { ...options, method: 'DELETE' })
  },

  getStatuts(options?: SendOptions): Promise<Statut[]> {
    return request<Statut[]>('/statuts', options)
  },

  getPostes(options?: SendOptions): Promise<Poste[]> {
    return request<Poste[]>('/postes', options)
  },

  getCompetences(options?: SendOptions): Promise<Competence[]> {
    return request<Competence[]>('/competences', options)
  },

  getNotifications(utilisateur: string, options?: SendOptions): Promise<AppNotification[]> {
    const query = toQueryString({ utilisateur, _sort: 'date', _order: 'desc' })
    return request<AppNotification[]>(`/notifications${query}`, options)
  },

  createNotification(payload: AppNotificationInput, options?: SendOptions): Promise<AppNotification> {
    return request<AppNotification>('/notifications', { ...options, method: 'POST', body: JSON.stringify(payload) })
  },

  markNotificationRead(id: number, options?: SendOptions): Promise<AppNotification> {
    return request<AppNotification>(`/notifications/${id}`, { ...options, method: 'PATCH', body: JSON.stringify({ lue: true }) })
  }
}