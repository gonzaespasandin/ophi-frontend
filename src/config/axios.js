import axios from "axios";

console.log(import.meta.env.VITE_API_URL);

const axiosInstance =  axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

export default axiosInstance