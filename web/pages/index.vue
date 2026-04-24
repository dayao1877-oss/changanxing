<template>
  <div class="redirect-container" v-loading="true">
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
  if (authStore.isLoggedIn) {
    router.replace('/dashboard')
  } else {
    router.replace('/login')
  }
})
</script>

<style scoped>
.redirect-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
