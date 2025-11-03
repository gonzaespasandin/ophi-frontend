import axiosInstance from "../config/axios.js";

export async function getAllIngredients() {
    const response = await axiosInstance.get('/api/ingredients')

    return response.data
}