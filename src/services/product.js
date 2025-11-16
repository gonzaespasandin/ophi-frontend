import axios from "axios";
import axiosInstance from "../config/axios.js";


export async function findProductById(id) {
    const response = await axiosInstance.get('/api/products/' + id);

    return response.data
}

export async function findBarcodeAndAnalyze(barcode) {

}

export async function findByBarcode(barcode) {
    try {
        const result = await axiosInstance.get(`/api/products/barcode/${barcode}`);

        console.log(result.data)
        return result.data
    } catch(error) {
        console.error('[services/product.js] -> [findByBarcode]: Error al buscar un producto por código de barra', error);
    }
}


export async function findByName(name) {
    try {
        const result = await axiosInstance.get(`/api/products/name/${name}`);

        console.log(result.data);
        return result.data;
    } catch(error) {
        console.error('[services/product.js] -> [findByName]: Error al buscar un producto por nombre', error);
        return error.response.status;
    }
}


export async function getMatchesByName(name) {
    try {
        const result = await axiosInstance.get(`/api/products/matchedname/${name}`);

        console.log(result.data);
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
    }
}