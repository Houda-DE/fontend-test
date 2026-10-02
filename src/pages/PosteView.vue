<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PosteFormModal from '../components/PostFormModal.vue'

import { useToast } from '../composables/useToast'
import { usePostesStore } from '../stores/postes'
import type { Poste, PosteInput } from '../types'

const store = usePostesStore()
const { notify } = useToast()
const isCreating = ref(false)

function initials(title: string) {
  return title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

async function createPoste(payload: PosteInput) {
  const created = await store.createPoste(payload)
  if (!created) return
  isCreating.value = false
  notify(`Poste « ${created.titre} » créé.`)
}

async function removePoste(poste: Poste) {
  const n = store.counts[poste.titre] ?? 0
  const warning = n ? `\n${n} candidature(s) y sont rattachée(s).` : ''
  if (!window.confirm(`Supprimer le poste « ${poste.titre} » ?${warning}`)) return
  if (await store.removePoste(poste.id)) notify('Poste supprimé.')
}

onMounted(() => {
  void store.initialize()
})
</script>

<template>
  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">Offres</p>
        <h1>Les postes à pourvoir.</h1>
        <p>Consultez les postes ouverts, leurs compétences requises et le nombre de candidatures associées.</p>
      </div>
      <div class="hero-actions">
        <button class="button secondary" type="button" @click="isCreating = true">+ Ajouter</button>
        <button class="button" type="button" :disabled="store.isLoadingList" @click="store.initialize()">↻ Actualiser</button>
      </div>
    </section>

    <section class="filters poste-filters">
      <label class="search">
        Recherche
        <span aria-hidden="true">⌕</span>
        <input v-model="store.filters.query" type="search" placeholder="Titre ou description" />
      </label>
      <label>
        Compétence
        <select v-model="store.filters.skill">
          <option value="">Toutes</option>
          <option v-for="s in store.skills" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <button v-if="store.hasActiveFilters" class="clear" type="button" @click="store.resetFilters()">Réinitialiser</button>
    </section>

    <section class="content">
      <div class="list-heading">
        <div>
          <h2>Postes</h2>
          <p>{{ store.resultLabel }}</p>
        </div>
        <span v-if="store.isLoadingList" class="loading" role="status">Chargement…</span>
      </div>

      <div v-if="store.listError" class="error" role="alert">
        <span aria-hidden="true">⚠</span>
        <div>
          <b>Les postes ne sont pas disponibles.</b>
          <p>{{ store.listError }}</p>
        </div>
        <button class="button secondary" type="button" @click="store.initialize()">Réessayer</button>
      </div>

      <template v-else>
        <div v-if="store.filtered.length" class="candidate-list">
          <div v-for="p in store.filtered" :key="p.id" class="candidate poste">
            <div class="avatar">{{ initials(p.titre) }}</div>
            <div class="candidate-main">
              <strong>{{ p.titre }}</strong>
              <span>{{ p.description }}</span>
              <span class="skills">{{ p.competencesRequises.join(' · ') }}</span>
            </div>
            <div class="candidate-meta">
              <span class="status interview">{{ store.counts[p.titre] ?? 0 }} candidature(s)</span>
              <button class="delete-button" type="button" @click="removePoste(p)">Supprimer</button>
            </div>
          </div>
        </div>

        <div v-else-if="!store.isLoadingList" class="empty">
          <h3>{{ store.hasActiveFilters ? 'Aucun poste ne correspond à ces filtres' : 'Aucun poste pour le moment' }}</h3>
          <button v-if="store.hasActiveFilters" class="button secondary" type="button" @click="store.resetFilters()">Réinitialiser les filtres</button>
        </div>
      </template>
    </section>

    <PosteFormModal
      v-if="isCreating"
      :saving="store.isSaving"
      :error="store.actionError"
      @close="isCreating = false"
      @submit="createPoste"
    />
  </main>
</template>

<style scoped>
.poste-filters { grid-template-columns: 2fr 1fr auto; }
.poste { grid-template-columns: 45px 1fr auto; }

@media (max-width: 800px) {
  .poste-filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 550px) {
  .poste-filters { grid-template-columns: 1fr; }
  .poste { grid-template-columns: 40px 1fr; }
  .poste .candidate-meta { grid-column: 2; }
}
</style>