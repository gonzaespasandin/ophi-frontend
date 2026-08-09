import { onScopeDispose, ref } from 'vue'

const TOAST_DURATION = 4000

export function useToast() {
    const toast = ref({ message: null, type: null })
    let timer = null

    function clearPendingTimer() {
        clearTimeout(timer)
        timer = null
    }

    function hideToast() {
        clearPendingTimer()
        toast.value = { message: null, type: null }
    }

    function showToast(message, type = 'success') {
        clearPendingTimer()
        toast.value = { message, type }
        timer = setTimeout(hideToast, TOAST_DURATION)
    }

    onScopeDispose(clearPendingTimer)

    return { toast, showToast, hideToast }
}
