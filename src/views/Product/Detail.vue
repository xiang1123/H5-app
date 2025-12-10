<template>
  <div class="product-detail-page">
    <van-nav-bar
      title="商品详情"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    >
      <template #right>
        <van-icon name="share-o" size="18" @click="onShare" />
      </template>
    </van-nav-bar>

    <div v-if="loading" class="skeleton-container">
      <van-skeleton title :row="3" />
      <van-skeleton title :row="3" />
      <van-skeleton title :row="3" />
    </div>

    <div v-else-if="product" class="product-content">
      <div class="product-swipe">
        <van-swipe
          :autoplay="3000"
          indicator-color="#fff"
          @change="onSwipeChange"
        >
          <van-swipe-item v-for="(image, index) in productImages" :key="index">
            <van-image
              :src="getImageUrl(image)"
              fit="cover"
              width="100%"
              height="375px"
              @click="previewImages(index)"
            >
              <template #loading>
                <van-loading type="spinner" size="20" />
              </template>
            </van-image>
          </van-swipe-item>
        </van-swipe>
        <div class="swipe-indicator">
          {{ currentSwipeIndex + 1 }}/{{ productImages.length }}
        </div>
      </div>

      <div class="product-info">
        <div class="price-section">
          <div class="current-price">
            <span class="symbol">¥</span>
            <span class="price">{{ formatPrice(displayPrice) }}</span>
          </div>
          <div class="sales-info" v-if="currentSku">
            库存：{{ currentSku.stock }}
          </div>
        </div>

        <div class="title-section">
          <div class="product-title">{{ product.title }}</div>
          <div class="product-subtitle" v-if="product.subtitle">
            {{ product.subtitle }}
          </div>
        </div>

        <div
          class="tags-section"
          v-if="product.tags && product.tags.length > 0"
        >
          <van-tag
            v-for="(tag, index) in product.tags"
            :key="index"
            color="#eef7ff"
            text-color="#1989fa"
            size="medium"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <div
        class="spec-section"
        @click="showSkuPopup = true"
        v-if="skuList.length > 0"
      >
        <div class="spec-label">已选</div>
        <div class="spec-value">
          {{ selectedSkuText || '请选择规格' }}
        </div>
        <van-icon name="arrow" />
      </div>

      <div class="detail-section">
        <van-tabs v-model:active="activeTab" sticky offset-top="46" color="#1989fa">
          <van-tab title="商品详情">
            <div class="detail-content">
              <div class="detail-text" v-if="product.description">
                {{ product.description }}
              </div>
              <div
                class="detail-images"
                v-if="product.images && product.images.length > 0"
              >
                <van-image
                  v-for="(image, index) in product.images"
                  :key="index"
                  :src="getImageUrl(image)"
                  fit="contain"
                  width="100%"
                />
              </div>
            </div>
          </van-tab>
          <van-tab title="评价">
            <div class="comment-content">
              <van-empty description="暂无评价" />
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>

    <van-empty v-else description="商品不存在" />

    <div class="product-footer safe-area-bottom">
      <div class="footer-icons">
        <div class="icon-item" @click="goHome">
          <div class="icon-area">
            <van-icon name="wap-home-o" size="20" />
          </div>
          <span>首页</span>
        </div>
        
        <div class="icon-item" @click="goCart">
          <div class="icon-area cart-icon-fixed">
            <van-icon name="shopping-cart-o" size="20" />
            <van-badge :content="cartBadge" :show-zero="false" color="#1989fa" />
          </div>
          <span>购物车</span>
        </div>
        
        <div class="icon-item" @click="onCollect">
          <div class="icon-area">
            <van-icon
              :name="isCollected ? 'star' : 'star-o'"
              :color="isCollected ? '#1989fa' : ''"
              size="20"
            />
          </div>
          <span>收藏</span>
        </div>
      </div>
      <div class="footer-buttons">
        <button class="action-btn btn-cart" @click="onAddToCart">
          加入购物车
        </button>
        <button class="action-btn btn-buy" @click="onBuyNow">
          立即购买
        </button>
      </div>
    </div>

    <van-popup
      v-model:show="showSkuPopup"
      position="bottom"
      round
      closeable
      :style="{ maxHeight: '80%' }"
    >
      <div class="sku-popup">
        <div class="sku-header">
          <div class="sku-image">
            <van-image
              :src="
                getImageUrl(currentSku?.image || product?.cover_image || '')
              "
              fit="cover"
              width="80px"
              height="80px"
            />
          </div>
          <div class="sku-info">
            <div class="sku-price">
              ¥{{ formatPrice(currentSku?.price || 0) }}
            </div>
            <div class="sku-stock">库存：{{ currentSku?.stock || 0 }}</div>
            <div class="sku-selected" v-if="selectedSkuText">
              已选：{{ selectedSkuText }}
            </div>
          </div>
        </div>

        <div class="sku-specs">
          <div class="spec-group" v-if="colorOptions.length > 0">
            <div class="spec-name">颜色</div>
            <div class="spec-values">
              <div
                v-for="color in colorOptions"
                :key="color"
                class="spec-value-item"
                :class="{
                  active: selectedColor === color,
                  disabled: !isColorAvailable(color),
                }"
                @click="selectColor(color)"
              >
                {{ color }}
              </div>
            </div>
          </div>

          <div class="spec-group" v-if="sizeOptions.length > 0">
            <div class="spec-name">尺寸</div>
            <div class="spec-values">
              <div
                v-for="size in sizeOptions"
                :key="size"
                class="spec-value-item"
                :class="{
                  active: selectedSize === size,
                  disabled: !isSizeAvailable(size),
                }"
                @click="selectSize(size)"
              >
                {{ size }}
              </div>
            </div>
          </div>
        </div>

        <div class="sku-quantity">
          <div class="quantity-label">数量</div>
          <van-stepper
            v-model="quantity"
            :min="1"
            :max="currentSku?.stock || 999"
          />
        </div>

        <div class="sku-actions">
          <button
            v-if="actionType === 'cart'"
            class="action-btn btn-cart block-btn"
            :disabled="!canSubmit"
            @click="confirmAddToCart"
          >
            确认加入购物车
          </button>
          <button
            v-else
            class="action-btn btn-buy block-btn"
            :disabled="!canSubmit"
            @click="confirmBuyNow"
          >
            确认立即购买
          </button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Image as VanImage,
  Swipe as VanSwipe,
  SwipeItem as VanSwipeItem,
  Loading as VanLoading,
  Skeleton as VanSkeleton,
  Tag as VanTag,
  Tabs as VanTabs,
  Tab as VanTab,
  Empty as VanEmpty,
  Button as VanButton,
  Badge as VanBadge,
  Popup as VanPopup,
  Stepper as VanStepper,
  ImagePreview,
  showToast,
  showLoadingToast,
  showConfirmDialog,
  closeToast,
} from 'vant'
import {
  getProductDetail,
  getProductSkus,
  type ProductDetail,
  type ProductSku,
} from '@/api/product'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const product = ref<ProductDetail | null>(null)
const skuList = ref<ProductSku[]>([])
const selectedColor = ref('')
const selectedSize = ref('')
const currentSwipeIndex = ref(0)
const activeTab = ref(0)
const showSkuPopup = ref(false)
const quantity = ref(1)
const actionType = ref<'cart' | 'buy'>('cart')
const isCollected = ref(false)

