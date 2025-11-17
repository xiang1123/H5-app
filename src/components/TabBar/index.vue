<template>
  <van-tabbar 
    v-model="active" 
    active-color="#667eea" 
    inactive-color="#999" 
    @change="onChange"
    fixed
    placeholder
    safe-area-inset-bottom
  >
    <van-tabbar-item name="home" icon="wap-home">首页</van-tabbar-item>
    <van-tabbar-item name="category" icon="apps-o">分类</van-tabbar-item>
    <van-tabbar-item name="cart" icon="shopping-cart-o" :badge="cartBadge">购物车</van-tabbar-item>
    <van-tabbar-item name="user" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()

const active = ref('home')

// 购物车角标
const cartBadge = computed(() => {
  if (!userStore.isLogin) return ''
  
  const count = cartStore.cartCount
  if (count === 0) return ''
  return count > 99 ? '99+' : count.toString()
})

watch(
  () => route.name,
  (newName) => {
    if (newName) {
      active.value = newName.toString().toLowerCase()
    }
  },
  { immediate: true }
)

const onChange = (name: string) => {
  router.push({ name: name.charAt(0).toUpperCase() + name.slice(1) })
}

// 登录后加载购物车数据
watch(
  () => userStore.isLogin,
  (isLogin) => {
    if (isLogin) {
      cartStore.fetchCartList().catch(() => {
        // 静默失败
      })
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 如果已登录，加载购物车数据
  if (userStore.isLogin) {
    cartStore.fetchCartList().catch(() => {
      // 静默失败
    })
  }
})
</script>

<style lang="scss" scoped>
:deep(.van-tabbar) {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.van-tabbar-item__icon) {
  font-size: 20px;
}

:deep(.van-tabbar-item--active) {
  .van-tabbar-item__text {
    font-weight: 500;
  }
}

:deep(.van-badge) {
  min-width: 16px;
  padding: 0 3px;
}
</style>
