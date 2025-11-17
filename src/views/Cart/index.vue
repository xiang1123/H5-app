<template>
  <div class="cart-page">
    <!-- 骨架屏 -->
    <CartSkeleton v-if="loading" />

    <!-- 实际内容 -->
    <div v-else class="cart-content">
      <!-- 顶部导航 -->
      <van-nav-bar title="购物车" fixed placeholder>
        <template #right>
          <span class="nav-btn" @click="onManage">{{ isManage ? '完成' : '管理' }}</span>
        </template>
      </van-nav-bar>

      <!-- 未登录状态 -->
      <div v-if="!userStore.isLogin" class="empty-container">
        <van-empty description="请先登录">
          <template #image>
            <van-icon name="shopping-cart-o" size="80" color="#dcdee0" />
          </template>
          <van-button round type="primary" class="empty-button" @click="goLogin">
            立即登录
          </van-button>
        </van-empty>
      </div>

      <!-- 已登录但购物车为空 -->
      <div v-else-if="cartStore.cartList.length === 0" class="empty-container">
        <van-empty description="购物车是空的">
          <template #image>
            <van-icon name="shopping-cart-o" size="80" color="#dcdee0" />
          </template>
          <van-button round type="primary" class="empty-button" @click="goShopping">
            去逛逛
          </van-button>
        </van-empty>
      </div>

      <!-- 购物车列表 -->
      <div v-else class="cart-list">
        <van-checkbox-group v-model="checkedIds" @change="onCheckChange">
          <van-swipe-cell
            v-for="item in cartStore.cartList"
            :key="item.id"
            class="cart-item-wrapper"
          >
            <div class="cart-item">
              <van-checkbox
                :name="item.id"
                @click.stop="onItemCheck(item)"
              />
              <div class="item-image" @click="goProductDetail(item)">
                <van-image
                  :src="getImageUrl(item.image)"
                  fit="cover"
                  width="80px"
                  height="80px"
                  lazy-load
                >
                  <template #loading>
                    <div class="image-loading">
                      <van-loading type="spinner" size="20" />
                    </div>
                  </template>
                  <template #error>
                    <div class="image-error">
                      <van-icon name="photo-fail" size="24" />
                    </div>
                  </template>
                </van-image>
              </div>
              <div class="item-info">
                <div class="item-name" @click="goProductDetail(item)">
                  {{ item.title }}
                </div>
                <div class="item-footer">
                  <div class="item-price">¥{{ formatPrice(item.unit_price) }}</div>
                  <van-stepper
                    v-model="item.quantity"
                    :min="1"
                    :disabled="isManage"
                    @change="onQuantityChange(item)"
                  />
                </div>
              </div>
            </div>

            <!-- 左滑删除 -->
            <template #right>
              <van-button
                square
                type="danger"
                text="删除"
                class="delete-button"
                @click="onDelete(item)"
              />
            </template>
          </van-swipe-cell>
        </van-checkbox-group>

        <!-- 推荐商品 -->
        <div class="recommend-section">
          <div class="recommend-title">
            <span>为你推荐</span>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div v-if="userStore.isLogin && cartStore.cartList.length > 0" class="cart-footer safe-area-bottom">
        <div class="footer-left">
          <van-checkbox
            v-model="allChecked"
            @change="onSelectAll"
          >
            全选
          </van-checkbox>
        </div>

        <div class="footer-right">
          <!-- 管理模式 -->
          <template v-if="isManage">
            <van-button
              type="danger"
              size="small"
              :disabled="cartStore.selectedCount === 0"
              @click="onDeleteSelected"
            >
              删除({{ cartStore.selectedCount }})
            </van-button>
          </template>

          <!-- 正常模式 -->
          <template v-else>
            <div class="total-info">
              <div class="total-label">合计:</div>
              <div class="total-price">¥{{ formatPrice(cartStore.totalPrice) }}</div>
            </div>
            <van-button
              type="danger"
              size="small"
              :disabled="cartStore.selectedCount === 0"
              @click="onCheckout"
            >
              结算({{ cartStore.selectedCount }})
            </van-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NavBar as VanNavBar,
  Empty as VanEmpty,
  Checkbox as VanCheckbox,
  CheckboxGroup as VanCheckboxGroup,
  Stepper as VanStepper,
  Button as VanButton,
  Icon as VanIcon,
  Image as VanImage,
  Loading as VanLoading,
  SwipeCell as VanSwipeCell,
  showConfirmDialog,
  showToast,
} from 'vant'
import CartSkeleton from '@/components/SkeletonScreen/CartSkeleton.vue'
import TabBar from '@/components/TabBar/index.vue'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'
import type { CartItem } from '@/api/cart'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const isManage = ref(false)
const checkedIds = ref<number[]>([])

// 是否全选
const allChecked = computed({
  get: () => cartStore.isAllSelected,
  set: (val: boolean) => {
    cartStore.selectAll(val)
  }
})

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

