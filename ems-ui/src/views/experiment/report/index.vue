<template>
  <div class="page-container">
    <!-- 报告列表视图 -->
    <div v-if="currentView === 'list'" class="list-view">
      <div class="page-header">
        <h1 class="page-title">实验报告</h1>
        <p class="page-subtitle">管理实验报告</p>
      </div>

      <!-- 标签页 -->
      <div class="report-tabs">
        <div class="report-tab" :class="{ active: currentTab === 'pending' }" @click="switchTab('pending')">
          待提交
          <span v-if="pendingCount > 0" class="tab-badge">{{ pendingCount }}</span>
        </div>
        <div class="report-tab" :class="{ active: currentTab === 'submitted' }" @click="switchTab('submitted')">
          已提交
          <span v-if="submittedCount > 0" class="tab-badge submitted">{{ submittedCount }}</span>
        </div>
      </div>

      <!-- 待提交列表 -->
      <div v-show="currentTab === 'pending'" class="report-list">
        <div v-if="pendingList.length === 0" class="empty-tip">暂无待提交的实验报告</div>
        <div v-for="report in pendingList" :key="report.id || report.templateId" class="report-item">
          <div class="report-item-info">
            <div class="report-item-name">{{ report.templateName || report.reportName }}</div>
            <div class="report-item-meta">
              课程: {{ report.courseName || '未知课程' }}
              <span v-if="report.comment" class="return-comment">退回意见: {{ report.comment }}</span>
            </div>
          </div>
          <div class="report-item-status" :class="report.status">
            {{ getStatusText(REPORT_STATUS_STRING, report.status) }}
          </div>
          <div class="report-item-actions">
            <el-button v-if="report.status === 'draft' || report.status === 'returned'" type="primary" size="small" @click="editReport(report)">
              继续编辑
            </el-button>
            <el-button v-else type="primary" size="small" @click="startReport(report)">
              开始填写
            </el-button>
          </div>
        </div>
      </div>

      <!-- 已提交列表 -->
      <div v-show="currentTab === 'submitted'" class="report-list">
        <div v-if="submittedList.length === 0" class="empty-tip">暂无已提交的实验报告</div>
        <div v-for="report in submittedList" :key="report.id" class="report-item">
          <div class="report-item-info">
            <div class="report-item-name">{{ report.reportName || report.templateName }}</div>
            <div class="report-item-meta">提交时间: {{ formatDateTime(report.submitTime) }}</div>
          </div>
          <div class="report-item-status" :class="getStatusClass(report.status)">
            {{ report.status === 'graded' ? '已评分' : '已提交' }}
          </div>
          <div class="report-item-actions">
            <el-button type="primary" size="small" @click="viewReport(report)">查看</el-button>
          </div>
          <div v-if="report.score !== null && report.score !== undefined" class="report-item-score">
            <div class="score-label">得分</div>
            <div class="score-value">{{ report.score }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 报告编辑器视图 -->
    <div v-else-if="currentView === 'editor'" class="editor-view">
      <div class="editor-header">
        <div class="header-left">
          <el-button @click="backToList">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
          <el-input v-model="reportName" placeholder="请输入报告名称" class="title-input" />
        </div>
        <div class="header-right">
          <el-upload :show-file-list="false" :before-upload="handlePdfUpload" accept=".pdf">
            <el-button type="info">
              <el-icon><Upload /></el-icon> 上传PDF
            </el-button>
          </el-upload>
          <el-button type="danger" @click="resetReport">重置</el-button>
          <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
          <el-button type="success" @click="exportMarkdown">导出</el-button>
          <el-button type="primary" @click="submitReport" :loading="submitting">提交</el-button>
        </div>
      </div>

      <!-- PDF预览区域 -->
      <div v-if="pdfUrl" class="pdf-preview-area">
        <div class="pdf-preview-header">
          <span class="pdf-preview-title">已上传的PDF报告</span>
          <div class="pdf-preview-actions">
            <a :href="getPdfAccessUrl(pdfUrl)" target="_blank" class="pdf-link-btn">新窗口打开</a>
            <el-button type="success" size="small" @click="downloadPdf">下载</el-button>
            <el-button type="danger" size="small" @click="removePdf">删除</el-button>
          </div>
        </div>
        <div class="pdf-preview-container">
          <embed :src="getPdfAccessUrl(pdfUrl) + '#toolbar=0'" type="application/pdf" width="100%" height="100%">
        </div>
      </div>

      <!-- 报告内容编辑区域 -->
      <div v-show="!pdfUrl" ref="editorRef" class="editor-content" contenteditable="true"></div>
    </div>

    <!-- 报告查看视图 -->
    <div v-else-if="currentView === 'view'" class="view-mode">
      <div class="view-header">
        <el-button @click="backToList">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <div class="view-title">{{ currentReport?.reportName }}</div>
        <div class="view-actions">
          <el-button v-if="currentReport?.status === 'submitted'" type="success" @click="openGradeModal">
            <el-icon><Edit /></el-icon> 批改
          </el-button>
          <el-button type="primary" @click="exportMarkdown">导出</el-button>
        </div>
      </div>

      <!-- PDF预览 -->
      <div v-if="currentReport?.pdfUrl" class="pdf-view-area">
        <embed :src="getPdfAccessUrl(currentReport.pdfUrl) + '#toolbar=0'" type="application/pdf" width="100%" height="600px">
      </div>

      <!-- 报告内容 -->
      <div v-else class="view-content" v-html="reportHtmlContent"></div>

      <!-- 评分信息 -->
      <div v-if="currentReport?.status === 'graded'" class="grade-info">
        <div class="grade-row">
          <span class="grade-label">得分：</span>
          <span class="grade-value">{{ currentReport.score }}</span>
        </div>
        <div v-if="currentReport.comment" class="grade-row">
          <span class="grade-label">评语：</span>
          <span class="grade-comment">{{ currentReport.comment }}</span>
        </div>
      </div>
    </div>

    <!-- 批改弹窗 -->
    <el-dialog 
      v-model="showGradeModal" 
      title="批改报告" 
      width="400px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="gradeForm" label-width="80px">
        <el-form-item label="分数" required>
          <el-input-number v-model="gradeForm.score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="gradeForm.comment" type="textarea" rows="3" placeholder="请输入评语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGradeModal = false">取消</el-button>
        <el-button type="primary" @click="submitGrade" :loading="grading">提交批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onActivated, onDeactivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Upload, Edit } from '@element-plus/icons-vue'
