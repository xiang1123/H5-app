<template>
  <div class="category-page">
    <!-- 骨架屏 -->
    <CategorySkeleton v-if="loading" />

    <!-- 实际内容 -->
    <div v-else class="category-content">
      <!-- 搜索栏 -->
      <div class="search-bar" @click="goSearch">
        <van-icon name="search" />
        <span class="search-text">搜索商品</span>
      </div>

      <div class="category-main">
        <!-- 左侧分类导航 -->
        <div class="left-nav">
          <van-sidebar v-model="activeIndex" @change="onCategoryChange">
            <van-sidebar-item
              v-for="(item, index) in parentCategories"
              :key="item.id"
              :title="item.name"
            />
          </van-sidebar>
        </div>

        <!-- 右侧内容区域 -->
        <div class="right-content">
          <!-- 下拉刷新 -->
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <!-- 二级分类 -->
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

            <!-- 商品列表 -->
            <div class="goods-section">
              <div class="goods-header">
                <span class="goods-title">商品列表</span>
                <div class="sort-tabs">
                  <span
                    class="sort-item"
                    :class="{ active: sortType === 'default' }"
                    @click="changeSort('default')"
                  >
                    综合
                  </span>
                  <span
                    class="sort-item"
                    :class="{ active: sortType === 'sales' }"
                    @click="changeSort('sales')"
                  >
                    销量
                  </span>
                  <span
                    class="sort-item"
                    :class="{ active: sortType === 'price' }"
                    @click="changeSort('price')"
                  >
                    价格
                    <van-icon
                      v-if="sortType === 'price'"
                      :name="priceOrder === 'asc' ? 'arrow-up' : 'arrow-down'"
                      size="12"
                    />
                  </span>
                </div>
              </div>

              <!-- 商品列表 - 上拉加载 -->
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

                      <!-- 商品状态标签 -->
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
                      <div class="goods-action">
                        <span class="view-detail">查看详情</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
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

    <!-- 底部导航 -->
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
const sortType = ref<'default' | 'sales' | 'price'>('default')
const priceOrder = ref<'asc' | 'desc'>('desc')

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
      console.log('分类数据:', categories.value)
      console.log('一级分类:', parentCategories.value)

      // 如果 URL 中有分类 ID，设置对应的 activeIndex
      if (route.query.id) {
        const categoryId = Number(route.query.id)
        const index = parentCategories.value.findIndex(
          (item) => item.id === categoryId
        )
        if (index !== -1) {
          activeIndex.value = index
        }
      }

      // 加载商品数据
      await loadProducts()
    }
  } catch (error) {
    // console.error('加载数据失败:', error)
    // showToast('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 添加获取状态文本的函数
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

    // 构建请求参数 - 注意参数名称要和后端一致
    const params: any = {
      page: pageParams.value.page,
      page_size: pageParams.value.page_size,
    }

    // 如果选择了子分类，使用子分类 ID；否则使用父分类 ID
    if (selectedSubCategory.value) {
      params.category_id = selectedSubCategory.value
    } else if (currentParentCategory.value) {
      params.category_id = currentParentCategory.value.id
    }

    // 添加排序参数（如果后端支持）
    if (sortType.value === 'sales') {
      params.sort_by = 'sales'
      params.order = 'desc'
    } else if (sortType.value === 'price') {
      params.sort_by = 'price'
      params.order = priceOrder.value
    }

    console.log('请求商品列表，参数:', params)

    const productsRes = await getProducts(params)
    console.log('商品列表响应:', productsRes)

    if (productsRes && productsRes.data) {
      const { list, total, page } = productsRes.data

      // 如果是加载更多，追加数据；否则替换数据
      if (isLoadMore) {
        products.value = [...products.value, ...list]
      } else {
        products.value = list
      }

      pageParams.value.total = total
      pageParams.value.page = page

      // 判断是否还有更多数据
      if (products.value.length >= total) {
        finished.value = true
      }

      console.log('当前商品总数:', products.value.length, '总数:', total)
    }
  } catch (error: any) {
    console.error('加载商品失败:', error)

    // 详细的错误信息
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误数据:', error.response.data)

      // 422 错误通常是参数验证失败
      if (error.response.status === 422) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          console.error('参数验证错误:', detail)
          // 显示第一个错误信息
          const firstError = detail[0]
          const errorMsg = `参数错误: ${firstError.loc?.join('.')} - ${
            firstError.msg
          }`
          showToast(errorMsg)
        } else {
          // showToast('请求参数错误')
        }
      } else {
        // showToast('加载商品失败')
      }
    } else {
      // showToast('网络错误')
    }

    if (isLoadMore) {
      finished.value = true
    }
  } finally {
    if (isLoadMore) {
      listLoading.value = false
    }
  }
}

