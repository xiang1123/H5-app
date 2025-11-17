import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const networkStatus = ref(true)

  const setLoading = (status: boolean) => {
    loading.value = status
  }

  const setNetworkStatus = (status: boolean) => {
    networkStatus.value = status
  }

  const initApp = () => {
    // 初始化应用配置
    console.log('App initialized')
  }

  return {
    loading,
    networkStatus,
    setLoading,
    setNetworkStatus,
    initApp,
  }
})