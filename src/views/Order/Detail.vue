<template>
  <div class="order-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="订单详情"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <van-skeleton title :row="5" />
    </div>

    <!-- 订单详情 -->
    <div v-else-if="order" class="order-detail">
      <!-- 订单状态 -->
      <div class="status-section" :class="`status-${order.status.toLowerCase()}`">
        <van-icon name="checked" size="48" />
        <div class="status-text">{{ getOrderStatusText(order.status) }}</div>
        <div class="status-desc" v-if="getStatusDesc(order.status)">
          {{ getStatusDesc(order.status) }}
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="address-section">
        <div class="section-title">
          <van-icon name="location-o" />
          <span>收货信息</span>
        </div>
        <div class="address-info">
          <div class="receiver-info">
            <span class="receiver-name">{{ order.receiver_name }}</span>
            <span class="receiver-phone">{{ order.receiver_phone }}</span>
          </div>
          <div class="address-detail">{{ order.address }}</div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="goods-section">
        <div class="section-title">
          <van-icon name="shopping-cart-o" />
          <span>商品信息</span>
        </div>
        <div class="goods-list">
          <div
            v-for="item in order.items"
            :key="item.sku_id"
            class="goods-item"
          >
            <van-image
              :src="getImageUrl(item.cover_image)"
              fit="cover"
              width="80px"
              height="80px"
            />
            <div class="goods-info">
              <div class="goods-name">{{ item.title }}</div>
              <div class="goods-sku" v-if="item.sku_attrs">{{ item.sku_attrs }}</div>
              <div class="goods-footer">
                <span class="goods-price">¥{{ formatPrice(item.unit_price) }}</span>
                <span class="goods-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info-section">
        <div class="section-title">
          <van-icon name="orders-o" />
          <span>订单信息</span>
        </div>
        <van-cell-group inset>
          <van-cell title="订单编号" :value="order.order_no" />
          <van-cell title="创建时间" :value="order.created_at || '-'" />
          <van-cell title="支付时间" :value="order.paid_at || '-'" v-if="order.paid_at" />
          <van-cell title="发货时间" :value="order.shipped_at || '-'" v-if="order.shipped_at" />
          <van-cell title="完成时间" :value="order.completed_at || '-'" v-if="order.completed_at" />
          <van-cell title="订单备注" :value="order.remark || '无'" v-if="order.remark" />
        </van-cell-group>
      </div>

      <!-- 价格明细 -->
      <div class="price-section">
        <van-cell-group inset>
          <van-cell title="商品总额" :value="`¥${formatPrice(order.amount_total)}`" />
          <van-cell title="实付款" :value="`¥${formatPrice(order.amount_payable)}`" value-class="price-value" />
        </van-cell-group>
      </div>

      <!-- 底部操作按钮 -->
      <div class="bottom-actions safe-area-bottom">
        <!-- 待付款 -->
        <template v-if="order.status === 'UNPAID'">
          <van-button plain @click="onCancelOrder">取消订单</van-button>
          <van-button type="danger" @click="onPayOrder">立即支付</van-button>
        </template>

        <!-- 待发货 -->
        <template v-else-if="order.status === 'PAID'">
          <van-button plain @click="onRemindShip">提醒发货</van-button>
        </template>

        <!-- 待收货 -->
        <template v-else-if="order.status === 'SHIPPING' || order.status === 'SHIPPED'">
          <van-button plain @click="onViewLogistics">查看物流</van-button>
          <van-button type="danger" @click="onConfirmReceipt">确认收货</van-button>
        </template>

        <!-- 已完成 -->
        <template v-else-if="order.status === 'COMPLETED'">
          <van-button plain @click="onDeleteOrder">删除订单</van-button>
          <van-button type="danger" @click="onComment">评价</van-button>
        </template>

        <!-- 已取消 -->
        <template v-else-if="order.status === 'CANCELED'">
          <van-button block plain @click="onDeleteOrder">删除订单</van-button>
        </template>
      </div>
    </div>

    <!-- 订单不存在 -->
    <van-empty v-else description="订单不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Image as VanImage,
  Button as VanButton,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Empty as VanEmpty,
  Skeleton as VanSkeleton,
  showConfirmDialog,
  showToast,
} from 'vant'
import { getOrderDetail, cancelOrder, confirmOrder, getOrderStatusText, type Order } from '@/api/order'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const order = ref<Order | null>(null)

// 获取状态描述
const getStatusDesc = (status: string): string => {
  const descMap: Record<string, string> = {
    'UNPAID': '请尽快完成支付',
    'PAID': '商家正在备货中',
    'SHIPPING': '商品正在配送中',
    'SHIPPED': '商品正在配送中',
    'COMPLETED': '感谢您的购买',
    'CANCELED': '订单已取消',
  }
  return descMap[status] || ''
}

// 处理图片 URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  return url.startsWith('/') ? `${baseURL}${url}` : `${baseURL}/${url}`
}

