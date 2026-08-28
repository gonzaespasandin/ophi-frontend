import axios from "axios";
import axiosInstance from "../config/axios.js";


// SIN USO: ningún componente la llama actualmente. Se conserva porque el
// endpoint GET /api/products/{id} sigue activo en el backend.
export async function findProductById(id) {
    try {
        const response = await axiosInstance.get('/api/products/' + id);
        return response.data;
    } catch (error) {
        console.error('[product.js] -> [findProductById]: Error al buscar un producto por id', error);
        throw error;
    }
}

// SIN USO: el escáner resuelve los códigos con processBarcode() de
// services/scanner.js. Se conserva porque el endpoint
// GET /api/products/barcode/{barcode} sigue activo en el backend.
export async function findByBarcode(barcode) {
    try {
        const result = await axiosInstance.get(`/api/products/barcode/${barcode}`);
        return result.data
    } catch(error) {
        console.error('[services/product.js] -> [findByBarcode]: Error al buscar un producto por código de barra', error);
        throw error;
    }
}


// currentPage y filters tienen default porque hay llamadores que sólo pasan el
// término (SearchView, ScannerView). La query va encodeada: viene del texto que
// escribe la persona y un "&" suelto rompía el resto de los parámetros.
export async function search(query, currentPage = 1, filters = '') {
    try {
        const result = await axiosInstance.get(`/api/products/search?q=${encodeURIComponent(query)}&page=${currentPage}${filters}`);
        return result.data;
    } catch(error) {
        console.error('[services/product.js] -> [findByName]: Error al buscar un producto por nombre', error);
        // Sin respuesta (offline, timeout) no hay status que devolver: null deja
        // que el llamador lo trate como fallo en vez de romper acá.
        return error.response?.status ?? null;
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


// SIN USO: quedó libre al eliminar components/ui/RecomendedProducts.vue, su
// único consumidor. Los recomendados del home salen hoy de getSafeProducts().
// Se conserva porque el endpoint POST /api/products/recomended sigue activo.
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

export async function getSafeProducts() {
    try {
        const result = await axiosInstance.get('/api/products/safe');

        return result.data;
    } catch (error) {
        console.error('[services/product.js] -> getSafeProducts()')
        throw error
    }
}

export async function getBrands() {
    try {
        const result = await axiosInstance.get(`/api/brands`);
        return result;
    } catch(error) {
        console.error('[services/product.js] -> [getBrands], Error: ', error);
        throw error;
    }
}

// export async function getOrigins() {
//     try {
//         const result = await axiosInstance.get(`/api/origins`);
//         return result;
//     } catch(error) {
//         console.error('[services/product.js] -> [getOrigins], Error: ', error);
//         throw error;
//     }
// }

// export async function getCategory() {
//     try {
//         const result = await axiosInstance.get(`/api/categories`);
//         return result;
//     } catch(error) {
//         console.error('[services/product.js] -> [getCategory], Error: ', error);
//         throw error;
//     }
// } 



export async function getBrandsByName(name) {
    try {
        const result = await axiosInstance.get(`/api/brands/${name}`);
        return result;
    } catch(error) {
        console.error('[services/product.js] -> [getBrandsByName], Error: ', error);
        throw error;
    }
}