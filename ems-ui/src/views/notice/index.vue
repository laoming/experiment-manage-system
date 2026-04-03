<template>
  <PageListLayout
    title="公告管理"
    subtitle="管理系统公告"
    :data="noticeList"
    :loading="loading"
    :current="pagination.current"
    :size="pagination.size"
    :total="pagination.total"
    @update:current="pagination.current = $event"
    @update:size="pagination.size = $event"
    @page-change="fetchNoticeList"
  >
    <!-- 搜索区域 -->
    <template #search>
      <el-input v-model="queryForm.title" placeholder="输入公告标题搜索" clearable style="width: 200px" />
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
      <el-button type="success" @click="noticeModal.openAdd()">
        <el-icon><Plus /></el-icon> 新增公告
      </el-button>
    </template>

    <!-- 表格列 -->
    <el-table-column type="index" label="序号" width="60" :index="indexMethod" />
    <el-table-column prop="title" label="公告标题" min-width="200" />
    <el-table-column label="状态" width="80">
      <template #default="{ row }">
        <el-tag :type="getStatusType(NOTICE_STATUS, row.status)" size="small">
          {{ getStatusText(NOTICE_STATUS, row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="publisherName" label="发布人" width="100" />
    <el-table-column label="发布时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.publishTime) }}</template>
    </el-table-column>
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="noticeModal.openEdit(row)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button v-if="row.status === 0" type="success" link @click="handlePublish(row)">
          <el-icon><Promotion /></el-icon> 发布
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </template>
    </el-table-column>

    <!-- 弹窗 -->
    <template #modals>
      <el-dialog 
        v-model="noticeModal.visible" 
        :title="(noticeModal.isAdd ? '新增' : '编辑') + '公告'" 
        width="600px" 
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form :model="noticeModal.form" :rules="rules" ref="formRef" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="noticeModal.form.title" placeholder="请输入公告标题" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="noticeModal.form.content" type="textarea" rows="6" placeholder="请输入公告内容" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="noticeModal.close()">取消</el-button>
          <el-button type="info" @click="handleSaveDraft">保存草稿</el-button>
          <el-button type="primary" @click="handleSubmit">发布</el-button>
        </template>
      </el-dialog>
    </template>
  </PageListLayout>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Promotion } from '@element-plus/icons-vue'
import { getNoticePage, addNotice, updateNotice, deleteNotice, publishNotice } from '@/api/notice'
import { formatDateTime } from '@/utils/format'
import { NOTICE_STATUS, getStatusText, getStatusType } from '@/utils/statusMap'
import { usePagination, useFormModal, useSearch } from '@/hooks'
import { PageListLayout } from '@/components'

// 列表数据
const noticeList = ref([])
const formRef = ref(null)

// 分页
const { pagination, loading, indexMethod } = usePagination()

// 搜索
const defaultQuery = { title: '', status: null }
const { queryForm, handleSearch, handleReset } = useSearch(defaultQuery, () => {
  pagination.current = 1
  fetchNoticeList()
})

// 公告弹窗
const noticeModal = useFormModal({
  id: '',
  title: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

// 获取公告列表
const fetchNoticeList = async () => {
  loading.value = true
  try {
    const res = await getNoticePage({ ...queryForm, ...pagination })
    if (res.code === 200) {
      noticeList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const res = noticeModal.isAdd
        ? await addNotice({ ...noticeModal.form, status: 0 })
        : await updateNotice({ ...noticeModal.form, status: 0 })
      if (res.code === 200) {
        ElMessage.success('保存草稿成功')
        noticeModal.close()
        fetchNoticeList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    }
  })
}

// 发布
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const res = noticeModal.isAdd
        ? await addNotice({ ...noticeModal.form, status: 1 })
        : await updateNotice({ ...noticeModal.form, status: 1 })
      if (res.code === 200) {
        ElMessage.success(noticeModal.isAdd ? '发布成功' : '更新成功')
        noticeModal.close()
        fetchNoticeList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    }
  })
}

// 发布公告
const handlePublish = async (notice) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要发布公告 "${notice.title}" 吗？`, '提示', { type: 'warning' })
    const res = await publishNotice(notice.id)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      fetchNoticeList()
    } else {
      ElMessage.error(res.message || '发布失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('发布失败')
  }
}

// 删除公告
const handleDelete = async (notice) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(`确定要删除公告 "${notice.title}" 吗？`, '提示', { type: 'warning' })
    const res = await deleteNotice(notice.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchNoticeList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => fetchNoticeList())

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  noticeModal.close()
})

// 组件被 keep-alive 缓存失活时，关闭弹窗
onDeactivated(() => {
  noticeModal.close()
})
</script>