// 切换一级分类
const onCategoryChange = (index: number) => {
  console.log('切换分类:', index, parentCategories.value[index])
  activeIndex.value = index
  selectedSubCategory.value = null
  resetAndLoad()
}

// 选择二级分类
const selectSubCategory = (category: Category) => {
  console.log('选择子分类:', category)

  if (selectedSubCategory.value === category.id) {
    // 如果点击的是已选中的分类，取消选中
    selectedSubCategory.value = null
  } else {
    selectedSubCategory.value = category.id
  }

  resetAndLoad()
}

// 切换排序方式
const changeSort = (type: 'default' | 'sales' | 'price') => {
  console.log('切换排序:', type)

  if (type === 'price' && sortType.value === 'price') {
    // 如果已经是价格排序，切换升序/降序
    priceOrder.value = priceOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortType.value = type
    if (type === 'price') {
      priceOrder.value = 'desc'
    }
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

// List 组件的 load 事件 - 上拉加载更多
const onLoad = async () => {
  console.log('触发上拉加载, finished:', finished.value)

  if (finished.value) {
    return
  }

  pageParams.value.page += 1
  await loadProducts(true)
}

// 下拉刷新
const onRefresh = async () => {
  console.log('触发下拉刷新')

  try {
    resetAndLoad()
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

// 跳转到商品详情 - 确保传递数字 ID
const goProductDetail = (product: Product) => {
  console.log('点击商品:', product.id, '类型:', typeof product.id)

  router.push({
    path: '/product/detail',
    query: { id: product.id }, // 传递 product.id 而不是 product
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
.category-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

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

    .category-main {
      flex: 1;
      display: flex;
      overflow: hidden;

      .left-nav {
        width: 90px;
        background-color: #f7f8fa;
        overflow-y: auto;

        :deep(.van-sidebar) {
          width: 100%;
        }

        :deep(.van-sidebar-item) {
          padding: 20px 12px;
          background-color: transparent;

          &::before {
            display: none;
          }
        }

        :deep(.van-sidebar-item--select) {
          background-color: #fff;
          color: #e93b3d;
          font-weight: bold;

          &::before {
            display: block;
            background-color: #e93b3d;
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
          border-bottom: 1px solid #f5f5f5;

          .sub-category-title {
            font-size: 14px;
            color: #323233;
            font-weight: bold;
            margin-bottom: 12px;
          }

          .sub-category-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;

            .sub-category-item {
              padding: 8px 12px;
              background-color: #f7f8fa;
              border-radius: 4px;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s;

              &.active {
                background-color: #fff7f0;
                color: #e93b3d;
                border: 1px solid #e93b3d;
              }

              .sub-category-name {
                font-size: 13px;
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
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background-color: #fff;
            border-bottom: 1px solid #f5f5f5;

            .goods-title {
              font-size: 14px;
              color: #323233;
              font-weight: bold;
            }

            .sort-tabs {
              display: flex;
              gap: 16px;

              .sort-item {
                font-size: 13px;
                color: #646566;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 2px;

                &.active {
                  color: #e93b3d;
                  font-weight: bold;
                }
              }
            }
          }

          :deep(.van-list) {
            flex: 1;
            overflow-y: auto;
          }

          .goods-list {
            padding: 12px 16px;

            .goods-item {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #f5f5f5;
              cursor: pointer;

              &:last-child {
                border-bottom: none;
              }

              &:active {
                background-color: #f7f8fa;
              }

              .goods-image {
                width: 100px;
                height: 100px;
                flex-shrink: 0;
                margin-right: 12px;
                background-color: #f7f8fa;
                border-radius: 8px;
                overflow: hidden;
                position: relative;

                .goods-status {
                  position: absolute;
                  top: 4px;
                  right: 4px;
                  padding: 2px 6px;
                  background-color: rgba(0, 0, 0, 0.6);
                  color: #fff;
                  font-size: 10px;
                  border-radius: 4px;
                }
              }

              .goods-action {
                margin-top: 8px;

                .view-detail {
                  display: inline-block;
                  width: 100%;
                  padding: 4px 0;
                  text-align: center;
                  font-size: 12px;
                  color: #667eea;
                  background-color: #f0f2ff;
                  border-radius: 4px;
                  font-weight: 500;
                }

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
                  color: #dcdee0;
                }
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

                  .goods-price {
                    font-size: 18px;
                    color: #ee0a24;
                    font-weight: bold;

                    &::before {
                      content: '¥';
                      font-size: 12px;
                    }
                  }

                  .goods-sales {
                    font-size: 12px;
                    color: #969799;
                  }
                }
              }
            }
          }

          :deep(.van-list__finished-text) {
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
    }
  }
}
</style>
