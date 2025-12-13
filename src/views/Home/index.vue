<template>
  <div class="blue-home">
    <div class="search-header">
      <div class="search-box" @click="goSearch">
        <div class="app-logo">
          <van-icon name="bag-o" size="20" color="#1989fa" />
        </div>
        <div class="search-input">
          <van-icon name="search" color="#999" size="16" />
          <span class="placeholder">搜索商品</span>
        </div>
        <div class="search-btn">搜索</div>
      </div>
    </div>

    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
      class="pull-content"
    >
      <div class="header-bg-decoration"></div>

      <div class="main-content">
        <div class="banner-wrapper" v-if="banners.length > 0">
          <van-swipe :autoplay="4000" indicator-color="#fff" class="my-swipe">
            <van-swipe-item v-for="item in banners" :key="item.id">
              <van-image
                :src="item.image_url"
                fit="cover"
                width="100%"
                height="100%"
              />
            </van-swipe-item>
          </van-swipe>
        </div>

        <div class="king-kong-area" v-if="topCategories.length > 0">
          <div
            v-for="item in topCategories"
            :key="item.id"
            class="nav-item"
            @click="goCategory(item)"
          >
            <div class="nav-icon-bg">
              <van-icon
                :name="getCategoryIcon(item.id)"
                size="22"
                color="#fff"
              />
            </div>
            <span class="nav-text">{{ item.name }}</span>
          </div>
        </div>

        <div class="recommend-feed">
          <div class="feed-header">
            <van-icon name="diamond-o" color="#1989fa" size="18" />
            <span class="main-title">为你推荐</span>
          </div>

          <van-list
            v-model:loading="listLoading"
            v-model:error="listError"
            :finished="finished"
            finished-text="没有更多了"
            error-text="请求失败，点击重新加载"
            @load="onLoad"
            :immediate-check="false"
            :offset="50"
          >
            <div class="goods-list-vertical">
              <div
                v-for="item in products"
                :key="item.id"
                class="goods-card-horizontal"
                @click="goProductDetail(item.id)"
              >
                <div class="img-wrapper">
                  <van-image
                    :src="getImageUrl(item.cover_image)"
                    fit="cover"
                    width="100%"
                    height="100%"
                    radius="6px"
                    lazy-load
                  >
                    <template #loading>
                      <div class="loading-holder">
                        <van-loading size="20" />
                      </div>
                    </template>
                  </van-image>
                  <div class="sold-out-mask" v-if="item.status !== 'ON_SALE'">
                    <span>{{ getStatusText(item.status) }}</span>
                  </div>
                </div>

                <div class="info-wrapper">
                  <div class="info-top">
                    <div class="goods-title">{{ item.title }}</div>
                    <div class="goods-sub-title" v-if="item.subtitle">
                      {{ item.subtitle }}
                    </div>
                  </div>

                  <div class="goods-bottom">
                    <div class="price-box">
                      <span class="symbol">¥</span>
                      <span class="int">{{ getPriceInt(item.price) }}</span>
                      <span class="dec">.{{ getPriceDec(item.price) }}</span>
                    </div>
                    <div class="detail-btn">查看详情</div>
                  </div>
                </div>
              </div>
            </div>
          </van-list>

          <van-empty
            v-if="
              !listLoading && !listError && products.length === 0 && !refreshing
            "
            description="暂无商品"
            image="search"
          />
        </div>
      </div>
    </van-pull-refresh>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import {
  Icon as VanIcon,
  Swipe as VanSwipe,
  SwipeItem as VanSwipeItem,
  Image as VanImage,
  List as VanList,
  Loading as VanLoading,
  Empty as VanEmpty,
  PullRefresh as VanPullRefresh,
  showToast,
} from 'vant'
import TabBar from '@/components/TabBar/index.vue'
import { getBanners, getCategories, getProducts } from '@/api/home'

interface Category {
  id: number
  parent_id: number | null
  name: string
  level: number
  sort_order: number
  is_visible: number
}

interface Product {
  id: number
  title: string
  subtitle: string
  cover_image: string
  category_id: number
  status: string
  price?: number
}

const router = useRouter()
const loading = ref(false)
const listLoading = ref(false)
const listError = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const isFirstLoad = ref(true)

const banners = ref<any[]>([])
const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const pageParams = ref({
  page: 1,
  page_size: 10,
  total: 0,
})

const topCategories = computed(() => {
  return categories.value
    .filter((item) => item.level === 1 || item.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 10)
})

const getCategoryIcon = (id: number) => {
  const iconMap: Record<number, string> = {
    1: 'bag-o',
    2: 'gift-o',
    3: 'gem-o',
    4: 'flower-o',
    5: 'shop-o',
    6: 'fire-o',
    7: 'star-o',
    8: 'music-o',
  }
  return iconMap[id] || 'apps-o'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    ON_SALE: '',
    OFF_SALE: '已下架',
    SOLD_OUT: '抢光了',
  }
  return map[status] || status
}

const getPriceInt = (price?: number) => {
  if (!price) return '0'
  return Math.floor(price).toString()
}
const getPriceDec = (price?: number) => {
  if (!price) return '00'
  return (price % 1).toFixed(2).substring(2)
}

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  return url.startsWith('/') ? `${baseURL}${url}` : `${baseURL}/${url}`
}

