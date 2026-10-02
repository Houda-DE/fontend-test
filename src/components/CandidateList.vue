<script setup lang="ts">
import type { Candidature } from '../types'
import StatusBadge from './StatusBadge.vue'

defineProps<{ candidates: Candidature[]; busy?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
const formatDate = (value: string) => dateFormatter.format(new Date(value))
const initials = (nom: string) =>
  nom
    .split(' ')
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
</script>

<template>
  <div class="candidate-list" role="list" aria-label="Candidatures">
    <button
      v-for="candidate in candidates"
      :key="candidate.id"
      class="candidate"
      type="button"
      role="listitem"
      :aria-busy="busy || undefined"
      :aria-label="`Ouvrir le profil de ${candidate.nom}, ${candidate.statut}`"
      @click="emit('select', candidate.id)"
    >
      <span class="avatar" aria-hidden="true">{{ initials(candidate.nom) }}</span>
      <span class="candidate-main">
        <strong>{{ candidate.nom }}</strong>
        <span>{{ candidate.poste }}</span>
        <span class="skills">{{ candidate.competences.slice(0, 3).join(' · ') }}</span>
      </span>
      <span class="candidate-meta">
        <StatusBadge :status="candidate.statut" />
        <time :datetime="candidate.dateCandidature">{{ formatDate(candidate.dateCandidature) }}</time>
      </span>
      <span class="chevron" aria-hidden="true">›</span>
    </button>
  </div>
</template>