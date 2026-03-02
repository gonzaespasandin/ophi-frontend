import axiosInstance from "../config/axios.js"
import { getSubscription } from "./profiles.js";

export async function givePremium() {
    try {
        const result = await axiosInstance.get(`/api/givePremium`);
        if(result) {
            let ophiUser = JSON.parse(sessionStorage.getItem('ophi-user'));
            ophiUser.subscription = await getSubscription();
            sessionStorage.setItem('ophi-user', JSON.stringify(ophiUser));
        }
        return result;
    } catch(error) {
        console.error('[services/subscription.js] -> [givePremium], Error: ', error);
        throw error;
    }
}

export async function giveFree() {
    try {
        const result = await axiosInstance.get(`/api/giveFree`);
        if(result) {
            let ophiUser = JSON.parse(sessionStorage.getItem('ophi-user'));
            ophiUser.subscription = await getSubscription();
            sessionStorage.setItem('ophi-user', JSON.stringify(ophiUser));
        }
        return result;
    } catch(error) {
        console.error('[services/subscription.js] -> [giveFree], Error: ', error);
        throw error;
    }
}