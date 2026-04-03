import { post } from '@/utils/request'

/**
 * 公告管理 API
 */

// 获取公告分页列表
export const getNoticePage = (params) => {
  return post(`/notice/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取公告列表
export const getNoticeList = () => {
  return post('/notice/list', {})
}

// 新增公告
export const addNotice = (data) => {
  return post('/notice/add', data)
}

// 更新公告
export const updateNotice = (data) => {
  return post('/notice/update', data)
}

// 删除公告
export const deleteNotice = (id) => {
  return post('/notice/delete', { id })
}

// 发布公告
export const publishNotice = (id) => {
  return post('/notice/publish', { id })
}
