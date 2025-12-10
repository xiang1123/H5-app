<template>
  <div class="category-page">
    <CategorySkeleton v-if="loading" />

    <div v-else class="category-content">
      <div class="search-bar" @click="goSearch">
        <van-icon name="search" />
        <span class="search-text">搜索商品</span>
      </div>

      <div class="category-main">
        <div class="left-nav">
          <van-sidebar v-model="activeIndex" @change="onCategoryChange">
            <van-sidebar-item
              v-for="(item, index) in parentCategories"
              :key="item.id"
              :title="item.name"
            />
          </van-sidebar>
        </div>

        <div class="right-content">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <div v-if="childCategories.length > 0" class="sub-categories">
              <div class="sub-category-title">全部分类</div>
              <div class="sub-category-grid">
                <div
                  v-for="item in childCategories"
                  :key="item.id"
                  class="sub-category-item"
                  :class="{ active: selectedSubCategory === item.id }"
                  @click="selectSubCategory(item)"
                >
                  <div class="sub-category-name">{{ item.name }}</div>
                </div>
              </div>
            </div>

            <div class="goods-section">
              <div class="goods-header">
                <span class="goods-title">商品列表</span>
              </div>

              <van-list
                v-model:loading="listLoading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
                :immediate-check="false"
                :offset="100"
              >
                <div class="goods-list">
                  <div
                    v-for="item in products"
                    :key="item.id"
                    class="goods-item"
                    @click="goProductDetail(item)"
                  >
                    <div class="goods-image">
                      <van-image
                        width="100px"
                        height="100px"
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
                            <van-icon name="photo-fail" size="24" />
                          </div>
                        </template>
                      </van-image>

                      <div
                        class="goods-status"
                        v-if="item.status !== 'ON_SALE'"
                      >
                        {{ getStatusText(item.status) }}
                      </div>
                    </div>
                    <div class="goods-info">
                      <div class="goods-name">{{ item.title }}</div>
                      <div class="goods-desc" v-if="item.subtitle">
                        {{ item.subtitle }}
                      </div>
                      
                      <div class="goods-footer">
                        <div class="goods-price">
                          {{ formatPrice(item.price) }}
                        </div>
                        <div class="view-btn">
                          选购
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <van-empty
                  v-if="!listLoading && products.length === 0 && !refreshing"
                  description="暂无商品"
                  image="search"
                />
              </van-list>
            </div>
          </van-pull-refresh>
        </div>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Icon as VanIcon,
  Image as VanImage,
  Sidebar as VanSidebar,
  SidebarItem as VanSidebarItem,
  List as VanList,
  Loading as VanLoading,
  Empty as VanEmpty,
  PullRefresh as VanPullRefresh,
  showToast,
} from 'vant'
import CategorySkeleton from '@/components/SkeletonScreen/CategorySkeleton.vue'
import TabBar from '@/components/TabBar/index.vue'
import { getCategories, getProducts } from '@/api/home'

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
  price: number
  cover_image: string
  sales?: number
  category_id?: number
  status: string
}

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const listLoading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const activeIndex = ref(0)
const selectedSubCategory = ref<number | null>(null)

// 分页参数
const pageParams = ref({
  page: 1,
  page_size: 20,
  total: 0,
})

// 一级分类（父级分类）
const parentCategories = computed(() => {
  return categories.value
    .filter((item) => item.level === 1 || item.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order)
})

// 当前选中的一级分类
const currentParentCategory = computed(() => {
  return parentCategories.value[activeIndex.value]
})

// 二级分类（子分类）
const childCategories = computed(() => {
  if (!currentParentCategory.value) return []

  return categories.value
    .filter((item) => item.parent_id === currentParentCategory.value.id)
    .sort((a, b) => a.sort_order - b.sort_order)
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

// 初始化加载数据
const loadData = async () => {
  try {
    loading.value = true

    // 获取分类列表
    const categoriesRes = await getCategories()

    if (categoriesRes && categoriesRes.data) {
      categories.value = categoriesRes.data
      
      if (route.query.id) {
        const categoryId = Number(route.query.id)
        const index = parentCategories.value.findIndex(
          (item) => item.id === categoryId
        )
        if (index !== -1) {
          activeIndex.value = index
        }
      }

      await loadProducts()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ON_SALE: '在售',
    OFF_SALE: '已下架',
    SOLD_OUT: '已售罄',
  }
  return statusMap[status] || status
}

// 加载商品列表
const loadProducts = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      listLoading.value = true
    }

    const params: any = {
      page: pageParams.value.page,
      page_size: pageParams.value.page_size,
    }

    if (selectedSubCategory.value) {
      params.category_id = selectedSubCategory.value
    } else if (currentParentCategory.value) {
      params.category_id = currentParentCategory.value.id
    }

    console.log('请求参数:', params) 

    const productsRes = await getProducts(params)

    if (productsRes && productsRes.data) {
      const { list, total } = productsRes.data

      if (isLoadMore) {
        products.value = [...products.value, ...list]
      } else {
        products.value = list
      }

      pageParams.value.total = total
      
      if (products.value.length >= total) {
        finished.value = true
      } else {
        finished.value = false
      }
    }
  } catch (error: any) {
    console.error('加载商品失败:', error)
    
    if (isLoadMore) {
      finished.value = true 
      if (pageParams.value.page > 1) {
        pageParams.value.page--
      }
    }
  } finally {
    if (isLoadMore) {
      listLoading.value = false
    }
  }
}

