<template>
  <div class="product-detail-page">
    <!-- 顶部导航 -->
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

    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <van-skeleton title :row="3" />
      <van-skeleton title :row="3" />
      <van-skeleton title :row="3" />
    </div>

    <!-- 商品内容 -->
    <div v-else-if="product" class="product-content">
      <!-- 商品图片轮播 -->
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

      <!-- 商品信息 -->
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
            type="danger"
            plain
            size="medium"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <!-- 规格选择 -->
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

      <!-- 商品详情 -->
      <div class="detail-section">
        <van-tabs v-model:active="activeTab" sticky offset-top="46">
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

    <!-- 商品不存在 -->
    <van-empty v-else description="商品不存在" />

    <!-- 底部操作栏 -->
    <div class="product-footer safe-area-bottom">
      <div class="footer-icons">
        <div class="icon-item" @click="goHome">
          <van-icon name="wap-home-o" size="20" />
          <span>首页</span>
        </div>
        <div class="icon-item" @click="goCart">
          <van-badge :content="cartBadge" :show-zero="false">
            <van-icon name="shopping-cart-o" size="20" />
          </van-badge>
          <span>购物车</span>
        </div>
        <div class="icon-item" @click="onCollect">
          <van-icon
            :name="isCollected ? 'star' : 'star-o'"
            :color="isCollected ? '#ee0a24' : ''"
            size="20"
          />
          <span>收藏</span>
        </div>
      </div>
      <div class="footer-buttons">
        <van-button type="warning" round @click="onAddToCart">
          加入购物车
        </van-button>
        <van-button type="danger" round @click="onBuyNow">
          立即购买
        </van-button>
      </div>
    </div>

    <!-- SKU 选择弹窗 -->
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
          <!-- 颜色选择 -->
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

          <!-- 尺寸选择 -->
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
          <van-button
            v-if="actionType === 'cart'"
            type="warning"
            block
            round
            :disabled="!canSubmit"
            @click="confirmAddToCart"
          >
            确认
          </van-button>
          <van-button
            v-else
            type="danger"
            block
            round
            :disabled="!canSubmit"
            @click="confirmBuyNow"
          >
            确认
          </van-button>
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

  // 如果当前 SKU 有图片，优先显示 SKU 图片
  const images = []

  if (currentSku.value?.image) {
    images.push(currentSku.value.image)
  }

  images.push(product.value.cover_image)

  if (product.value.images && product.value.images.length > 0) {
    images.push(...product.value.images)
  }

  // 去重
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

  // 根据选中的颜色和尺寸查找 SKU
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

  // 如果没有选中 SKU，显示价格区间
  if (skuList.value.length > 0) {
    const prices = skuList.value.map((sku) => sku.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      return minPrice
    }

    // 返回最低价
    return minPrice
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
  // 如果有 SKU，必须选择完整
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

// 判断颜色是否可选
const isColorAvailable = (color: string): boolean => {
  return skuList.value.some((sku) => {
    const colorMatch = sku.color === color
    const sizeMatch = !selectedSize.value || sku.size === selectedSize.value
    return colorMatch && sizeMatch && sku.stock > 0
  })
}

// 判断尺寸是否可选
const isSizeAvailable = (size: string): boolean => {
  return skuList.value.some((sku) => {
    const colorMatch = !selectedColor.value || sku.color === selectedColor.value
    const sizeMatch = sku.size === size
    return colorMatch && sizeMatch && sku.stock > 0
  })
}

// 选择颜色
const selectColor = (color: string) => {
  if (!isColorAvailable(color)) return

  if (selectedColor.value === color) {
    selectedColor.value = ''
  } else {
    selectedColor.value = color

    // 自动选择第一个可用的尺寸
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

// 选择尺寸
const selectSize = (size: string) => {
  if (!isSizeAvailable(size)) return

  if (selectedSize.value === size) {
    selectedSize.value = ''
  } else {
    selectedSize.value = size

    // 自动选择第一个可用的颜色
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

// 自动选择第一个可用的 SKU
const autoSelectFirstSku = () => {
  if (skuList.value.length === 0) return

  console.log('自动选择第一个可用的 SKU')

  // 查找第一个有库存的 SKU
  const firstAvailableSku = skuList.value.find((sku) => sku.stock > 0)

  if (firstAvailableSku) {
    selectedColor.value = firstAvailableSku.color
    selectedSize.value = firstAvailableSku.size

    console.log('已自动选择:', {
      color: selectedColor.value,
      size: selectedSize.value,
      sku: firstAvailableSku,
    })
  } else {
    // 如果所有 SKU 都没有库存，选择第一个
    const firstSku = skuList.value[0]
    selectedColor.value = firstSku.color
    selectedSize.value = firstSku.size

    console.log('所有 SKU 无库存，选择第一个:', firstSku)
  }
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

// 轮播图切换
const onSwipeChange = (index: number) => {
  currentSwipeIndex.value = index
}

// 加载商品详情
const loadProductDetail = async () => {
  try {
    loading.value = true

    const productId = route.query.id as string

    console.log('商品ID:', productId, '类型:', typeof productId)

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

    console.log('请求商品详情，ID:', numericId)

    // 并行请求商品详情和 SKU 列表
    const [detailRes, skuRes] = await Promise.all([
      getProductDetail(numericId),
      getProductSkus(numericId),
    ])

    console.log('商品详情响应:', detailRes)
    console.log('SKU列表响应:', skuRes)

    if (detailRes.code === 0 && detailRes.data) {
      product.value = detailRes.data
    } else {
      product.value = null
      showToast(detailRes.message || '获取商品详情失败')
    }

    if (skuRes.code === 0 && skuRes.data) {
      // 直接使用返回的数组
      skuList.value = skuRes.data

      console.log('SKU列表:', skuList.value)
      console.log('颜色选项:', colorOptions.value)
      console.log('尺寸选项:', sizeOptions.value)

      // 自动选择第一个可用的 SKU
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

// 监听选中的 SKU 变化，更新轮播图
watch(currentSku, (newSku) => {
  if (newSku?.image) {
    // 如果 SKU 有图片，重置轮播图到第一张
    currentSwipeIndex.value = 0
  }
})

// 图片预览
const previewImages = (startIndex: number) => {
  ImagePreview({
    images: productImages.value.map((img) => getImageUrl(img)),
    startPosition: startIndex,
  })
}

// 返回
const onBack = () => {
  router.back()
}

// 分享
const onShare = () => {
  showToast('分享功能开发中')
}

// 去首页
const goHome = () => {
  router.push('/home')
}

// 去购物车
const goCart = () => {
  router.push('/cart')
}

// 收藏/取消收藏
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

// 加入购物车
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

  // 如果没有 SKU，提示错误
  if (skuList.value.length === 0) {
    showToast('该商品暂无可购买规格')
    return
  }

  // 显示 SKU 选择弹窗
  actionType.value = 'cart'
  showSkuPopup.value = true
}

// 确认加入购物车
const confirmAddToCart = async () => {
  try {
    // 检查是否选择了规格
    if (!currentSku.value) {
      showToast('请选择商品规格')
      return
    }

    // 检查库存
    if (currentSku.value.stock < quantity.value) {
      showToast('库存不足')
      return
    }

    // 添加到购物车
    await cartStore.addCartItem({
      sku_id: currentSku.value.id,
      quantity: quantity.value,
    })

    // 关闭弹窗
    showSkuPopup.value = false

    // 重置数量
    quantity.value = 1
  } catch (error) {
    console.error('添加购物车失败:', error)
  }
}

// 立即购买
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

  // 如果没有 SKU，提示错误
  if (skuList.value.length === 0) {
    showToast('该商品暂无可购买规格')
    return
  }

  // 显示 SKU 选择弹窗
  actionType.value = 'buy'
  showSkuPopup.value = true
}

// 确认立即购买
const confirmBuyNow = async () => {
  // 检查是否选择了规格
  if (skuList.value.length > 0 && !currentSku.value) {
    showToast('请选择商品规格')
    return
  }

  // 检查库存
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

    // 先添加到购物车
    await cartStore.addCartItem({
      sku_id: currentSku.value!.id,
      quantity: quantity.value,
    })

    // 重新获取购物车列表
    await cartStore.fetchCartList()

    // 找到刚添加的商品并选中
    const addedItem = cartStore.cartList.find(
      (item) => item.sku_id === currentSku.value!.id
    )
    if (addedItem) {
      // 取消其他商品的选中状态
      cartStore.selectAll(false)
      // 只选中当前商品
      cartStore.toggleSelect(addedItem.id)
    }

    closeToast()

    console.log('立即购买 - 已添加到购物车并选中')

    // 跳转到订单确认页
    router.push({
      path: '/order/confirm',
      query: {
        type: 'buy',
      },
    })

    // 关闭弹窗
    showSkuPopup.value = false

    // 重置数量和选择
    quantity.value = 1
    selectedColor.value = ''
    selectedSize.value = ''
  } catch (error) {
    closeToast()
    console.error('立即购买失败:', error)
    showToast('操作失败')
  }
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style lang="scss" scoped>
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
          color: #ee0a24;
          font-weight: bold;

          .symbol {
            font-size: 16px;
          }

          .price {
            font-size: 28px;
          }
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

      &:active {
        background-color: #f7f8fa;
      }

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

        .detail-images {
          :deep(.van-image) {
            margin-bottom: 8px;
          }
        }
      }

      .comment-content {
        padding: 40px 16px;
      }
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
      margin-right: 12px;

      .icon-item {
        position: relative; // 添加相对定位
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center; // 添加垂直居中
        min-width: 44px; // 设置最小宽度，确保一致性
        height: 44px; // 设置固定高度
        cursor: pointer;

        &:active {
          opacity: 0.7;
        }

        // Badge 容器样式优化
        :deep(.van-badge) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .van-badge__wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2px; // 调整图标和文字的间距
          }
        }

        // 图标样式
        .van-icon {
          display: block;
          margin-bottom: 2px; // 统一图标和文字的间距
        }

        span {
          font-size: 10px;
          color: #646566;
          line-height: 1;
          white-space: nowrap; // 防止文字换行
        }
      }
    }

    .footer-buttons {
      flex: 1;
      display: flex;
      gap: 12px;

      :deep(.van-button) {
        flex: 1;
        height: 40px;
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
          color: #ee0a24;
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
            padding: 8px 16px;
            background-color: #f7f8fa;
            border: 1px solid #ebedf0;
            border-radius: 4px;
            font-size: 13px;
            color: #323233;
            cursor: pointer;
            transition: all 0.3s;

            &.active {
              background-color: #fff7f0;
              border-color: #ee0a24;
              color: #ee0a24;
            }

            &.disabled {
              opacity: 0.4;
              cursor: not-allowed;
            }

            &:not(.disabled):active {
              transform: scale(0.95);
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

      .quantity-label {
        font-size: 14px;
        color: #323233;
      }
    }

    .sku-actions {
      padding-top: 16px;
    }
  }
}
</style>
