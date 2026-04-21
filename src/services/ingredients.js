import axiosInstance from "../config/axios.js";
let controller;


export async function getAllIngredients() {
    if(controller) controller.abort();
    
    controller =  new AbortController();
    try {
        const response = await axiosInstance.get('/api/ingredients', {signal: controller.signal })
        return response.data
    } catch (error) {
        console.error('[ingredients.js] -> [getAllIngredients], Error: ', error);
        throw error;
    }
}

export async function getListOfIntolerances(forceFetch = false) {
    if(controller) controller.abort();

    controller =  new AbortController();
    try {
        // if (!forceFetch && sessionStorage.getItem('ophi-intolerances')) {
        //     return JSON.parse(sessionStorage.getItem('ophi-intolerances'));
        // }

        const result = await axiosInstance.get('/api/intolerances', {signal: controller.signal })
        

        // sessionStorage.setItem('ophi-intolerances', JSON.stringify(result.data));
        

        return result.data
    } catch (error) {
        console.error('[ingredients.js] -> [getListOfIntolerances], Error: ', error);
        throw error;
    }
}

export async function getListOfAllergies(forceFetch = false) {
    if(controller) controller.abort();
    
    controller =  new AbortController();
    try {
        // if (!forceFetch && sessionStorage.getItem('ophi-allergies')) {
        //     return JSON.parse(sessionStorage.getItem('ophi-allergies'));
        // }

        const result = await axiosInstance.get('/api/allergies', {signal: controller.signal })

        // sessionStorage.setItem('ophi-allergies', JSON.stringify(result.data));

        return result.data
    } catch (error) {
        console.error('[ingredients.js] -> [getListOfAllergies], Error: ', error);
        throw error;
    }
    
}

export async function getListOfSpecialDiets(forceFetch = false) {
    if(controller) controller.abort();
    
    controller =  new AbortController();
    try {
        // if (!forceFetch && sessionStorage.getItem('ophi-special-diets')) {
        //     return JSON.parse(sessionStorage.getItem('ophi-special-diets'));
        // }

        const result  = await axiosInstance.get('/api/special-diets', {signal: controller.signal })

        // sessionStorage.setItem('ophi-special-diets', JSON.stringify(result.data));

        return result.data
    } catch (error) {
        console.error('[ingredients.js] -> [getListOfSpecialDiets], Error: ', error);
        throw error;
    }
}

// function saveToIndexedDB(storeName, data) {
//     const request = indexedDB.open('OphiDB', 4);
//     request.onupgradeneeded = (e) => {
//         // Obtengo la base de datos
//         const db = e.target.result;
//         // Creo o actualizo el objeto.
//         db.createObjectStore(storeName, { keyPath: 'id'})
//     } 

//     request.onsuccess = (e) => {
//         // Obtengo la base de datos
//         const db = e.target.result;
//         // Creo la transacción (la empiezo, indicando a que tabla y que permisos). ¿Para qué? Para luego agregarle la "configuración" que necesito y los datos.
//         const transaction = db.transaction(storeName, 'readwrite');
//         const store = transaction.objectStore(storeName); // Acá le digo: en la tabla storeName.

//         // Creo el objeto y realizo la petición (con put), guardando cada registro con SU propio ID.
//         data.forEach(item => {
//             store.put(item);
//         });

//         // Finalizo la operación y manejo los casos de éxito y errores.
//         transaction.oncomplete = () => {
//             console.log('Datos guardados en indexedDB')
//         }
//         transaction.onerror = (err) => {
//             console.log('Error al guardar los datos', err)
//         }
//     }
// }

// function getToIndexDB(tableName) {
//     const request = indexedDB.open('OphiDB', 4);
//     request.onsuccess = (e) => {
//         const db = e.target.result; // obtenemos la DB

//         const transaction = db.transaction(tableName, 'readonly');
//         const objectStore = transaction.objectStore(tableName);

//         objectStore.openCursor().onsuccess = (e) => {
//             const cursor = e.target.result;
//             if (cursor) {
//                 console.log(`ID ${cursor.value.id}, Name: ${cursor.value.name}`);
//                 cursor.continue();
//             } else {
//                 console.log("No more entries!");
//             }
//         };
//     };
// }
