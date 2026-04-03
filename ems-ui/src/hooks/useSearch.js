/**
 * 搜索 Hook
 * 统一处理搜索和重置逻辑
 */
import { reactive } from 'vue'

export function useSearch(defaultQuery, onSearch) {
  const queryForm = reactive({ ...defaultQuery })

  // 搜索
  const handleSearch = () => {
    if (onSearch) {
      onSearch(queryForm)
    }
  }

  // 重置
  const handleReset = () => {
    Object.keys(defaultQuery).forEach(key => {
      queryForm[key] = defaultQuery[key]
    })
    if (onSearch) {
      onSearch(queryForm)
    }
  }

  // 重置查询条件（不触发搜索）
  const resetQuery = () => {
    Object.keys(defaultQuery).forEach(key => {
      queryForm[key] = defaultQuery[key]
    })
  }

  // 获取查询参数
  const getQueryParams = () => ({ ...queryForm })

  return {
    queryForm,
    handleSearch,
    handleReset,
    resetQuery,
    getQueryParams
  }
}

export default useSearch
