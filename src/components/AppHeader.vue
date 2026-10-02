<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useCandidatesStore } from '../stores/candidates'

const store = useCandidatesStore()
const { theme, toggleTheme } = useTheme()

const themeLabel = computed(() =>
  theme.value === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
)
</script>

<template>
  <header class="topbar">
    <RouterLink class="brand" :to="{ name: 'candidatures' }">TalentFlow<span>.</span></RouterLink>
    <nav class="main-nav" aria-label="Navigation principale">
      <RouterLink :to="{ name: 'candidatures' }">Candidatures</RouterLink>
      <RouterLink :to="{ name: 'statuts' }">Statuts</RouterLink>
    </nav>
    <div class="topbar-right">
      <span class="workspace">Espace recrutement</span>
      <button
        class="theme-toggle"
        type="button"
        :aria-pressed="theme === 'dark'"
        :aria-label="themeLabel"
        :title="themeLabel"
        @click="toggleTheme"
      >
        <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
      </button>
      <button class="user" type="button" aria-label="Profil de Marie Recruteuse">MR</button>
    </div>
  </header>
  <p class="api-status" role="status">
    <span class="dot" :class="{ ok: store.statuses.length > 0, ko: store.metadataError }" aria-hidden="true" />
    API JSON Server
    <template v-if="store.metadataError"> · {{ store.metadataError }}</template>
    <template v-else-if="store.statuses.length"> · {{ store.statuses.length }} statuts, {{ store.positions.length }} postes et {{ store.skills.length }} compétences chargés</template>
  </p>
</template>
