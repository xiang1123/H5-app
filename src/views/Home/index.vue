<template>
  <div class="home-page">
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="home-content">
        <!-- 搜索栏 -->
        <div class="search-bar" @click="goSearch">
          <van-icon name="search" />
          <span class="search-text">搜索商品</span>
        </div>

        <!-- 轮播图 -->
        <div class="banner" v-if="banners.length > 0">
          <van-swipe :autoplay="3000" indicator-color="#e93b3d">
            <van-swipe-item v-for="item in banners" :key="item.id">
              <div class="banner-item">
                <van-image
                  :src="item.image_url"
                  fit="cover"
                  width="100%"
                  height="180px"
                />
              </div>
            </van-swipe-item>
          </van-swipe>
        </div>

        <!-- 导航图标 -->
        <div class="nav-grid" v-if="topCategories.length > 0">
          <div
            v-for="item in topCategories"
            :key="item.id"
            class="nav-item"
            @click="goCategory(item)"
          >
            <div class="nav-icon">
              <van-icon :name="getCategoryIcon(item.id)" size="24" />
            </div>
            <div class="nav-text">{{ item.name }}</div>
          </div>
        </div>

        <!-- 秒杀区域 -->
        <div class="seckill-section">
          <div class="section-header">
            <span class="title">限时秒杀</span>
            <span class="more">更多 ></span>
          </div>
          <div class="seckill-content">秒杀商品区域</div>
        </div>

        <!-- 商品列表 - 使用 List 组件实现上拉加载 -->
        <div class="goods-list">
          <div class="section-header">
            <span class="title">为你推荐</span>
          </div>

          <van-list
            v-model:loading="listLoading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
            :immediate-check="false"
            :offset="100"
          >
            <div class="goods-grid">
              <div
                v-for="item in products"
                :key="item.id"
                class="goods-item"
                @click="goProductDetail(item.id)"
              >
                <div class="goods-image">
                  <van-image
                    width="100%"
                    height="156px"
                    :src="getImageUrl(item.cover_image)"
                    fit="cover"
                    lazy-load
                  >
                    <template #loading>
                      <div class="image-loading">
                        <van-loading type="spinner" size="20" />
                      </div>
                    </template>
                    <template #error>
                      <div class="image-error">
                        <van-icon name="photo-fail" size="32" />
                        <div>图片加载失败</div>
                      </div>
                    </template>
                  </van-image>
                  
                  <!-- 商品状态标签 -->
                  <div class="goods-status" v-if="item.status !== 'ON_SALE'">
                    {{ getStatusText(item.status) }}
                  </div>
                </div>
                <div class="goods-name">{{ item.title }}</div>
                <div class="goods-desc" v-if="item.subtitle">{{ item.subtitle }}</div>
                <div class="goods-footer">
                  <div class="goods-action">
                    <span class="view-detail">查看详情</span>
                  </div>
                </div>
              </div>
            </div>
          </van-list>

          <!-- 空状态 -->
          <van-empty
            v-if="!listLoading && products.length === 0 && !refreshing"
            description="暂无商品"
            image="search"
          />
        </div>
      </div>
    </van-pull-refresh>

    <!-- 底部导航 -->
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
  sales?: number
}

const router = useRouter()
const loading = ref(false)
const listLoading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const isFirstLoad = ref(true) // 标记是否首次加载

const banners = ref<any[]>([])
const categories = ref<Category[]>([])
const products = ref<Product[]>([])

// 分页参数
const pageParams = ref({
  page: 1,
  page_size: 20,
  total: 0,
})

// 计算属性：只获取一级分类
const topCategories = computed(() => {
  return categories.value
    .filter((item) => item.level === 1 || item.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 10)
})

// 根据分类 ID 返回对应的图标
const getCategoryIcon = (id: number) => {
  const iconMap: Record<number, string> = {
    1: 'user-o',
    2: 'friends-o',
    3: 'bag-o',
    4: 'diamond-o',
  }
  return iconMap[id] || 'apps-o'
}

// 获取商品状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'ON_SALE': '在售',
    'OFF_SALE': '已下架',
    'SOLD_OUT': '已售罄',
  }
  return statusMap[status] || status
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

// 初始化加载数据
const loadData = async () => {
  try {
    loading.value = true

    // 并行请求轮播图和分类
    const [bannersRes, categoriesRes] = await Promise.all([
      getBanners(),
      getCategories(),
    ])

    if (bannersRes && bannersRes.data) {
      banners.value = bannersRes.data
    }

    if (categoriesRes && categoriesRes.data) {
      categories.value = categoriesRes.data
    }

    // 加载第一页商品数据
    await loadProducts()
  } catch (error) {
    console.error('加载数据失败:', error)
    showToast('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载商品列表
const loadProducts = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      listLoading.value = true
    }

    const params = {
      page: pageParams.value.page,
      page_size: pageParams.value.page_size,
    }

    console.log('请求商品列表，参数:', params)

    const productsRes = await getProducts(params)
    console.log('商品列表响应:', productsRes)

    if (productsRes && productsRes.data) {
      const { list, total } = productsRes.data

      // 如果是加载更多，追加数据；否则替换数据
      if (isLoadMore) {
        products.value = [...products.value, ...list]
      } else {
        products.value = list
      }

      pageParams.value.total = total

      // 判断是否还有更多数据
      if (products.value.length >= total) {
        finished.value = true
      } else {
        finished.value = false
      }

      console.log('当前商品总数:', products.value.length, '总数:', total)
    }
  } catch (error: any) {
    console.error('加载商品失败:', error)
    showToast('加载商品失败')
    if (isLoadMore) {
      finished.value = true
    }
  } finally {
    if (isLoadMore) {
      listLoading.value = false
    }
  }
}

