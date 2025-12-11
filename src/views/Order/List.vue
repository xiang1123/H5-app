<template>
  <div class="order-list-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="我的订单"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <!-- 订单状态 Tab -->
    <van-tabs
      v-model:active="activeTab"
      sticky
      offset-top="46"
      @change="onTabChange"
    >
      <van-tab title="全部" name=""></van-tab>
      <van-tab title="待付款" name="UNPAID"></van-tab>
      <van-tab title="待发货" name="PAID"></van-tab>
      <van-tab title="待收货" name="SHIPPING"></van-tab>
      <van-tab title="已完成" name="COMPLETED"></van-tab>
    </van-tabs>

    <!-- 订单列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
      >
        <div class="order-list">
          <div
            v-for="order in orderList"
            :key="order.id"
            class="order-item"
            @click="goOrderDetail(order.id)"
          >
            <!-- 订单头部 -->
            <div class="order-header">
              <span class="order-no">订单号：{{ order.order_no }}</span>
              <span
                class="order-status"
                :class="`status-${order.status.toLowerCase()}`"
              >
                {{ getOrderStatusText(order.status) }}
              </span>
            </div>

            <!-- 订单商品 -->
            <div class="order-goods">
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
                  lazy-load
                />
                <div class="goods-info">
                  <div class="goods-name">{{ item.title }}</div>
                  <div class="goods-sku" v-if="item.sku_attrs">
                    {{ formatSkuAttrs(item.sku_attrs) }}
                  </div>
                  <div class="goods-footer">
                    <span class="goods-price"
                      >¥{{ formatPrice(item.unit_price) }}</span
                    >
                    <span class="goods-quantity">x{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单底部 -->
            <div class="order-footer">
              <div class="order-total">
                共{{ order.items.length }}件商品 合计：
                <span class="total-price"
                  >¥{{ formatPrice(order.amount_payable) }}</span
                >
              </div>
              <div class="order-actions">
                <!-- 待付款 -->
                <template v-if="order.status === 'UNPAID'">
                  <van-button
                    size="small"
                    plain
                    @click.stop="onCancelOrder(order)"
                  >
                    取消订单
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    @click.stop="onPayOrder(order)"
                  >
                    立即支付
                  </van-button>
                </template>

                <!-- 待发货 -->
                <template v-else-if="order.status === 'PAID'">
                  <van-button
                    size="small"
                    plain
                    @click.stop="onRemindShip(order)"
                  >
                    提醒发货
                  </van-button>
                </template>

                <!-- 待收货 -->
                <template
                  v-else-if="
                    order.status === 'SHIPPING' || order.status === 'SHIPPED'
                  "
                >
                  <van-button
                    size="small"
                    plain
                    @click.stop="onViewLogistics(order)"
                  >
                    查看物流
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    @click.stop="onConfirmReceipt(order)"
                  >
                    确认收货
                  </van-button>
                </template>

                <!-- 已完成 -->
                <template v-else-if="order.status === 'COMPLETED'">
                  <van-button
                    size="small"
                    plain
                    @click.stop="onDeleteOrder(order)"
                  >
                    删除订单
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    @click.stop="onComment(order)"
                  >
                    评价
                  </van-button>
                </template>

                <!-- 已取消 -->
                <template v-else-if="order.status === 'CANCELED'">
                  <van-button
                    size="small"
                    plain
                    @click.stop="onDeleteOrder(order)"
                  >
                    删除订单
                  </van-button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="!listLoading && orderList.length === 0 && !refreshing"
          description="暂无订单"
          image="search"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Tabs as VanTabs,
  Tab as VanTab,
  List as VanList,
  PullRefresh as VanPullRefresh,
  Image as VanImage,
  Button as VanButton,
  Empty as VanEmpty,
  showConfirmDialog,
  showToast,
} from 'vant'
import {
  getOrderList,
  cancelOrder,
  confirmOrder,
  getOrderStatusText,
  type Order,
} from '@/api/order'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const listLoading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const activeTab = ref('')
const orderList = ref<Order[]>([])

// 分页参数
const pageParams = ref({
  page: 1,
  page_size: 10,
  total: 0,
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

// 格式化 SKU 属性
const formatSkuAttrs = (attrs: any) => {
  if (!attrs) return ''

  if (typeof attrs === 'string') return attrs

  // 如果是对象，格式化为字符串
  const parts = []
  if (attrs.color) parts.push(attrs.color)
  if (attrs.size) parts.push(attrs.size)

  return parts.join(' / ')
}

// 加载订单列表
const loadOrderList = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      listLoading.value = true
    } else {
      loading.value = true
    }

    const params: any = {
      page: pageParams.value.page,
      page_size: pageParams.value.page_size,
    }

    // 如果有状态筛选
    if (activeTab.value) {
      params.status = activeTab.value
    }

    console.log('请求订单列表，参数:', params)

    const res = await getOrderList(params)
    console.log('订单列表响应:', res)

    if (res.code === 0 && res.data) {
      const { list, total } = res.data

      // 如果是加载更多，追加数据；否则替换数据
      if (isLoadMore) {
        orderList.value = [...orderList.value, ...list]
      } else {
        orderList.value = list
      }

      pageParams.value.total = total

      // 判断是否还有更多数据
      if (orderList.value.length >= total) {
        finished.value = true
      } else {
        finished.value = false
      }
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    showToast('加载失败')
    if (isLoadMore) {
      finished.value = true
    }
  } finally {
    loading.value = false
    if (isLoadMore) {
      listLoading.value = false
    }
  }
}

