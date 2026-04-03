import { post } from '@/utils/request'

/**
 * 菜单管理 API
 */

// 获取菜单树
export const getMenuTree = () => {
  return post('/menu/tree', {})
}

// 获取菜单列表
export const getMenuList = () => {
  return post('/menu/list', {})
}

// 新增菜单
export const addMenu = (data) => {
  return post('/menu/add', data)
}

// 更新菜单
export const updateMenu = (data) => {
  return post('/menu/update', data)
}

// 删除菜单
export const deleteMenu = (id) => {
  return post('/menu/delete', { id })
}
