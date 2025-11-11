import axiosInstance from "../config/axios.js";

export async function getAllIngredients() {
    const response = await axiosInstance.get('/api/ingredients')

    return response.data
}

export async function getListOfIntolerances() {
    const result = await axiosInstance.get('/api/intolerances')
    return result.data
}

export async function getListOfAllergies() {
    const result = await axiosInstance.get('/api/allergies')
    return result.data
}

export async function getListOfSpecialDiets() {
    const result  = await axiosInstance.get('/api/special-diets')
    return result.data
}