import { post } from '@/utils/request'

/**
 * 角色管理 API
 */

// 获取角色分页列表
export const getRolePage = (params) => {
  return post(`/role/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取角色列表
export const getRoleList = () => {
  return post('/role/list', {})
}

// 新增角色
export const addRole = (data) => {
  return post('/role/add', data)
}

// 更新角色
export const updateRole = (data) => {
  return post('/role/update', data)
}

// 删除角色
export const deleteRole = (id) => {
  return post('/role/delete', { id })
}

// 获取角色菜单ID列表
export const getRoleMenuIds = (roleId) => {
  return post(`/role/getMenuIds?roleId=${roleId}`, {})
}

// 分配菜单权限
export const assignMenu = (roleId, menuIds) => {
  const formData = new URLSearchParams()
  formData.append('roleId', roleId)
  formData.append('menuIds', menuIds.join(','))
  return post('/role/assignMenu', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}
