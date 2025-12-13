<template>
  <div class="cart-page">
    <CartSkeleton v-if="loading" />

    <div v-else class="cart-content">
      <van-nav-bar title="购物车" fixed placeholder>
        <template #right>
          <span class="nav-btn" @click="onManage">{{
            isManage ? '完成' : '管理'
          }}</span>
        </template>
      </van-nav-bar>

      <div v-if="!userStore.isLogin" class="empty-container">
        <van-empty description="请先登录">
          <template #image>
            <van-icon name="shopping-cart-o" size="80" color="#dcdee0" />
          </template>
          <van-button
            round
            type="primary"
            class="empty-button"
            @click="goLogin"
          >
            立即登录
          </van-button>
        </van-empty>
      </div>

      <div v-else-if="cartStore.cartList.length === 0" class="empty-container">
        <van-empty description="购物车是空的">
          <template #image>
            <van-icon name="shopping-cart-o" size="80" color="#dcdee0" />
          </template>
          <van-button
            round
            type="primary"
            class="empty-button"
            @click="goShopping"
          >
            去逛逛
          </van-button>
        </van-empty>
      </div>

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
                checked-color="#1989fa"
              />
              <div class="item-image" @click="goProductDetail(item.product_id)">
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
                <div class="item-name" @click="goProductDetail(item.product_id)">
                  {{ item.title }}
                </div>
                <div class="item-sku-info">
                  <span v-if="item.color">{{ item.color }}</span>
                  <span v-if="item.color && item.size"> / </span>
                  <span v-if="item.size">{{ item.size }}</span>
                </div>
                <div class="item-footer">
                  <div class="item-price">
                    ¥{{ formatPrice(item.unit_price) }}
                  </div>
                  <van-stepper
                    v-model="item.quantity"
                    :min="1"
                    :disabled="isManage"
                    @change="onQuantityChange(item)"
                  />
                </div>
              </div>
            </div>

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

        <!-- <div class="recommend-section">
          <div class="recommend-title">
            <span>为你推荐</span>
          </div>
        </div> -->
      </div>

      <div
        v-if="userStore.isLogin && cartStore.cartList.length > 0"
        class="cart-footer safe-area-bottom"
      >
        <div class="footer-left">
          <van-checkbox
            v-model="allChecked"
            @change="onSelectAll"
            checked-color="#1989fa"
          >
            全选
          </van-checkbox>
        </div>

        <div class="footer-right">
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

          <template v-else>
            <div class="total-info">
              <div class="total-label">合计:</div>
              <div class="total-price price-blue">
                ¥{{ formatPrice(cartStore.totalPrice) }}
              </div>
            </div>
            <van-button
              type="primary"
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
// 扩展 CartItem 类型以包含 color 和 size 字段
// 假设 CartItem 来源于 @/api/cart
type CartItem = {
  id: number
  sku_id: number
  product_id: number
  title: string
  image: string
  unit_price: number
  quantity: number
  total_price: number
  color?: string // 可能是可选的
  size?: string // 可能是可选的
  stock: number
  selected: boolean
}

// 确保使用扩展后的 CartItem 类型
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
  },
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
    .filter((item) => item.selected)
    .map((item) => item.id)
}

// 复选框变化
const onCheckChange = (ids: number[]) => {
  cartStore.cartList.forEach((item) => {
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
    // 调用store中的更新方法
    await cartStore.updateCartItem({
      id: item.id,
      quantity: item.quantity
    })
  } catch (error) {
    console.error('更新数量失败:', error)
    showToast('更新数量失败')
    // 更新失败，恢复原数量
    await loadCartData()
  }
}

// 删除单个商品
const onDelete = (item: CartItem) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该商品吗？',
    confirmButtonColor: '#1989fa', // 蓝色确认按钮
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
    confirmButtonColor: '#1989fa', // 蓝色确认按钮
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

  console.log(
    '结算商品:',
    cartStore.cartList.filter((item) => item.selected)
  )

  // 跳转到订单确认页
  router.push({
    path: '/order/confirm',
    query: { type: 'cart' },
  })
}
// 去登录
const goLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: '/cart' },
  })
}

// 去逛逛
const goShopping = () => {
  router.push('/home')
}

// 跳转到商品详情
const goProductDetail = (id: number) => {
  // 如果商品 ID 无效（例如为 0 或 null），阻止跳转并提示用户
  if (!id || id <= 0 || isNaN(id)) {
    showToast('商品信息无效，无法查看详情')
    return
  }

  router.push({
    path: '/product/detail',
    query: { id: id }, // ID 现在是 item.product_id
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
// 定义主题蓝色
$theme-color: #1989fa;
$price-color: $theme-color; // 价格使用主题色

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
      // 调整高度以适应新的底部导航高度，如果 TabBar 是 50px
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
              margin-bottom: 4px; /* 调整间距 */
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              font-weight: 500;
              cursor: pointer;
            }

            /* 新增 SKU 样式 */
            .item-sku-info {
              font-size: 12px;
              color: #969799; /* 灰色调 */
              margin-bottom: 8px;
            }

            .item-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .item-price {
                font-size: 18px;
                color: $price-color; // 使用主题色作为价格颜色
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

          .total-price.price-blue {
            font-size: 20px;
            color: $price-color; // 价格使用主题色
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
