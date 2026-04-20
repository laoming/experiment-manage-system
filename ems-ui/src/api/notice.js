import { post, get } from '@/utils/request'

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

// 获取最新公告（GET方法）
export const getLatestNotices = (limit = 20) => {
  return get(`/notice/latest?limit=${limit}`)
}

// 新增公告
export const addNotice = (data) => {
  return post('/notice/add', data)
}

// 删除公告
export const deleteNotice = (id) => {
  return post('/notice/delete', { id })
}