// 切换一级分类
const onCategoryChange = (index: number) => {
  activeIndex.value = index
  selectedSubCategory.value = null
  resetAndLoad()
}

// 选择二级分类
const selectSubCategory = (category: Category) => {
  if (selectedSubCategory.value === category.id) {
    selectedSubCategory.value = null
  } else {
    selectedSubCategory.value = category.id
  }
  resetAndLoad()
}

// 重置并加载数据
const resetAndLoad = () => {
  pageParams.value.page = 1
  finished.value = false
  products.value = []
  loadProducts()
}

// 上拉加载更多
const onLoad = async () => {
  if (listLoading.value || finished.value) {
    return
  }
  pageParams.value.page += 1
  await loadProducts(true)
}

// 下拉刷新
const onRefresh = async () => {
  try {
    resetAndLoad()
    showToast('刷新成功')
  } catch (error) {
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 跳转到搜索页
const goSearch = () => {
  router.push('/search')
}

// 跳转到商品详情
const goProductDetail = (product: Product) => {
  router.push({
    path: '/product/detail',
    query: { id: product.id },
  })
}

// 监听路由变化
watch(
  () => route.query.id,
  (newId) => {
    if (newId && parentCategories.value.length > 0) {
      const categoryId = Number(newId)
      const index = parentCategories.value.findIndex(
        (item) => item.id === categoryId
      )
      if (index !== -1 && index !== activeIndex.value) {
        activeIndex.value = index
        selectedSubCategory.value = null
        resetAndLoad()
      }
    }
  }
)

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
// 蓝白主题变量
$primary-blue: #1989fa;
$light-blue-bg: #eef7ff;
$bg-color: #f7f8fa;

.category-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .category-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-bar {
      display: flex;
      align-items: center;
      margin: 12px 16px;
      padding: 8px 16px;
      background-color: $bg-color;
      border-radius: 20px;

      .van-icon {
        margin-right: 8px;
        color: #969799;
      }

      .search-text {
        color: #969799;
        font-size: 14px;
      }
    }

    .category-main {
      flex: 1;
      display: flex;
      overflow: hidden;
      border-top: 1px solid #f2f3f5;

      .left-nav {
        width: 90px;
        background-color: $bg-color;
        overflow-y: auto;

        :deep(.van-sidebar) {
          width: 100%;
        }

        :deep(.van-sidebar-item) {
          padding: 16px 12px;
          background-color: transparent;
          color: #646566;

          &::before {
            display: none;
          }
        }

        /* 左侧选中样式：蓝字 + 蓝条 + 白底 */
        :deep(.van-sidebar-item--select) {
          background-color: #fff;
          color: $primary-blue;
          font-weight: 600;

          &::before {
            display: block;
            background-color: $primary-blue;
            width: 3px;
            height: 16px;
          }
        }
      }

      .right-content {
        flex: 1;
        background-color: #fff;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        :deep(.van-pull-refresh) {
          flex: 1;
          overflow-y: auto;
        }

        .sub-categories {
          padding: 16px;
          background-color: #fff;

          .sub-category-title {
            font-size: 14px;
            color: #323233;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .sub-category-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;

            .sub-category-item {
              padding: 8px 4px;
              background-color: $bg-color;
              border-radius: 4px;
              text-align: center;
              cursor: pointer;
              transition: all 0.2s;
              border: 1px solid transparent;

              /* 二级分类选中：浅蓝背景 + 蓝边框 */
              &.active {
                background-color: $light-blue-bg;
                color: $primary-blue;
                border-color: $primary-blue;
                font-weight: 500;
              }

              .sub-category-name {
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }

        .goods-section {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;

          .goods-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background-color: #fff;
            
            .goods-title {
              font-size: 14px;
              color: #323233;
              font-weight: 600;
            }
          }

          :deep(.van-list) {
            flex: 1;
            overflow-y: auto;
          }

          .goods-list {
            padding: 0 16px 16px;

            .goods-item {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #f5f5f5;
              cursor: pointer;

              &:last-child {
                border-bottom: none;
              }

              .goods-image {
                width: 90px;
                height: 90px;
                flex-shrink: 0;
                margin-right: 12px;
                background-color: $bg-color;
                border-radius: 6px;
                overflow: hidden;
                position: relative;

                .goods-status {
                  position: absolute;
                  top: 0;
                  right: 0;
                  padding: 2px 4px;
                  background-color: rgba(0, 0, 0, 0.5);
                  color: #fff;
                  font-size: 10px;
                  border-bottom-left-radius: 6px;
                }
              }

              .goods-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 2px 0;

                .goods-name {
                  font-size: 14px;
                  color: #323233;
                  line-height: 20px;
                  margin-bottom: 4px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }

                .goods-desc {
                  font-size: 11px;
                  color: #969799;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .goods-footer {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;

                  .goods-price {
                    font-size: 16px;
                    color: #ff4d4f; // 价格保留警示色，突出显示
                    font-weight: 600;

                    &::before {
                      content: '¥';
                      font-size: 11px;
                      margin-right: 1px;
                    }
                  }

                  .view-btn {
                    padding: 4px 10px;
                    background-color: $light-blue-bg;
                    color: $primary-blue;
                    font-size: 11px;
                    border-radius: 12px;
                    font-weight: 500;
                  }
                }
              }
            }
          }

          :deep(.van-list__finished-text) {
            padding: 16px 0;
            color: #969799;
            font-size: 13px;
            text-align: center;
          }

          :deep(.van-list__loading) {
            padding: 16px 0;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>