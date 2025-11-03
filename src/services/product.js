import axiosInstance from "../config/axios.js";

export async function findProductById(id) {
    const response = await axiosInstance.get('/api/products/' + id);

    return response.data
}

export async function findBarcodeAndAnalyze(barcode) {

}

export async function findByBarcode(barcode) {
}