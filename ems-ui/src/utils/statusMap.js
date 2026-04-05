/**
 * 状态映射工具
 * 统一管理各种状态的文本和类型映射
 */

// 用户状态
export const USER_STATUS = {
  1: { text: '激活', type: 'success' },
  2: { text: '禁用', type: 'danger' },
  0: { text: '已删除', type: 'info' }
}

// 角色状态
export const ROLE_STATUS = {
  1: { text: '正常', type: 'success' },
  0: { text: '禁用', type: 'danger' }
}

// 公告状态
export const NOTICE_STATUS = {
  0: { text: '草稿', type: 'info' },
  1: { text: '已发布', type: 'success' }
}

// 实验模板状态
export const TEMPLATE_STATUS = {
  0: { text: '草稿', type: 'info' },
  1: { text: '已发布', type: 'success' }
}

// 实验报告状态
export const REPORT_STATUS = {
  0: { text: '待提交', type: 'warning' },
  1: { text: '已提交', type: 'primary' },
  2: { text: '已批改', type: 'success' },
  3: { text: '已退回', type: 'danger' }
}

// 实验报告状态（字符串格式）
export const REPORT_STATUS_STRING = {
  'pending': { text: '待填写', type: 'warning' },
  'draft': { text: '草稿', type: 'info' },
  'returned': { text: '已退回', type: 'danger' },
  'submitted': { text: '已提交', type: 'primary' },
  'graded': { text: '已评分', type: 'success' }
}

// 消息状态
export const MESSAGE_STATUS = {
  0: { text: '未读', type: 'warning' },
  1: { text: '已读', type: 'success' }
}

// 课程状态
export const COURSE_STATUS = {
  1: { text: '进行中', type: 'success' },
  2: { text: '已结束', type: 'info' }
}

// 菜单类型
export const MENU_TYPE = {
  'M': { text: '菜单', type: 'primary' },
  'D': { text: '目录', type: 'success' }
}

/**
 * 获取状态文本
 * @param {Object} statusMap 状态映射对象
 * @param {Number|String} status 状态值
 * @returns {String} 状态文本
 */
export function getStatusText(statusMap, status) {
  return statusMap[status]?.text || '未知'
}

/**
 * 获取状态类型（用于 el-tag）
 * @param {Object} statusMap 状态映射对象
 * @param {Number|String} status 状态值
 * @returns {String} 状态类型
 */
export function getStatusType(statusMap, status) {
  return statusMap[status]?.type || 'info'
}

/**
 * 创建状态格式化函数
 * @param {Object} statusMap 状态映射对象
 * @returns {Object} 包含 getText 和 getType 方法
 */
export function createStatusFormatter(statusMap) {
  return {
    getText: (status) => getStatusText(statusMap, status),
    getType: (status) => getStatusType(statusMap, status)
  }
}

export default {
  USER_STATUS,
  ROLE_STATUS,
  NOTICE_STATUS,
  TEMPLATE_STATUS,
  REPORT_STATUS,
  REPORT_STATUS_STRING,
  MESSAGE_STATUS,
  COURSE_STATUS,
  MENU_TYPE,
  getStatusText,
  getStatusType,
  createStatusFormatter
}
