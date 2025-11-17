<template>
  <div class="order-pay-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="收银台"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <!-- 支付信息 -->
    <div class="pay-content">
      <!-- 订单信息 -->
      <div class="order-info">
        <div class="order-amount">
          <span class="label">订单金额</span>
          <div class="amount">
            <span class="symbol">¥</span>
            <span class="price">{{ formatPrice(orderAmount) }}</span>
          </div>
        </div>
        <div class="order-no">订单号：{{ orderNo }}</div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-methods">
        <div class="section-title">选择支付方式</div>
        <van-radio-group v-model="paymentMethod">
          <van-cell-group inset>
            <van-cell clickable @click="paymentMethod = 'alipay'">
              <template #title>
                <div class="payment-item">
                  <div class="payment-icon alipay-icon">
                    <van-icon name="alipay" size="24" />
                  </div>
                  <span class="payment-name">支付宝支付</span>
                </div>
              </template>
              <template #right-icon>
                <van-radio name="alipay" />
              </template>
            </van-cell>
            
            <!-- 其他支付方式（暂不可用） -->
            <van-cell disabled>
              <template #title>
                <div class="payment-item">
                  <div class="payment-icon wechat-icon">
                    <van-icon name="wechat-pay" size="24" />
                  </div>
                  <span class="payment-name">微信支付</span>
                  <van-tag type="warning" size="small">暂不可用</van-tag>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <!-- 支付说明 -->
      <div class="pay-tips">
        <van-notice-bar
          left-icon="info-o"
          text="请在30分钟内完成支付，超时订单将自动取消"
          background="#fff7e6"
          color="#ff976a"
        />
      </div>
    </div>

    <!-- 底部支付按钮 -->
    <div class="pay-footer safe-area-bottom">
      <van-button
        type="danger"
        block
        round
        :loading="paying"
        :disabled="!paymentMethod"
        @click="onPay"
      >
        立即支付 ¥{{ formatPrice(orderAmount) }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Button as VanButton,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Radio as VanRadio,
  RadioGroup as VanRadioGroup,
  Tag as VanTag,
  NoticeBar as VanNoticeBar,
  Loading as VanLoading,
  showToast,
  showDialog,
} from 'vant'
import { getOrderDetail } from '@/api/order'
import { createAlipay, getPaymentStatus } from '@/api/pay'

const router = useRouter()
const route = useRoute()

const paying = ref(false)
const paymentMethod = ref('alipay')
const orderId = ref<number>(0)
const orderNo = ref('')
const orderAmount = ref(0)
const checkPaymentTimer = ref<any>(null)

// 格式化价格
const formatPrice = (price: number) => {
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  return '0.00'
}

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const id = route.query.id as string
    
    if (!id) {
      showToast('订单ID不存在')
      return
    }

    orderId.value = Number(id)

    const res = await getOrderDetail(orderId.value)
    
    if (res.code === 0 && res.data) {
      const order = res.data
      orderNo.value = order.order_no
      orderAmount.value = order.amount_payable
      
      // 检查订单状态
      if (order.status !== 'UNPAID') {
        showToast('订单状态不正确')
        setTimeout(() => {
          router.back()
        }, 1500)
      }
    }
  } catch (error) {
    console.error('加载订单信息失败:', error)
    showToast('加载失败')
  }
}

// 发起支付
const onPay = async () => {
  if (!paymentMethod.value) {
    showToast('请选择支付方式')
    return
  }

  if (paymentMethod.value === 'alipay') {
    await payWithAlipay()
  } else {
    showToast('该支付方式暂不可用')
  }
}

// 支付宝支付
const payWithAlipay = async () => {
  try {
    paying.value = true

    console.log('发起支付宝支付, 订单ID:', orderId.value)

    const res = await createAlipay(orderId.value)
    console.log('支付宝支付响应:', res)

    if (res.code === 0 && res.data) {
      const { pay_url } = res.data

      if (!pay_url) {
        throw new Error('支付链接获取失败')
      }

      console.log('支付宝支付链接:', pay_url)

      // 直接跳转到支付宝支付页面
      window.location.href = pay_url

      // 开始轮询检查支付状态
      startCheckPaymentStatus()
    } else {
      throw new Error(res.message || '支付失败')
    }
  } catch (error: any) {
    console.error('支付宝支付失败:', error)
    
    let errorMsg = '支付失败'
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail[0].msg || errorMsg
      }
    } else if (error.message) {
      errorMsg = error.message
    }
    
    showToast(errorMsg)
    paying.value = false
  }
}