const loadData = async () => {
  try {
    loading.value = true
    const [bannersRes, categoriesRes] = await Promise.all([
      getBanners(),
      getCategories(),
    ])
    if (bannersRes?.data) banners.value = bannersRes.data
    if (categoriesRes?.data) categories.value = categoriesRes.data

    // 重置状态
    pageParams.value.page = 1
    finished.value = false
    listError.value = false
    products.value = []

    await loadProducts(false)
  } catch (error) {
    console.error(error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const loadProducts = async (isLoadMore = false) => {
  try {
    listError.value = false

    const res = await getProducts({
      page: pageParams.value.page,
      page_size: pageParams.value.page_size,
    })

    if (res?.data) {
      const { list, total } = res.data

      if (isLoadMore) {
        products.value = [...products.value, ...list]
      } else {
        products.value = list
      }

      pageParams.value.total = total

      if (products.value.length >= total || list.length === 0) {
        finished.value = true
      } else {
        finished.value = false
      }
    } else {
      finished.value = true
    }
  } catch (e) {
    console.error('加载商品失败:', e)
    listError.value = true
    // 如果是加载更多失败，回退页码，方便重试
    if (isLoadMore && pageParams.value.page > 1) {
      pageParams.value.page--
    }
  } finally {
    // 必须关闭 loading 状态
    listLoading.value = false
  }
}

const onLoad = () => {
  // 【修复】不能判断 listLoading.value，因为 van-list 触发 load 时会自动设为 true
  if (finished.value || listError.value) return

  pageParams.value.page++
  loadProducts(true)
}

const onRefresh = async () => {
  try {
    finished.value = false
    listLoading.value = false
    listError.value = false
    await loadData()
    showToast('刷新成功')
  } finally {
    refreshing.value = false
  }
}

const goSearch = () => router.push('/search')
const goCategory = (item: Category) =>
  router.push({ name: 'Category', query: { id: item.id } })
const goProductDetail = (id: number) =>
  router.push({ path: '/product/detail', query: { id } })

onMounted(() => {
  if (isFirstLoad.value) {
    loadData()
    isFirstLoad.value = false
  }
})

onDeactivated(() => {
  listLoading.value = false
})
</script>

<style lang="scss" scoped>
$primary-blue: #1989fa;
$bg-gray: #f7f8fa;

.blue-home {
  min-height: 100vh;
  background-color: $bg-gray;
  padding-bottom: 50px;
  position: relative;

  .search-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: $primary-blue;
    padding: 6px 12px;

    .search-box {
      display: flex;
      align-items: center;
      background: #fff;
      height: 32px;
      border-radius: 16px;
      padding: 0 4px 0 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .app-logo {
        margin-right: 8px;
        display: flex;
        align-items: center;
        border-right: 1px solid #eee;
        padding-right: 8px;
        height: 16px;
      }

      .search-input {
        flex: 1;
        display: flex;
        align-items: center;
        color: #999;
        font-size: 13px;
        .van-icon {
          margin-right: 4px;
        }
      }

      .search-btn {
        background: linear-gradient(90deg, #3b9cff, $primary-blue);
        color: #fff;
        font-size: 13px;
        padding: 4px 12px;
        border-radius: 14px;
        font-weight: 500;
      }
    }
  }

  :deep(.van-pull-refresh) {
    padding-top: 44px;
    min-height: 100vh;
  }

  .header-bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: $primary-blue;
    z-index: 0;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  .main-content {
    position: relative;
    z-index: 1;
    padding: 0 10px;
  }

  .banner-wrapper {
    margin-top: 6px;
    border-radius: 8px;
    overflow: hidden;
    height: 150px;
    box-shadow: 0 4px 8px rgba(25, 137, 250, 0.15);
  }

  .king-kong-area {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px 0;
    background: #fff;
    margin: 8px 0;
    padding: 10px 0;
    border-radius: 8px;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .nav-icon-bg {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #57b0ff 0%, $primary-blue 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
      }
      .nav-text {
        font-size: 11px;
        color: #333;
      }
    }
  }

  .recommend-feed {
    .feed-header {
      margin: 12px 0 8px;
      padding-left: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
      .main-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
      }
    }

    .goods-list-vertical {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-bottom: 10px;

      .goods-card-horizontal {
        display: flex;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        height: 120px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);

        &:active {
          background-color: #fafafa;
        }

        .img-wrapper {
          width: 120px;
          height: 120px;
          position: relative;
          background: #f8f8f8;
          flex-shrink: 0;

          :deep(.van-image) {
            display: block;
          }

          .loading-holder {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: #eee;
          }

          .sold-out-mask {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
          }
        }

        .info-wrapper {
          flex: 1;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;

          .info-top {
            .goods-title {
              font-size: 14px;
              color: #333;
              line-height: 1.4;
              height: 40px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              margin-bottom: 4px;
              font-weight: 500;
            }
            .goods-sub-title {
              font-size: 11px;
              color: #999;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .goods-bottom {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;

            .price-box {
              color: #ff4d4f;
              font-weight: bold;
              line-height: 1;
              .symbol {
                font-size: 12px;
                margin-right: 1px;
              }
              .int {
                font-size: 18px;
              }
              .dec {
                font-size: 12px;
              }
            }

            .detail-btn {
              padding: 5px 12px;
              background: #eef7ff;
              color: $primary-blue;
              border-radius: 14px;
              font-size: 12px;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>
