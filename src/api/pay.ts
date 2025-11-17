import request from '@/utils/request'

// 支付宝支付响应
export interface AlipayResponse {
  code: number
  message: string
  data: {
    pay_url: string  // 支付宝支付链接
    order_id: number
    order_no: string
  }
}

// 支付结果查询响应
export interface PaymentStatusResponse {
  code: number
  message: string
  data: {
    status: string
    paid: boolean
    paid_at?: string
  }
}

// 通用响应
export interface CommonResponse {
  code: number
  message: string
  data?: any
}

// 创建支付宝支付
export const createAlipay = (orderId: number) => {
  return request.post<AlipayResponse>(`/api/v1/pay/alipay/${orderId}`)
}

// 查询支付状态
export const getPaymentStatus = (orderId: number) => {
  return request.get<PaymentStatusResponse>(`/api/v1/orders/${orderId}/payment-status`)
}