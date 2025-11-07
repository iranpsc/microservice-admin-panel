<template>
  <NavigationProgress />
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import NavigationProgress from './NavigationProgress.vue'
import { useAuth } from '../composables/useAuth'

// Initialize auth state when app loads
const { init } = useAuth()

onMounted(() => {
  init().catch(console.error)
})
</script>

