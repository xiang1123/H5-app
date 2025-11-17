<template>
  <div class="user-page">
    <!-- 骨架屏 -->
    <UserSkeleton v-if="loading" />

    <!-- 实际内容 -->
    <div v-else class="user-content">
      <!-- 用户信息 -->
      <div class="user-header" @click="handleUserClick">
        <div class="user-info">
          <div class="avatar">
            <van-image
              v-if="userStore.isLogin && userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              round
              width="60px"
              height="60px"
            />
            <van-icon v-else name="user-o" size="32" />
          </div>
          <div class="info">
            <div class="username">
              {{
                userStore.isLogin ? userStore.userInfo?.nickname : '点击登录'
              }}
            </div>
            <div class="user-level" v-if="userStore.isLogin">
              {{ userStore.userInfo?.phone || userStore.userInfo?.email }}
            </div>
            <div class="user-level" v-else>登录后享受更多权益</div>
          </div>
        </div>
        <van-icon name="arrow" color="#fff" />
      </div>

      <!-- 订单 -->
      <div class="order-section">
        <div class="section-title">
          <span>我的订单</span>
          <span class="more" @click="goOrderList"
            >全部订单 <van-icon name="arrow"
          /></span>
        </div>
        <div class="order-nav">
          <div
            v-for="item in orderTypes"
            :key="item.name"
            class="order-item"
            @click="handleOrderClick(item)"
          >
            <div class="order-icon">{{ item.icon }}</div>
            <div class="order-name">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <!-- 菜单列表 -->
      <div class="menu-section">
        <van-cell-group>
          <van-cell
            v-for="item in menuList"
            :key="item.title"
            :title="item.title"
            :icon="item.icon"
            is-link
            @click="handleMenuClick(item)"
          />
        </van-cell-group>
      </div>

      <!-- 退出登录按钮 -->
      <div v-if="userStore.isLogin" class="logout-section">
        <van-button block round type="danger" @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>

    <!-- 底部导航 - 固定在底部 -->
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Icon as VanIcon,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Image as VanImage,
  Button as VanButton,
  showConfirmDialog,
  showToast,
} from 'vant'
import UserSkeleton from '@/components/SkeletonScreen/UserSkeleton.vue'
import TabBar from '@/components/TabBar/index.vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)

const orderTypes = [
  { name: '待付款', icon: '💰', type: 'UNPAID' },
  { name: '待发货', icon: '📦', type: 'PAID' },
  { name: '待收货', icon: '🚚', type: 'SHIPPING' },
  { name: '待评价', icon: '⭐', type: 'COMPLETED' },
  { name: '退换/售后', icon: '🔄', type: 'aftersale' },
]

const menuList = [
  { title: '收货地址', icon: 'location-o', path: '/address/list', enabled: true },
  { title: '优惠券', icon: 'coupon-o', path: '/coupon', enabled: false },
  { title: '我的收藏', icon: 'star-o', path: '/favorite', enabled: false },
  { title: '浏览记录', icon: 'browsing-history-o', path: '/history', enabled: false },
  { title: '意见反馈', icon: 'comment-o', path: '/feedback', enabled: false },
  { title: '设置', icon: 'setting-o', path: '/setting', enabled: false },
]

// 点击用户信息
const handleUserClick = () => {
  if (!userStore.isLogin) {
    router.push('/login')
  } else {
    // 个人信息编辑功能暂未开发
    showToast('功能正在开发中...')
  }
}

// 处理订单类型点击
const handleOrderClick = (item: any) => {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }

  // 退换/售后功能未开发
  if (item.type === 'aftersale') {
    showToast('功能正在开发中...')
    return
  }

  // 其他订单状态跳转到订单列表
  goOrderList(item.type)
}

// 跳转订单列表
const goOrderList = (status?: string) => {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  
  router.push({
    path: '/order/list',
    query: status ? { status } : {},
  })
}

// 菜单点击
const handleMenuClick = (item: any) => {
  // 未登录时，除了设置页面，其他都需要登录
  if (!userStore.isLogin && item.enabled) {
    router.push('/login')
    return
  }

  // 检查功能是否已开发
  if (!item.enabled) {
    showToast('功能正在开发中...')
    return
  }

  // 已开发的功能才跳转
  if (item.path) {
    router.push(item.path)
  }
}

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      userStore.logout()
      showToast('已退出登录')
      // 不需要跳转，留在当前页面
    })
    .catch(() => {
      // 取消
    })
}

onMounted(() => {
  // 如果已登录，获取用户信息
  if (userStore.isLogin) {
    userStore.getUserInfo().catch(() => {
      // 获取失败可能是 token 过期
      userStore.logout()
    })
  }

  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px; // 为底部导航留出空间

  .user-content {
    min-height: calc(100vh - 50px);
  }

  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    cursor: pointer;

    .user-info {
      display: flex;
      align-items: center;

      .avatar {
        width: 60px;
        height: 60px;
        margin-right: 16px;
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        overflow: hidden;
      }

      .info {
        .username {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .user-level {
          font-size: 12px;
          opacity: 0.9;
        }
      }
    }
  }

  .order-section {
    margin: 12px 0;
    padding: 16px;
    background-color: #fff;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #323233;
      margin-bottom: 16px;

      .more {
        font-size: 13px;
        color: #969799;
        font-weight: normal;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .order-nav {
      display: flex;
      justify-content: space-around;

      .order-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: transform 0.2s;

        &:active {
          transform: scale(0.95);
        }

        .order-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .order-name {
          font-size: 12px;
          color: #646566;
        }
      }
    }
  }

  .menu-section {
    margin-bottom: 12px;

    :deep(.van-cell) {
      padding: 14px 16px;
    }
  }

  .logout-section {
    margin: 24px 16px;
    padding-bottom: 20px;
  }
}
</style>
