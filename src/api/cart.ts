import request from '@/utils/request'

// 购物车商品项接口 - 根据实际返回调整
export interface CartItem {
  id: number
  sku_id: number
  title: string
  image: string
  unit_price: number
  quantity: number
  total_price: number
  color?: string  // SKU颜色
  size?: string   // SKU尺码
  selected?: boolean  // 前端添加的选中状态
}

// 购物车响应 - 根据实际返回调整
export interface CartResponse {
  code: number
  message: string
  data: {
    items: CartItem[]
    amount_total: number
  }
}

// 添加购物车参数
export interface AddCartParams {
  sku_id: number
  quantity: number
}

// 更新购物车参数
export interface UpdateCartParams {
  quantity?: number
  selected?: boolean
}

// 通用响应
export interface CommonResponse {
  code: number
  message: string
  data?: any
}

// 获取购物车列表
export const getCartList = () => {
  return request.get<CartResponse>('/api/v1/cart')
}

// 添加商品到购物车
export const addToCart = (data: AddCartParams) => {
  return request.post<CommonResponse>('/api/v1/cart/items', data)
}

// 更新购物车商品数量
export const updateCartItem = (id: number, data: UpdateCartParams) => {
  return request.patch<CommonResponse>(`/api/v1/cart/items/${id}`, data)
}

// 删除购物车商品
export const deleteCartItem = (id: number) => {
  return request.delete<CommonResponse>(`/api/v1/cart/items/${id}`)
}

// 清空购物车
export const clearCart = () => {
  return request.post<CommonResponse>('/api/v1/cart/clear')
}