import axiosInstance from "../config/axios";

export async function getAmountOfHistory() {
    try {
        const result = await axiosInstance.get('/api/history/count');
        return result;
    } catch (error) {
        console.log('[history.js] -> [getAmountOfHistory]: Error!', error);
        return result.data.message;
    }
}

export async function searchByName(name) {
    try {
        const result = await axiosInstance.get(`/api/history/name/${name}`);
        return result.data;
    } catch (error) {
        console.log('[history.js] -> [searchByName]:Error!', error);
        return result.data.message;
    }
}

export async function getLatestScans() {
    try {
        const result = await axiosInstance.get('/api/history/latest');
        return result.data;
    } catch (err) {
        console.error('[history.js] -> [getLatestScans], Error: ', err);
        throw err;
    }
}