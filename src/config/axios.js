import axios from "axios";

const axiosInstance =  axios.create({
    // baseURL: 'http://localhost:8000', // ESTO ES PARA USO LOCAL, comentar para producción
    baseURL: import.meta.env.VITE_API_URL, // ESTO ES PARA USO EN PRODUCCIÓN, comentar para uso local
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

export default axiosInstance