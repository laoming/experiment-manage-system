<template>
  <PageListLayout
    title="菜单管理"
    subtitle="管理系统菜单，配置菜单权限"
    :data="menuList"
    :loading="loading"
    :show-pagination="false"
  >
    <!-- 搜索区域 -->
    <template #search>
      <el-input v-model="queryForm.menuName" placeholder="输入菜单名称搜索" clearable style="width: 180px" />
      <el-select v-model="queryForm.menuType" placeholder="全部类型" clearable style="width: 120px">
        <el-option label="菜单" value="M" />
        <el-option label="目录" value="D" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon> 搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon> 重置
      </el-button>
    </template>

    <!-- 操作按钮 -->
    <template #actions>
      <el-button type="success" @click="menuModal.openAdd()">
        <el-icon><Plus /></el-icon> 新增菜单
      </el-button>
    </template>

    <!-- 表格列 -->
    <el-table-column type="index" label="序号" width="60" :index="indexMethod" />
    <el-table-column prop="menuName" label="菜单名称" width="150" />
    <el-table-column prop="menuCode" label="菜单编码" width="150" />
    <el-table-column prop="path" label="路径" width="150" />
    <el-table-column label="类型" width="80">
      <template #default="{ row }">
        <el-tag :type="getStatusType(MENU_TYPE, row.menuType)" size="small">
          {{ getStatusText(MENU_TYPE, row.menuType) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="sort" label="排序" width="80" />
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="menuModal.openEdit(row)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </template>
    </el-table-column>

    <!-- 弹窗 -->
    <template #modals>
      <el-dialog 
        v-model="menuModal.visible" 
        :title="(menuModal.isAdd ? '新增' : '编辑') + '菜单'" 
        width="500px" 
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form :model="menuModal.form" label-width="100px">
          <el-form-item label="上级菜单">
            <el-select v-model="menuModal.form.parentId" placeholder="请选择上级菜单" clearable style="width: 100%">
              <el-option label="无（作为根菜单）" value="0" />
              <el-option v-for="menu in parentMenus" :key="menu.id" :label="menu.menuName" :value="menu.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="菜单名称" required>
            <el-input v-model="menuModal.form.menuName" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item label="菜单编码" required>
            <el-input v-model="menuModal.form.menuCode" placeholder="请输入菜单编码" />
          </el-form-item>
          <el-form-item label="路径">
            <el-input v-model="menuModal.form.path" placeholder="请输入路径" />
          </el-form-item>
          <el-form-item label="菜单类型" required>
            <el-select v-model="menuModal.form.menuType" style="width: 100%">
              <el-option label="菜单" value="M" />
              <el-option label="目录" value="D" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="menuModal.form.sort" :min="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="menuModal.close()">取消</el-button>
          <el-button type="primary" @click="handleMenuSubmit">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </PageListLayout>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getMenuList, addMenu, updateMenu, deleteMenu } from '@/api/menu'
import { formatDateTime } from '@/utils/format'
import { MENU_TYPE, getStatusText, getStatusType } from '@/utils/statusMap'
import { usePagination, useFormModal, useSearch } from '@/hooks'
import { PageListLayout } from '@/components'

// 数据
const menuList = ref([])
const parentMenus = computed(() => menuList.value.filter(m => m.menuType === 'D'))

// 分页（用于序号计算）
const { loading, indexMethod } = usePagination()

// 菜单弹窗
const menuModal = useFormModal({
  id: '',
  parentId: '0',
  menuName: '',
  menuCode: '',
  path: '',
  menuType: 'M',
  sort: 0
})

// 获取菜单列表
const fetchMenuList = async () => {
  loading.value = true
  try {
    const res = await getMenuList()
    if (res.code === 200) {
      let list = res.data || []
      // 搜索过滤
      if (queryForm.menuName) {
        list = list.filter(m => m.menuName.includes(queryForm.menuName))
      }
      if (queryForm.menuType) {
        list = list.filter(m => m.menuType === queryForm.menuType)
      }
      menuList.value = list
    }
  } finally {
    loading.value = false
  }
}

// 搜索
const defaultQuery = { menuName: '', menuType: null }
const { queryForm, handleSearch, handleReset } = useSearch(defaultQuery, fetchMenuList)

// 提交菜单表单
const handleMenuSubmit = async () => {
  const form = menuModal.form
  if (!form.menuName.trim()) return ElMessage.warning('菜单名称不能为空')
  if (!form.menuCode.trim()) return ElMessage.warning('菜单编码不能为空')
  if (!form.menuType) return ElMessage.warning('请选择菜单类型')

  const res = menuModal.isAdd ? await addMenu(form) : await updateMenu(form)
  if (res.code === 200) {
    ElMessage.success(menuModal.isAdd ? '新增成功' : '更新成功')
    menuModal.close()
    fetchMenuList()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

// 删除菜单
const handleDelete = async (menu) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要删除菜单 "${menu.menuName}" 吗？`, '提示', { type: 'warning' })
    const res = await deleteMenu(menu.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchMenuList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => fetchMenuList())

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  menuModal.close()
})

// 组件被 keep-alive 缓存失活时，关闭弹窗
onDeactivated(() => {
  menuModal.close()
})
</script>
