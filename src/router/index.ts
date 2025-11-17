import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: {
      title: '首页',
      keepAlive: true,
      showTabBar: true,
    },
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/Category/index.vue'),
    meta: {
      title: '分类',
      keepAlive: true,
      showTabBar: true,
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart/index.vue'),
    meta: {
      title: '购物车',
      keepAlive: false,
      showTabBar: true,
      requiresAuth: true,
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/User/index.vue'),
    meta: {
      title: '我的',
      keepAlive: false,
      showTabBar: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: '登录',
      keepAlive: false,
      showTabBar: false,
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search/index.vue'),
    meta: {
      title: '搜索',
      keepAlive: false,
      showTabBar: false,
    },
  },
  {
    path: '/product/detail',
    name: 'ProductDetail',
    component: () => import('@/views/Product/Detail.vue'),
    meta: {
      title: '商品详情',
      keepAlive: false,
      showTabBar: false,
    },
  },
  // 地址管理
  {
    path: '/address/list',
    name: 'AddressList',
    component: () => import('@/views/Address/List.vue'),
    meta: {
      title: '收货地址',
      requiresAuth: true,
    },
  },
  {
    path: '/address/edit',
    name: 'AddressEdit',
    component: () => import('@/views/Address/Edit.vue'),
    meta: {
      title: '编辑地址',
      requiresAuth: true,
    },
  },
  // 订单管理
  {
    path: '/order/list',
    name: 'OrderList',
    component: () => import('@/views/Order/List.vue'),
    meta: {
      title: '我的订单',
      requiresAuth: true,
    },
  },
  {
    path: '/order/detail',
    name: 'OrderDetail',
    component: () => import('@/views/Order/Detail.vue'),
    meta: {
      title: '订单详情',
      requiresAuth: true,
    },
  },
  {
    path: '/order/confirm',
    name: 'OrderConfirm',
    component: () => import('@/views/Order/Confirm.vue'),
    meta: {
      title: '确认订单',
      requiresAuth: true,
    },
  },
  {
    path: '/order/pay',
    name: 'OrderPay',
    component: () => import('@/views/Order/Pay.vue'),
    meta: {
      title: '收银台',
      requiresAuth: true,
    },
  },
  {
    path: '/order/logistics',
    name: 'OrderLogistics',
    component: () => import('@/views/Order/Logistics.vue'),
    meta: {
      title: '物流信息',
      requiresAuth: true,
    },
  },
  {
    path: '/order/pay-result',
    name: 'PayResult',
    component: () => import('@/views/Order/PayResult.vue'),
    meta: {
      title: '支付结果',
      requiresAuth: true,
    },
  },
  {
    path: '/pay/alipay-callback',
    name: 'AlipayCallback',
    component: () => import('@/views/Pay/AlipayCallback.vue'),
    meta: {
      title: '支付处理中',
    },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '商城'

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  next()
})

export default router