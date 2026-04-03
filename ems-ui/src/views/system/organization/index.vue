<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">组织管理</h1>
      <p class="page-subtitle">管理系统组织架构，支持树形结构展示</p>
    </div>

    <div class="content-wrapper">
      <!-- 左侧组织树 -->
      <div class="tree-panel">
        <div class="panel-header">
          <h3>组织架构</h3>
          <div class="panel-actions">
            <el-button type="primary" size="small" @click="openAddModal">
              <el-icon><Plus /></el-icon> 新增
            </el-button>
            <el-button size="small" @click="expandAll">
              {{ expandedAll ? '收起全部' : '展开全部' }}
            </el-button>
          </div>
        </div>
        <div class="tree-content" v-loading="loading">
          <el-tree
            :data="orgTree"
            :props="treeProps"
            node-key="id"
            :default-expand-all="expandedAll"
            :highlight-current="true"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span class="tree-label">{{ data.orgName }}</span>
                <el-tag v-if="!data.parentId || data.parentId === '0'" type="warning" size="small">根</el-tag>
                <span class="tree-code">({{ data.orgCode }})</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="detail-panel">
        <div class="panel-header">
          <h3>组织详情</h3>
          <div class="panel-actions" v-if="selectedOrg">
            <el-button type="primary" size="small" @click="openEditModal">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
        <div class="detail-content" v-if="selectedOrg">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="组织名称">{{ selectedOrg.orgName }}</el-descriptions-item>
            <el-descriptions-item label="组织编码">{{ selectedOrg.orgCode }}</el-descriptions-item>
            <el-descriptions-item label="完整路径">{{ selectedOrg.fullPath }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ selectedOrg.description || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(selectedOrg.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(selectedOrg.updateTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-empty" v-else>
          <el-empty description="请在左侧选择一个组织" />
        </div>
      </div>
    </div>

    <!-- 组织编辑弹窗 -->
    <el-dialog 
      v-model="orgModal.visible" 
      :title="(orgModal.isAdd ? '新增' : '编辑') + '组织'" 
      width="500px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="orgModal.form" label-width="100px">
        <el-form-item label="上级组织">
          <el-select v-model="orgModal.form.parentId" placeholder="请选择上级组织" clearable style="width: 100%">
            <el-option label="无（作为根组织）" value="" />
            <el-option v-for="org in parentOrgList" :key="org.id" :label="org.fullPath" :value="org.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="组织名称" required>
          <el-input v-model="orgModal.form.orgName" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织编码" required>
          <el-input v-model="orgModal.form.orgCode" placeholder="请输入组织编码" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="orgModal.form.description" type="textarea" rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orgModal.close()">取消</el-button>
        <el-button type="primary" @click="handleOrgSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getOrganizationList, addOrganization, updateOrganization, deleteOrganization } from '@/api/organization'
import { formatDateTime } from '@/utils/format'
import { useFormModal } from '@/hooks'

// 数据
const loading = ref(false)
const organizationList = ref([])
const selectedOrg = ref(null)
const expandedAll = ref(false)

const treeProps = { children: 'children', label: 'orgName' }

// 组织弹窗
const orgModal = useFormModal({
  id: '',
  parentId: '',
  orgName: '',
  orgCode: '',
  description: ''
})

// 父组织列表
const parentOrgList = computed(() => organizationList.value)

// 组织树
const orgTree = computed(() => {
  const orgMap = {}
  const roots = []

  organizationList.value.forEach(org => {
    orgMap[org.id] = {
      id: org.id,
      parentId: org.parentId,
      orgName: org.orgName,
      orgCode: org.orgCode,
      fullPath: org.fullPath || '',
      description: org.description || '',
      createTime: org.createTime,
      updateTime: org.updateTime,
      children: []
    }
  })

  organizationList.value.forEach(org => {
    const node = orgMap[org.id]
    if (!org.parentId || org.parentId === '' || org.parentId === '0') {
      roots.push(node)
    } else if (orgMap[org.parentId]) {
      orgMap[org.parentId].children.push(node)
    }
  })

  return roots
})

// 获取组织列表
const fetchOrganizationList = async () => {
  loading.value = true
  try {
    const res = await getOrganizationList()
    if (res.code === 200) {
      organizationList.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

// 展开/收起
const expandAll = () => {
  expandedAll.value = !expandedAll.value
}

// 选择节点
const handleNodeClick = (data) => {
  selectedOrg.value = data
}

// 打开新增弹窗
const openAddModal = () => {
  orgModal.openAdd()
  orgModal.form.parentId = selectedOrg.value ? selectedOrg.value.id : ''
}

// 打开编辑弹窗
const openEditModal = () => {
  if (!selectedOrg.value) return ElMessage.warning('请先选择一个组织')
  orgModal.openEdit(selectedOrg.value)
}

// 提交组织表单
const handleOrgSubmit = async () => {
  const form = orgModal.form
  if (!form.orgName.trim()) return ElMessage.warning('组织名称不能为空')
  if (!form.orgCode.trim()) return ElMessage.warning('组织编码不能为空')

  const res = orgModal.isAdd ? await addOrganization(form) : await updateOrganization(form)
  if (res.code === 200) {
    ElMessage.success(orgModal.isAdd ? '新增成功' : '更新成功')
    orgModal.close()
    selectedOrg.value = null
    fetchOrganizationList()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

// 删除组织
const handleDelete = async () => {
  if (!selectedOrg.value) return ElMessage.warning('请先选择一个组织')

  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要删除组织 "${selectedOrg.value.orgName}" 吗？`, '提示', { type: 'warning' })
    const res = await deleteOrganization(selectedOrg.value.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      selectedOrg.value = null
      fetchOrganizationList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => fetchOrganizationList())

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  orgModal.close()
})

// 组件被 keep-alive 缓存失活时，关闭弹窗
onDeactivated(() => {
  orgModal.close()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px 0; }
.page-subtitle { font-size: 14px; color: #666; margin: 0; }
.content-wrapper { display: flex; gap: 20px; min-height: calc(100vh - 180px); }
.tree-panel, .detail-panel { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tree-panel { width: 350px; flex-shrink: 0; }
.detail-panel { flex: 1; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #ebeef5; }
.panel-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.panel-actions { display: flex; gap: 8px; }
.tree-content { padding: 16px; max-height: calc(100vh - 280px); overflow-y: auto; }
.tree-node { display: flex; align-items: center; gap: 6px; }
.tree-label { font-weight: 500; }
.tree-code { color: #999; font-size: 12px; }
.detail-content { padding: 20px; }
.detail-empty { padding: 40px; }
</style>
