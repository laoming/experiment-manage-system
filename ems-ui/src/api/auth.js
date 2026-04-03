import { post } from '@/utils/request'

/**
 * 用户登录
 */
export const login = (username, password) => {
  return post('/auth/login', { username, password })
}