import { post } from '@/utils/request'
import { getToken, getUserInfo } from '@/utils/auth'
import { formatDateTime } from '@/utils/format'
import { markdownToHtml, htmlToMarkdown } from '@/utils/markdown'
import { REPORT_STATUS_STRING, getStatusText } from '@/utils/statusMap'

// 视图状态
const currentView = ref('list')
const currentTab = ref('pending')

// 列表数据
const pendingList = ref([])
const submittedList = ref([])
const pendingCount = ref(0)
const submittedCount = ref(0)

// 编辑器数据
const reportName = ref('')
const pdfUrl = ref('')
const editorRef = ref(null)
const currentTemplateId = ref(null)
const currentCourseId = ref(null)
const currentReport = ref(null)
const saving = ref(false)
const submitting = ref(false)

// 批改
const showGradeModal = ref(false)
const grading = ref(false)
const gradeForm = ref({ score: 0, comment: '' })
const reportHtmlContent = ref('')

onMounted(() => loadReportOverview())

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  showGradeModal.value = false
})

// 组件被 keep-alive 缓存失活时，关闭弹窗
onDeactivated(() => {
  showGradeModal.value = false
})

// 加载报告概览
const loadReportOverview = async () => {
  try {
    const res = await post('/experimentReport/overview', {})
    if (res.code === 200 && res.data) {
      const all = res.data || []
      pendingList.value = all.filter(r => ['pending', 'draft', 'returned'].includes(r.status))
      submittedList.value = all.filter(r => ['submitted', 'graded'].includes(r.status))
      pendingCount.value = pendingList.value.length
      submittedCount.value = submittedList.value.length
    }
  } catch (e) {
    console.error('加载报告列表失败:', e)
  }
}

const switchTab = (tab) => { currentTab.value = tab }

const getPdfAccessUrl = (objectName) => `/api/file/access?objectName=${encodeURIComponent(objectName)}`

// 开始填写报告
const startReport = async (report) => {
  currentTemplateId.value = report.templateId
  currentCourseId.value = report.courseId
  currentReport.value = null
  pdfUrl.value = ''
  try {
    const res = await post(`/experimentTemplate/get?templateId=${report.templateId}`, {})
    if (res.code === 200 && res.data) {
      reportName.value = res.data.templateName
      await nextTick()
      editorRef.value.innerHTML = markdownToHtml(res.data.templateContent)
      currentView.value = 'editor'
    } else {
      ElMessage.error(res.message || '加载模板失败')
    }
  } catch (e) {
    ElMessage.error('加载模板失败')
  }
}

