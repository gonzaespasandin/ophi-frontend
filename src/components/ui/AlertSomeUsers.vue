<script setup>
import { ref } from 'vue';



const props = defineProps({
    safe: {
        String
    },
    unrestrictedProfiles: {
        Array
    }
});

const usersTrue = ref([])
const usersFalse = ref([]);
const hiddenFalse = ref(true);
const hiddenTrue = ref(true);
const hiddenIngredienets = ref({forWho: null, state: false});

console.log(props.safe);
console.log(props.unrestrictedProfiles);


props.safe.forEach(userCheck => {
    usersTrue.value.push(userCheck);
    usersFalse.value.push(userCheck);
});
usersTrue.value = usersTrue.value.filter(user => user.isSafe);
usersFalse.value = usersFalse.value.filter(user => !user.isSafe);

console.log('Seguro: ', usersTrue.value);
console.log('Inseguro: ', usersFalse.value);

function handleClick(which) {
    if(which) {
        if(!hiddenTrue.value) {
            hiddenTrue.value = true;
        } else {
            hiddenTrue.value = false;
        }
    } else {
        if(!hiddenFalse.value) {
            hiddenFalse.value = true;
        } else {
            hiddenFalse.value = false;
        }
    }
}

function handleIngredientsClick(user) {
    if (hiddenIngredienets.value.forWho === user) {
        hiddenIngredienets.value.state = !hiddenIngredienets.value.state;
    } else {
        hiddenIngredienets.value = { forWho: user, state: true };
    }
}

</script>

<template>
    <div v-if="usersTrue.length > 0" class=" max-w-80 m-auto flex justify-between px-5 items-center text-white h-14" :class="hiddenTrue ? 'success-some transition-all delay-400 duration-200' : 'success-some-bordered transition-all duration-100'" @click="handleClick(true)">
        <div class="flex items-center gap-3 ">
            <i class="fa-solid fa-circle-check text-4xl"></i>
            <p>Seguro</p>
        </div>
        <i class="fa-solid fa-chevron-down transition-all duration-300" :class="{ 'rotate-180': !hiddenTrue }"></i>
    </div>
    <ul :class="hiddenTrue ? 'max-h-0' : 'max-h-96 '" class="max-w-80 m-auto true overflow-hidden transition-all duration-500">
        <li v-for="user of usersTrue" :key="user.id" class="bg-[#00916146] p-2 px-5">
            <span>{{ user.forWho }}</span>
        </li>
    </ul>
    <div v-if="usersFalse.length > 0" class="max-w-80 m-auto mt-4 flex justify-between px-5 items-center text-white h-14" :class="hiddenFalse ? 'danger-some delay-400 duration-200' : 'danger-some-bordered transition-all duration-100'" @click="handleClick(false)">
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
            <p>Peligro</p>
        </div>
        <i class="fa-solid fa-chevron-down transition-all duration-300" :class="{ 'rotate-180': !hiddenFalse }"></i>
    </div>
    <ul :class="hiddenFalse ? 'max-h-0' : 'max-h-96 '" class="max-w-80 m-auto false overflow-hidden transition-all duration-500 bg-[#c43b5244]">
        <li v-for="user of usersFalse" :key="user.id">
            <div class="flex flex-col">
                <div class="flex items-center justify-between p-2 bg-[#c43b525b] px-5" @click="handleIngredientsClick(user.forWho)">
                    <span>{{ user.forWho }}</span>
                    <i class="fa-solid fa-chevron-down transition-all duration-300" :class="{ 'rotate-180': (hiddenIngredienets.forWho === user.forWho && hiddenIngredienets.state) }"></i>
                </div>
               <div :class="(hiddenIngredienets.forWho === user.forWho && hiddenIngredienets.state) ? 'max-h-96' : 'max-h-0'" class="px-5 overflow-hidden  transition-all duration-200 ingr">
                 <p class="py-1">{{ user.unsafeIngredients.join(', ') }}</p>
               </div>
            </div>
        </li>
    </ul>
    <template v-if="unrestrictedProfiles && (unrestrictedProfiles.length > 0)">
        <div class="flex flex-col justify-center items-center p-3 mt-3 bg-[#f5f5f5] rounded-[11px]">
            <span>Sin restricciones cargadas aún: </span>
            <p class="font-semibold">{{ unrestrictedProfiles.join(', ') }}</p>
        </div>
    </template>
</template>


<style scoped>
li:last-child {
    border-bottom-left-radius: 11px;
    border-bottom-right-radius: 11px;
    border-bottom: 0;
}



.false {
    border-bottom-left-radius: 11px;
    border-bottom-right-radius: 11px;
}

</style>