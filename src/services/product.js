import axiosInstance from "../config/axios.js";

export async function findById(id) {

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