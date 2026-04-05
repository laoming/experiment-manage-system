import { post } from '@/utils/request'

/**
 * 实验模板 API
 */

// 获取模板分页列表
export const getTemplatePage = (params) => {
  return post(`/experimentTemplate/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取模板详情
export const getTemplateDetail = (id) => {
  return post(`/experimentTemplate/get?templateId=${id}`, {})
}

// 新增模板
export const addTemplate = (data) => {
  return post('/experimentTemplate/add', data)
}

// 更新模板
export const updateTemplate = (data) => {
  return post('/experimentTemplate/update', data)
}

// 删除模板
export const deleteTemplate = (id) => {
  return post('/experimentTemplate/delete', { id })
}
