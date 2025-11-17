<template>
  <div class="alipay-callback-page">
    <div class="callback-content">
      <van-loading type="spinner" size="50" color="#1989fa">
        正在处理支付结果...
      </van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading as VanLoading } from 'vant'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  // 从 URL 参数获取订单信息
  const orderId = route.query.out_trade_no || route.query.order_id
  
  console.log('支付宝回调参数:', route.query)
  
  // 跳转到支付结果页面
  setTimeout(() => {
    router.replace({
      path: '/order/pay-result',
      query: { id: orderId }
    })
  }, 1000)
})
</script>

<style lang="scss" scoped>
.alipay-callback-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  .callback-content {
    text-align: center;
  }
}
</style>
