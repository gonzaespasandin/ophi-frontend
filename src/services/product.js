import axios from "axios";
import axiosInstance from "../config/axios.js";


export async function findProductById(id) {
    try {
        const response = await axiosInstance.get('/api/products/' + id);
        return response.data;
    } catch (error) {
        console.error('[product.js] -> [findProductById]: Error al buscar un producto por id', error);
        throw error;
    }
}

export async function findByBarcode(barcode) {
    try {
        const result = await axiosInstance.get(`/api/products/barcode/${barcode}`);
        return result.data
    } catch(error) {
        console.error('[services/product.js] -> [findByBarcode]: Error al buscar un producto por código de barra', error);
        throw error;
    }
}


export async function findByName(name) {
    try {
        const result = await axiosInstance.get(`/api/products/name/${name}`);
        return result.data;
    } catch(error) {
        console.error('[services/product.js] -> [findByName]: Error al buscar un producto por nombre', error);
        return error.response.status;
    }
}

export async function findByNameAndBrand(name, brand) {
    try {
        const result = await axiosInstance.get(`/api/products/nameandbrand/${name}/${brand}`);
        return result.data;
    } catch(error) {
        console.error('[services/product.js] -> [findByNameAndBrand]: Error al buscar un producto por nombre y marca', error);
        throw error;
    }
}


export async function getMatchesByName(name) {
    try {
        const result = await axiosInstance.get(`/api/products/matchedname/${name}`);
        return result.data;
    } catch(error) {
        console.error('[services/product.js] -> [getMatchesByName]: Error al buscar un producto por nombre', error);
        return error.response.status;
    }
}


export async function getRecomendedProducts(userIngredients) {
    try {
        const result = await axiosInstance.post(`/api/products/recomended`, {
            userI: userIngredients
        });
        return (result.data)
    } catch(error) {
        console.error('[services/product.js] -> [getRecomendedProducts]: Error al obtener los productso recomendados por nombre', error);
        throw error;
    }
}