// Tab 切换
const onTabChange = () => {
  console.log('切换 Tab:', activeTab.value)
  resetAndLoad()
}

// 重置并加载
const resetAndLoad = () => {
  pageParams.value.page = 1
  finished.value = false
  orderList.value = []
  loadOrderList()
}

// 上拉加载更多
const onLoad = async () => {
  if (finished.value) {
    return
  }

  pageParams.value.page += 1
  await loadOrderList(true)
}

// 下拉刷新
const onRefresh = async () => {
  resetAndLoad()
  refreshing.value = false
}

// 返回
const onBack = () => {
  router.back()
}

// 跳转订单详情
const goOrderDetail = (orderId: number) => {
  router.push({
    path: '/order/detail',
    query: { id: orderId },
  })
}

// 取消订单
const onCancelOrder = (order: Order) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要取消该订单吗？',
  })
    .then(async () => {
      try {
        const res = await cancelOrder(order.id)
        if (res.code === 0) {
          showToast('订单已取消')
          resetAndLoad()
        }
      } catch (error) {
        console.error('取消订单失败:', error)
        showToast('操作失败')
      }
    })
    .catch(() => {})
}

// 支付订单
const onPayOrder = (order: Order) => {
  router.push({
    path: '/order/pay',
    query: { id: order.id },
  })
}

// 提醒发货
const onRemindShip = (order: Order) => {
  showToast('已提醒商家发货')
}

// 查看物流
const onViewLogistics = (order: Order) => {
  if (
    order.status === 'SHIPPING' ||
    order.status === 'SHIPPED' ||
    order.status === 'COMPLETED'
  ) {
    router.push({
      path: '/order/logistics',
      query: { id: order.id },
    })
  } else {
    showToast('订单尚未发货')
  }
}

// 确认收货
const onConfirmReceipt = (order: Order) => {
  showConfirmDialog({
    title: '提示',
    message: '确认已收到货物吗？',
  })
    .then(async () => {
      try {
        const res = await confirmOrder(order.id)
        if (res.code === 0) {
          showToast('确认收货成功')
          resetAndLoad()
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        showToast('操作失败')
      }
    })
    .catch(() => {})
}

// 删除订单
const onDeleteOrder = (order: Order) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该订单吗？',
  })
    .then(() => {
      showToast('删除成功')
      resetAndLoad()
    })
    .catch(() => {})
}

// 评价订单
const onComment = (order: Order) => {
  showToast('功能正在开发中...')
}

onMounted(() => {
  // 从 URL 获取状态参数
  if (route.query.status) {
    activeTab.value = route.query.status as string
  }

  loadOrderList()
})
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;

  .order-list {
    padding: 12px 16px;

    .order-item {
      margin-bottom: 12px;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: #f7f8fa;
        border-bottom: 1px solid #ebedf0;

        .order-no {
          font-size: 13px;
          color: #646566;
        }

        .order-status {
          font-size: 13px;
          font-weight: bold;

          &.status-unpaid {
            color: #ee0a24;
          }

          &.status-paid {
            color: #ff976a;
          }

          &.status-shipping,
          &.status-shipped {
            color: #1989fa;
          }

          &.status-completed {
            color: #07c160;
          }

          &.status-canceled {
            color: #969799;
          }
        }
      }

      .order-goods {
        padding: 12px 16px;

        .goods-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          :deep(.van-image) {
            flex-shrink: 0;
            border-radius: 8px;
            overflow: hidden;
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
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
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
                font-size: 14px;
                color: #323233;
              }

              .goods-quantity {
                font-size: 12px;
                color: #969799;
              }
            }
          }
        }
      }

      .order-footer {
        padding: 12px 16px;
        border-top: 1px solid #ebedf0;

        .order-total {
          font-size: 14px;
          color: #646566;
          text-align: right;
          margin-bottom: 12px;

          .total-price {
            color: #ee0a24;
            font-size: 16px;
            font-weight: bold;
          }
        }

        .order-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;

          :deep(.van-button) {
            height: 32px;
            padding: 0 16px;
          }
        }
      }
    }
  }

  :deep(.van-list__finished-text) {
    padding: 16px 0;
    color: #969799;
    font-size: 14px;
  }
}
</style>
