import axiosInstance from '../config/axios';

/**
 * Busca un producto en el catálogo por EAN (solo admin).
 * Incluye ingredientes si ya fueron cargados.
 */
export const lookupCatalogByEan = (ean) =>
  axiosInstance.get(`/api/admin/catalog/${ean}`).then((r) => r.data);

/**
 * Envía una foto del listado de ingredientes para extracción via OpenAI Vision.
 * Devuelve { ingredientes: string[] } — no guarda nada.
 */
export const extractIngredientsFromPhoto = (ean, imageFile) => {
  const fd = new FormData();
  fd.append('image', imageFile);
  return axiosInstance
    .post(`/api/admin/catalog/${ean}/extract-ingredients`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/**
 * Guarda el array de ingredientes (ya revisado por el admin) en el catálogo.
 */
export const saveCatalogIngredients = (ean, ingredientes) =>
  axiosInstance
    .put(`/api/admin/catalog/${ean}/ingredients`, { ingredientes })
    .then((r) => r.data);