// 编辑报告
const editReport = async (report) => {
  try {
    const res = await post(`/experimentReport/get?reportId=${report.id || report.reportId}`, {})
    if (res.code === 200 && res.data) {
      currentReport.value = res.data
      currentTemplateId.value = res.data.templateId
      currentCourseId.value = res.data.courseId
      pdfUrl.value = res.data.pdfUrl || ''
      reportName.value = res.data.reportName
      await nextTick()
      editorRef.value.innerHTML = markdownToHtml(res.data.reportContent)
      currentView.value = 'editor'
    } else {
      ElMessage.error(res.message || '加载报告失败')
    }
  } catch (e) {
    ElMessage.error('加载报告失败')
  }
}

// 查看报告
const viewReport = async (report) => {
  try {
    const res = await post(`/experimentReport/get?reportId=${report.id || report.reportId}`, {})
    if (res.code === 200 && res.data) {
      currentReport.value = res.data
      reportHtmlContent.value = markdownToHtml(res.data.reportContent)
      currentView.value = 'view'
    } else {
      ElMessage.error(res.message || '加载报告失败')
    }
  } catch (e) {
    ElMessage.error('加载报告失败')
  }
}

// 返回列表
const backToList = async () => {
  if (currentView.value === 'editor' && currentReport.value) {
    try {
      await ElMessageBox.confirm('返回将不保存当前编辑内容，确定要返回吗？', '提示', { type: 'warning' })
    } catch { return }
  }
  currentView.value = 'list'
  currentReport.value = null
  loadReportOverview()
}

// 重置报告
const resetReport = async () => {
  try {
    await ElMessageBox.confirm('确定要重置吗？这将清空所有已填写的内容和已上传的PDF报告。', '提示', { type: 'warning' })
    if (currentTemplateId.value) {
      const res = await post(`/experimentTemplate/get?templateId=${currentTemplateId.value}`, {})
      if (res.code === 200 && res.data) {
        reportName.value = res.data.templateName
        editorRef.value.innerHTML = markdownToHtml(res.data.templateContent)
        currentReport.value = null
        pdfUrl.value = ''
        ElMessage.success('已重置')
      }
    }
  } catch {}
}

