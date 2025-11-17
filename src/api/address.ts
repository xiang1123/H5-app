import request from '@/utils/request'

// 地址信息接口
export interface Address {
  id: number
  contact_name: string
  contact_phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

// 地址列表响应
export interface AddressListResponse {
  code: number
  message: string
  data: Address[]
}

// 添加/编辑地址参数
export interface AddressParams {
  contact_name: string
  contact_phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

// 通用响应
export interface CommonResponse {
  code: number
  message: string
  data?: any
}

// 获取地址列表
export const getAddressList = () => {
  return request.get<AddressListResponse>('/api/v1/addresses')
}

// 添加地址
export const addAddress = (data: AddressParams) => {
  return request.post<CommonResponse>('/api/v1/addresses', data)
}

// 更新地址
export const updateAddress = (id: number, data: AddressParams) => {
  return request.patch<CommonResponse>(`/api/v1/addresses/${id}`, data)
}

// 删除地址
export const deleteAddress = (id: number) => {
  return request.delete<CommonResponse>(`/api/v1/addresses/${id}`)
}

// 设置默认地址
export const setDefaultAddress = (id: number) => {
  return request.patch<CommonResponse>(`/api/v1/addresses/${id}`, {
    is_default: true
  })
}