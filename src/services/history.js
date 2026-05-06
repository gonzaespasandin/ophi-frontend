import axiosInstance from "../config/axios";

export const saveToHistory = async (productData, safetyResults, userProfiles) => {
  const results = safetyResults
    .map(result => ({
      profile_id: userProfiles.find(p => p.name === result.forWho)?.id,
      is_safe: result.isSafe,
      unsafe_ingredients: result.unsafeIngredients || [],
    }))
    .filter(r => r.profile_id);

  await axiosInstance.post('/api/history', {
    product_id: productData.id,
    results,
  });
};

export async function getAmountOfHistory() {
    try {
        const result = await axiosInstance.get('/api/history/count');
        return result;
    } catch (error) {
        console.log('[history.js] -> [getAmountOfHistory]: Error!', error);
        return result.data.message;
    }
}

export async function searchByName(name) {
    try {
        const result = await axiosInstance.get(`/api/history/name/${name}`);
        return result.data;
    } catch (error) {
        console.log('[history.js] -> [searchByName]:Error!', error);
        return result.data.message;
    }
}

export async function getLatestScans() {
    try {
        const result = await axiosInstance.get('/api/history/latest');
        return result.data;
    } catch (err) {
        console.error('[history.js] -> [getLatestScans], Error: ', err);
        throw err;
    }
}