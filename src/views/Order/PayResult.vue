<template>
  <div class="pay-result-page">
    <div class="result-content">
      <!-- 支付中 -->
      <div v-if="checking" class="checking-content">
        <van-loading type="spinner" size="50" color="#1989fa">
          正在确认支付结果...
        </van-loading>
        <div class="checking-text">请稍候，正在查询支付状态</div>
      </div>

      <!-- 支付成功 -->
      <div v-else-if="paySuccess" class="success-content">
        <van-icon name="checked" color="#07c160" size="80" />
        <div class="result-title">支付成功</div>
        <div class="result-desc">您的订单已支付成功</div>
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付金额：</span>
            <span class="value amount">¥{{ formatPrice(orderAmount) }}</span>
          </div>
        </div>
        <div class="button-group">
          <van-button type="primary" round block @click="goOrderDetail">
            查看订单
          </van-button>
          <van-button plain round block @click="goHome">
            返回首页
          </van-button>
        </div>
      </div>

      <!-- 支付失败 -->
      <div v-else class="fail-content">
        <van-icon name="close" color="#ee0a24" size="80" />
        <div class="result-title">支付失败</div>
        <div class="result-desc">{{ failReason || '支付未完成或已取消' }}</div>
        <div class="button-group">
          <van-button type="danger" round block @click="goPayAgain">
            重新支付
          </van-button>
          <van-button plain round block @click="goOrderList">
            查看订单
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Icon as VanIcon,
  Button as VanButton,
  Loading as VanLoading,
} from 'vant'
import { getPaymentStatus } from '@/api/pay'
import { getOrderDetail } from '@/api/order'

const router = useRouter()
const route = useRoute()

const checking = ref(true)
const paySuccess = ref(false)
const orderId = ref<number>(0)
const orderNo = ref('')
const orderAmount = ref(0)
const failReason = ref('')
const checkTimer = ref<any>(null)

// 格式化价格
const formatPrice = (price: number) => {
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  return '0.00'
}

// 检查支付结果
const checkPaymentResult = async () => {
  try {
    const id = route.query.id as string
    
    if (!id) {
      paySuccess.value = false
      checking.value = false
      return
    }

    orderId.value = Number(id)

    // 先获取订单信息
    const orderRes = await getOrderDetail(orderId.value)
    if (orderRes.code === 0 && orderRes.data) {
      orderNo.value = orderRes.data.order_no
      orderAmount.value = orderRes.data.amount_payable
    }

    // 查询支付状态
    const res = await getPaymentStatus(orderId.value)
    console.log('支付状态查询结果:', res)
    
    if (res.code === 0 && res.data) {
      paySuccess.value = res.data.paid
      
      if (!res.data.paid) {
        // 如果未支付，继续轮询几次
        startPolling()
      } else {
        checking.value = false
      }
    } else {
      paySuccess.value = false
      failReason.value = res.message || '查询支付状态失败'
      checking.value = false
    }
  } catch (error) {
    console.error('查询支付结果失败:', error)
    paySuccess.value = false
    failReason.value = '查询支付状态失败'
    checking.value = false
  }
}

// 开始轮询（最多轮询5次）
const startPolling = () => {
  let pollCount = 0
  const maxPoll = 5

  checkTimer.value = setInterval(async () => {
    pollCount++
    console.log(`第${pollCount}次轮询支付状态`)

    try {
      const res = await getPaymentStatus(orderId.value)
      
      if (res.code === 0 && res.data && res.data.paid) {
        // 支付成功
        clearInterval(checkTimer.value)
        paySuccess.value = true
        checking.value = false
      } else if (pollCount >= maxPoll) {
        // 达到最大轮询次数
        clearInterval(checkTimer.value)
        paySuccess.value = false
        checking.value = false
      }
    } catch (error) {
      console.error('轮询支付状态失败:', error)
      if (pollCount >= maxPoll) {
        clearInterval(checkTimer.value)
        paySuccess.value = false
        checking.value = false
      }
    }
  }, 2000)
}

// 查看订单详情
const goOrderDetail = () => {
  router.replace({
    path: '/order/detail',
    query: { id: orderId.value }
  })
}

// 返回首页
const goHome = () => {
  router.replace('/home')
}

// 重新支付
const goPayAgain = () => {
  router.replace({
    path: '/order/pay',
    query: { id: orderId.value }
  })
}

// 查看订单列表
const goOrderList = () => {
  router.replace('/order/list')
}

onMounted(() => {
  checkPaymentResult()
})

onUnmounted(() => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.pay-result-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  .result-content {
    width: 100%;
    padding: 40px 20px;
    text-align: center;

    .checking-content {
      .checking-text {
        margin-top: 24px;
        font-size: 14px;
        color: #969799;
      }
    }

    .success-content,
    .fail-content {
      .van-icon {
        margin-bottom: 24px;
      }

      .result-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 12px;
      }

      .result-desc {
        font-size: 14px;
        color: #969799;
        margin-bottom: 24px;
      }

      .order-info {
        padding: 16px;
        background-color: #fff;
        border-radius: 8px;
        margin-bottom: 32px;
        text-align: left;

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;

          .label {
            color: #646566;
          }

          .value {
            color: #323233;
            font-weight: 500;

            &.amount {
              color: #ee0a24;
              font-size: 16px;
              font-weight: bold;
            }
          }
        }
      }

      .button-group {
        display: flex;
        flex-direction: column;
        gap: 12px;

        :deep(.van-button) {
          height: 44px;
        }
      }
    }

    .success-content {
      .result-title {
        color: #07c160;
      }
    }

    .fail-content {
      .result-title {
        color: #ee0a24;
      }
    }
  }
}
</style>
