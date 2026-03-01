<script setup>


const props = defineProps({
    user: Object,
    showPremium: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    }
});



</script>

<template>
    <div class="flex flex-col items-center" >
        <div class="circle-user roboto-slab" v-if="user.name">{{ props.user.name.charAt(0) }}</div>
        <div class="text-[#005B8E] flex flex-col items-center">
            <span class="text-lg roboto-slab">
              {{props.user.name}}

              <template v-if="showPremium">
                <span v-if="isPremium" class="bg-amber-300 text-gray-800 font-semibold text-sm font-family-poppins rounded-full p-[2px] px-4">Premium</span>
                <span v-else class="bg-blue-200 text-gray-800 font-semibold text-sm font-family-poppins rounded-full p-[2px] px-4">Plan gratuito</span>
              </template>
            </span>
            <span class="text-sm" v-if="props.user.email">{{ props.user.email }}</span>
        </div>
    </div>
</template>