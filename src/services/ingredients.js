import axiosInstance from "../config/axios.js";

export async function getAllIngredients() {
    const response = await axiosInstance.get('/api/ingredients')

    return response.data
}

export async function getListOfIntolerances(forceFetch = false) {
    if (!forceFetch && sessionStorage.getItem('ophi-intolerances')) {
        return JSON.parse(sessionStorage.getItem('ophi-intolerances'));
    }

    const result = await axiosInstance.get('/api/intolerances')

    sessionStorage.setItem('ophi-intolerances', JSON.stringify(result.data));

    return result.data
}

export async function getListOfAllergies(forceFetch = false) {
    if (!forceFetch && sessionStorage.getItem('ophi-allergies')) {
        return JSON.parse(sessionStorage.getItem('ophi-allergies'));
    }

    const result = await axiosInstance.get('/api/allergies')

    sessionStorage.setItem('ophi-allergies', JSON.stringify(result.data));

    return result.data
}

export async function getListOfSpecialDiets(forceFetch = false) {
    if (!forceFetch && sessionStorage.getItem('ophi-special-diets')) {
        return JSON.parse(sessionStorage.getItem('ophi-special-diets'));
    }

    const result  = await axiosInstance.get('/api/special-diets')

    sessionStorage.setItem('ophi-special-diets', JSON.stringify(result.data));

    return result.data
}