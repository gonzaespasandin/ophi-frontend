<script setup>
</script>

<template>
  <div class="flex flex-col justify-around min-h-screen">
    <div class="flex flex-col justify-between flex-grow">
      <img src="../assets/img/logo.png" alt="" class="mt-6">
      <div class="flex flex-col justify-center mb-5 px-3 h-50">
        <h1 class="text-4xl text-center mb-3">Bienvenido/a</h1>
        <p>Somos <span class="font-semibold">ophi</span> y queremos ayudarte a comer sin preocupaciones</p>
      </div>
    </div>

    <div class="flex flex-col justify-center p-4 min-h-80 bg-[#005B8E]">
      <RouterLink to="/register" class="action-btn mb-5">Empezar <i class="fa-solid fa-arrow-right ps-4"></i></RouterLink>
      <RouterLink to="/login" class="secondary-action-btn">Ya tengo una cuenta</RouterLink>
    </div>
  </div>
</template>


<style scoped>
  div > div:first-child {
    background-image: url(../assets/img/tramas/Artboard\ 1trama-1.png);
 
    background-repeat: no-repeat;
    background-size: 175%;
  }
  
  img {
    
    display: block;
    margin: 4rem auto;
  }

  

</style>