// List 组件的 load 事件 - 上拉加载更多
const onLoad = async () => {
  console.log('触发上拉加载, finished:', finished.value, 'loading:', listLoading.value)
  
  // 如果已经没有更多数据，或正在加载中，直接返回
  if (finished.value || listLoading.value) {
    return
  }

  // 加载下一页
  pageParams.value.page += 1
  await loadProducts(true)
}

// 下拉刷新
const onRefresh = async () => {
  console.log('触发下拉刷新')
  
  try {
    // 重置分页
    pageParams.value.page = 1
    finished.value = false
    products.value = []

    await loadData()
    showToast('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 跳转到搜索页
const goSearch = () => {
  router.push('/search')
}

// 跳转到分类页
const goCategory = (category: Category) => {
  console.log('点击分类:', category)
  router.push({
    name: 'Category',
    query: { id: category.id },
  })
}

// 跳转到商品详情
const goProductDetail = (productId: number) => {
  console.log('跳转商品详情，ID:', productId)
  
  if (typeof productId !== 'number' || isNaN(productId) || productId <= 0) {
    console.error('无效的商品ID:', productId)
    showToast('商品ID错误')
    return
  }
  
  router.push({
    path: '/product/detail',
    query: { id: productId }
  })
}

// 首次挂载时加载数据
onMounted(() => {
  console.log('Home onMounted')
  if (isFirstLoad.value) {
    loadData()
    isFirstLoad.value = false
  }
})

// keep-alive 激活时
onActivated(() => {
  console.log('Home onActivated')
  // 从其他页面返回时，不重新加载数据
  // 如果需要刷新数据，用户可以手动下拉刷新
})

// keep-alive 停用时
onDeactivated(() => {
  console.log('Home onDeactivated')
  // 重置 loading 状态，防止返回时出现异常
  listLoading.value = false
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px;

  :deep(.van-pull-refresh) {
    min-height: calc(100vh - 50px);
  }

  .search-bar {
    display: flex;
    align-items: center;
    margin: 16px;
    padding: 10px 16px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .van-icon {
      margin-right: 8px;
      color: #999;
    }

    .search-text {
      color: #999;
      font-size: 14px;
    }
  }

  .banner {
    margin: 0 16px 16px;
    border-radius: 8px;
    overflow: hidden;

    .banner-item {
      width: 100%;
      height: 180px;

      :deep(.van-image) {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin: 0 16px 16px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      .nav-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .nav-text {
        font-size: 12px;
        color: #666;
        text-align: center;
      }
    }
  }

  .seckill-section {
    margin: 0 16px 16px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .more {
        font-size: 12px;
        color: #999;
      }
    }

    .seckill-content {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 8px;
      color: #999;
    }
  }

  .goods-list {
    margin: 0 16px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;

    .section-header {
      margin-bottom: 16px;

      .title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }

    .goods-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .goods-item {
        cursor: pointer;
        transition: transform 0.2s;

        &:active {
          transform: scale(0.98);
        }

        .goods-image {
          position: relative;
          height: 156px;
          background-color: #f7f8fa;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 8px;

          :deep(.van-image) {
            width: 100%;
            height: 100%;
          }

          .image-loading,
          .image-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: #dcdee0;
            font-size: 12px;
            gap: 8px;
          }

          .goods-status {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 8px;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 11px;
            border-radius: 4px;
          }
        }

        .goods-name {
          font-size: 14px;
          color: #323233;
          line-height: 20px;
          height: 40px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-weight: 500;
        }

        .goods-desc {
          font-size: 12px;
          color: #969799;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .goods-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .goods-action {
            width: 100%;
            
            .view-detail {
              display: inline-block;
              width: 100%;
              padding: 6px 0;
              text-align: center;
              font-size: 13px;
              color: #667eea;
              background-color: #f0f2ff;
              border-radius: 4px;
              font-weight: 500;
            }
          }
        }
      }
    }

    :deep(.van-list__finished-text) {
      margin-top: 16px;
      padding: 16px 0;
      color: #969799;
      font-size: 14px;
      text-align: center;
    }

    :deep(.van-list__loading) {
      padding: 16px 0;
      text-align: center;
    }
  }
}
</style>