// 开始检查支付状态
const startCheckPaymentStatus = () => {
  console.log('开始轮询支付状态')
  
  // 每3秒检查一次支付状态
  checkPaymentTimer.value = setInterval(async () => {
    try {
      const res = await getPaymentStatus(orderId.value)
      console.log('支付状态:', res)
      
      if (res.code === 0 && res.data) {
        if (res.data.paid) {
          // 支付成功
          clearInterval(checkPaymentTimer.value)
          paying.value = false
          
          showDialog({
            title: '支付成功',
            message: '订单支付成功！',
            confirmButtonText: '查看订单',
            confirmButtonColor: '#07c160',
          }).then(() => {
            router.replace({
              path: '/order/detail',
              query: { id: orderId.value }
            })
          })
        }
      }
    } catch (error) {
      console.error('查询支付状态失败:', error)
    }
  }, 3000)
  
  // 5分钟后停止轮询
  setTimeout(() => {
    if (checkPaymentTimer.value) {
      clearInterval(checkPaymentTimer.value)
      paying.value = false
      
      // 提示用户手动查看订单状态
      showDialog({
        title: '提示',
        message: '支付时间较长，请稍后在订单列表中查看支付状态',
        confirmButtonText: '查看订单',
      }).then(() => {
        router.replace('/order/list')
      })
    }
  }, 5 * 60 * 1000)
}

// 返回
const onBack = () => {
  // 如果正在支付，提示用户
  if (paying.value) {
    showDialog({
      title: '提示',
      message: '支付尚未完成，确定要返回吗？',
      confirmButtonText: '继续支付',
      cancelButtonText: '返回',
      showCancelButton: true,
    }).then(() => {
      // 继续支付，不做任何操作
    }).catch(() => {
      // 返回
      if (checkPaymentTimer.value) {
        clearInterval(checkPaymentTimer.value)
      }
      router.back()
    })
    return
  }
  
  router.back()
}

// 处理页面可见性变化
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    console.log('页面可见，检查支付状态')
    // 用户从支付宝返回，立即检查支付状态
    if (orderId.value && paying.value) {
      checkPaymentStatusOnce()
    }
  }
}

// 单次检查支付状态
const checkPaymentStatusOnce = async () => {
  try {
    const res = await getPaymentStatus(orderId.value)
    
    if (res.code === 0 && res.data) {
      if (res.data.paid) {
        // 支付成功
        if (checkPaymentTimer.value) {
          clearInterval(checkPaymentTimer.value)
        }
        paying.value = false
        
        showDialog({
          title: '支付成功',
          message: '订单支付成功！',
          confirmButtonText: '查看订单',
          confirmButtonColor: '#07c160',
        }).then(() => {
          router.replace({
            path: '/order/detail',
            query: { id: orderId.value }
          })
        })
      }
    }
  } catch (error) {
    console.error('查询支付状态失败:', error)
  }
}

onMounted(() => {
  loadOrderInfo()
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 组件卸载时清除定时器和事件监听
onUnmounted(() => {
  if (checkPaymentTimer.value) {
    clearInterval(checkPaymentTimer.value)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
.order-pay-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;

  .pay-content {
    .order-info {
      padding: 32px 16px;
      background-color: #fff;
      text-align: center;
      margin-bottom: 12px;

      .order-amount {
        margin-bottom: 12px;

        .label {
          font-size: 14px;
          color: #969799;
          display: block;
          margin-bottom: 8px;
        }

        .amount {
          color: #ee0a24;
          font-weight: bold;

          .symbol {
            font-size: 20px;
          }

          .price {
            font-size: 36px;
          }
        }
      }

      .order-no {
        font-size: 13px;
        color: #969799;
      }
    }

    .payment-methods {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #323233;
        margin-bottom: 12px;
      }

      .payment-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .payment-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;

          &.alipay-icon {
            background-color: #1677ff;
            color: #fff;
          }

          &.wechat-icon {
            background-color: #07c160;
            color: #fff;
          }
        }

        .payment-name {
          flex: 1;
          font-size: 15px;
          color: #323233;
        }
      }
    }

    .pay-tips {
      padding: 0 16px;
    }
  }

  .pay-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background-color: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    :deep(.van-button) {
      height: 44px;
      font-size: 16px;
    }
  }
}
</style>
