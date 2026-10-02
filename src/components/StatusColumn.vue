<script setup lang="ts">
import { ref } from 'vue'
import type { Candidature, Statut } from '../types'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{
  column: Statut
  cards: Candidature[]
  statuses: Statut[]
  movingId: number | null
}>()

const emit = defineEmits<{ select: [id: number]; move: [id: number, statut: string] }>()

const isOver = ref(false)
const draggingId = ref<number | null>(null)

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

function onDragStart(event: DragEvent, id: number) {
  draggingId.value = id
  event.dataTransfer?.setData('text/plain', String(id))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isOver.value = true
}

function onDragLeave(event: DragEvent) {
  if (event.currentTarget === event.target) isOver.value = false
}

function onDrop(event: DragEvent, statut: string) {
  event.preventDefault()
  isOver.value = false
  const id = Number(event.dataTransfer?.getData('text/plain') ?? draggingId.value)
  if (Number.isInteger(id) && id > 0) emit('move', id, statut)
  draggingId.value = null
}

function onKeyMove(event: Event, card: Candidature) {
  const statut = (event.target as HTMLSelectElement).value
  if (statut && statut !== card.statut) emit('move', card.id, statut)
}
</script>

<template>
  <section
    class="board-column"
    :class="{ 'drag-over': isOver }"
    :aria-label="`Colonne ${column.nom}`"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop($event, column.nom)"
  >
    <header class="board-head">
      <StatusBadge :status="column.nom" />
      <span class="board-count" :aria-label="`${cards.length} candidature(s)`">{{ cards.length }}</span>
    </header>

    <ul class="board-cards">
      <li
        v-for="card in cards"
        :key="card.id"
        class="board-card"
        :class="{ dragging: draggingId === card.id, busy: movingId === card.id }"
        draggable="true"
        @dragstart="onDragStart($event, card.id)"
        @dragend="draggingId = null"
      >
        <button class="board-card-open" type="button" :aria-label="`Ouvrir le profil de ${card.nom}`" @click="emit('select', card.id)">
          <strong>{{ card.nom }}</strong>
          <span>{{ card.poste }}</span>
          <time :datetime="card.dateCandidature">{{ dateFormatter.format(new Date(card.dateCandidature)) }}</time>
        </button>

        <label class="board-card-move">
          <span class="visually-hidden">Déplacer {{ card.nom }} vers</span>
          <select
            :value="card.statut"
            :disabled="movingId === card.id"
            :aria-label="`Déplacer ${card.nom} vers un autre statut`"
            @change="onKeyMove($event, card)"
          >
            <option v-for="status in statuses" :key="status.id" :value="status.nom">{{ status.nom }}</option>
          </select>
        </label>
      </li>
    </ul>

    <p v-if="!cards.length" class="board-empty">Aucune candidature</p>
  </section>
</template>