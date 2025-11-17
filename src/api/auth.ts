import request from '@/utils/request'

// 用户信息接口
export interface UserProfile {
  id: number
  email: string
  phone: string
  nickname: string
  avatar?: string
  created_at?: string
}

// 注册参数
export interface RegisterParams {
  email?: string
  phone?: string
  password: string
  nickname: string
}

// 登录参数
export interface LoginParams {
  email?: string
  phone?: string
  password: string
}

// 更新用户信息参数
export interface UpdateProfileParams {
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
}

// 通用响应
export interface AuthResponse {
  code: number
  message: string
  data: {
    token: string
    user: UserProfile
  }
}

export interface ProfileResponse {
  code: number
  message: string
  data: UserProfile
}

// 注册
export const register = (data: RegisterParams) => {
  return request.post<AuthResponse>('/api/v1/auth/register', data)
}

// 登录
export const login = (data: LoginParams) => {
  return request.post<AuthResponse>('/api/v1/auth/login', data)
}

// 获取用户信息
export const getProfile = () => {
  return request.get<ProfileResponse>('/api/v1/auth/profile')
}

// 更新用户信息
export const updateProfile = (data: UpdateProfileParams) => {
  return request.patch<ProfileResponse>('/api/v1/auth/profile', data)
}