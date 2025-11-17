<template>
  <div class="alipay-return-page">
    <div class="return-content">
      <van-loading v-if="checking" type="spinner" size="50">
        正在确认支付结果...
      </van-loading>
      
      <div v-else-if="paySuccess" class="success-content">
        <van-icon name="checked" color="#07c160" size="64" />
        <div class="success-text">支付成功</div>
        <van-button type="primary" round @click="goOrderDetail">
          查看订单
        </van-button>
      </div>
      
      <div v-else class="fail-content">
        <van-icon name="close" color="#ee0a24" size="64" />
        <div class="fail-text">支付失败</div>
        <van-button type="primary" round @click="goOrderList">
          返回订单列表
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Icon as VanIcon,
  Button as VanButton,
  Loading as VanLoading,
} from 'vant'
import { getPaymentStatus } from '@/api/pay'

const router = useRouter()
const route = useRoute()

const checking = ref(true)
const paySuccess = ref(false)
const orderId = ref<number>(0)

// 检查支付结果
const checkPaymentResult = async () => {
  try {
    const id = route.query.order_id || route.query.out_trade_no
    
    if (!id) {
      paySuccess.value = false
      return
    }

    orderId.value = Number(id)

    const res = await getPaymentStatus(orderId.value)
    
    if (res.code === 0 && res.data) {
      paySuccess.value = res.data.paid
    } else {
      paySuccess.value = false
    }
  } catch (error) {
    console.error('查询支付结果失败:', error)
    paySuccess.value = false
  } finally {
    checking.value = false
  }
}

// 查看订单详情
const goOrderDetail = () => {
  router.replace({
    path: '/order/detail',
    query: { id: orderId.value }
  })
}

// 返回订单列表
const goOrderList = () => {
  router.replace('/order/list')
}

onMounted(() => {
  checkPaymentResult()
})
</script>

<style lang="scss" scoped>
.alipay-return-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  .return-content {
    text-align: center;
    padding: 40px 20px;

    .success-content,
    .fail-content {
      .van-icon {
        margin-bottom: 24px;
      }

      .success-text,
      .fail-text {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 32px;
      }

      .success-text {
        color: #07c160;
      }

      .fail-text {
        color: #ee0a24;
      }

      :deep(.van-button) {
        width: 160px;
      }
    }
  }
}
</style>
