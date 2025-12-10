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

  // ====================================================================
  // 【核心修复】静默删除辅助函数：用于订单提交后的清理
  // ====================================================================
  const _attemptSilentDelete = async (id: number): Promise<boolean> => {
    try {
      await deleteCartItem(id);
      return true;
    } catch (error: any) {
      // 捕获错误，并静默处理（不显示 Toast，不抛出异常）。
      // 订单流程中，项不存在是预期内的失败。
      console.warn(`静默删除购物车项 ${id} 失败 (可能已删除或不存在):`, error.message);
      return false;
    }
  };


  // 获取购物车列表
  const fetchCartList = async () => {
    try {
      loading.value = true
      const res = await getCartList()
      if (res.code === 0 && res.data) {
        cartList.value = (res.data.items || []).map(item => ({
          ...item,
          selected: item.selected === true ? true : false
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

  // 通用更新逻辑 (数量或 SKU ID)
  const updateCartItemLogic = async (params: { id: number, quantity?: number, sku_id?: number }) => {
    try {
      const { id, quantity, sku_id } = params;

      const updateData: any = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (sku_id !== undefined) updateData.sku_id = sku_id;

      const res = await updateCartItem(id, updateData);

      if (res.code === 0) {
        await fetchCartList();
      }
      return res;
    } catch (error: any) {
      console.error('更新购物车项失败:', error);
      showToast(error.message || '更新失败');
      throw error;
    }
  }

  // 删除商品 (单个删除 - 用户手动操作)
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

  // 删除选中的商品 (用于订单提交后的清理)
  const removeSelectedItems = async () => {

    const selectedItems = cartList.value.filter(item => item.selected)

    if (selectedItems.length === 0) {
      return
    }

    let successCount = 0

    for (const item of selectedItems) {
      const success = await _attemptSilentDelete(item.id)
      if (success) {
        successCount++
      }
    }

    await fetchCartList()

    if (successCount > 0) {
      showToast('购物车已更新')
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