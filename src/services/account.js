import axiosInstance from "../config/axios.js"

export async function getAccount() {
    const result = await axiosInstance.get('/api/account')
    return result.data
}

export async function requestEmailChange({ newEmail, currentPassword }) {
    const result = await axiosInstance.put('/api/account/email', {
        new_email: newEmail,
        current_password: currentPassword,
    })
    return result.data
}

export async function confirmEmailChange(token) {
    const result = await axiosInstance.post('/api/account/email/confirm', { token })
    return result.data
}

export async function setNewsletter(subscribed) {
    const result = await axiosInstance.put('/api/account/newsletter', { subscribed })
    return result.data
}