// 商品图片列表
const productImages = computed(() => {
  if (!product.value) return []

  const images = []
  if (currentSku.value?.image) {
    images.push(currentSku.value.image)
  }
  images.push(product.value.cover_image)
  if (product.value.images && product.value.images.length > 0) {
    images.push(...product.value.images)
  }
  return [...new Set(images)]
})

// 颜色选项（去重）
const colorOptions = computed(() => {
  const colors = skuList.value.map((sku) => sku.color)
  return [...new Set(colors)]
})

// 尺寸选项（去重）
const sizeOptions = computed(() => {
  const sizes = skuList.value.map((sku) => sku.size)
  return [...new Set(sizes)]
})

// 当前选中的 SKU
const currentSku = computed(() => {
  if (skuList.value.length === 0) return null
  return skuList.value.find((sku) => {
    const colorMatch = !selectedColor.value || sku.color === selectedColor.value
    const sizeMatch = !selectedSize.value || sku.size === selectedSize.value
    return colorMatch && sizeMatch
  })
})

// 显示的价格
const displayPrice = computed(() => {
  if (currentSku.value) {
    return currentSku.value.price
  }
  if (skuList.value.length > 0) {
    const prices = skuList.value.map((sku) => sku.price)
    return Math.min(...prices)
  }
  return 0
})

