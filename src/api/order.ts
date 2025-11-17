import request from '@/utils/request'

// 订单状态枚举
export enum OrderStatus {
  UNPAID = 'UNPAID',       // 待付款
  PAID = 'PAID',           // 待发货
  SHIPPING = 'SHIPPING',   // 待收货
  SHIPPED = 'SHIPPED',     // 待收货
  COMPLETED = 'COMPLETED', // 已完成
  CANCELED = 'CANCELED',   // 已取消
}

// 订单商品项
export interface OrderItem {
  sku_id: number
  title: string
  sku_attrs: string | null
  unit_price: number
  quantity: number
  total_price: number
  cover_image: string
}

// 订单信息
export interface Order {
  id: number
  order_no: string
  status: OrderStatus
  amount_total: number
  amount_payable: number
  receiver_name: string
  receiver_phone: string
  address: string
  items: OrderItem[]
  created_at?: string
  paid_at?: string
  shipped_at?: string
  completed_at?: string
  remark?: string
}

// 创建订单参数
export interface CreateOrderParams {
  address_id: number
  remark?: string
}

// 订单列表参数
export interface OrderListParams {
  page?: number
  page_size?: number
  status?: OrderStatus | string
}

// 订单列表响应
export interface OrderListResponse {
  code: number
  message: string
  data: {
    list: Order[]
    total: number
  }
}

// 订单详情响应
export interface OrderDetailResponse {
  code: number
  message: string
  data: Order
}

// 通用响应
export interface CommonResponse {
  code: number
  message: string
  data?: any
}

// 创建订单
export const createOrder = (data: CreateOrderParams) => {
  return request.post<CommonResponse>('/api/v1/orders', data)
}

// 获取订单列表
export const getOrderList = (params?: OrderListParams) => {
  return request.get<OrderListResponse>('/api/v1/orders', { params })
}

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request.get<OrderDetailResponse>(`/api/v1/orders/${id}`)
}

// 取消订单
export const cancelOrder = (id: number) => {
  return request.post<CommonResponse>(`/api/v1/orders/${id}/cancel`)
}

// 确认收货
export const confirmOrder = (id: number) => {
  return request.post<CommonResponse>(`/api/v1/orders/${id}/confirm`)
}

// 订单状态文本映射
export const orderStatusMap: Record<OrderStatus, string> = {
  [OrderStatus.UNPAID]: '待付款',
  [OrderStatus.PAID]: '待发货',
  [OrderStatus.SHIPPING]: '待收货',
  [OrderStatus.SHIPPED]: '待收货',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELED]: '已取消',
}

// 获取订单状态文本
export const getOrderStatusText = (status: OrderStatus | string): string => {
  return orderStatusMap[status as OrderStatus] || status
}