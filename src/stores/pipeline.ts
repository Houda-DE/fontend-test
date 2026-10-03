import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api } from '../services/api'
import { notifyAccounts } from '../composables/notifyAccounts'
import { useCandidatesStore } from './candidates'
import type { Candidature, Statut } from '../types'

const BOARD_LIMIT = 50

function message(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export const usePipelineStore = defineStore('pipeline', () => {
  const columns = ref<Statut[]>([])
  const cards = ref<Candidature[]>([])
  const total = ref(0)
  const movingId = ref<number | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  const byStatus = computed(() => {
    const grouped: Record<string, Candidature[]> = {}
    for (const column of columns.value) grouped[column.nom] = []
    for (const candidate of cards.value) (grouped[candidate.statut] ??= []).push(candidate)
    return grouped
  })

  const isTruncated = computed(() => total.value > cards.value.length)

  function cardsOf(statut: string): Candidature[] {
    return byStatus.value[statut] ?? []
  }

  async function load(force = false): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      const reference = useCandidatesStore()
      await reference.fetchMetadata(force)
      if (reference.statuses.length === 0) {
        columns.value = []
        error.value = reference.metadataError || 'Aucun statut disponible.'
        return
      }
      columns.value = reference.statuses
      const response = await api.getCandidatures({
        _sort: 'dateCandidature',
        _order: 'desc',
        _limit: BOARD_LIMIT
      })
      cards.value = response.data
      total.value = response.total
    } catch (exception) {
      error.value = message(exception, 'Impossible de charger le pipeline.')
    } finally {
      isLoading.value = false
    }
  }

  async function moveCandidate(id: number, statut: string): Promise<boolean> {
    const current = cards.value.find(card => card.id === id)
    if (!current || current.statut === statut) return true

    const previousCards = cards.value
    cards.value = cards.value.map(card => (card.id === id ? { ...card, statut } : card))
    movingId.value = id
    error.value = ''

    try {
      const updated = await api.updateCandidature(id, { statut })
      cards.value = cards.value.map(card => (card.id === id ? updated : card))
      await notifyAccounts('statut-mis-a-jour', `Statut de la candidature #${id} mis à jour : ${statut}.`)
      return true
    } catch (exception) {
      cards.value = previousCards
      error.value = message(exception, 'Le déplacement a échoué.')
      return false
    } finally {
      movingId.value = null
    }
  }

  return {
    columns,
    cards,
    byStatus,
    total,
    isTruncated,
    isLoading,
    error,
    movingId,
    load,
    cardsOf,
    moveCandidate
  }
})