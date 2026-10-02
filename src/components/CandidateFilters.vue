<script setup lang="ts">
import type { Competence, Filters, Poste, Statut } from '../types'

const props = defineProps<{
  filters: Filters
  statuses: Statut[]
  positions: Poste[]
  skills: Competence[]
}>()

const emit = defineEmits<{
  change: [changes: Partial<Filters>]
  search: [query: string]
  reset: []
}>()
</script>

<template>
  <section class="filters" aria-label="Filtres de candidatures">
    <label class="search" for="filter-search">
      <span aria-hidden="true">⌕</span>
      <input
        id="filter-search"
        type="search"
        :value="props.filters.query"
        placeholder="Rechercher un nom, poste ou compétence…"
        autocomplete="off"
        @input="emit('search', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label for="filter-statut">
      Statut
      <select id="filter-statut" :value="props.filters.statut" @change="emit('change', { statut: ($event.target as HTMLSelectElement).value })">
        <option value="">Tous les statuts</option>
        <option v-for="status in props.statuses" :key="status.id" :value="status.nom">{{ status.nom }}</option>
      </select>
    </label>

    <label for="filter-poste">
      Poste
      <select id="filter-poste" :value="props.filters.poste" @change="emit('change', { poste: ($event.target as HTMLSelectElement).value })">
        <option value="">Tous les postes</option>
        <option v-for="position in props.positions" :key="position.id" :value="position.titre">{{ position.titre }}</option>
      </select>
    </label>

    <label for="filter-competence">
      Compétence
      <select id="filter-competence" :value="props.filters.competence" @change="emit('change', { competence: ($event.target as HTMLSelectElement).value })">
        <option value="">Toutes les compétences</option>
        <option v-for="skill in props.skills" :key="skill.id" :value="skill.nom">{{ skill.nom }}</option>
      </select>
    </label>

    <label for="filter-date">
      Candidature depuis
      <input id="filter-date" type="date" :value="props.filters.dateFrom" @change="emit('change', { dateFrom: ($event.target as HTMLInputElement).value })" />
    </label>

    <button class="clear" type="button" @click="emit('reset')">Réinitialiser</button>
  </section>
</template>