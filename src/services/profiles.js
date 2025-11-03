import axiosInstance from "../config/axios.js"

export async function getAuthUserProfiles() {
    console.log('Obteniendo los perfiles del usuario autenticado')
    const result = await axiosInstance.get(`/api/user-profiles`);

    console.log(result.data, 'data')
    return result.data
}