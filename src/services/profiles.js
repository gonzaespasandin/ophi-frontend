import axiosInstance from "../config/axios.js"

export async function getAuthUserProfiles() {
    console.log('Obteniendo los perfiles del usuario autenticado');
    const result = await axiosInstance.get(`/api/user-profiles`);

    console.log(result)
    return result.data
}

export async function storeProfile(data) {
    const result = await axiosInstance.post('/api/profiles', data)
    return result.data
}

export async function updateProfile(data) {
    console.log('[profiles.js updateProfile()] Method is being executed')

    const result = await axiosInstance.put(`/api/profiles/${data.id}`, data)

    console.log('[profiles.js updateProfile()] Response:', result.data)

    return result.data
}

export async function deleteProfile(id) {
    console.log('[profiles.js deleteProfile()] Method is being executed')
    const result = await axiosInstance.delete(`/api/profiles/${id}`)
    return result.data
}