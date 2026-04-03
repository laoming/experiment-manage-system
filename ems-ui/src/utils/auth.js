/**
 * 认证工具函数
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getUserInfo = () => {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export const setUserInfo = (info) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY)
}

export const logout = () => {
  removeToken()
  removeUserInfo()
  window.location.href = '/login'
}

export const isAuthenticated = () => {
  return !!getToken()
}

export default {
  getToken,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  logout,
  isAuthenticated
}