// 加载购物车数据
const loadCartData = async () => {
  if (!userStore.isLogin) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    await cartStore.fetchCartList()
    
    // 同步选中状态
    syncCheckedIds()
    
    console.log('购物车数据:', cartStore.cartList)
  } catch (error) {
    console.error('加载购物车失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 同步选中状态
const syncCheckedIds = () => {
  checkedIds.value = cartStore.cartList
    .filter(item => item.selected)
    .map(item => item.id)
}

// 复选框变化
const onCheckChange = (ids: number[]) => {
  cartStore.cartList.forEach(item => {
    item.selected = ids.includes(item.id)
  })
}

// 单个商品选中
const onItemCheck = (item: CartItem) => {
  cartStore.toggleSelect(item.id)
  syncCheckedIds()
}

// 全选/取消全选
const onSelectAll = (checked: boolean) => {
  cartStore.selectAll(checked)
  syncCheckedIds()
}

// 数量变化
const onQuantityChange = async (item: CartItem) => {
  try {
    await cartStore.updateQuantity(item.id, item.quantity)
  } catch (error) {
    // 更新失败，恢复原数量
    await loadCartData()
  }
}

// 删除单个商品
const onDelete = (item: CartItem) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该商品吗？',
  })
    .then(async () => {
      await cartStore.removeCartItem(item.id)
      syncCheckedIds()
    })
    .catch(() => {})
}

// 删除选中的商品
const onDeleteSelected = () => {
  if (cartStore.selectedCount === 0) {
    showToast('请选择要删除的商品')
    return
  }

  showConfirmDialog({
    title: '提示',
    message: `确定要删除选中的${cartStore.selectedCount}件商品吗？`,
  })
    .then(async () => {
      await cartStore.removeSelectedItems()
      syncCheckedIds()
      isManage.value = false
    })
    .catch(() => {})
}

// 管理模式切换
const onManage = () => {
  isManage.value = !isManage.value
}

// 去结算
const onCheckout = () => {
  if (cartStore.selectedCount === 0) {
    showToast('请选择要结算的商品')
    return
  }

  console.log('结算商品:', cartStore.cartList.filter(item => item.selected))

  // 跳转到订单确认页
  router.push({
    path: '/order/confirm',
    query: { type: 'cart' }
  })
}
// 去登录
const goLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: '/cart' }
  })
}

// 去逛逛
const goShopping = () => {
  router.push('/home')
}

// 跳转到商品详情
const goProductDetail = (item: CartItem) => {
  // 从 SKU ID 推断商品 ID（这里需要根据实际情况调整）
  // 如果后端返回了 product_id，使用 product_id
  // 否则使用 sku_id
  router.push({
    path: '/product/detail',
    query: { id: item.sku_id } // 或者 item.product_id
  })
}

// 监听登录状态
watch(
  () => userStore.isLogin,
  (isLogin) => {
    if (isLogin) {
      loadCartData()
    } else {
      cartStore.cartList = []
      loading.value = false
    }
  }
)

onMounted(() => {
  loadCartData()
})
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .cart-content {
    min-height: 100vh;
    padding-bottom: 100px;

    .nav-btn {
      font-size: 14px;
      color: #323233;
      cursor: pointer;
    }

    .empty-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 46px - 50px);
      padding: 20px;

      .empty-button {
        margin-top: 16px;
        width: 160px;
      }
    }

    .cart-list {
      padding: 12px 0;

      .cart-item-wrapper {
        margin-bottom: 12px;
        background-color: #fff;

        .cart-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;

          :deep(.van-checkbox) {
            margin-right: 12px;
          }

          .item-image {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            margin-right: 12px;
            background-color: #f7f8fa;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;

            :deep(.van-image) {
              width: 100%;
              height: 100%;
            }

            .image-loading,
            .image-error {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background-color: #f7f8fa;
              color: #dcdee0;
            }
          }

          .item-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 80px;

            .item-name {
              font-size: 14px;
              color: #323233;
              line-height: 20px;
              margin-bottom: 8px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              font-weight: 500;
              cursor: pointer;
            }

            .item-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .item-price {
                font-size: 18px;
                color: #ee0a24;
                font-weight: bold;

                &::before {
                  content: '¥';
                  font-size: 12px;
                }
              }
            }
          }
        }

        .delete-button {
          height: 100%;
        }
      }

      .recommend-section {
        margin-top: 24px;
        padding: 0 16px;

        .recommend-title {
          font-size: 16px;
          font-weight: bold;
          color: #323233;
          margin-bottom: 16px;
          text-align: center;

          &::before,
          &::after {
            content: '';
            display: inline-block;
            width: 30px;
            height: 1px;
            background-color: #dcdee0;
            vertical-align: middle;
            margin: 0 12px;
          }
        }
      }
    }

    .cart-footer {
      position: fixed;
      bottom: 50px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #fff;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
      z-index: 999;

      .footer-left {
        :deep(.van-checkbox) {
          .van-checkbox__label {
            font-size: 14px;
            color: #323233;
          }
        }
      }

      .footer-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .total-info {
          display: flex;
          align-items: baseline;
          gap: 4px;

          .total-label {
            font-size: 14px;
            color: #646566;
          }

          .total-price {
            font-size: 20px;
            color: #ee0a24;
            font-weight: bold;

            &::before {
              content: '¥';
              font-size: 12px;
            }
          }
        }

        :deep(.van-button) {
          min-width: 100px;
          height: 40px;
          border-radius: 20px;
        }
      }
    }
  }
}
</style>