// 格式化价格
const formatPrice = (price: number) => {
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  return '0.00'
}

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    loading.value = true
    
    const orderId = route.query.id as string
    
    if (!orderId) {
      showToast('订单ID不存在')
      order.value = null
      return
    }

    const numericId = Number(orderId)
    
    if (isNaN(numericId)) {
      showToast('订单ID格式错误')
      order.value = null
      return
    }

    console.log('请求订单详情，ID:', numericId)

    const res = await getOrderDetail(numericId)
    console.log('订单详情响应:', res)

    if (res.code === 0 && res.data) {
      order.value = res.data
    } else {
      order.value = null
      showToast(res.message || '获取订单详情失败')
    }
  } catch (error: any) {
    console.error('加载订单详情失败:', error)
    order.value = null
    
    if (error.response?.status === 404) {
      showToast('订单不存在')
    } else {
      showToast('加载失败')
    }
  } finally {
    loading.value = false
  }
}

// 返回
const onBack = () => {
  router.back()
}

// 取消订单
const onCancelOrder = () => {
  if (!order.value) return

  showConfirmDialog({
    title: '提示',
    message: '确定要取消该订单吗？',
  })
    .then(async () => {
      try {
        const res = await cancelOrder(order.value!.id)
        if (res.code === 0) {
          showToast('订单已取消')
          // 重新加载订单详情
          await loadOrderDetail()
        }
      } catch (error) {
        console.error('取消订单失败:', error)
        showToast('操作失败')
      }
    })
    .catch(() => {})
}

// 支付订单
const onPayOrder = () => {
  if (!order.value) return
  
  router.push({
    path: '/order/pay',
    query: { id: order.value.id }
  })
}

// 提醒发货
const onRemindShip = () => {
  showToast('已提醒商家发货')
}

// 查看物流
const onViewLogistics = () => {
  if (!order.value) return
  
  router.push({
    path: '/order/logistics',
    query: { id: order.value.id }
  })
}

// 确认收货
const onConfirmReceipt = () => {
  if (!order.value) return

  showConfirmDialog({
    title: '提示',
    message: '确认已收到货物吗？',
  })
    .then(async () => {
      try {
        const res = await confirmOrder(order.value!.id)
        if (res.code === 0) {
          showToast('确认收货成功')
          // 重新加载订单详情
          await loadOrderDetail()
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        showToast('操作失败')
      }
    })
    .catch(() => {})
}

// 删除订单
const onDeleteOrder = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该订单吗？',
  })
    .then(() => {
      showToast('删除成功')
      setTimeout(() => {
        router.back()
      }, 500)
    })
    .catch(() => {})
}

// 评价订单
const onComment = () => {
  if (!order.value) return
  
  router.push({
    path: '/order/comment',
    query: { id: order.value.id }
  })
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;

  .skeleton-container {
    padding: 16px;
  }

  .order-detail {
    .status-section {
      padding: 32px 16px;
      background-color: #fff;
      text-align: center;
      margin-bottom: 12px;

      .van-icon {
        margin-bottom: 12px;
      }

      .status-text {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .status-desc {
        font-size: 14px;
        color: #969799;
      }

      &.status-unpaid {
        .van-icon,
        .status-text {
          color: #ee0a24;
        }
      }

      &.status-paid {
        .van-icon,
        .status-text {
          color: #ff976a;
        }
      }

      &.status-shipping,
      &.status-shipped {
        .van-icon,
        .status-text {
          color: #1989fa;
        }
      }

      &.status-completed {
        .van-icon,
        .status-text {
          color: #07c160;
        }
      }

      &.status-canceled {
        .van-icon,
        .status-text {
          color: #969799;
        }
      }
    }

    .address-section {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: bold;
        color: #323233;
        margin-bottom: 12px;
      }

      .address-info {
        .receiver-info {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;

          .receiver-name {
            font-size: 15px;
            font-weight: bold;
            color: #323233;
          }

          .receiver-phone {
            font-size: 15px;
            color: #646566;
          }
        }

        .address-detail {
          font-size: 14px;
          color: #646566;
          line-height: 20px;
        }
      }
    }

    .goods-section {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: bold;
        color: #323233;
        margin-bottom: 12px;
      }

      .goods-list {
        .goods-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f7f8fa;

          &:last-child {
            border-bottom: none;
          }

          :deep(.van-image) {
            flex-shrink: 0;
            border-radius: 8px;
          }

          .goods-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .goods-name {
              font-size: 14px;
              color: #323233;
              line-height: 20px;
              margin-bottom: 4px;
            }

            .goods-sku {
              font-size: 12px;
              color: #969799;
              margin-bottom: 8px;
            }

            .goods-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .goods-price {
                font-size: 15px;
                color: #323233;
                font-weight: bold;
              }

              .goods-quantity {
                font-size: 13px;
                color: #969799;
              }
            }
          }
        }
      }
    }

    .order-info-section {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: bold;
        color: #323233;
        margin-bottom: 12px;
      }
    }

    .price-section {
      :deep(.van-cell__value) {
        color: #323233;
        font-weight: bold;
      }

      :deep(.price-value) {
        color: #ee0a24;
        font-size: 18px;
      }
    }

    .bottom-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      background-color: #fff;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

      :deep(.van-button) {
        flex: 1;
        height: 44px;
      }
    }
  }
}
</style>
