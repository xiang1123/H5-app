import request from '@/utils/request'

// 轮播图接口
export interface Banner {
  id: number
  image_url: string
  link_url: string
  sort_order: number
}

export interface BannerResponse {
  code: number
  message: string
  data: Banner[]
}

// 分类接口
export interface Category {
  id: number
  parent_id: number | null
  name: string
  level: number
  sort_order: number
  is_visible: number
}

export interface CategoryResponse {
  code: number
  message: string
  data: Category[]
}

// 商品接口 - 根据实际返回调整
export interface Product {
  id: number
  title: string
  subtitle: string
  cover_image: string
  category_id: number
  status: string
  price?: number  // 可选，因为列表接口不返回
  sales?: number  // 可选，因为列表接口不返回
}

export interface ProductListParams {
  page: number
  page_size: number
  category_id?: number
  keyword?: string
  sort_by?: string
  order?: string
}

export interface ProductListResponse {
  code: number
  message: string
  data: {
    list: Product[]
    total: number
  }
}

// 获取轮播图
export const getBanners = () => {
  return request.get<BannerResponse>('/api/v1/banners')
}

// 获取分类列表
export const getCategories = () => {
  return request.get<CategoryResponse>('/api/v1/categories')
}

// 获取商品列表
export const getProducts = (params: ProductListParams) => {
  // 清理 undefined 的参数
  const cleanParams: any = {}
  
  Object.keys(params).forEach(key => {
    const value = params[key as keyof ProductListParams]
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value
    }
  })
  
  console.log('清理后的请求参数:', cleanParams)
  
  return request.get<ProductListResponse>('/api/v1/products', { params: cleanParams })
}