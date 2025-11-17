import request from '@/utils/request'

// 商品详情接口
export interface ProductDetail {
  id: number
  title: string
  subtitle: string
  description: string
  cover_image: string
  images: string[]
  price: number
  original_price: number
  stock: number
  sales: number
  category_id: number
  category_name: string
  brand?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

// SKU 信息 - 根据实际返回调整
export interface ProductSku {
  id: number
  sku_code: string
  color: string
  size: string
  price: number
  stock: number
  image?: string
}

// 商品详情响应
export interface ProductDetailResponse {
  code: number
  message: string
  data: ProductDetail
}

// SKU 列表响应 - 根据实际返回调整
export interface ProductSkuResponse {
  code: number
  message: string
  data: ProductSku[]  // 直接是数组
}

// 获取商品详情
export const getProductDetail = (id: number | string) => {
  return request.get<ProductDetailResponse>(`/api/v1/products/${id}`)
}

// 获取商品 SKU 列表
export const getProductSkus = (id: number | string) => {
  return request.get<ProductSkuResponse>(`/api/v1/products/${id}/skus`)
}