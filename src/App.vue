<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="['Home', 'Category']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.initApp()
})
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}
</style>
