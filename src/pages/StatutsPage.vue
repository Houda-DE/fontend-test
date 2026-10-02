<script setup lang="ts">
import { onMounted } from 'vue'
import CandidateModal from '../components/CandidateModal.vue'
import StatusColumn from '../components/StatusColumn.vue'
import { useCandidateDeepLink } from '../composables/useCandidateDeepLink'
import { useToast } from '../composables/useToast'
import { useCandidatesStore } from '../stores/candidates'
import { usePipelineStore } from '../stores/pipeline'

const candidates = useCandidatesStore()
const pipeline = usePipelineStore()
const { notify } = useToast()
const { candidate, open: openCandidate, close: closeCandidate } = useCandidateDeepLink()

/** Déplacement optimiste : PATCH `/candidatures/:id` puis rechargement de la colonne. */
async function move(id: number, statut: string) {
  const moved = pipeline.cards.find(card => card.id === id)
  const label = moved ? `${moved.nom} → ${statut}` : `Candidature → ${statut}`
  if (await pipeline.moveCandidate(id, statut)) notify(label)
}

async function updateStatus(status: string) {
  if (!candidate.value) return
  const id = candidate.value.id
  if (await candidates.patchCandidate(id, { statut: status })) {
    await pipeline.load()
    notify('Statut mis à jour.')
  }
}

async function addComment(content: string) {
  if (!candidate.value) return
  const note = { id: Date.now(), auteur: 'Marie Recruteuse', date: new Date().toISOString(), contenu: content }
  if (await candidates.patchCandidate(candidate.value.id, { commentaires: [...candidate.value.commentaires, note] })) {
    notify('Note ajoutée à la candidature.')
  }
}

onMounted(() => {
  void pipeline.load()
})
</script>

<template>
  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">Suivi du parcours</p>
        <h1>Un statut clair pour chaque profil.</h1>
        <p>
          Les colonnes proviennent de <code>GET /statuts</code>. Déposez une carte pour la déplacer : la mise à jour part en
          <code>PATCH /candidatures/:id</code>.
        </p>
      </div>
      <div class="hero-actions">
        <button class="button" type="button" :disabled="pipeline.isLoading" @click="pipeline.load()">↻ Actualiser</button>
      </div>
    </section>

    <section class="content">
      <div class="list-heading">
        <div>
          <h2>Pipeline</h2>
          <p>
            {{ pipeline.total }} candidature{{ pipeline.total > 1 ? 's' : '' }} au total
            <template v-if="pipeline.isTruncated"> · {{ pipeline.cards.length }} affichées sur cette page</template>
          </p>
        </div>
        <span v-if="pipeline.isLoading" class="loading" role="status">Chargement…</span>
      </div>

      <div v-if="pipeline.error" class="error" role="alert">
        <span aria-hidden="true">⚠</span>
        <div>
          <b>Le pipeline n’est pas disponible.</b>
          <p>{{ pipeline.error }}</p>
        </div>
        <button class="button secondary" type="button" @click="pipeline.load(true)">Réessayer</button>
      </div>

      <div v-else class="board">
        <StatusColumn
          v-for="column in pipeline.columns"
          :key="column.id"
          :column="column"
          :cards="pipeline.cardsOf(column.nom)"
          :statuses="pipeline.columns"
          :moving-id="pipeline.movingId"
          @select="openCandidate"
          @move="move"
        />
      </div>
    </section>

    <CandidateModal
      v-if="candidate"
      :candidate="candidate"
      :statuses="candidates.statuses"
      :saving="candidates.isSaving"
      :error="candidates.actionError"
      @close="closeCandidate"
      @update-status="updateStatus"
      @add-comment="addComment"
    />
  </main>
</template>