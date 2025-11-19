<script setup>
import { defineProps, onMounted, ref } from 'vue';
import { getRecomendedProducts } from '../../services/product';
 // import Swiper core and required modules
  import { A11y, Virtual } from 'swiper/modules';

  // Import Swiper Vue.js components
  import { Swiper, SwiperSlide } from 'swiper/vue';

  // Import Swiper styles
  import 'swiper/css';
  import 'swiper/css/navigation';
  import 'swiper/css/pagination';
  import 'swiper/css/scrollbar';


const userIngredients = ref([]);
const recomendedP = ref([]);
const merged = ref([]);
const i = ref([]);

const props = defineProps ({
    user: {
        type: Object,
        required: true
    }
});

onMounted(async () => {

    const check = (profiles, uI) => {
        let existsInArray = userIngredients.value.some(i => i.name === profiles.name && i.ingredient === uI.name);
        if(!existsInArray) {
            userIngredients.value.push({name: profiles.name, ingredient: uI.name});
        }
    }

    props.user.forEach(profiles => {
        profiles.ingredients.forEach(uIngredients => {
            if(!uIngredients.is_group) {
                userIngredients.value.push({name: profiles.name, ingredient: uIngredients.name});
            } else {
                uIngredients.ingredients.forEach(uI1 => {
                    if(!uI1.is_group) {
                        check(profiles, uI1);
                    } else {
                        uI1.ingredients.forEach(uI2 => {
                            if(!uI2.is_group) {
                                check(profiles, uI2);
                            } else {
                                uI2.ingredients.forEach(uI3 => {
                                    check(profiles, uI3);
                                })  
                            }
                        })
                    }
                })
            }

        })
    });

    

    async function getRecomendedByUser(userName) {
        const uI = userIngredients.value.filter(i => i.name === userName);
        try {
            const result = await getRecomendedProducts(uI);
            recomendedP.value.push({userName: userName, products: result});
        } catch (error) {
            console.log('ERR', error);
        }
    }

    // Esperamos a que carguen todos los registros
    await Promise.all(
        // Map porque Promise necesita un array de promesas, y no un array vacío como si lo devuelve forEach
        props.user.map(u => getRecomendedByUser(u.name))
    );

    recomendedP.value.forEach(userAndProducts => {
        console.log(userAndProducts)
        userAndProducts.products.map(p => {
            merged.value.push({userName: userAndProducts.userName, product: p})
        })
    })

    console.log(merged.value);
})

const onSwiper = (swiper) => {
    console.log(swiper)
}
const onSlideChange = () => {
    console.log('slide change');
};

const modules = [A11y, Virtual];

// const vSlide = Array.from({length: 15}).map(
//     (el, index) => `Slide ${index + 1}`
// );

</script>

<template>
    <template v-if="merged.length > 0">
       <div class="mt-25">
            <swiper
                :modules="modules"
                :slides-per-view="1.5"
                :space-between="50"
                @swiper="onSwiper"
                @slideChange="onSlideChange"
                :centered-slides="true"
                :initial-slide="merged.length / 2"
                :virtual="true"
                >
                    <swiper-slide  v-for="(p, index) of merged" :key="index" :virtual-index="index" v-slot="{ isActive }">
                        <div :class="isActive ? 'min-h-[150px]' : 'min-h-[100px] mt-2'" class="flex bg-[#005B8E] p-5 rounded-[11px] flex-col justify-center text-white transition-all">
                            <h3 class="text-sm">{{ p.product.name }}</h3>
                            <span class=" text-md">{{ p.userName }}</span> 
                            <p class="text-lg font-bold">RECOMENDADO</p>   
                        </div>
                    </swiper-slide>
            </swiper>
       </div>
    </template>
    <template v-else>
        <span class="block text-center mt-10">No hay productos recomendados</span>
    </template>
</template>