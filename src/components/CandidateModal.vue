<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Candidature, Statut } from '../types'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{
  candidate: Candidature
  statuses: Statut[]
  saving: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  'update-status': [status: string]
  'add-comment': [content: string]
  remove: []
}>()

const dialog = ref<HTMLElement | null>(null)
const status = ref(props.candidate.statut)
const comment = ref('')

const salary = computed(() =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(props.candidate.salaireSouhaite)
)
const commentDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

watch(
  () => props.candidate,
  candidate => {
    status.value = candidate.statut
    comment.value = ''
  }
)

function submitComment() {
  const content = comment.value.trim()
  if (!content) return
  emit('add-comment', content)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  await nextTick()
  dialog.value?.focus()
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section ref="dialog" class="modal" role="dialog" aria-modal="true" :aria-label="`Profil de ${candidate.nom}`" tabindex="-1">
      <header>
        <div>
          <p class="eyebrow">Candidature #{{ candidate.id }}</p>
          <h2>{{ candidate.nom }}</h2>
          <p>{{ candidate.poste }} · {{ candidate.localisation }}</p>
        </div>
        <div class="modal-actions">
          <button class="delete-button" type="button" :disabled="saving" @click="emit('remove')">Supprimer</button>
          <button class="icon-button" type="button" aria-label="Fermer le profil" @click="emit('close')">×</button>
        </div>
      </header>

      <div class="modal-content">
        <p v-if="error" class="inline-error" role="alert">{{ error }}</p>

        <div class="profile-grid">
          <div><span>Email</span><a :href="`mailto:${candidate.email}`">{{ candidate.email }}</a></div>
          <div><span>Téléphone</span><a :href="`tel:${candidate.telephone}`">{{ candidate.telephone }}</a></div>
          <div><span>Expérience</span><b>{{ candidate.experience }}</b></div>
          <div><span>Salaire souhaité</span><b>{{ salary }}</b></div>
          <div><span>Disponibilité</span><b>{{ candidate.disponibilite }}</b></div>
          <div><span>CV</span><a :href="candidate.cv" target="_blank" rel="noreferrer">Ouvrir le CV ↗</a></div>
        </div>

        <section>
          <h3>Compétences</h3>
          <div class="tag-list">
            <span v-for="skill in candidate.competences" :key="skill" class="tag">{{ skill }}</span>
          </div>
        </section>

        <section>
          <h3>Statut du parcours</h3>
          <div class="status-edit">
            <StatusBadge :status="candidate.statut" />
            <label class="visually-hidden" for="modal-status">Nouveau statut</label>
            <select id="modal-status" v-model="status">
              <option v-for="item in statuses" :key="item.id" :value="item.nom">{{ item.nom }}</option>
            </select>
            <button
              class="button secondary"
              type="button"
              :disabled="saving || status === candidate.statut"
              @click="emit('update-status', status)"
            >
              {{ saving ? 'Enregistrement…' : 'Mettre à jour' }}
            </button>
          </div>
        </section>

        <section>
          <h3>Lettre de motivation</h3>
          <p class="letter">{{ candidate.lettreMotivation }}</p>
        </section>

        <section>
          <h3>Notes de l’équipe <small>({{ candidate.commentaires.length }})</small></h3>
          <div v-if="candidate.commentaires.length" class="comments">
            <article v-for="item in candidate.commentaires" :key="item.id">
              <b>{{ item.auteur }}</b>
              <time :datetime="item.date">{{ commentDate.format(new Date(item.date)) }}</time>
              <p>{{ item.contenu }}</p>
            </article>
          </div>
          <p v-else class="empty-note">Aucun commentaire pour le moment.</p>

          <form class="comment-form" @submit.prevent="submitComment">
            <label for="comment">Ajouter une note</label>
            <textarea id="comment" v-model="comment" rows="3" placeholder="Partagez une observation avec l’équipe…" />
            <button class="button" type="submit" :disabled="saving || !comment.trim()">Ajouter la note</button>
          </form>
        </section>
      </div>
    </section>
  </div>
</template>