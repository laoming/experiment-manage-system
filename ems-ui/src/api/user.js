import { post } from '@/utils/request'

/**
 * 用户管理 API
 */

// 获取用户分页列表
export const getUserPage = (params) => {
  return post(`/user/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取用户列表（使用page接口）
export const getUserList = () => {
  return post('/user/page?current=1&size=1000', {})
}

// 新增用户
export const addUser = (data) => {
  return post('/user/add', data)
}

// 更新用户
export const updateUser = (data) => {
  return post('/user/update', data)
}

// 删除用户
export const deleteUser = (id) => {
  return post('/user/delete', { id })
}

// 重置密码
export const resetPassword = (id, password) => {
  return post('/user/resetPassword', { id, password })
}

// 获取简单用户列表
export const getUserSimpleList = () => {
  return post('/user/simpleList', {})
}

// 修改个人信息（使用 /user/update 接口）
export const updateProfile = (data) => {
  return post('/user/update', data)
}

// 修改密码（使用 /user/update 接口）
export const changePassword = (data) => {
  return post('/user/update', data)
}
