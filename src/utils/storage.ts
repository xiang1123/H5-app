const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

// Token 相关
export const getToken = (): string => {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息相关
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

export const setUserInfo = (userInfo: any): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY)
}

// 清空所有存储
export const clearStorage = (): void => {
  localStorage.clear()
}