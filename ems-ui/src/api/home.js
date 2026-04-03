import { post } from '@/utils/request'

/**
 * 获取首页统计数据
 */
export const getHomeStats = () => {
  return post('/home/stats', {})
}

/**
 * 获取首页公告列表
 */
export const getHomeNotices = (limit = 5) => {
  return post(`/notice/page?current=1&size=${limit}`, {})
}

/**
 * 获取首页消息列表
 */
export const getHomeMessages = (limit = 5) => {
  return post(`/message/page?current=1&size=${limit}`, { isRead: 0 })
}
