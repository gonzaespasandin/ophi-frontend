<script setup>


const props = defineProps({
    user: Object,
});



</script>

<template>
    <div class="flex flex-col items-center" >
        <div class="circle-user roboto-slab" v-if="user.name">{{ props.user.name.charAt(0) }}</div>
        <div class="text-[#005B8E] flex flex-col items-center">
            <span class="text-lg roboto-slab">{{props.user.name}}</span>
            <span class="text-sm" v-if="props.user.email">{{ props.user.email }}</span>
        </div>
    </div>
</template>