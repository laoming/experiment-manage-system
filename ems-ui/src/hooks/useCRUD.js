/**
 * CRUD 操作 Hook
 * 统一处理增删改查操作
 */
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useCRUD(options = {}) {
  const {
    addFn,
    updateFn,
    deleteFn,
    listFn,
    itemName = '数据',
    onSuccess
  } = options

  const list = ref([])
  const loading = ref(false)

  // 获取列表
  const fetchList = async (params = {}) => {
    if (!listFn) return
    
    loading.value = true
    try {
      const res = await listFn(params)
      if (res.code === 200) {
        list.value = res.data?.records || []
        return res.data
      } else {
        ElMessage.error(res.message || `获取${itemName}列表失败`)
      }
    } catch (error) {
      ElMessage.error(`获取${itemName}列表失败: ${error.message}`)
    } finally {
      loading.value = false
    }
  }

  // 新增
  const handleAdd = async (data) => {
    if (!addFn) return false
    
    try {
      const res = await addFn(data)
      if (res.code === 200) {
        ElMessage.success(`新增${itemName}成功`)
        onSuccess?.('add', data)
        return true
      } else {
        ElMessage.error(res.message || `新增${itemName}失败`)
        return false
      }
    } catch (error) {
      ElMessage.error(`新增${itemName}失败: ${error.message}`)
      return false
    }
  }

  // 更新
  const handleUpdate = async (data) => {
    if (!updateFn) return false
    
    try {
      const res = await updateFn(data)
      if (res.code === 200) {
        ElMessage.success(`更新${itemName}成功`)
        onSuccess?.('update', data)
        return true
      } else {
        ElMessage.error(res.message || `更新${itemName}失败`)
        return false
      }
    } catch (error) {
      ElMessage.error(`更新${itemName}失败: ${error.message}`)
      return false
    }
  }

  // 保存（自动判断新增/更新）
  const handleSave = async (data, isAdd) => {
    return isAdd ? handleAdd(data) : handleUpdate(data)
  }

  // 删除
  const handleDelete = async (id, name) => {
    if (!deleteFn) return false
    
    try {
      await ElMessageBox.confirm(
        `确定要删除${itemName} "${name}" 吗？`,
        '提示',
        { type: 'warning' }
      )
      const res = await deleteFn(id)
      if (res.code === 200) {
        ElMessage.success(`删除${itemName}成功`)
        onSuccess?.('delete', id)
        return true
      } else {
        ElMessage.error(res.message || `删除${itemName}失败`)
        return false
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(`删除${itemName}失败: ${error.message}`)
      }
      return false
    }
  }

  return {
    list,
    loading,
    fetchList,
    handleAdd,
    handleUpdate,
    handleSave,
    handleDelete
  }
}

export default useCRUD
