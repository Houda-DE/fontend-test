<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { CandidatureInput, Poste, Statut } from '../types'

const props = defineProps<{ positions: Poste[]; statuses: Statut[]; saving: boolean; error?: string }>()
const emit = defineEmits<{ close: []; submit: [candidate: CandidatureInput] }>()

const firstField = ref<HTMLInputElement | null>(null)

const form = reactive({
  nom: '',
  poste: props.positions[0]?.titre ?? '',
  statut: props.statuses[0]?.nom ?? 'En attente',
  email: '',
  telephone: '',
  experience: '',
  salaireSouhaute: '',
  disponibilite: '',
  localisation: '',
  competences: '',
  cv: '',
  lettreMotivation: ''
})

function submit() {
  emit('submit', {
    nom: form.nom,
    poste: form.poste,
    statut: form.statut,
    competences: form.competences.split(',').map(item => item.trim()).filter(Boolean),
    experience: form.experience,
    email: form.email,
    telephone: form.telephone,
    salaireSouhaite: Number(form.salaireSouhaute),
    disponibilite: form.disponibilite,
    localisation: form.localisation,
    cv: form.cv,
    lettreMotivation: form.lettreMotivation,
    dateCandidature: new Date().toISOString(),
    commentaires: []
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
    <section class="modal" role="dialog" aria-modal="true" aria-label="Nouvelle candidature">
      <header>
        <div>
          <p class="eyebrow">Nouveau profil</p>
          <h2>Ajouter une candidature</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Fermer le formulaire" @click="emit('close')">×</button>
      </header>

      <form class="modal-content candidate-form" @submit.prevent="submit">
        <p v-if="error" class="inline-error" role="alert">{{ error }}</p>

        <label for="form-nom">Nom complet<input id="form-nom" ref="firstField" v-model.trim="form.nom" required /></label>

        <label for="form-poste">
          Poste
          <select id="form-poste" v-model="form.poste" required>
            <option v-for="position in positions" :key="position.id" :value="position.titre">{{ position.titre }}</option>
          </select>
        </label>

        <label for="form-statut">
          Statut
          <select id="form-statut" v-model="form.statut" required>
            <option v-for="status in statuses" :key="status.id" :value="status.nom">{{ status.nom }}</option>
          </select>
        </label>

        <label for="form-email">Email<input id="form-email" v-model.trim="form.email" type="email" required /></label>
        <label for="form-telephone">Téléphone<input id="form-telephone" v-model.trim="form.telephone" required /></label>
        <label for="form-experience">Expérience<input id="form-experience" v-model.trim="form.experience" placeholder="ex. 3 ans" required /></label>
        <label for="form-salaire">Salaire souhaité (€)<input id="form-salaire" v-model="form.salaireSouhaute" type="number" min="0" step="1000" required /></label>
        <label for="form-disponibilite">Disponibilité<input id="form-disponibilite" v-model.trim="form.disponibilite" required /></label>
        <label for="form-localisation">Localisation<input id="form-localisation" v-model.trim="form.localisation" required /></label>
        <label for="form-competences">
          Compétences <small>(séparées par des virgules)</small>
          <input id="form-competences" v-model="form.competences" placeholder="Vue.js, TypeScript" required />
        </label>
        <label for="form-cv">URL du CV<input id="form-cv" v-model.trim="form.cv" type="url" placeholder="https://…" required /></label>

        <label class="full-width" for="form-lettre">
          Lettre de motivation
          <textarea id="form-lettre" v-model.trim="form.lettreMotivation" rows="4" required />
        </label>

        <div class="form-actions full-width">
          <button type="button" class="button secondary" @click="emit('close')">Annuler</button>
          <button type="submit" class="button" :disabled="saving">{{ saving ? 'Création…' : 'Créer la candidature' }}</button>
        </div>
      </form>
    </section>
  </div>
</template>