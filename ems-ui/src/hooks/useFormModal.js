/**
 * 表单弹窗 Hook
 * 统一处理新增/编辑弹窗状态
 * 使用 reactive 确保整个对象是响应式的
 */
import { reactive } from 'vue'

export function useFormModal(defaultForm) {
  // 创建响应式状态对象，所有属性都是直接的响应式属性（不是 ref）
  const state = reactive({
    visible: false,
    mode: 'add', // 'add' | 'edit'
    form: { ...defaultForm },

    // 打开新增弹窗
    openAdd() {
      state.mode = 'add'
      Object.keys(defaultForm).forEach(key => {
        state.form[key] = defaultForm[key]
      })
      state.visible = true
    },

    // 打开编辑弹窗
    openEdit(data) {
      state.mode = 'edit'
      Object.keys(defaultForm).forEach(key => {
        state.form[key] = data[key] !== undefined ? data[key] : defaultForm[key]
      })
      state.visible = true
    },

    // 关闭弹窗
    close() {
      state.visible = false
    },

    // 重置表单
    reset() {
      Object.keys(defaultForm).forEach(key => {
        state.form[key] = defaultForm[key]
      })
    },

    // 重置弹窗状态（关闭弹窗并重置表单）
    resetModal() {
      state.visible = false
      state.mode = 'add'
      Object.keys(defaultForm).forEach(key => {
        state.form[key] = defaultForm[key]
      })
    }
  })

  // 使用 getter 来定义计算属性（避免 computed 在 reactive 中的潜在问题）
  Object.defineProperty(state, 'isAdd', {
    get() { return state.mode === 'add' },
    enumerable: true,
    configurable: true
  })

  Object.defineProperty(state, 'isEdit', {
    get() { return state.mode === 'edit' },
    enumerable: true,
    configurable: true
  })

  Object.defineProperty(state, 'title', {
    get() { return state.isAdd ? '新增' : '编辑' },
    enumerable: true,
    configurable: true
  })

  return state
}

export default useFormModal