// 选中的规格文本
const selectedSkuText = computed(() => {
  const parts = []
  if (selectedColor.value) parts.push(selectedColor.value)
  if (selectedSize.value) parts.push(selectedSize.value)
  return parts.join(' / ')
})

// 是否可以提交
const canSubmit = computed(() => {
  if (skuList.value.length > 0) {
    if (!currentSku.value) return false
    if (currentSku.value.stock < quantity.value) return false
  }
  return true
})

// 购物车角标
const cartBadge = computed(() => {
  if (!userStore.isLogin) return ''
  const count = cartStore.cartCount
  return count > 0 ? (count > 99 ? '99+' : count) : ''
})

const isColorAvailable = (color: string): boolean => {
  return skuList.value.some((sku) => {
    const colorMatch = sku.color === color
    const sizeMatch = !selectedSize.value || sku.size === selectedSize.value
    return colorMatch && sizeMatch && sku.stock > 0
  })
}

const isSizeAvailable = (size: string): boolean => {
  return skuList.value.some((sku) => {
    const colorMatch = !selectedColor.value || sku.color === selectedColor.value
    const sizeMatch = sku.size === size
    return colorMatch && sizeMatch && sku.stock > 0
  })
}

const selectColor = (color: string) => {
  if (!isColorAvailable(color)) return
  if (selectedColor.value === color) {
    selectedColor.value = ''
  } else {
    selectedColor.value = color
    if (!selectedSize.value || !isSizeAvailable(selectedSize.value)) {
      const availableSize = sizeOptions.value.find((size) => {
        return skuList.value.some(
          (sku) => sku.color === color && sku.size === size && sku.stock > 0
        )
      })
      if (availableSize) {
        selectedSize.value = availableSize
      }
    }
  }
}

const selectSize = (size: string) => {
  if (!isSizeAvailable(size)) return
  if (selectedSize.value === size) {
    selectedSize.value = ''
  } else {
    selectedSize.value = size
    if (!selectedColor.value || !isColorAvailable(selectedColor.value)) {
      const availableColor = colorOptions.value.find((color) => {
        return skuList.value.some(
          (sku) => sku.color === color && sku.size === size && sku.stock > 0
        )
      })
      if (availableColor) {
        selectedColor.value = availableColor
      }
    }
  }
}

const autoSelectFirstSku = () => {
  if (skuList.value.length === 0) return
  const firstAvailableSku = skuList.value.find((sku) => sku.stock > 0)
  if (firstAvailableSku) {
    selectedColor.value = firstAvailableSku.color
    selectedSize.value = firstAvailableSku.size
  } else {
    const firstSku = skuList.value[0]
    selectedColor.value = firstSku.color
    selectedSize.value = firstSku.size
  }
}

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  return url.startsWith('/') ? `${baseURL}${url}` : `${baseURL}/${url}`
}

const formatPrice = (price: number) => {
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  return '0.00'
}

const onSwipeChange = (index: number) => {
  currentSwipeIndex.value = index
}

const loadProductDetail = async () => {
  try {
    loading.value = true
    const productId = route.query.id as string
    if (!productId) {
      showToast('商品ID不存在')
      product.value = null
      return
    }
    const numericId = Number(productId)
    if (isNaN(numericId)) {
      showToast('商品ID格式错误')
      product.value = null
      return
    }

    const [detailRes, skuRes] = await Promise.all([
      getProductDetail(numericId),
      getProductSkus(numericId),
    ])

    if (detailRes.code === 0 && detailRes.data) {
      product.value = detailRes.data
    } else {
      product.value = null
      showToast(detailRes.message || '获取商品详情失败')
    }

    if (skuRes.code === 0 && skuRes.data) {
      skuList.value = skuRes.data
      autoSelectFirstSku()
    }
  } catch (error: any) {
    console.error('加载商品详情失败:', error)
    product.value = null
    if (error.response?.status === 422) {
      showToast('商品ID格式错误')
    } else if (error.response?.status === 404) {
      showToast('商品不存在')
    } else {
      showToast('加载失败')
    }
  } finally {
    loading.value = false
  }
}

