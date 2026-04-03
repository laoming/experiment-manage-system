import { ElMessage } from 'element-plus'

const BASE_URL = '/ems'

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
    
    // 处理 401
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
      throw new Error('登录已过期')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('请求错误:', error)
    throw error
  }
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
