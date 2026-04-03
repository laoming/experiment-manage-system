<template>
  <PageListLayout
    title="实验模板"
    subtitle="管理实验报告模板"
    :data="templateList"
    :loading="loading"
    :current="pagination.current"
    :size="pagination.size"
    :total="pagination.total"
    @update:current="pagination.current = $event"
    @update:size="pagination.size = $event"
    @page-change="fetchTemplateList"
  >
    <!-- 搜索区域 -->
    <template #search>
      <el-input v-model="queryForm.templateName" placeholder="输入模板名称搜索" clearable style="width: 180px" />
      <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
        <el-option label="草稿" :value="0" />
        <el-option label="已发布" :value="1" />
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
      <el-button type="success" @click="handleCreate">
        <el-icon><Plus /></el-icon> 新建模板
      </el-button>
    </template>

    <!-- 表格列 -->
    <el-table-column type="index" label="序号" width="60" :index="indexMethod" />
    <el-table-column prop="templateName" label="模板名称" min-width="180" />
    <el-table-column prop="courseName" label="关联课程" width="150" />
    <el-table-column label="状态" width="80">
      <template #default="{ row }">
        <el-tag :type="getStatusType(TEMPLATE_STATUS, row.status)" size="small">
          {{ getStatusText(TEMPLATE_STATUS, row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="280" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button v-if="row.status === 0" type="success" link @click="handlePublish(row)">
          <el-icon><Promotion /></el-icon> 发布
        </el-button>
        <el-button v-else type="warning" link @click="handleUnpublish(row)">
          <el-icon><Download /></el-icon> 取消发布
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </template>
    </el-table-column>

    <!-- 弹窗 -->
    <template #modals></template>
  </PageListLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Promotion, Download } from '@element-plus/icons-vue'
import { getTemplatePage, deleteTemplate, publishTemplate, unpublishTemplate } from '@/api/template'
import { formatDateTime } from '@/utils/format'
import { TEMPLATE_STATUS, getStatusText, getStatusType } from '@/utils/statusMap'
import { usePagination, useSearch } from '@/hooks'
import { PageListLayout } from '@/components'

const router = useRouter()

// 分页
const { pagination, loading, indexMethod } = usePagination()

// 搜索
const defaultQuery = { templateName: '', status: null }
const { queryForm, handleSearch, handleReset } = useSearch(defaultQuery, () => {
  pagination.current = 1
  fetchTemplateList()
})

// 列表数据
const templateList = ref([])

// 获取模板列表
const fetchTemplateList = async () => {
  loading.value = true
  try {
    const res = await getTemplatePage({ ...queryForm, ...pagination })
    if (res.code === 200) {
      templateList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 新建模板
const handleCreate = () => router.push('/template/edit')

// 编辑模板
const handleEdit = (row) => router.push(`/template/edit/${row.id}`)

// 发布模板
const handlePublish = async (row) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要发布模板 "${row.templateName}" 吗？`, '提示', { type: 'warning' })
    const res = await publishTemplate(row.id)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      fetchTemplateList()
    } else {
      ElMessage.error(res.message || '发布失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('发布失败')
  }
}

// 取消发布
const handleUnpublish = async (row) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要取消发布模板 "${row.templateName}" 吗？`, '提示', { type: 'warning' })
    const res = await unpublishTemplate(row.id)
    if (res.code === 200) {
      ElMessage.success('取消发布成功')
      fetchTemplateList()
    } else {
      ElMessage.error(res.message || '取消发布失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('取消发布失败')
  }
}

// 删除模板
const handleDelete = async (row) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要删除模板 "${row.templateName}" 吗？`, '提示', { type: 'warning' })
    const res = await deleteTemplate(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchTemplateList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => fetchTemplateList())
</script>
