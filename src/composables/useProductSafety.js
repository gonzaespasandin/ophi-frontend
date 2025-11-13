import { ref } from 'vue';

export function useProductSafety() {
  const safe = ref([]);
  const unsafeIngredients = ref([]);
  const normalizedIngredients = ref([]);

  function checkAll(userProfiles, productIngredients) {
    userProfiles.forEach(userProfile => {
      userProfile.ingredients.forEach(uIngredients => {
        productIngredients.forEach(Pingredient => {
          if(!normalizedIngredients.value.includes(Pingredient.name)) {
            normalizedIngredients.value.push(Pingredient.name);
          }      
          
          if(uIngredients.ingredients && uIngredients.ingredients.length > 0) {
            browseIfUserHasMoreThanOneIngredient(uIngredients.ingredients, Pingredient, userProfile); 
          } else {
            goThroughAndCheck(uIngredients, Pingredient, userProfile);
          }
        });
      });
    });
  }

  function browseIfUserHasMoreThanOneIngredient(uIngredients, Pingredient, userProfile) {
    uIngredients.forEach(uIngredient => {
      if(uIngredient.ingredients && uIngredient.ingredients.length > 0) {
        uIngredient.ingredients.forEach(uI1 => {
          if(uI1.ingredients && uI1.ingredients.length > 0) {
            uI1.ingredients.forEach(uI2 =>{
              goThroughAndCheck(uI2, Pingredient, userProfile);  
            })
          } else {
            if(uI1.id === Pingredient.id) {
              goThroughAndCheck(uI1, Pingredient, userProfile);
            }
          }
        });
      } else {
        goThroughAndCheck(uIngredient, Pingredient, userProfile);
      }
    })
  }

  function goThroughAndCheck(uIngredients, Pingredient, userProfile) {
    if(uIngredients.id === Pingredient.id) {
      if(!unsafeIngredients.value.includes(Pingredient.name)) {
        unsafeIngredients.value.push(Pingredient.name);
      }
      pushValueToSafeArray(userProfile, false, Pingredient);
    }
    pushValueToSafeArray(userProfile, true);
  }

  function pushValueToSafeArray(userProfile, bool, Pingredient = null) {
    const index = safe.value.findIndex(s => s.forWho === userProfile.name);

    if (index === -1) {
      safe.value.push({
        isSafe: bool,
        forWho: userProfile.name,
        unsafeIngredients: !bool && Pingredient ? [Pingredient.name] : []
      });
    } else {
      const userSafe = safe.value[index];

      if (!bool && Pingredient) {
        if (!userSafe.unsafeIngredients.includes(Pingredient.name)) {
          userSafe.unsafeIngredients.push(Pingredient.name);
        }

        userSafe.isSafe = false;
      }

      safe.value[index] = userSafe;
    }
  }

  function resetSafety() {
    safe.value = [];
    unsafeIngredients.value = [];
    normalizedIngredients.value = [];
  }

  return {
    safe,
    unsafeIngredients,
    normalizedIngredients,
    checkAll,
    resetSafety
  };
}
