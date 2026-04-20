import { post } from '@/utils/request'

/**
 * 课程管理 API
 */

// 获取课程分页列表
export const getCoursePage = (params, userType = 1) => {
  return post(`/course/page?current=${params.current || 1}&size=${params.size || 10}&userType=${userType}`, params)
}

// 新增课程
export const addCourse = (data) => {
  return post('/course/add', data)
}

// 更新课程
export const updateCourse = (data) => {
  return post('/course/update', data)
}

// 删除课程
export const deleteCourse = (id) => {
  return post('/course/delete', { id })
}

// 获取课程详情
export const getCourseDetail = (courseId) => {
  return post(`/course/get?courseId=${courseId}`, {})
}

// 获取我的课程（学生视角）- 使用 /course/page?userType=2
export const getMyCourseList = (params) => {
  return post(`/course/page?current=${params.current || 1}&size=${params.size || 10}&userType=2`, params)
}

// 管理者相关
export const getAdminIds = (courseId) => post(`/course/getAdminIds?courseId=${courseId}`, {})
export const addAdmins = (courseId, userIds) => post('/course/bindAdmins', { courseId, userIds })
export const removeAdmin = (courseId, userId) => post('/course/unbindUsers', { courseId, userIds: [userId] })

// 学生相关
export const getStudentIds = (courseId) => post(`/course/getStudentIds?courseId=${courseId}`, {})
export const addStudents = (courseId, userIds) => post('/course/bindUsers', { courseId, userIds })
export const removeStudent = (courseId, userId) => post('/course/unbindUsers', { courseId, userIds: [userId] })

// 模板相关
export const getTemplateIds = (courseId) => post(`/course/getTemplateIds?courseId=${courseId}`, {})
export const getTemplateInfos = (courseId) => post(`/course/getTemplateInfos?courseId=${courseId}`, {})
export const addTemplates = (courseId, templateIds) => post('/course/bindTemplates', { courseId, templateIds })
export const removeTemplate = (courseId, templateId) => post('/course/unbindTemplates', { courseId, templateIds: [templateId] })

// 加入课程（使用 bindUsers 接口，绑定当前用户）
export const joinCourse = (courseId, userId) => {
  return post('/course/bindUsers', { courseId, userIds: [userId] })
}

// 退出课程（使用 unbindUsers 接口，解绑当前用户）
export const leaveCourse = (courseId, userId) => {
  return post('/course/unbindUsers', { courseId, userIds: [userId] })
}
