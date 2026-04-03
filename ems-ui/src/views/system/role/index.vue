<template>
  <PageListLayout
    title="角色管理"
    subtitle="管理系统角色，包括角色添加、编辑、删除以及权限分配"
    :data="roleList"
    :loading="loading"
    :current="pagination.current"
    :size="pagination.size"
    :total="pagination.total"
    @update:current="pagination.current = $event"
    @update:size="pagination.size = $event"
    @page-change="fetchRoleList"
  >
    <!-- 搜索区域 -->
    <template #search>
      <el-input v-model="queryForm.roleName" placeholder="输入角色名称搜索" clearable style="width: 150px" />
      <el-input v-model="queryForm.roleCode" placeholder="输入角色编码搜索" clearable style="width: 150px" />
      <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
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
      <el-button type="success" @click="roleModal.openAdd()">
        <el-icon><Plus /></el-icon> 新增角色
      </el-button>
    </template>

    <!-- 表格列 -->
    <el-table-column type="index" label="序号" width="60" :index="indexMethod" />
    <el-table-column prop="roleName" label="角色名称" width="150" />
    <el-table-column prop="roleCode" label="角色编码" width="150" />
    <el-table-column label="状态" width="80">
      <template #default="{ row }">
        <el-tag :type="getStatusType(ROLE_STATUS, row.status)" size="small">
          {{ getStatusText(ROLE_STATUS, row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="250" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="roleModal.openEdit(row)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button type="warning" link @click="openAssignModal(row)">
          <el-icon><Lock /></el-icon> 分配权限
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </template>
    </el-table-column>

    <!-- 弹窗 -->
    <template #modals>
      <el-dialog 
        v-model="roleModal.visible" 
        :title="(roleModal.isAdd ? '新增' : '编辑') + '角色'" 
        width="500px" 
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form :model="roleModal.form" label-width="100px">
          <el-form-item label="角色名称" required>
            <el-input v-model="roleModal.form.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色编码" required>
            <el-input v-model="roleModal.form.roleCode" placeholder="请输入角色编码" />
          </el-form-item>
          <el-form-item v-if="roleModal.isEdit" label="状态">
            <el-select v-model="roleModal.form.status" style="width: 100%">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="roleModal.close()">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
        </template>
      </el-dialog>

      <el-dialog 
        v-model="showAssignModal" 
        title="分配权限" 
        width="500px" 
        destroy-on-close
        :close-on-click-modal="false"
      >
        <div v-loading="menuLoading">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          <el-divider />
          <el-checkbox-group v-model="selectedMenuIds">
            <div v-for="menu in menuTree" :key="menu.id" class="menu-item">
              <el-checkbox :label="menu.id">{{ menu.menuName }}</el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
        <template #footer>
          <el-button @click="showAssignModal = false">取消</el-button>
          <el-button type="primary" @click="handleAssignSubmit">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </PageListLayout>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Lock } from '@element-plus/icons-vue'
import { getRolePage, addRole, updateRole, deleteRole, getRoleMenuIds, assignMenu } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import { formatDateTime } from '@/utils/format'
import { ROLE_STATUS, getStatusText, getStatusType } from '@/utils/statusMap'
import { usePagination, useFormModal, useSearch } from '@/hooks'
import { PageListLayout } from '@/components'

// 列表数据
const roleList = ref([])
const menuTree = ref([])
const selectedMenuIds = ref([])
const currentRole = ref(null)
const menuLoading = ref(false)
const showAssignModal = ref(false)
const selectAll = ref(false)

// 分页
const { pagination, loading, indexMethod } = usePagination()

// 搜索
const defaultQuery = { roleName: '', roleCode: '', status: null }
const { queryForm, handleSearch, handleReset } = useSearch(defaultQuery, () => {
  pagination.current = 1
  fetchRoleList()
})

// 角色弹窗
const roleModal = useFormModal({
  id: '',
  roleName: '',
  roleCode: '',
  status: 1
})

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const res = await getRolePage({ ...queryForm, ...pagination })
    if (res.code === 200) {
      roleList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 提交角色表单
const handleRoleSubmit = async () => {
  const form = roleModal.form
  if (!form.roleName.trim()) return ElMessage.warning('角色名称不能为空')
  if (!form.roleCode.trim()) return ElMessage.warning('角色编码不能为空')

  const res = roleModal.isAdd ? await addRole(form) : await updateRole(form)
  if (res.code === 200) {
    ElMessage.success(roleModal.isAdd ? '新增成功' : '更新成功')
    roleModal.close()
    fetchRoleList()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

// 打开分配权限弹窗
const openAssignModal = async (role) => {
  currentRole.value = role
  showAssignModal.value = true
  selectAll.value = false
  selectedMenuIds.value = []
  menuLoading.value = true
  try {
    const res = await getMenuTree()
    if (res.code === 200) menuTree.value = res.data || []
    const menuRes = await getRoleMenuIds(role.id)
    if (menuRes.code === 200) selectedMenuIds.value = menuRes.data || []
    checkSelectAll()
  } finally {
    menuLoading.value = false
  }
}

// 全选
const handleSelectAll = () => {
  const allIds = menuTree.value.map(m => m.id)
  selectedMenuIds.value = selectAll.value ? allIds : []
}

// 检查是否全选
const checkSelectAll = () => {
  const allIds = menuTree.value.map(m => m.id)
  selectAll.value = allIds.length > 0 && allIds.every(id => selectedMenuIds.value.includes(id))
}

// 提交权限分配
const handleAssignSubmit = async () => {
  const res = await assignMenu(currentRole.value.id, selectedMenuIds.value)
  if (res.code === 200) {
    ElMessage.success('权限分配成功')
    showAssignModal.value = false
  } else {
    ElMessage.error(res.message || '权限分配失败')
  }
}

// 删除角色
const handleDelete = async (role) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要删除角色 "${role.roleName}" 吗？`, '提示', { type: 'warning' })
    const res = await deleteRole(role.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchRoleList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => fetchRoleList())

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  roleModal.close()
  showAssignModal.value = false
})

// 组件被 keep-alive 缓存失活时，关闭弹窗
onDeactivated(() => {
  roleModal.close()
  showAssignModal.value = false
})
</script>

<style scoped>
.menu-item {
  margin-bottom: 10px;
}
</style>
