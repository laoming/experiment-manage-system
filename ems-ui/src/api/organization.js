import { post } from '@/utils/request'

/**
 * 组织管理 API
 */

// 获取组织列表
export const getOrganizationList = () => {
  return post('/organization/list', {})
}

// 获取组织树（使用list接口，前端构建树结构）
export const getOrganizationTree = () => {
  return post('/organization/list', {})
}

// 新增组织
export const addOrganization = (data) => {
  return post('/organization/add', data)
}

// 更新组织
export const updateOrganization = (data) => {
  return post('/organization/update', data)
}

// 删除组织
export const deleteOrganization = (id) => {
  return post('/organization/delete', { id })
}
