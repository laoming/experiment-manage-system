import { post } from '@/utils/request'

/**
 * 消息管理 API
 */

// 获取消息分页列表
export const getMessagePage = (params) => {
  return post(`/message/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取未读消息数量
export const getUnreadCount = () => {
  return post('/message/unreadCount', {})
}

// 标记已读
export const markAsRead = (id) => {
  return post(`/message/markRead?id=${id}`, {})
}

// 全部标记已读
export const markAllAsRead = () => {
  return post('/message/markAllRead', {})
}

// 删除消息
export const deleteMessage = (id) => {
  return post(`/message/delete?id=${id}`, {})
}

// 发送消息
export const sendMessage = (data) => {
  return post('/message/add', data)
}

// 获取用户简单列表（用于选择接收人）
export const getUserSimpleList = () => {
  return post('/user/simpleList', {})
}
