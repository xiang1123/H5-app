<template>
  <div class="order-confirm-page">
    <van-nav-bar
      title="确认订单"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <div class="order-confirm-content">
      <div class="address-section" @click="goAddressList">
        <div v-if="selectedAddress" class="address-info">
          <div class="address-header">
            <van-icon name="location-o" color="#ee0a24" size="18" />
            <span class="receiver-name">{{ selectedAddress.contact_name }}</span>
            <span class="receiver-phone">{{ selectedAddress.contact_phone }}</span>
          </div>
          <div class="address-detail">
            {{ selectedAddress.province }} {{ selectedAddress.city }} 
            {{ selectedAddress.district }} {{ selectedAddress.detail }}
          </div>
        </div>
        <div v-else class="address-empty">
          <van-icon name="add-o" size="20" />
          <span>请选择收货地址</span>
        </div>
        <van-icon name="arrow" />
      </div>

      <div class="goods-section">
        <div class="section-title">商品清单</div>
        <div class="goods-list">
          <div v-for="item in orderGoods" :key="item.sku_id" class="goods-item">
            <van-image :src="getImageUrl(item.cover_image)" fit="cover" width="80px" height="80px" />
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

      <div class="remark-section">
        <van-field
          v-model="remark"
          rows="2"
          autosize
          type="textarea"
          maxlength="200"
          placeholder="选填，可以告诉卖家您的特殊需求"
          show-word-limit
        />
      </div>

      <div class="price-section">
        <van-cell title="商品总额" :value="`¥${formatPrice(totalAmount)}`" />
        <van-cell title="运费" value="¥0.00" />
      </div>
    </div>

    <div class="submit-bar safe-area-bottom">
      <div class="total-info">
        <span class="label">实付款：</span>
        <span class="price">¥{{ formatPrice(totalAmount) }}</span>
      </div>
      <van-button
        type="danger"
        round
        :loading="submitting"
        :disabled="!selectedAddress || orderGoods.length === 0"
        @click="onSubmit"
      >
        提交订单
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Image as VanImage,
  Button as VanButton,
  Cell as VanCell,
  Field as VanField,
  showToast,
} from 'vant'
import { createOrder } from '@/api/order'
import { getAddressList, type Address } from '@/api/address'
import { useCartStore } from '@/store/modules/cart'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const submitting = ref(false)
const selectedAddress = ref<Address | null>(null)
const orderGoods = ref<any[]>([])
const remark = ref('')

const totalAmount = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
})

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  return url.startsWith('/') ? `${baseURL}${url}` : `${baseURL}/${url}`
}

const formatPrice = (price: number) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00'
}

const initOrderGoods = () => {
  if (route.query.type === 'cart') {
    const selectedItems = cartStore.cartList.filter(item => item.selected)
    if (selectedItems.length === 0) {
      showToast('请选择要结算的商品')
      router.back()
      return
    }
    orderGoods.value = selectedItems.map(item => ({
      sku_id: item.sku_id,
      title: item.title,
      cover_image: item.image,
      unit_price: item.unit_price,
      quantity: item.quantity,
      total_price: item.total_price,
      sku_attrs: null,
    }))
  } else if (route.query.type === 'buy') {
    const skuId = Number(route.query.sku_id)
    const quantity = Number(route.query.quantity)
    if (!skuId || !quantity) {
      showToast('订单信息错误')
      router.back()
      return
    }
    orderGoods.value = [{
      sku_id: skuId,
      title: route.query.title || '商品',
      cover_image: route.query.image || '',
      unit_price: Number(route.query.price) || 0,
      quantity: quantity,
      total_price: (Number(route.query.price) || 0) * quantity,
      sku_attrs: route.query.sku_attrs || null,
    }]
  }
}

const loadAddress = async () => {
  try {
    const res = await getAddressList()
    if (res.code === 0 && res.data) {
      const defaultAddr = res.data.find(item => item.is_default)
      selectedAddress.value = defaultAddr || (res.data.length > 0 ? res.data[0] : null)
    }
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

const goAddressList = () => {
  router.push({ path: '/address/list', query: { from: 'order' } })
}

const onSubmit = async () => {
  if (!selectedAddress.value) {
    showToast('请选择收货地址')
    return
  }
  if (orderGoods.value.length === 0) {
    showToast('订单商品为空')
    return
  }

  try {
    submitting.value = true
    const params = {
      address_id: selectedAddress.value.id,
      remark: remark.value || '',
      items: orderGoods.value.map(item => ({
        sku_id: item.sku_id,
        quantity: item.quantity
      }))
    }

    const res = await createOrder(params)
    if (res.code === 0) {
      showToast('订单创建成功')
      if (route.query.type === 'cart') {
        await cartStore.removeSelectedItems()
      }
      setTimeout(() => {
        const orderId = res.data?.id || res.data?.order_id
        if (orderId) {
          router.replace({ path: '/order/detail', query: { id: orderId } })
        } else {
          router.replace('/order/list')
        }
      }, 500)
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    showToast('订单创建失败')
  } finally {
    submitting.value = false
  }
}

const onBack = () => router.back()

onMounted(() => {
  initOrderGoods()
  loadAddress()
})
</script>

<style lang="scss" scoped>
.order-confirm-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;

  .order-confirm-content {
    .address-section {
      display: flex;
      align-items: center;
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;
      cursor: pointer;

      &:active { background-color: #f7f8fa; }

      .address-info {
        flex: 1;

        .address-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .receiver-name {
            font-size: 15px;
            font-weight: bold;
            color: #323233;
          }

          .receiver-phone {
            font-size: 14px;
            color: #646566;
          }
        }

        .address-detail {
          font-size: 14px;
          color: #646566;
          line-height: 20px;
        }
      }

      .address-empty {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #969799;
        font-size: 14px;
      }
    }

    .goods-section {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 12px;

      .section-title {
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

          &:last-child { border-bottom: none; }

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
            }

            .goods-sku {
              font-size: 12px;
              color: #969799;
              margin: 4px 0;
            }

            .goods-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .goods-price {
                font-size: 15px;
                color: #323233;
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

    .remark-section {
      background-color: #fff;
      margin-bottom: 12px;
    }

    .price-section {
      background-color: #fff;
      margin-bottom: 12px;
    }
  }

  .submit-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    .total-info {
      .label {
        font-size: 14px;
        color: #646566;
      }

      .price {
        font-size: 20px;
        color: #ee0a24;
        font-weight: bold;
      }
    }

    :deep(.van-button) {
      width: 120px;
      height: 44px;
    }
  }
}
</style>