watch(currentSku, (newSku) => {
  if (newSku?.image) {
    currentSwipeIndex.value = 0
  }
})

const previewImages = (startIndex: number) => {
  ImagePreview({
    images: productImages.value.map((img) => getImageUrl(img)),
    startPosition: startIndex,
  })
}

const onBack = () => {
  router.back()
}

const onShare = () => {
  showToast('分享功能开发中')
}

const goHome = () => {
  router.push('/home')
}

const goCart = () => {
  router.push('/cart')
}

const onCollect = () => {
  if (!userStore.isLogin) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录',
      confirmButtonText: '去登录',
    })
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath },
        })
      })
      .catch(() => {})
    return
  }
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '收藏成功' : '取消收藏')
}

const onAddToCart = () => {
  if (!userStore.isLogin) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录后再添加到购物车',
      confirmButtonText: '去登录',
    })
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath },
        })
      })
      .catch(() => {})
    return
  }
  if (skuList.value.length === 0) {
    showToast('该商品暂无可购买规格')
    return
  }
  actionType.value = 'cart'
  showSkuPopup.value = true
}

const confirmAddToCart = async () => {
  try {
    if (!currentSku.value) {
      showToast('请选择商品规格')
      return
    }
    if (currentSku.value.stock < quantity.value) {
      showToast('库存不足')
      return
    }
    await cartStore.addCartItem({
      sku_id: currentSku.value.id,
      quantity: quantity.value,
    })
    showToast('加入购物车成功')
    showSkuPopup.value = false
    quantity.value = 1
  } catch (error) {
    console.error('添加购物车失败:', error)
  }
}

const onBuyNow = () => {
  if (!userStore.isLogin) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录后再购买',
      confirmButtonText: '去登录',
    })
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath },
        })
      })
      .catch(() => {})
    return
  }
  if (skuList.value.length === 0) {
    showToast('该商品暂无可购买规格')
    return
  }
  actionType.value = 'buy'
  showSkuPopup.value = true
}

