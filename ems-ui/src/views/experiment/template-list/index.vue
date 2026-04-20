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
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          <el-icon><Edit /></el-icon> 编辑
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
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getTemplatePage, deleteTemplate } from '@/api/template'
import { formatDateTime } from '@/utils/format'
import { usePagination, useSearch } from '@/hooks'
import { PageListLayout } from '@/components'

const router = useRouter()

// 分页
const { pagination, loading, indexMethod } = usePagination()

// 搜索
const defaultQuery = { templateName: '' }
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
