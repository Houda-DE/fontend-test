<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useToast } from './composables/useToast'
import { initTheme } from './composables/useTheme'
import { useNotifications } from './composables/useNotifications'
import { ACCOUNTS } from './accounts'

const { toast, dismiss } = useToast()
const { currentAccountId, startPolling, stopPolling, switchAccount } = useNotifications()

initTheme()
onMounted(() => startPolling())
onUnmounted(() => stopPolling())
</script>

<template>
  <AppHeader />
  <RouterView />

  <footer class="account-bar">
    <span class="account-bar-label">Compte actif :</span>
    <button
      v-for="a in ACCOUNTS"
      :key="a.id"
      type="button"
      class="account-btn"
      :class="{ active: a.id === currentAccountId }"
      :aria-pressed="a.id === currentAccountId"
      @click="switchAccount(a.id)"
    >
      <span class="account-initials" aria-hidden="true">{{ a.initials }}</span>
      {{ a.name }}
    </button>
  </footer>

  <Transition name="toast">
    <p v-if="toast" class="toast" :class="toast.tone" role="status" @click="dismiss">
      {{ toast.tone === 'error' ? '⚠' : '✓' }} {{ toast.message }}
    </p>
  </Transition>
</template>

<style scoped>
.account-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 20px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 40;
  flex-wrap: wrap;
}
.account-bar-label {
  color: var(--text-muted);
  font-size: 13px;
}
.account-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border);
  background: var(--surface-sunken);
  color: var(--text);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.account-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast);
}
.account-initials {
  font-weight: 700;
  font-size: 11px;
}
</style>
