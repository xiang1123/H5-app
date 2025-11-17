import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, register, getProfile, type UserProfile } from '@/api/auth'
import { setToken, getToken, removeToken } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserProfile | null>(null)
  const token = ref(getToken() || '')
  const isLogin = ref(!!token.value)

  // 设置用户信息
  const setUserInfo = (info: UserProfile) => {
    userInfo.value = info
  }

  // 设置 Token
  const setUserToken = (newToken: string) => {
    token.value = newToken
    isLogin.value = !!newToken
    setToken(newToken)
  }

  // 登录
  const userLogin = async (params: any) => {
    const res = await login(params)
    if (res.code === 0 && res.data) {
      setUserToken(res.data.token)
      setUserInfo(res.data.user)
    }
    return res
  }

  // 注册
  const userRegister = async (params: any) => {
    const res = await register(params)
    if (res.code === 0 && res.data) {
      setUserToken(res.data.token)
      setUserInfo(res.data.user)
    }
    return res
  }

  // 获取用户信息
  const getUserInfo = async () => {
    const res = await getProfile()
    if (res.code === 0 && res.data) {
      setUserInfo(res.data)
    }
    return res
  }

  // 退出登录
  const logout = () => {
    userInfo.value = null
    token.value = ''
    isLogin.value = false
    removeToken()
  }

  return {
    userInfo,
    token,
    isLogin,
    setUserInfo,
    setUserToken,
    userLogin,
    userRegister,
    getUserInfo,
    logout,
  }
})