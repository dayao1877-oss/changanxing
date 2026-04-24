<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
useHead({
  script: [
    {
      src: 'https://webapi.amap.com/maps?v=2.0&key=1f94bda96c69813dbd213d3cb245206f&plugin=AMap.Driving,AMap.Geocoder',
      async: true
    }
  ]
})
</script>
