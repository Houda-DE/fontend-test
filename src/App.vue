<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useToast } from './composables/useToast'
import { initTheme } from './composables/useTheme'

const { toast, dismiss } = useToast()

initTheme()
</script>

<template>
  <AppHeader />
  <RouterView />
  <Transition name="toast">
    <p v-if="toast" class="toast" :class="toast.tone" role="status" @click="dismiss">
      {{ toast.tone === 'error' ? '⚠' : '✓' }} {{ toast.message }}
    </p>
  </Transition>
</template>
