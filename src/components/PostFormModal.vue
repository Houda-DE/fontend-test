<script setup lang="ts">
import { reactive } from 'vue'
import type { PosteInput } from '../types'

defineProps<{ saving: boolean; error: string }>()
const emit = defineEmits<{ close: []; submit: [PosteInput] }>()

const form = reactive({ titre: '', description: '', competences: '' })

function onSubmit() {
  emit('submit', {
    titre: form.titre.trim(),
    description: form.description.trim(),
    competencesRequises: form.competences.split(',').map(s => s.trim()).filter(Boolean)
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <form class="modal" @submit.prevent="onSubmit">
      <h2>Nouveau poste</h2>
      <label>Titre <input v-model="form.titre" required /></label>
      <label>Description <textarea v-model="form.description" rows="3" required /></label>
      <label>Compétences requises (séparées par des virgules)
        <input v-model="form.competences" placeholder="Vue.js, TypeScript, Pinia" />
      </label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="hero-actions">
        <button class="button secondary" type="button" @click="emit('close')">Annuler</button>
        <button class="button" type="submit" :disabled="saving">Créer</button>
      </div>
    </form>
  </div>
</template>