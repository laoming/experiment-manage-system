import { post } from '@/utils/request'

/**
 * 实验报告 API
 */

// 获取报告分页列表
export const getReportPage = (params) => {
  return post(`/experimentReport/page?current=${params.current || 1}&size=${params.size || 10}`, params)
}

// 获取报告详情
export const getReportDetail = (id) => {
  return post(`/experimentReport/get?reportId=${id}`, {})
}

// 获取报告内容（使用get接口，从返回数据中取content）
export const getReportContent = (reportId) => {
  return post(`/experimentReport/get?reportId=${reportId}`, {})
}

// 提交报告
export const submitReport = (data) => {
  return post('/experimentReport/submit', data)
}

// 评分
export const gradeReport = (data) => {
  return post('/experimentReport/grade', data)
}

// 获取课程报告列表
export const getCourseReports = (courseId) => {
  return post(`/experimentReport/getByCourseId?courseId=${courseId}`, {})
}

// 获取报告内容（使用get接口获取详情）
export const getReportContent = (reportId) => {
  return post(`/experimentReport/get?reportId=${reportId}`, {})
}
