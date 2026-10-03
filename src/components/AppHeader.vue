<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useCandidatesStore } from '../stores/candidates'
import { useNotifications } from '../composables/useNotifications'

const store = useCandidatesStore()
const { theme, toggleTheme } = useTheme()
const { notifications, account, unreadCount, lastError, markAllRead } = useNotifications()

const panelOpen = ref(false)

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
      <RouterLink :to="{ name: 'postes' }">Postes</RouterLink>
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
      <button
        class="notif-bell"
        type="button"
        :aria-pressed="panelOpen"
        :aria-label="`Notifications (${unreadCount} non lues)`"
        @click="panelOpen = !panelOpen"
      >
        <span aria-hidden="true">🔔</span>
        <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      </button>
      <button class="user" type="button" :aria-label="`Profil de ${account.name}`" :title="account.name">
        {{ account.initials }}
      </button>
    </div>
  </header>
  <p class="api-status" role="status">
    <span class="dot" :class="{ ok: store.statuses.length > 0, ko: store.metadataError }" aria-hidden="true" />
    API JSON Server
    <template v-if="store.metadataError"> · {{ store.metadataError }}</template>
    <template v-else-if="store.statuses.length"> · {{ store.statuses.length }} statuts, {{ store.positions.length }} postes et {{ store.skills.length }} compétences chargés</template>
  </p>

  <section v-if="panelOpen" class="notif-panel" aria-label="Notifications">
    <header>
      <strong>Notifications · {{ account.name }}</strong>
      <button type="button" class="notif-clear" @click="markAllRead">Tout marquer comme lu</button>
    </header>
    <p v-if="lastError" class="notif-error">{{ lastError }}</p>
    <ul v-if="notifications.length" class="notif-list">
      <li v-for="n in notifications" :key="n.id" :class="{ unread: !n.lue }">
        <span class="notif-message">{{ n.message }}</span>
        <time>{{ new Date(n.date).toLocaleString('fr-FR') }}</time>
      </li>
    </ul>
    <p v-else class="notif-empty">Aucune notification pour ce compte.</p>
  </section>
</template>

<style scoped>
.notif-bell {
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}
.notif-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: var(--accent);
  color: #fff;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 10px;
  line-height: 16px;
}
.notif-panel {
  position: fixed;
  top: 80px;
  right: 16px;
  width: 340px;
  max-height: 50vh;
  overflow: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-toast);
  padding: 12px 16px;
  z-index: 45;
}
.notif-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.notif-clear {
  border: none;
  background: none;
  color: var(--link);
  cursor: pointer;
  font-size: 12px;
}
.notif-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.notif-list li {
  padding: 8px 0;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.notif-list li.unread .notif-message {
  font-weight: 700;
}
.notif-list time {
  font-size: 11px;
  color: var(--text-faint);
}
.notif-empty, .notif-error {
  color: var(--text-muted);
  font-size: 13px;
}
</style>
