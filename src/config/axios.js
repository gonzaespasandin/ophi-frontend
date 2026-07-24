import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_URL || window.location.origin;
const baseURL = configuredBaseURL
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');

const axiosInstance =  axios.create({
    baseURL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

export default axiosInstance
