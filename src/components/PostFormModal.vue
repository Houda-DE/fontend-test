<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { PosteInput } from '../types'

defineProps<{ saving: boolean; error: string }>()
const emit = defineEmits<{ close: []; submit: [PosteInput] }>()

const firstField = ref<HTMLInputElement | null>(null)
const form = reactive({ titre: '', description: '', competences: '' })

function onSubmit() {
  emit('submit', {
    titre: form.titre.trim(),
    description: form.description.trim(),
    competencesRequises: form.competences.split(',').map(s => s.trim()).filter(Boolean)
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  await nextTick()
  firstField.value?.focus()
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="modal" role="dialog" aria-modal="true" aria-label="Nouveau poste">
      <header>
        <div>
          <p class="eyebrow">Offres</p>
          <h2>Ajouter un poste</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Fermer le formulaire" @click="emit('close')">×</button>
      </header>

      <form class="modal-content candidate-form" @submit.prevent="onSubmit">
        <p v-if="error" class="inline-error full-width" role="alert">{{ error }}</p>

        <label class="full-width" for="poste-titre">
          Titre
          <input id="poste-titre" ref="firstField" v-model.trim="form.titre" required />
        </label>

        <label class="full-width" for="poste-description">
          Description
          <textarea id="poste-description" v-model.trim="form.description" rows="4" required />
        </label>

        <label class="full-width" for="poste-competences">
          Compétences requises <small>(séparées par des virgules)</small>
          <input id="poste-competences" v-model="form.competences" placeholder="Vue.js, TypeScript, Pinia" required />
        </label>

        <div class="form-actions full-width">
          <button type="button" class="button secondary" @click="emit('close')">Annuler</button>
          <button type="submit" class="button" :disabled="saving">{{ saving ? 'Création…' : 'Créer le poste' }}</button>
        </div>
      </form>
    </section>
  </div>
</template>
