<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const classes: Record<string, string> = {
  'En attente': 'pending',
  'Entretien RH': 'interview',
  'Entretien technique': 'technical',
  'Accepté': 'accepted',
  'Refusé': 'rejected'
}

const statusClass = computed(() => classes[props.status] ?? 'pending')
</script>

<template>
  <span class="status" :class="statusClass">{{ status }}</span>
</template>