// 保存草稿
const saveDraft = async () => {
  if (!reportName.value.trim()) {
    ElMessage.warning('请输入报告名称')
    return
  }
  saving.value = true
  try {
    const content = htmlToMarkdown(editorRef.value.innerHTML)
    const userInfo = getUserInfo()
    const data = {
      id: currentReport.value?.id || null,
      templateId: currentTemplateId.value,
      courseId: currentCourseId.value,
      reportName: reportName.value,
      reportContent: content,
      studentId: userInfo?.id,
      pdfUrl: pdfUrl.value
    }
    const url = data.id ? '/experimentReport/update' : '/experimentReport/add'
    const res = await post(url, data)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      if (!currentReport.value && res.data) currentReport.value = { id: res.data }
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 提交报告
const submitReport = async () => {
  try {
    await ElMessageBox.confirm('确定要提交报告吗？提交后将不能修改。', '提示', { type: 'warning' })
  } catch { return }

  if (!reportName.value.trim()) {
    ElMessage.warning('请输入报告名称')
    return
  }
  submitting.value = true
  try {
    const content = htmlToMarkdown(editorRef.value.innerHTML)
    const userInfo = getUserInfo()
    const data = {
      id: currentReport.value?.id || null,
      templateId: currentTemplateId.value,
      courseId: currentCourseId.value,
      reportName: reportName.value,
      reportContent: content,
      studentId: userInfo?.id,
      pdfUrl: pdfUrl.value
    }
    let url = '/experimentReport/add'
    if (data.id) url = '/experimentReport/update'
    const res = await post(url, data)
    if (res.code === 200) {
      const reportId = data.id || res.data
      const submitRes = await post('/experimentReport/submit', { id: reportId })
      if (submitRes.code === 200) {
        ElMessage.success('提交成功')
        backToList()
      } else {
        ElMessage.error(submitRes.message || '提交失败')
      }
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 上传PDF
const handlePdfUpload = async (file) => {
  if (file.type !== 'application/pdf') {
    ElMessage.warning('请选择PDF文件')
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('PDF文件大小不能超过10MB')
    return false
  }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch('/api/file/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    }).then(r => r.json())
    if (res.code === 200 && res.data?.objectName) {
      pdfUrl.value = res.data.objectName
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
  return false
}

const downloadPdf = () => {
  if (!pdfUrl.value) return
  const url = `/api/file/download?objectName=${encodeURIComponent(pdfUrl.value)}`
  window.open(url, '_blank')
}

const removePdf = () => {
  pdfUrl.value = ''
  ElMessage.success('已删除PDF')
}

// 导出Markdown
const exportMarkdown = () => {
  const name = reportName.value || currentReport.value?.reportName || '实验报告'
  const content = currentView.value === 'editor' ? htmlToMarkdown(editorRef.value.innerHTML) : currentReport.value?.reportContent || ''
  const md = `# ${name}\n\n${content}`
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 批改
const openGradeModal = () => {
  gradeForm.value = { score: currentReport.value?.score || 0, comment: currentReport.value?.comment || '' }
  showGradeModal.value = true
}

const submitGrade = async () => {
  grading.value = true
  try {
    const res = await post('/experimentReport/grade', {
      id: currentReport.value.id,
      score: gradeForm.value.score,
      comment: gradeForm.value.comment
    })
    if (res.code === 200) {
      ElMessage.success('批改成功')
      showGradeModal.value = false
      currentReport.value.status = 'graded'
      currentReport.value.score = gradeForm.value.score
      currentReport.value.comment = gradeForm.value.comment
    } else {
      ElMessage.error(res.message || '批改失败')
    }
  } catch (e) {
    ElMessage.error('批改失败')
  } finally {
    grading.value = false
  }
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px 0; }
.page-subtitle { font-size: 14px; color: #666; margin: 0; }

/* 标签页 */
.report-tabs { display: flex; background: #fff; border-radius: 12px 12px 0 0; padding: 0 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.report-tab { padding: 16px 24px; font-size: 15px; font-weight: 500; color: #666; cursor: pointer; border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 8px; }
.report-tab:hover { color: #667eea; }
.report-tab.active { color: #667eea; border-bottom-color: #667eea; }
.tab-badge { background: #ff4d4f; color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 10px; min-width: 18px; text-align: center; }
.tab-badge.submitted { background: #52c41a; }

/* 列表 */
.report-list { background: #fff; border-radius: 0 0 12px 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.empty-tip { text-align: center; color: #999; padding: 40px; }
.report-item { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #f0f0f0; gap: 16px; }
.report-item:last-child { border-bottom: none; }
.report-item-info { flex: 1; }
.report-item-name { font-size: 16px; font-weight: 500; color: #333; margin-bottom: 4px; }
.report-item-meta { font-size: 13px; color: #999; }
.return-comment { display: block; color: #e65100; margin-top: 4px; }
.report-item-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
.report-item-status.pending { background: #e6f7ff; color: #1890ff; }
.report-item-status.draft { background: #fff7e6; color: #fa8c16; }
.report-item-status.returned { background: #fff1f0; color: #ff4d4f; }
.report-item-status.submitted { background: #f6ffed; color: #52c41a; }
.report-item-status.graded { background: #f9f0ff; color: #722ed1; }
.report-item-score { text-align: center; padding: 8px 16px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px; color: #fff; }
.score-label { font-size: 12px; }
.score-value { font-size: 24px; font-weight: 600; }

/* 编辑器 */
.editor-view { display: flex; flex-direction: column; height: calc(100vh - 100px); background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.editor-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.header-left, .header-right { display: flex; align-items: center; gap: 10px; }
.title-input { width: 300px; }
.title-input :deep(.el-input__inner) { font-size: 16px; font-weight: 600; }
.editor-content { flex: 1; padding: 24px; overflow-y: auto; outline: none; line-height: 1.8; font-size: 15px; }
.editor-content:empty::before { content: '在此输入内容...'; color: #999; }
.editor-content :deep(.inline-input) { display: inline-block; background: #e6f7ff; border: 1px dashed #1890ff; border-radius: 4px; padding: 2px 8px; color: #1890ff; }
.editor-content :deep(.inline-formula) { display: inline-block; background: #fff7e6; border: 1px dashed #fa8c16; border-radius: 4px; padding: 2px 8px; color: #fa8c16; }

/* PDF预览 */
.pdf-preview-area { margin: 20px; border: 1px solid #e8e8e8; border-radius: 8px; }
.pdf-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; border-bottom: 1px solid #e8e8e8; }
.pdf-preview-title { font-weight: 500; }
.pdf-preview-actions { display: flex; gap: 8px; }
.pdf-link-btn { padding: 5px 15px; background: #409eff; color: #fff; border-radius: 4px; text-decoration: none; font-size: 12px; }
.pdf-preview-container { height: 500px; }

/* 查看模式 */
.view-mode { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.view-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.view-title { font-size: 18px; font-weight: 600; }
.view-content { padding: 24px; line-height: 1.8; }
.pdf-view-area { margin: 20px; }
.grade-info { margin: 20px; padding: 16px; background: #f6ffed; border-radius: 8px; border: 1px solid #b7eb8f; }
.grade-row { margin-bottom: 8px; }
.grade-label { color: #666; }
.grade-value { font-size: 24px; font-weight: 600; color: #52c41a; }
.grade-comment { color: #333; }
</style>
