import { ref } from 'vue'

export type ToastTone = 'success' | 'error'

interface Toast {
  message: string
  tone: ToastTone
}

const current = ref<Toast | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  function notify(message: string, tone: ToastTone = 'success') {
    current.value = { message, tone }
    clearTimeout(timer)
    timer = setTimeout(() => {
      current.value = null
    }, 3500)
  }

  function dismiss() {
    clearTimeout(timer)
    current.value = null
  }

  return { toast: current, notify, dismiss }
}