<script setup>


const props = defineProps({
    user: Object,
});



</script>

<template>

    <div class="flex flex-col items-center">
        <div class="circle-user"></div>
        <div class="text-[#005B8E] flex flex-col items-center">
            <h1 class="text-lg">{{props.user.name}}</h1>
            <span class="text-sm">{{ props.user.email }}</span>
        </div>
    </div>
</template>