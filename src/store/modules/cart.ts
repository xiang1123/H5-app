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

  // 检查是否有选中的商品
  const hasSelectedItems = computed(() => {
    return cartList.value.some(item => item.selected)
  })

  // 获取购物车列表
  const fetchCartList = async () => {
    try {
      loading.value = true
      const res = await getCartList()
      if (res.code === 0 && res.data) {
        cartList.value = (res.data.items || []).map(item => ({
          ...item,
          // 确保 selected 存在，如果后端没返回默认给 false (实际上根据上面的后端修改应该返回了)
          selected: item.selected ?? false
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
        await fetchCartList()
        showToast('已添加到购物车')
      }
      return res
    } catch (error) {
      console.error('添加购物车失败:', error)
      throw error
    }
  }

  // 【核心修改】通用更新逻辑 (支持 selected)
  const updateCartItemLogic = async (params: { id: number, quantity?: number, sku_id?: number, selected?: boolean }) => {
    try {
      const { id, quantity, sku_id, selected } = params;

      const updateData: any = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (sku_id !== undefined) updateData.sku_id = sku_id;
      if (selected !== undefined) updateData.selected = selected;

      // 如果没有任何数据要更新，直接返回
      if (Object.keys(updateData).length === 0) return;

      const res = await updateCartItem(id, updateData);

      if (res.code === 0) {
        // 为了确保金额计算准确（后端计算总价），建议操作成功后静默刷新列表
        // 或者只在全选/全不选时刷新，这里选择静默刷新以保证数据一致性
        await fetchCartList();
      }
      return res;
    } catch (error: any) {
      console.error('更新购物车项失败:', error);
      // 避免频繁打扰用户，可以选择性 toast
      if (error?.response?.status !== 422) { 
         showToast(error.message || '更新失败');
      }
      throw error;
    }
  }

  // 删除商品
  const removeCartItem = async (id: number) => {
    try {
      const res = await deleteCartItem(id)
      if (res.code === 0) {
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

  // 【核心修改】切换选中状态
  const toggleSelect = async (id: number) => {
    const item = cartList.value.find(i => i.id === id)
    if (item) {
      // 1. 乐观更新本地 UI，提升响应速度
      const newValue = !item.selected
      item.selected = newValue

      try {
        // 2. 发送请求同步给后端
        await updateCartItemLogic({ id, selected: newValue })
      } catch (error) {
        // 3. 如果失败，回滚本地状态
        item.selected = !newValue
        console.error("同步选中状态失败", error)
        showToast('操作失败，请重试')
      }
    }
  }

  // 【核心修改】全选/取消全选
  const selectAll = async (selected: boolean) => {
    // 1. 本地先更新
    cartList.value.forEach(item => {
      item.selected = selected
    })

    // 2. 筛选出所有需要更新的项
    const updates = cartList.value.map(item => 
      updateCartItemLogic({ id: item.id, selected: selected })
    )

    try {
      // 并发请求
      await Promise.all(updates)
    } catch (error) {
      console.error("全选同步失败", error)
      // 失败则刷新列表以恢复正确状态
      await fetchCartList()
      showToast('部分操作同步失败')
    }
  }

  // 批量删除选中的商品
  const removeSelectedItems = async () => {
    const selectedItems = cartList.value.filter(item => item.selected)
    if (selectedItems.length === 0) return

    // 逐个删除 (如果有批量删除接口更好，但目前使用现有接口)
    try {
        await Promise.all(selectedItems.map(item => deleteCartItem(item.id)))
        await fetchCartList()
        showToast('删除成功')
    } catch (e) {
        showToast('删除失败')
        await fetchCartList()
    }
  }
  
  return {
    cartList,
    loading,
    cartCount,
    selectedCount,
    totalPrice,
    isAllSelected,
    hasSelectedItems,
    fetchCartList,
    addCartItem,
    updateCartItem: updateCartItemLogic,
    removeCartItem,
    clearCartList,
    toggleSelect,
    selectAll,
    removeSelectedItems,
  }
})