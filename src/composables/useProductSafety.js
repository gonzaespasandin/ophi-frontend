import { ref } from 'vue';

export function useProductSafety() {
  const safe = ref([]);
  const unsafeIngredients = ref([]);
  const normalizedIngredients = ref([]);
  const unrestrictedProfiles = ref([]);


  function checkAll(userProfiles, productIngredients) {
    userProfiles.forEach(userProfile => {
      const userIngredientIds = getProfileIngredientIds(userProfile);

      if(userIngredientIds.size === 0) {
        unrestrictedProfiles.value.push(userProfile.name);
      }

      const profileUnsafeIngredients = [];

      productIngredients.forEach(Pingredient => {
        if(!normalizedIngredients.value.includes(Pingredient.name)) {
          normalizedIngredients.value.push(Pingredient.name);
        }

        const productIngredientIds = getProductIngredientIds(Pingredient);
        const isUnsafe = [...productIngredientIds].some(id => userIngredientIds.has(id));

        if(isUnsafe && !profileUnsafeIngredients.includes(Pingredient.name)) {
          profileUnsafeIngredients.push(Pingredient.name);
        }
      });

      safe.value.push({
        isSafe: profileUnsafeIngredients.length === 0,
        forWho: userProfile.name,
        unsafeIngredients: profileUnsafeIngredients
      });
    });
  }

  function getProfileIngredientIds(profile) {
    const ids = new Set();

    (profile.ingredient_ids ?? []).forEach(id => ids.add(Number(id)));

    if(ids.size === 0) {
      collectIngredientIds(profile.ingredients ?? [], ids);
    }

    return ids;
  }

  function getProductIngredientIds(ingredient) {
    const ids = new Set([Number(ingredient.id)]);

    (ingredient.parent_ids ?? []).forEach(id => ids.add(Number(id)));

    if(ingredient.parents) {
      collectIngredientIds(ingredient.parents, ids);
    }

    return ids;
  }

  function collectIngredientIds(ingredients, ids) {
    ingredients.forEach(ingredient => {
      ids.add(Number(ingredient.id));

      if(ingredient.ingredients?.length > 0) {
        collectIngredientIds(ingredient.ingredients, ids);
      }

      if(ingredient.parents?.length > 0) {
        collectIngredientIds(ingredient.parents, ids);
      }
    });
  }

  function refreshUnsafeIngredients() {
    const names = [];

    safe.value.forEach(profileCheck => {
      profileCheck.unsafeIngredients.forEach(name => {
        if(!names.includes(name)) {
          names.push(name);
        }
      });
    });

    unsafeIngredients.value = names;
  }

  function finishCheck() {
    refreshUnsafeIngredients();
  }

  function checkAllAndFinish(userProfiles, productIngredients) {
    checkAll(userProfiles, productIngredients);
    finishCheck();
  }

  function normalizeInputs(userProfiles, productIngredients) {
    return {
      userProfiles: Array.isArray(userProfiles) ? userProfiles : [],
      productIngredients: Array.isArray(productIngredients) ? productIngredients : []
    }
  }

  function resetSafety() {
    safe.value = [];
    unsafeIngredients.value = [];
    normalizedIngredients.value = [];
    unrestrictedProfiles.value = [];
  }

  return {
    safe,
    normalizedIngredients,
    unrestrictedProfiles,
    checkAll: (userProfiles, productIngredients) => {
      const normalized = normalizeInputs(userProfiles, productIngredients);
      checkAllAndFinish(normalized.userProfiles, normalized.productIngredients);
    },
    resetSafety,
    unsafeIngredients
  };
}
