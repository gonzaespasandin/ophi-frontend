<script setup>
import { ref } from 'vue';



const props = defineProps({
    safe: {
        String
    }
});

const usersTrue = ref([])
const usersFalse = ref([]);
const hiddenFalse = ref(true);
const hiddenTrue = ref(true);
const hiddenIngredienets = ref(true);

console.log(props.safe);

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

function handleIngredientsClick() {
    if(hiddenIngredienets.value) {
        hiddenIngredienets.value = false
    } else {
        hiddenIngredienets.value = true
    }
}

</script>

<template>
    <div v-if="usersTrue.length > 0" class=" max-w-80 m-auto flex justify-between px-5 items-center text-white h-14" :class="hiddenTrue ? 'success-some' : 'success-some-bordered'" @click="handleClick(true)">
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-circle-check text-4xl"></i>
            <p>Seguro</p>
        </div>
        <i class="fa-solid fa-chevron-up"></i>
    </div>
    <ul :class="hiddenTrue ? 'hidden' : ''" class="max-w-80 m-auto true">
        <li v-for="user of usersTrue" :key="user.id" class="bg-[#F5F5F5] p-2 ">
            <span>{{ user.forWho }}</span>
        </li>
    </ul>
    <div v-if="usersFalse.length > 0" class="max-w-80 m-auto mt-4 flex justify-between px-5 items-center text-white h-14" :class="hiddenFalse ? 'danger-some' : 'danger-some-bordered'" @click="handleClick(false)">
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
            <p>Peligro</p>
        </div>
        <i class="fa-solid fa-chevron-up"></i>
    </div>
    <ul  :class="hiddenFalse ? 'hidden' : ''" class="max-w-80 m-auto false trasition-all">
        <li v-for="user of usersFalse" :key="user.id">
            <div class="flex flex-col">
                <div class="flex items-center justify-between p-2" @click="handleIngredientsClick()">
                    <span>{{ user.forWho }}</span>
                    <i class="fa-solid fa-chevron-up"></i>
                </div>
                <span v-for="unSafeIngredient of user.unsafeIngredients" :class="hiddenIngredienets ? 'hidden' : ''" class="px-3">- {{ unSafeIngredient }}</span>
            </div>
        </li>
    </ul>
</template>
