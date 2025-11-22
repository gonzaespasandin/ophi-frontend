<script setup>
import { onMounted, ref } from 'vue';
import { getRecomendedProducts } from '../../services/product';
import AppLoading from "../AppLoading.vue";
import { A11y, Virtual } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';



const userIngredients = ref([]);
const recomendedP = ref([]);
const merged = ref([]);
const loading = ref(true)

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

    loading.value = false;
})

const modules = [A11y, Virtual];

</script>

<template>
    <template v-if="!loading">
       <div class="mt-10">
            <swiper
                :modules="modules"
                :slides-per-view="1.5"
                :space-between="50"pi
                :centered-slides="true"
                :initial-slide="merged.length / 2"
                :virtual="true"
                >
                    <swiper-slide  v-for="(p, index) of merged" :key="index" :virtual-index="index" v-slot="{ isActive }" class="py-4">
                        <div :class="isActive ? 'min-h-[150px] recomended-card-active' : 'min-h-[100px] mt-2 recomended-card-inactive'" class="flex bg-[#005B8E] p-5 rounded-[11px] flex-col justify-center text-white transition-all ">
                            <h3 class="text-sm text-center font-regular">{{ p.product.name }}</h3>
                            <div class="bg-[#f5f5f5] text-[#005B8E] p-1 mt-1 rounded-[11px]">
                                <span class=" text-lg block text-center" :class="p.userName.length > 15 ? 'text-sm': 'text-lg'">{{ p.userName }}</span> 
                                <p class="text-lg font-bold text-center">RECOMENDADO</p>   
                            </div>
                        </div>
                    </swiper-slide>
            </swiper>
       </div>
    </template>
    <template v-else>
        <div class="flex justify-center mt-25">
            <AppLoading/>
        </div>
    </template>
</template>