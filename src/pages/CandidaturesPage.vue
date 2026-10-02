<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CandidateFilters from '../components/CandidateFilters.vue'
import CandidateFormModal from '../components/CandidateFormModal.vue'
import CandidateList from '../components/CandidateList.vue'
import CandidateModal from '../components/CandidateModal.vue'
import { useCandidateDeepLink } from '../composables/useCandidateDeepLink'
import { useToast } from '../composables/useToast'
import { useCandidatesStore } from '../stores/candidates'
import type { CandidatureInput, Commentaire, Filters } from '../types'

const store = useCandidatesStore()
const { notify } = useToast()
const { candidate, open: openCandidate, close: closeCandidate } = useCandidateDeepLink()

const isCreating = ref(false)

const isEmpty = computed(() => !store.isLoadingList && store.candidates.length === 0)

function onSearch(query: string) {
  store.filters.query = query
  store.scheduleSearch()
}

function onFilterChange(changes: Partial<Filters>) {
  void store.applyFilters(changes)
}

function onReset() {
  void store.resetFilters()
}

function onPageChange(next: number) {
  void store.setPage(next)
}

async function updateStatus(status: string) {
  if (!candidate.value) return
  if (await store.patchCandidate(candidate.value.id, { statut: status })) notify('Statut mis à jour.')
}

async function addComment(content: string) {
  if (!candidate.value) return
  const note: Commentaire = {
    id: Date.now(),
    auteur: 'Marie Recruteuse',
    date: new Date().toISOString(),
    contenu: content
  }
  const commentaires = [...candidate.value.commentaires, note]
  if (await store.patchCandidate(candidate.value.id, { commentaires })) notify('Note ajoutée à la candidature.')
}

async function createCandidate(payload: CandidatureInput) {
  const created = await store.createCandidate(payload)
  if (!created) return
  isCreating.value = false
  notify(`Candidature de ${created.nom} créée.`)
}

async function removeCandidate() {
  if (!candidate.value) return
  const name = candidate.value.nom
  if (!window.confirm(`Supprimer définitivement la candidature de ${name} ?`)) return
  if (await store.removeCandidate(candidate.value.id)) {
    closeCandidate()
    notify('Candidature supprimée.')
  }
}

onMounted(() => {
  void store.initialize()
})
</script>

<template>
  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">Pipeline de recrutement</p>
        <h1>Les bons profils, au bon moment.</h1>
        <p>Filtrez, recherchez et mettez à jour chaque candidature : toutes les données proviennent de l’API JSON Server.</p>
      </div>
      <div class="hero-actions">
        <button class="button secondary" type="button" @click="isCreating = true">+ Ajouter</button>
        <button class="button" type="button" :disabled="store.isLoadingList" @click="store.initialize()">↻ Actualiser</button>
      </div>
    </section>

    <CandidateFilters
      :filters="store.filters"
      :statuses="store.statuses"
      :positions="store.positions"
      :skills="store.skills"
      @search="onSearch"
      @change="onFilterChange"
      @reset="onReset"
    />

    <section class="content">
      <div class="list-heading">
        <div>
          <h2>Candidatures</h2>
          <p>{{ store.resultLabel }} · page {{ store.page }} sur {{ store.pageCount }} · triées par date récente</p>
        </div>
        <span v-if="store.isLoadingList" class="loading" role="status">Chargement…</span>
      </div>

      <div v-if="store.listError" class="error" role="alert">
        <span aria-hidden="true">⚠</span>
        <div>
          <b>Les candidatures ne sont pas disponibles.</b>
          <p>{{ store.listError }}</p>
        </div>
        <button class="button secondary" type="button" @click="store.initialize()">Réessayer</button>
      </div>

      <template v-else>
        <CandidateList
          v-if="store.candidates.length"
          :candidates="store.candidates"
          :busy="store.isLoadingList"
          @select="openCandidate"
        />

        <div v-else-if="isEmpty" class="empty">
          <h3>{{ store.hasActiveFilters ? 'Aucun profil ne correspond à ces filtres' : 'Aucune candidature pour le moment' }}</h3>
          <button v-if="store.hasActiveFilters" class="button secondary" type="button" @click="onReset">Réinitialiser les filtres</button>
        </div>

        <nav v-if="store.pageCount > 1" class="pagination" aria-label="Pagination des candidatures">
          <button type="button" aria-label="Page précédente" :disabled="store.page === 1 || store.isLoadingList" @click="onPageChange(store.page - 1)">‹</button>
          <span>Page {{ store.page }} sur {{ store.pageCount }}</span>
          <button type="button" aria-label="Page suivante" :disabled="store.page === store.pageCount || store.isLoadingList" @click="onPageChange(store.page + 1)">›</button>
        </nav>
      </template>
    </section>

    <CandidateModal
      v-if="candidate"
      :candidate="candidate"
      :statuses="store.statuses"
      :saving="store.isSaving"
      :error="store.actionError"
      @close="closeCandidate"
      @update-status="updateStatus"
      @add-comment="addComment"
      @remove="removeCandidate"
    />

    <CandidateFormModal
      v-if="isCreating"
      :positions="store.positions"
      :statuses="store.statuses"
      :saving="store.isSaving"
      :error="store.actionError"
      @close="isCreating = false"
      @submit="createCandidate"
    />
  </main>
</template>