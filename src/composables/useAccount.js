import { ref } from 'vue'
import { getAccount, requestEmailChange, setNewsletter } from '../services/account.js'

export function useAccount() {
    const account = ref({ email: null, pending_email: null, newsletter_subscribed: false })
    const loading = ref(false)
    const error = ref(null)

    async function loadAccount() {
        loading.value = true
        error.value = null

        try {
            account.value = await getAccount()
        } catch (e) {
            error.value = 'No pudimos cargar los datos de tu cuenta'
        } finally {
            loading.value = false
        }
    }

    async function changeEmail({ newEmail, currentPassword }) {
        loading.value = true
        error.value = null

        try {
            const result = await requestEmailChange({ newEmail, currentPassword })
            account.value.pending_email = newEmail
            return result.message
        } catch (e) {
            error.value = firstValidationMessage(e) ?? 'No pudimos procesar el cambio de email'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function toggleNewsletter(subscribed) {
        const previous = account.value.newsletter_subscribed
        account.value.newsletter_subscribed = subscribed

        try {
            const result = await setNewsletter(subscribed)
            return result.message
        } catch (e) {
            account.value.newsletter_subscribed = previous
            error.value = 'No pudimos actualizar tu preferencia de novedades'
            throw e
        }
    }

    function firstValidationMessage(e) {
        const errors = e?.response?.data?.errors
        if (!errors) return null
        const first = Object.values(errors)[0]
        return Array.isArray(first) ? first[0] : first
    }

    return { account, loading, error, loadAccount, changeEmail, toggleNewsletter }
}
