import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCartList,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  type CartItem,
  type AddCartParams,
} from '@/api/cart'
import { showToast } from 'vant'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref<CartItem[]>([])
  const loading = ref(false)

  // 购物车商品总数
  const cartCount = computed(() => {
    return cartList.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 选中的商品数量
  const selectedCount = computed(() => {
    return cartList.value.filter(item => item.selected).length
  })

  // 选中商品的总价
  const totalPrice = computed(() => {
    return cartList.value
      .filter(item => item.selected)
      .reduce((total, item) => total + item.total_price, 0)
  })

  // 是否全选
  const isAllSelected = computed(() => {
    return cartList.value.length > 0 && cartList.value.every(item => item.selected)
  })

  // 获取购物车列表
  const fetchCartList = async () => {
    try {
      loading.value = true
      const res = await getCartList()
      if (res.code === 0 && res.data) {
        // 为每个商品添加 selected 属性（默认不选中）
        cartList.value = (res.data.items || []).map(item => ({
          ...item,
          selected: false
        }))
      }
      return res
    } catch (error) {
      console.error('获取购物车失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 添加到购物车
  const addCartItem = async (params: AddCartParams) => {
    try {
      const res = await addToCart(params)
      if (res.code === 0) {
        // 重新获取购物车列表
        await fetchCartList()
        showToast('已添加到购物车')
      }
      return res
    } catch (error) {
      console.error('添加购物车失败:', error)
      throw error
    }
  }

  // 更新商品数量
  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const res = await updateCartItem(id, { quantity })
      if (res.code === 0) {
        // 更新本地数据
        const item = cartList.value.find(i => i.id === id)
        if (item) {
          item.quantity = quantity
          // 重新计算总价
          item.total_price = item.unit_price * quantity
        }
      }
      return res
    } catch (error) {
      console.error('更新数量失败:', error)
      showToast('更新失败')
      throw error
    }
  }

  // 删除商品
  const removeCartItem = async (id: number) => {
    try {
      const res = await deleteCartItem(id)
      if (res.code === 0) {
        // 从列表中移除
        const index = cartList.value.findIndex(item => item.id === id)
        if (index > -1) {
          cartList.value.splice(index, 1)
        }
        showToast('已删除')
      }
      return res
    } catch (error) {
      console.error('删除失败:', error)
      showToast('删除失败')
      throw error
    }
  }

  // 清空购物车
  const clearCartList = async () => {
    try {
      const res = await clearCart()
      if (res.code === 0) {
        cartList.value = []
        showToast('购物车已清空')
      }
      return res
    } catch (error) {
      console.error('清空购物车失败:', error)
      showToast('操作失败')
      throw error
    }
  }

  // 切换选中状态
  const toggleSelect = (id: number) => {
    const item = cartList.value.find(i => i.id === id)
    if (item) {
      item.selected = !item.selected
    }
  }

  // 全选/取消全选
  const selectAll = (selected: boolean) => {
    cartList.value.forEach(item => {
      item.selected = selected
    })
  }

  // 删除选中的商品
  const removeSelectedItems = async () => {
    try {
      const selectedItems = cartList.value.filter(item => item.selected)
      if (selectedItems.length === 0) {
        showToast('请选择要删除的商品')
        return
      }

      // 逐个删除
      for (const item of selectedItems) {
        await deleteCartItem(item.id)
      }

      // 重新获取购物车列表
      await fetchCartList()
      showToast('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }

  return {
    cartList,
    loading,
    cartCount,
    selectedCount,
    totalPrice,
    isAllSelected,
    fetchCartList,
    addCartItem,
    updateQuantity,
    removeCartItem,
    clearCartList,
    toggleSelect,
    selectAll,
    removeSelectedItems,
  }
})