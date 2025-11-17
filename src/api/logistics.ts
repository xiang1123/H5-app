import request from '@/utils/request'

// 物流信息 - 根据实际返回调整
export interface ShipmentInfo {
  company: string           // 快递公司
  tracking_no: string       // 运单号
  status: string           // 物流状态
  shipped_at: string       // 发货时间
  delivered_at: string | null  // 签收时间
}

// 物流信息响应
export interface ShipmentResponse {
  code: number
  message: string
  data: ShipmentInfo
}

// 获取订单物流信息
export const getOrderShipment = (orderId: number) => {
  return request.get<ShipmentResponse>(`/api/v1/orders/${orderId}/shipment`)
}

// 物流状态文本映射
export const shipmentStatusMap: Record<string, string> = {
  'PENDING': '待发货',
  'SHIPPED': '运输中',
  'DELIVERED': '已签收',
  'RETURNED': '已退回',
}

// 获取物流状态文本
export const getShipmentStatusText = (status: string): string => {
  return shipmentStatusMap[status] || status
}