import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { showToast } from 'vant'
import { useUserStore } from '@/store/modules/user'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 打印请求信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('请求URL:', config.url)
      console.log('请求方法:', config.method)
      console.log('请求参数:', config.params)
      console.log('请求数据:', config.data)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 打印响应信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('响应数据:', res)
    }
    
    // 修改这里：判断 code 是否为 0（成功）
    if (res.code !== undefined && res.code !== 0) {
      showToast(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    // 返回整个响应数据
    return res
  },
  (error) => {
    console.error('请求错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      console.error('错误状态码:', status)
      console.error('错误详情:', data)
      
      switch (status) {
        case 401:
          showToast('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          break
        case 403:
          showToast('没有权限访问')
          break
        case 404:
          showToast('请求资源不存在')
          break
        case 422:
          // 参数验证错误
          if (data.detail && Array.isArray(data.detail)) {
            const errors = data.detail.map((item: any) => {
              const field = item.loc?.slice(1).join('.') || 'unknown'
              return `${field}: ${item.msg}`
            }).join(', ')
            console.error('参数验证错误:', errors)
            showToast(`参数错误: ${errors}`)
          } else {
            showToast('请求参数错误')
          }
          break
        case 500:
          showToast('服务器错误')
          break
        default:
          showToast(data.message || error.message || '请求失败')
      }
    } else if (error.request) {
      console.error('请求未收到响应:', error.request)
      showToast('网络连接失败')
    } else {
      console.error('请求配置错误:', error.message)
      showToast('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service