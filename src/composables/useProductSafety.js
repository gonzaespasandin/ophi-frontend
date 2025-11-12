import { ref } from 'vue';

export function useProductSafety() {
  const safe = ref([]);
  const unsafeIngredients = ref([]);
  const normalizedIngredients = ref([]);

  function checkAll(userProfiles, productIngredeints) {
    // Recorro los user profile
    userProfiles.forEach(userProfile => {
      // Recorro los ingredientes de cada user profile
      userProfile.ingredients.forEach(uIngredients => {
        // Recorro los ingredientes del producto
        productIngredeints.forEach(Pingredient => {
          // Si no está en el array de normalizedIngredients, agrego (sino, se agregaría por cada perfil que tenga el usaurio).
          // Si una paja, pero probe al reves (por cada ingrediente, recorrer los ingredientes del usuario) y lo recorre más veces todavia.
          // TODO: mejorarlo?
          if(!normalizedIngredients.value.includes(Pingredient.name)) {
            normalizedIngredients.value.push(Pingredient.name);
          }      
  
          if(uIngredients.ingredients.length > 0) {
            
            browseIfUserHasMoreThanOneIngredient(uIngredients.ingredients, Pingredient, userProfile); 
          } else {
           
            browseIfUserHasOneIngredient(uIngredients, Pingredient, userProfile);
          }
        });
      });
    });
  }

  function browseIfUserHasMoreThanOneIngredient(uIngredients, Pingredient, userProfile) {
    uIngredients.forEach(uIngredient => {
      // Evalúo si hay coincidencias por id (no sé pq, pero probablemnete sea mas robusto (algo ne mi intuición me lo dice JA PON PPPPON)).
      if(uIngredient.id === Pingredient.id) {
        // Si no esta ne le array unsafeIngredients, agrego los valores.
        if(!unsafeIngredients.value.includes(Pingredient.name)) {
          unsafeIngredients.value.push(Pingredient.name);
        }
        pushValueToSafeArray(userProfile, false, Pingredient);
      }
      pushValueToSafeArray(userProfile, true);
    })
  }

  function browseIfUserHasOneIngredient(uIngredients, Pingredient, userProfile) {
    // Evalúo si hay coincidencias por id (no sé pq, pero probablemnete sea mas robusto (algo ne mi intuición me lo dice JA PON PPPPON)).
    console.log('Ejecutado 2')
    if(uIngredients.id === Pingredient.id) {
      // Si no esta ne le array unsafeIngredients, agrego los valores.
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
      // Si el perfil no existe todavía, lo creamos
      safe.value.push({
        isSafe: bool,
        forWho: userProfile.name,
        unsafeIngredients: !bool && Pingredient ? [Pingredient.name] : []
      });
    } else {
      // Si ya existe el perfil
      const userSafe = safe.value[index];

      // Si encontramos un ingrediente peligroso
      if (!bool && Pingredient) {
        // Solo agregamos si no está repetido
        if (!userSafe.unsafeIngredients.includes(Pingredient.name)) {
          userSafe.unsafeIngredients.push(Pingredient.name);
        }

        // Marcamos el perfil como no seguro
        userSafe.isSafe = false;
      }

      // Si es seguro y no había estado marcado antes como inseguro, lo mantenemos
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


