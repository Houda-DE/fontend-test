import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCandidatesStore } from '../stores/candidates'

export function useCandidateDeepLink() {
  const route = useRoute()
  const router = useRouter()
  const store = useCandidatesStore()

  const candidate = computed(() => store.selected)
  const isOpen = computed(() => candidate.value !== null)

  function open(id: number) {
    return router.push({ query: { ...route.query, candidat: String(id) } })
  }

  function close() {
    const { candidat, ...rest } = route.query
    void candidat
    return router.push({ query: rest })
  }

  watch(
    () => route.query.candidat,
    async (value) => {
      const id = Number(Array.isArray(value) ? value[0] : value)
      if (!Number.isInteger(id) || id <= 0) {
        store.closeCandidate()
        return
      }
      if (store.selected?.id !== id) await store.selectCandidate(id)
    },
    { immediate: true }
  )

  return { candidate, isOpen, open, close }
}