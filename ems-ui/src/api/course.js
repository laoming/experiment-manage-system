import { post } from '@/utils/request'

/**
 * 课程管理 API
 */

// 获取课程分页列表
export const getCoursePage = (params) => {
  return post(`/course/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取课程列表
export const getCourseList = () => {
  return post('/course/list', {})
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
  return post(`/course/delete?courseId=${id}`, {})
}

// 加入课程
export const joinCourse = (courseId) => {
  return post('/course/join', { courseId })
}

// 退出课程
export const leaveCourse = (courseId) => {
  return post('/course/leave', { courseId })
}

// 获取我的课程
export const getMyCourseList = (params) => {
  return post(`/course/my?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取课程详情
export const getCourseDetail = (courseId) => {
  return post(`/course/get?courseId=${courseId}`, {})
}

// 管理者相关
export const getAdminIds = (courseId) => post(`/course/getAdminIds?courseId=${courseId}`, {})
export const addAdmins = (courseId, userIds) => post(`/course/addAdmins?courseId=${courseId}`, userIds)
export const removeAdmin = (courseId, userId) => post(`/course/removeAdmin?courseId=${courseId}&userId=${userId}`, {})

// 学生相关
export const getStudentIds = (courseId) => post(`/course/getStudentIds?courseId=${courseId}`, {})
export const addStudents = (courseId, userIds) => post(`/course/addStudents?courseId=${courseId}`, userIds)
export const removeStudent = (courseId, userId) => post(`/course/removeStudent?courseId=${courseId}&userId=${userId}`, {})

// 模板相关
export const getTemplateIds = (courseId) => post(`/course/getTemplateIds?courseId=${courseId}`, {})
export const addTemplates = (courseId, templateIds) => post(`/course/addTemplates?courseId=${courseId}`, templateIds)
export const removeTemplate = (courseId, templateId) => post(`/course/removeTemplate?courseId=${courseId}&templateId=${templateId}`, {})
