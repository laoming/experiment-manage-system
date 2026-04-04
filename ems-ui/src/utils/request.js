import { ElMessageBox } from 'element-plus'

const BASE_URL = '/ems'

// 防止重复弹窗
let isShowingExpiredDialog = false

/**
 * 请求拦截器
 */
const request = async (url, options = {}) => {
  // 添加基础路径
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url

  // 默认配置
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  // 合并配置
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  // 添加 token
  const token = localStorage.getItem('token')
  if (token) {
    finalOptions.headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(fullUrl, finalOptions)

    // 处理 401 - JWT过期
    if (response.status === 401) {
      handleTokenExpired()
      throw new Error('登录已过期')
    }

    // 滑动刷新：检查响应头中的新Token
    const newToken = response.headers.get('X-New-Token')
    if (newToken) {
      localStorage.setItem('token', newToken)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('请求错误:', error)
    throw error
  }
}

/**
 * 处理 Token 过期
 */
function handleTokenExpired() {
  // 防止重复弹窗
  if (isShowingExpiredDialog) {
    return
  }
  isShowingExpiredDialog = true

  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')

  // 弹窗提示，用户确认后跳转登录页
  ElMessageBox.alert('登录已过期，请重新登录', '提示', {
    confirmButtonText: '确定',
    type: 'warning',
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false
  }).finally(() => {
    isShowingExpiredDialog = false
    window.location.href = '/login'
  })
}

/**
 * GET 请求
 */
export const get = (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return request(fullUrl, { method: 'GET' })
}

/**
 * POST 请求
 */
export const post = (url, data = {}, options = {}) => {
  // 如果 data 是 URLSearchParams，直接使用
  const body = data instanceof URLSearchParams ? data : JSON.stringify(data)
  return request(url, {
    method: 'POST',
    body,
    ...options
  })
}

/**
 * PUT 请求
 */
export const put = (url, data = {}) => {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE 请求
 */
export const del = (url) => {
  return request(url, { method: 'DELETE' })
}

export default request
