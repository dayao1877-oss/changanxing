<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// 从运行时配置获取高德地图 Key
const config = useRuntimeConfig()
const amapKey = config.public.amapKey

// 只在客户端加载高德地图脚本
if (process.client && amapKey) {
  useHead({
    script: [
      {
        src: `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Driving,AMap.Geocoder`,
        async: true,
        defer: true
      }
    ]
  })
}
</script>
