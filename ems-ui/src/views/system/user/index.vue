<template>
  <PageListLayout
    title="用户管理"
    subtitle="管理系统用户，包括用户添加、编辑、删除以及密码重置"
    :data="userList"
    :loading="loading"
    :current="pagination.current"
    :size="pagination.size"
    :total="pagination.total"
    @update:current="pagination.current = $event"
    @update:size="pagination.size = $event"
    @page-change="fetchUserList"
  >
    <!-- 搜索区域 -->
    <template #search>
      <el-input v-model="queryForm.username" placeholder="输入账号搜索" clearable style="width: 150px" />
      <el-input v-model="queryForm.displayName" placeholder="输入用户名称搜索" clearable style="width: 150px" />
      <el-select v-model="queryForm.roleId" placeholder="全部角色" clearable style="width: 120px">
        <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id" />
      </el-select>
      <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
        <el-option label="激活" :value="1" />
        <el-option label="禁用" :value="2" />
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
      <el-button type="success" @click="userModal.openAdd()">
        <el-icon><Plus /></el-icon> 新增用户
      </el-button>
    </template>

    <!-- 表格列 -->
    <el-table-column type="index" label="序号" width="60" :index="indexMethod" />
    <el-table-column prop="username" label="账号" width="120" />
    <el-table-column prop="displayName" label="用户名称" width="120" />
    <el-table-column label="角色" width="120">
      <template #default="{ row }">{{ getRoleName(row.roleId) }}</template>
    </el-table-column>
    <el-table-column label="组织" min-width="180">
      <template #default="{ row }">{{ getOrgName(row.orgId) }}</template>
    </el-table-column>
    <el-table-column label="状态" width="80">
      <template #default="{ row }">
        <el-tag :type="getStatusType(USER_STATUS, row.status)" size="small">
          {{ getStatusText(USER_STATUS, row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="userModal.openEdit(row)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button type="warning" link @click="openResetPasswordModal(row)">
          <el-icon><Key /></el-icon> 重置密码
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </template>
    </el-table-column>

    <!-- 弹窗 -->
    <template #modals>
      <el-dialog 
        v-model="userModal.visible" 
        :title="(userModal.isAdd ? '新增' : '编辑') + '用户'" 
        width="500px" 
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form :model="userModal.form" label-width="100px">
          <el-form-item label="账号" required>
            <el-input v-model="userModal.form.username" placeholder="请输入账号" :disabled="userModal.isEdit" />
          </el-form-item>
          <el-form-item v-if="userModal.isAdd" label="密码" required>
            <el-input v-model="userModal.form.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="用户名称" required>
            <el-input v-model="userModal.form.displayName" placeholder="请输入用户名称" />
          </el-form-item>
          <el-form-item label="用户角色" required>
            <el-select v-model="userModal.form.roleId" placeholder="请选择角色" style="width: 100%">
              <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属组织" required>
            <el-select v-model="userModal.form.orgId" placeholder="请选择组织" style="width: 100%">
              <el-option v-for="org in orgList" :key="org.id" :label="org.fullPath" :value="org.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="userModal.isEdit" label="状态">
            <el-select v-model="userModal.form.status" style="width: 100%">
              <el-option label="激活" :value="1" />
              <el-option label="禁用" :value="2" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="userModal.close()">取消</el-button>
          <el-button type="primary" @click="handleUserSubmit">确定</el-button>
        </template>
      </el-dialog>

      <el-dialog 
        v-model="showPasswordModal" 
        title="重置密码" 
        width="400px" 
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form :model="passwordForm" label-width="100px">
          <el-form-item label="账号">
            <el-input :value="passwordForm.username" disabled />
          </el-form-item>
          <el-form-item label="新密码" required>
            <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码" required>
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPasswordModal = false">取消</el-button>
          <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </PageListLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import { getUserPage, addUser, updateUser, deleteUser, resetPassword } from '@/api/user'
import { getRoleList } from '@/api/role'
import { getOrganizationList } from '@/api/organization'
import { formatDateTime } from '@/utils/format'
import { USER_STATUS, getStatusText, getStatusType } from '@/utils/statusMap'
import { usePagination, useFormModal, useSearch } from '@/hooks'
import { PageListLayout } from '@/components'

// 列表数据
const userList = ref([])
const roleList = ref([])
const orgList = ref([])

// 分页
const { pagination, loading, indexMethod } = usePagination()

// 搜索
const defaultQuery = { username: '', displayName: '', roleId: null, status: null }
const { queryForm, handleSearch, handleReset } = useSearch(defaultQuery, () => {
  pagination.current = 1
  fetchUserList()
})

// 用户弹窗
const userModal = useFormModal({
  id: '',
  username: '',
  password: '',
  displayName: '',
  roleId: '',
  orgId: '',
  status: 1
})

// 重置密码弹窗
const showPasswordModal = ref(false)
const passwordForm = reactive({ id: '', username: '', password: '', confirmPassword: '' })

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserPage({ ...queryForm, ...pagination })
    if (res.code === 200) {
      userList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 获取角色列表
const fetchRoleList = async () => {
  const res = await getRoleList()
  if (res.code === 200) roleList.value = res.data || []
}

// 获取组织列表
const fetchOrgList = async () => {
  const res = await getOrganizationList()
  if (res.code === 200) orgList.value = res.data || []
}

// 提交用户表单
const handleUserSubmit = async () => {
  const form = userModal.form
  if (!form.username.trim()) return ElMessage.warning('账号不能为空')
  if (userModal.isAdd && !form.password.trim()) return ElMessage.warning('密码不能为空')
  if (!form.displayName.trim()) return ElMessage.warning('用户名称不能为空')
  if (!form.roleId) return ElMessage.warning('请选择用户角色')
  if (!form.orgId) return ElMessage.warning('请选择所属组织')

  const res = userModal.isAdd ? await addUser(form) : await updateUser(form)
  if (res.code === 200) {
    ElMessage.success(userModal.isAdd ? '新增成功' : '更新成功')
    userModal.close()
    fetchUserList()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

// 打开重置密码弹窗
const openResetPasswordModal = (user) => {
  Object.assign(passwordForm, { id: user.id, username: user.username, password: '', confirmPassword: '' })
  showPasswordModal.value = true
}

// 提交重置密码
const handlePasswordSubmit = async () => {
  if (!passwordForm.password.trim()) return ElMessage.warning('新密码不能为空')
  if (passwordForm.password !== passwordForm.confirmPassword) return ElMessage.warning('两次输入的密码不一致')

  const res = await resetPassword(passwordForm.id, passwordForm.password)
  if (res.code === 200) {
    ElMessage.success('重置密码成功')
    showPasswordModal.value = false
  } else {
    ElMessage.error(res.message || '重置密码失败')
  }
}

// 删除用户
const handleDelete = async (user) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要删除用户 "${user.displayName}" 吗？`, '提示', { type: 'warning' })
    const res = await deleteUser(user.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchUserList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

// 获取角色名称
const getRoleName = (roleId) => {
  if (!roleId) return '-'
  const role = roleList.value.find(r => r.id === roleId)
  return role ? role.roleName : '-'
}

// 获取组织名称
const getOrgName = (orgId) => {
  if (!orgId) return '-'
  const org = orgList.value.find(o => o.id === orgId)
  return org ? org.fullPath : '-'
}

onMounted(() => {
  fetchRoleList()
  fetchOrgList()
  fetchUserList()
})

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  userModal.close()
  showPasswordModal.value = false
})

// 组件被 keep-alive 缓存失活时，关闭所有弹窗
onDeactivated(() => {
  userModal.close()
  showPasswordModal.value = false
})
</script>
