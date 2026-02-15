import axiosInstance from "../config/axios";

export async function getAmountOfHistory() {
    try {
        const result = axiosInstance.get('/api/history/count');
        return result;
    } catch (error) {
        console.log('[history.js] -> [getAmountOfHistory]: Error!', error);
        return result.data.message;
    }
}

export async function searchByName(name) {
    name.trim().toLowerCase();
    try {
        const result = axiosInstance.get(`/api/history/${name}`);
        return result;
    } catch (error) {
        console.log('[history.js] -> [searchByName]:Error!', error);
        return result.data.message;
    }
}