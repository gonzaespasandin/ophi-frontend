import axiosInstance from "../config/axios.js";

export async function getAllIngredients() {
    try {
        const response = await axiosInstance.get('/api/ingredients')
        return response.data
    } catch (error) {
        console.error('[ingredients.js] -> [getAllIngredients], Error: ', error);
        throw error;
    }
}

export async function getListOfIntolerances(forceFetch = false) {
    try {
        if (!forceFetch && sessionStorage.getItem('ophi-intolerances')) {
            return JSON.parse(sessionStorage.getItem('ophi-intolerances'));
        }

        const result = await axiosInstance.get('/api/intolerances')

        sessionStorage.setItem('ophi-intolerances', JSON.stringify(result.data));

        return result.data
    } catch (error) {
        console.error('[ingredients.js] -> [getListOfIntolerances], Error: ', error);
        throw error;
    }
}

export async function getListOfAllergies(forceFetch = false) {
    try {
        if (!forceFetch && sessionStorage.getItem('ophi-allergies')) {
            return JSON.parse(sessionStorage.getItem('ophi-allergies'));
        }

        const result = await axiosInstance.get('/api/allergies')

        sessionStorage.setItem('ophi-allergies', JSON.stringify(result.data));

        return result.data
    } catch (error) {
        console.error('[ingredients.js] -> [getListOfAllergies], Error: ', error);
        throw error;
    }
    
}

export async function getListOfSpecialDiets(forceFetch = false) {
    try {
        if (!forceFetch && sessionStorage.getItem('ophi-special-diets')) {
            return JSON.parse(sessionStorage.getItem('ophi-special-diets'));
        }

        const result  = await axiosInstance.get('/api/special-diets')

        sessionStorage.setItem('ophi-special-diets', JSON.stringify(result.data));

        return result.data
    } catch (error) {
        console.error('[ingredients.js] -> [getListOfSpecialDiets], Error: ', error);
        throw error;
    }
}