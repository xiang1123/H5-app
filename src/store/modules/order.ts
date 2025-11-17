import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOrderList, type Order } from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  const orderList = ref<Order[]>([])
  const loading = ref(false)

  // 获取订单列表
  const fetchOrderList = async (params?: any) => {
    try {
      loading.value = true
      const res = await getOrderList(params)
      
      if (res.code === 0 && res.data) {
        orderList.value = res.data.list
      }
      
      return res
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取待付款订单数量
  const getUnpaidCount = () => {
    return orderList.value.filter(order => order.status === 'UNPAID').length
  }

  return {
    orderList,
    loading,
    fetchOrderList,
    getUnpaidCount,
  }
})