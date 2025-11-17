<template>
  <div class="logistics-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="物流信息"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <van-skeleton title :row="5" />
    </div>

    <!-- 物流信息 -->
    <div v-else-if="shipmentInfo" class="logistics-content">
      <!-- 物流状态 -->
      <div class="logistics-status" :class="`status-${shipmentInfo.status.toLowerCase()}`">
        <div class="status-icon">
          <van-icon :name="getStatusIcon(shipmentInfo.status)" size="48" />
        </div>
        <div class="status-info">
          <div class="status-text">{{ getShipmentStatusText(shipmentInfo.status) }}</div>
          <div class="status-desc">{{ getStatusDesc(shipmentInfo.status) }}</div>
        </div>
      </div>

      <!-- 物流公司信息 -->
      <div class="logistics-header">
        <div class="company-info">
          <van-icon name="logistics" size="20" color="#1989fa" />
          <div class="company-detail">
            <div class="company-name">{{ shipmentInfo.company }}</div>
            <div class="tracking-number">运单号：{{ shipmentInfo.tracking_no }}</div>
          </div>
        </div>
        <van-button
          size="small"
          plain
          type="primary"
          @click="copyTrackingNumber"
        >
          复制
        </van-button>
      </div>

      <!-- 时间信息 -->
      <div class="time-info">
        <van-cell-group inset>
          <van-cell 
            title="发货时间" 
            :value="formatTime(shipmentInfo.shipped_at)" 
            v-if="shipmentInfo.shipped_at"
          />
          <van-cell 
            title="签收时间" 
            :value="formatTime(shipmentInfo.delivered_at)" 
            v-if="shipmentInfo.delivered_at"
          />
        </van-cell-group>
      </div>

      <!-- 物流轨迹说明 -->
      <div class="logistics-notice">
        <van-notice-bar
          left-icon="info-o"
          text="物流信息由物流公司提供，仅供参考"
          background="#fff7e6"
          color="#ff976a"
        />
      </div>

      <!-- 联系客服 -->
      <div class="contact-section">
        <van-button block plain @click="contactService">
          联系客服
        </van-button>
      </div>
    </div>

    <!-- 暂无物流信息 -->
    <van-empty v-else description="暂无物流信息">
      <van-button round type="primary" @click="onBack">
        返回
      </van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Button as VanButton,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Empty as VanEmpty,
  Skeleton as VanSkeleton,
  NoticeBar as VanNoticeBar,
  showToast,
} from 'vant'
import { getOrderShipment, getShipmentStatusText, type ShipmentInfo } from '@/api/logistics'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const shipmentInfo = ref<ShipmentInfo | null>(null)

// 获取状态图标
const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    'PENDING': 'clock-o',
    'SHIPPED': 'logistics',
    'DELIVERED': 'passed',
    'RETURNED': 'revoke',
  }
  return iconMap[status] || 'logistics'
}

// 获取状态描述
const getStatusDesc = (status: string): string => {
  const descMap: Record<string, string> = {
    'PENDING': '商家正在准备发货',
    'SHIPPED': '您的包裹正在运输途中',
    'DELIVERED': '包裹已签收，感谢您的购买',
    'RETURNED': '包裹已退回',
  }
  return descMap[status] || ''
}

// 格式化时间
const formatTime = (time: string | null): string => {
  if (!time) return '-'
  
  try {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (error) {
    return time
  }
}

// 加载物流信息
const loadShipmentInfo = async () => {
  try {
    loading.value = true
    
    const orderId = route.query.id as string
    
    if (!orderId) {
      showToast('订单ID不存在')
      return
    }

    const numericId = Number(orderId)
    
    if (isNaN(numericId)) {
      showToast('订单ID格式错误')
      return
    }

    console.log('请求物流信息, 订单ID:', numericId)

    const res = await getOrderShipment(numericId)
    console.log('物流信息响应:', res)

    if (res.code === 0 && res.data) {
      shipmentInfo.value = res.data
    } else {
      shipmentInfo.value = null
      showToast(res.message || '获取物流信息失败')
    }
  } catch (error: any) {
    console.error('加载物流信息失败:', error)
    shipmentInfo.value = null
    
    if (error.response?.status === 404) {
      showToast('物流信息不存在')
    } else {
      showToast('加载失败')
    }
  } finally {
    loading.value = false
  }
}

// 复制运单号
const copyTrackingNumber = async () => {
  if (!shipmentInfo.value?.tracking_no) return

  try {
    await navigator.clipboard.writeText(shipmentInfo.value.tracking_no)
    showToast('复制成功')
  } catch (error) {
    // 降级方案：使用传统方法复制
    const input = document.createElement('input')
    input.value = shipmentInfo.value.tracking_no
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    showToast('复制成功')
  }
}

// 联系客服
const contactService = () => {
  showToast('客服功能开发中')
}

// 返回
const onBack = () => {
  router.back()
}

onMounted(() => {
  loadShipmentInfo()
})
</script>

<style lang="scss" scoped>
.logistics-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .skeleton-container {
    padding: 16px;
  }

  .logistics-content {
    .logistics-status {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .status-icon {
        flex-shrink: 0;
      }

      .status-info {
        flex: 1;

        .status-text {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .status-desc {
          font-size: 13px;
          opacity: 0.8;
        }
      }

      &.status-pending {
        background: linear-gradient(135deg, #ff976a 0%, #ff6b6b 100%);
        color: #fff;

        .van-icon {
          color: #fff;
        }
      }

      &.status-shipped {
        background: linear-gradient(135deg, #1989fa 0%, #1677ff 100%);
        color: #fff;

        .van-icon {
          color: #fff;
        }
      }

      &.status-delivered {
        background: linear-gradient(135deg, #07c160 0%, #00b578 100%);
        color: #fff;

        .van-icon {
          color: #fff;
        }
      }

      &.status-returned {
        background: linear-gradient(135deg, #969799 0%, #7d7e80 100%);
        color: #fff;

        .van-icon {
          color: #fff;
        }
      }
    }

    .logistics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .company-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .company-detail {
          .company-name {
            font-size: 15px;
            font-weight: bold;
            color: #323233;
            margin-bottom: 4px;
          }

          .tracking-number {
            font-size: 13px;
            color: #969799;
          }
        }
      }
    }

    .time-info {
      margin-bottom: 12px;

      :deep(.van-cell__title) {
        color: #646566;
      }

      :deep(.van-cell__value) {
        color: #323233;
      }
    }

    .logistics-notice {
      padding: 0 16px;
      margin-bottom: 12px;
    }

    .contact-section {
      padding: 0 16px;
      margin-top: 24px;
    }
  }
}
</style>
