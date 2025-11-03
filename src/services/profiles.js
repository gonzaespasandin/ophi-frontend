import axiosInstance from "../config/axios.js"

export async function getAuthUserProfiles() {
    console.log('Obteniendo los perfiles del usuario autenticado')
    const result = await axiosInstance.get(`/api/user-profiles`);

    console.log(result)
    return result.data
}

export async function storeProfile(data) {
    console.log('Creando perfil de usuario', data)
    const result = await axiosInstance.post('/api/profiles', data)

    return result.data
}