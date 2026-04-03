/**
 * 分页 Hook
 * 统一处理分页逻辑
 */
import { ref, reactive, computed } from 'vue'

export function usePagination(defaultSize = 10) {
  const pagination = reactive({
    current: 1,
    size: defaultSize,
    total: 0
  })

  const loading = ref(false)

  // 序号计算方法
  const indexMethod = (index) => {
    return (pagination.current - 1) * pagination.size + index + 1
  }

  // 重置到第一页
  const resetPage = () => {
    pagination.current = 1
  }

  // 设置总数
  const setTotal = (total) => {
    pagination.total = total || 0
  }

  // 设置分页数据
  const setPageData = (data) => {
    if (data) {
      setTotal(data.total)
    }
  }

  // 获取分页参数
  const getPaginationParams = () => ({
    current: pagination.current,
    size: pagination.size
  })

  return {
    pagination,
    loading,
    indexMethod,
    resetPage,
    setTotal,
    setPageData,
    getPaginationParams
  }
}

export default usePagination