// 立即购买 - 修复逻辑：直接跳转到购物车
const confirmBuyNow = async () => {
  if (skuList.value.length > 0 && !currentSku.value) {
    showToast('请选择商品规格')
    return
  }
  const stock = currentSku.value?.stock || 0
  if (stock < quantity.value) {
    showToast('库存不足')
    return
  }

  try {
    showLoadingToast({
      message: '处理中...',
      forbidClick: true,
      duration: 0,
    })

    // 1. 添加到购物车
    await cartStore.addCartItem({
      sku_id: currentSku.value!.id,
      quantity: quantity.value,
    })

    // 2. 重新获取购物车列表，更新角标
    await cartStore.fetchCartList()

    closeToast()
    
    // 3. 【修复】直接跳转到购物车页面
    router.push('/cart')

    // 4. 跳转后关闭弹窗并重置状态
    showSkuPopup.value = false
    quantity.value = 1
    selectedColor.value = ''
    selectedSize.value = ''
  } catch (error) {
    closeToast()
    console.error('立即购买失败:', error)
    showToast('操作失败，请检查网络或重新尝试') 
  }
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style lang="scss" scoped>
// 定义蓝白主题颜色
$primary-blue: #1989fa;
$light-blue-bg: #eef7ff;

.product-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;

  .skeleton-container {
    padding: 16px;
  }

  .product-content {
    .product-swipe {
      position: relative;
      background-color: #fff;

      .swipe-indicator {
        position: absolute;
        bottom: 12px;
        right: 12px;
        padding: 4px 12px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 12px;
        border-radius: 12px;
      }
    }

    .product-info {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 8px;

      .price-section {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 12px;

        .current-price {
          color: #ff4d4f; 
          font-weight: bold;

          .symbol { font-size: 16px; }
          .price { font-size: 28px; }
        }

        .sales-info {
          margin-left: auto;
          font-size: 12px;
          color: #969799;
        }
      }

      .title-section {
        .product-title {
          font-size: 16px;
          font-weight: bold;
          color: #323233;
          line-height: 24px;
          margin-bottom: 4px;
        }
        .product-subtitle {
          font-size: 14px;
          color: #969799;
          line-height: 20px;
        }
      }

      .tags-section {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
    }

    .spec-section {
      display: flex;
      align-items: center;
      padding: 16px;
      background-color: #fff;
      margin-bottom: 8px;
      cursor: pointer;
      &:active { background-color: #f7f8fa; }

      .spec-label {
        font-size: 14px;
        color: #323233;
        margin-right: 12px;
      }
      .spec-value {
        flex: 1;
        font-size: 14px;
        color: #969799;
      }
    }

    .detail-section {
      background-color: #fff;
      .detail-content {
        padding: 16px;
        .detail-text {
          font-size: 14px;
          color: #646566;
          line-height: 24px;
          margin-bottom: 16px;
          white-space: pre-wrap;
        }
        .detail-images :deep(.van-image) { margin-bottom: 8px; }
      }
      .comment-content { padding: 40px 16px; }
    }
  }

  .product-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    z-index: 999;

    .footer-icons {
      display: flex;
      gap: 16px;
      margin-right: 16px;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        cursor: pointer;
        &:active { opacity: 0.7; }
        
        // 统一图标/徽章的容器，解决对齐问题
        .icon-area {
          height: 22px; 
          display: flex;
          align-items: center;
          justify-content: center;
        }

        // 【修复】购物车区域，图标居中，角标绝对定位
        .cart-icon-fixed {
            position: relative; // 为内部角标提供定位上下文
            height: 22px; 
            width: 22px; // 确保宽度足够包裹图标
            
            :deep(.van-icon) {
                // 确保图标本身居中
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            :deep(.van-badge) {
                // 角标绝对定位脱离文档流，不影响图标垂直空间
                position: absolute;
                top: 0;
                right: 0;
                transform: translate(50%, -50%); 
                transform-origin: 100% 0;
            }
        }

        span {
          font-size: 10px;
          color: #646566;
          margin-top: 2px;
          line-height: 1;
        }
      }
    }

    .footer-buttons {
      flex: 1;
      display: flex;
      gap: 12px;

      .action-btn {
        flex: 1;
        height: 40px;
        border: none;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;

        &:active { opacity: 0.8; }

        &.btn-cart {
          background-color: $light-blue-bg;
          color: $primary-blue;
        }

        &.btn-buy {
          background: linear-gradient(135deg, #57b0ff, $primary-blue);
          color: #fff;
          box-shadow: 0 2px 6px rgba(25, 137, 250, 0.3);
        }
      }
    }
  }

  .sku-popup {
    padding: 16px;

    .sku-header {
      display: flex;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebedf0;
      margin-bottom: 16px;

      .sku-image {
        flex-shrink: 0;
        border-radius: 8px;
        overflow: hidden;
      }

      .sku-info {
        flex: 1;
        .sku-price {
          font-size: 20px;
          color: #ff4d4f;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .sku-stock {
          font-size: 12px;
          color: #969799;
          margin-bottom: 4px;
        }
        .sku-selected {
          font-size: 12px;
          color: #323233;
        }
      }
    }

    .sku-specs {
      .spec-group {
        margin-bottom: 20px;
        .spec-name {
          font-size: 14px;
          color: #323233;
          margin-bottom: 12px;
        }
        .spec-values {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;

          .spec-value-item {
            padding: 6px 16px;
            background-color: #f7f8fa;
            border: 1px solid transparent;
            border-radius: 16px;
            font-size: 13px;
            color: #323233;
            cursor: pointer;
            transition: all 0.2s;

            &.active {
              background-color: $light-blue-bg;
              border-color: $primary-blue;
              color: $primary-blue;
              font-weight: 500;
            }

            &.disabled {
              opacity: 0.4;
              cursor: not-allowed;
              background-color: #f5f5f5;
            }
          }
        }
      }
    }

    .sku-quantity {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid #ebedf0;
      margin-bottom: 16px;
      .quantity-label { font-size: 14px; color: #323233; }
    }

    .sku-actions {
      padding-top: 8px;
      
      .action-btn {
        width: 100%;
        height: 44px;
        border: none;
        border-radius: 22px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        
        &.btn-cart {
          background-color: $light-blue-bg;
          color: $primary-blue;
        }
        
        &.btn-buy {
          background: linear-gradient(135deg, #57b0ff, $primary-blue);
          color: #fff;
          box-shadow: 0 4px 10px rgba(25, 137, 250, 0.3);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
      }
    }
  }
}
</style>