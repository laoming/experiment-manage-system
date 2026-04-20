<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">课程管理</h1>
      <p class="page-subtitle">管理系统课程信息，包括课程的创建、编辑、查看和删除</p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-box">
        <el-input v-model="queryForm.courseName" placeholder="输入课程名称搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
      <el-button type="success" @click="openAddModal">
        <el-icon><Plus /></el-icon> 新增课程
      </el-button>
    </div>

    <!-- 课程列表 -->
    <div class="table-container">
      <el-table :data="courseList" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" :index="indexMethod" />
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="description" label="简介" min-width="200">
          <template #default="{ row }">
            <div class="desc-preview">{{ row.description || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="100">
          <template #default="{ row }">{{ getUserName(row.creatorId) }}</template>
        </el-table-column>
        <el-table-column label="管理者" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ row.adminCount || 0 }} 人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="学生" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.studentCount || 0 }} 人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模板" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.templateCount || 0 }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openViewModal(row)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button type="warning" link size="small" @click="openGradeModal(row)">
              <el-icon><EditPen /></el-icon> 评价
            </el-button>
            <el-button type="primary" link size="small" @click="openEditModal(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="info" link size="small" @click="openBindModal(row)">
              <el-icon><Link /></el-icon> 绑定
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchCourseList"
          @current-change="fetchCourseList"
        />
      </div>
    </div>

    <!-- 新增/编辑课程弹窗 -->
    <el-dialog 
      v-model="showFormModal" 
      :title="isEditMode ? '编辑课程' : '新增课程'" 
      width="500px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="课程名称" required>
          <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程简介">
          <el-input v-model="formData.description" type="textarea" rows="4" placeholder="请输入课程简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看课程弹窗 -->
    <el-dialog 
      v-model="showViewModal" 
      title="查看课程" 
      width="600px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课程名称">{{ currentCourse.courseName }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ getUserName(currentCourse.creatorId) }}</el-descriptions-item>
        <el-descriptions-item label="管理者">
          <template v-if="currentCourse.adminIds?.length">
            <el-tag v-for="id in currentCourse.adminIds" :key="id" size="small" type="warning" class="mr-4">{{ getUserName(id) }}</el-tag>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="学生">
          <template v-if="currentCourse.studentIds?.length">
            <el-tag v-for="id in currentCourse.studentIds.slice(0, 10)" :key="id" size="small" class="mr-4">{{ getUserName(id) }}</el-tag>
            <span v-if="currentCourse.studentIds.length > 10">等 {{ currentCourse.studentIds.length }} 人</span>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="实验模板">
          <template v-if="currentCourse.templateIds?.length">
            <el-tag v-for="id in currentCourse.templateIds" :key="id" size="small" type="info" class="mr-4">{{ getTemplateName(id) }}</el-tag>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(currentCourse.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="课程简介">{{ currentCourse.description || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="showViewModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 绑定管理弹窗 -->
    <el-dialog 
      v-model="showBindModal" 
      :title="'绑定管理 - ' + (currentBindCourse?.courseName || '')" 
      width="800px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-tabs v-model="bindTab">
        <!-- 绑定管理者 -->
        <el-tab-pane label="绑定管理者" name="admin">
          <div class="bind-section">
            <div class="bind-header">
              <el-input v-model="adminSearchKeyword" placeholder="搜索用户名" clearable style="width: 200px" @keyup.enter="searchAdmins" />
              <el-button type="primary" @click="searchAdmins">搜索</el-button>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="bind-box">
                  <div class="bind-box-title">可添加的管理者</div>
                  <div class="bind-box-content">
                    <el-checkbox-group v-model="selectedAdminIds">
                      <div v-for="user in availableAdmins" :key="user.id" class="bind-item">
                        <el-checkbox :label="user.id">{{ user.displayName }}</el-checkbox>
                      </div>
                      <el-empty v-if="availableAdmins.length === 0" description="暂无可添加的管理者" :image-size="60" />
                    </el-checkbox-group>
                  </div>
                  <div class="bind-box-footer" v-if="selectedAdminIds.length">
                    <el-button type="success" size="small" @click="addAdmins">添加选中 ({{ selectedAdminIds.length }})</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="bind-box">
                  <div class="bind-box-title">已绑定的管理者 ({{ boundAdminIds.length }})</div>
                  <div class="bind-box-content">
                    <div v-for="id in boundAdminIds" :key="id" class="bind-item bind-item-remove">
                      <span>{{ getUserName(id) }}</span>
                      <el-button type="danger" size="small" link @click="removeAdmin(id)">移除</el-button>
                    </div>
                    <el-empty v-if="boundAdminIds.length === 0" description="暂无绑定的管理者" :image-size="60" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 绑定学生 -->
        <el-tab-pane label="绑定学生" name="student">
          <div class="bind-section">
            <div class="bind-header">
              <el-input v-model="studentSearchKeyword" placeholder="搜索用户名" clearable style="width: 200px" @keyup.enter="searchStudents" />
              <el-button type="primary" @click="searchStudents">搜索</el-button>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="bind-box">
                  <div class="bind-box-title">可添加的学生</div>
                  <div class="bind-box-content">
                    <el-checkbox-group v-model="selectedStudentIds">
                      <div v-for="user in availableStudents" :key="user.id" class="bind-item">
                        <el-checkbox :label="user.id">{{ user.displayName }}</el-checkbox>
                      </div>
                      <el-empty v-if="availableStudents.length === 0" description="暂无可添加的学生" :image-size="60" />
                    </el-checkbox-group>
                  </div>
                  <div class="bind-box-footer" v-if="selectedStudentIds.length">
                    <el-button type="success" size="small" @click="addStudents">添加选中 ({{ selectedStudentIds.length }})</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="bind-box">
                  <div class="bind-box-title">已绑定的学生 ({{ boundStudentIds.length }})</div>
                  <div class="bind-box-content">
                    <div v-for="id in boundStudentIds" :key="id" class="bind-item bind-item-remove">
                      <span>{{ getUserName(id) }}</span>
                      <el-button type="danger" size="small" link @click="removeStudent(id)">移除</el-button>
                    </div>
                    <el-empty v-if="boundStudentIds.length === 0" description="暂无绑定的学生" :image-size="60" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 绑定实验模板 -->
        <el-tab-pane label="绑定实验模板" name="template">
          <div class="bind-section">
            <div class="bind-header">
              <el-input v-model="templateSearchKeyword" placeholder="搜索模板名称" clearable style="width: 200px" @keyup.enter="searchTemplates" />
              <el-button type="primary" @click="searchTemplates">搜索</el-button>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="bind-box">
                  <div class="bind-box-title">可绑定的模板</div>
                  <div class="bind-box-content">
                    <el-checkbox-group v-model="selectedTemplateIds">
                      <div v-for="tpl in availableTemplates" :key="tpl.id" class="bind-item">
                        <el-checkbox :label="tpl.id">{{ tpl.templateName }}</el-checkbox>
                      </div>
                      <el-empty v-if="availableTemplates.length === 0" description="暂无可绑定的模板" :image-size="60" />
                    </el-checkbox-group>
                  </div>
                  <div class="bind-box-footer" v-if="selectedTemplateIds.length">
                    <el-button type="success" size="small" @click="addTemplates">绑定选中 ({{ selectedTemplateIds.length }})</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="bind-box">
                  <div class="bind-box-title">已绑定的模板 ({{ boundTemplateIds.length }})</div>
                  <div class="bind-box-content">
                    <div v-for="id in boundTemplateIds" :key="id" class="bind-item bind-item-remove">
                      <span>{{ getTemplateName(id) }}</span>
                      <el-button type="danger" size="small" link @click="removeTemplate(id)">解除</el-button>
                    </div>
                    <el-empty v-if="boundTemplateIds.length === 0" description="暂无绑定的模板" :image-size="60" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 课程评价弹窗 -->
    <el-dialog 
      v-model="showGradeModal" 
      :title="'课程评价 - ' + (currentGradeCourse?.courseName || '')" 
      width="900px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-if="loadingReports" class="loading-center">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="!currentGradeCourse?.studentIds?.length" class="empty-center">
        该课程暂无学生，无法查看报告
      </div>
      <el-table v-else :data="courseReports" stripe border max-height="400">
        <el-table-column label="学生" width="100">
          <template #default="{ row }">{{ getUserName(row.studentId) }}</template>
        </el-table-column>
        <el-table-column label="报告名称" min-width="150">
          <template #default="{ row }">{{ row.reportName || getTemplateName(row.templateId) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(REPORT_STATUS, row.status)" size="small">{{ getStatusText(REPORT_STATUS, row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.submitTime) }}</template>
        </el-table-column>
        <el-table-column label="分数" width="80">
          <template #default="{ row }">
            <el-tag :type="row.score !== null ? 'success' : 'info'" size="small">
              {{ row.score !== null ? row.score : '未评分' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评语" min-width="120">
          <template #default="{ row }">{{ row.comment || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openReportView(row)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button v-if="row.status === 1" type="success" link size="small" @click="openScoreModal(row)">
              <el-icon><EditPen /></el-icon> 评分
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="showGradeModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 评分弹窗 -->
    <el-dialog 
      v-model="showScoreModal" 
      title="报告评分" 
      width="500px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="scoreForm" label-width="80px">
        <el-form-item label="学生">
          <span>{{ getUserName(currentReport?.studentId) }}</span>
        </el-form-item>
        <el-form-item label="报告">
          <span>{{ currentReport?.reportName || getTemplateName(currentReport?.templateId) }}</span>
        </el-form-item>
        <el-form-item label="分数" required>
          <el-input-number v-model="scoreForm.score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="scoreForm.comment" type="textarea" rows="3" placeholder="请输入评语（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScoreModal = false">取消</el-button>
        <el-button type="warning" @click="returnReport">退回</el-button>
        <el-button type="primary" @click="submitScore">保存</el-button>
      </template>
    </el-dialog>

    <!-- 报告查看弹窗 -->
    <el-dialog 
      v-model="showReportViewModal" 
      title="查看报告" 
      width="800px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-if="loadingReportContent" class="loading-center">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else>
        <div class="report-info-bar">
          <span>学生：{{ getUserName(viewingReport?.studentId) }}</span>
          <span>提交时间：{{ formatDateTime(viewingReport?.submitTime) }}</span>
          <span>分数：{{ viewingReport?.score ?? '未评分' }}</span>
        </div>
        <el-divider />
        <div class="report-content" v-html="viewingReportContent"></div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showReportViewModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete, Link, EditPen, Loading } from '@element-plus/icons-vue'
import { post, get } from '@/utils/request'
import { formatDateTime } from '@/utils/format'
import { REPORT_STATUS, getStatusText, getStatusType } from '@/utils/statusMap'
import { markdownToHtml } from '@/utils/markdown'

// 数据
const loading = ref(false)
const courseList = ref([])
const userMap = ref({})
const templateMap = ref({})

const queryForm = reactive({ courseName: '' })
const pagination = reactive({ current: 1, size: 10, total: 0 })

// 表单弹窗
const showFormModal = ref(false)
const isEditMode = ref(false)
const formData = reactive({ id: '', courseName: '', description: '' })

// 查看弹窗
const showViewModal = ref(false)
const currentCourse = ref({})

// 绑定弹窗
const showBindModal = ref(false)
const currentBindCourse = ref(null)
const bindTab = ref('admin')
const adminSearchKeyword = ref('')
const studentSearchKeyword = ref('')
const templateSearchKeyword = ref('')
const adminList = ref([])
const studentList = ref([])
const templateList = ref([])
const selectedAdminIds = ref([])
const selectedStudentIds = ref([])
const selectedTemplateIds = ref([])
const boundAdminIds = ref([])
const boundStudentIds = ref([])
const boundTemplateIds = ref([])

// 评价弹窗
const showGradeModal = ref(false)
const currentGradeCourse = ref(null)
const courseReports = ref([])
const loadingReports = ref(false)

// 评分弹窗
const showScoreModal = ref(false)
const currentReport = ref(null)
const scoreForm = reactive({ score: null, comment: '' })

// 报告查看
const showReportViewModal = ref(false)
const viewingReport = ref(null)
const viewingReportContent = ref('')
const loadingReportContent = ref(false)

// 计算属性
const availableAdmins = computed(() => adminList.value.filter(u => !boundAdminIds.value.includes(u.id)))
const availableStudents = computed(() => studentList.value.filter(u => !boundStudentIds.value.includes(u.id) && !boundAdminIds.value.includes(u.id)))
const availableTemplates = computed(() => templateList.value.filter(t => !boundTemplateIds.value.includes(t.id)))

// 方法
const indexMethod = (index) => (pagination.current - 1) * pagination.size + index + 1

const fetchCourseList = async () => {
  loading.value = true
  try {
    const res = await post(`/course/page?current=${pagination.current}&size=${pagination.size}&userType=1`, queryForm)
    if (res.code === 200) {
      courseList.value = res.data.records || []
      pagination.total = res.data.total || 0
      // 收集用户ID
      courseList.value.forEach(c => {
        userMap.value[c.creatorId] = c.creatorName || ''
      })
    } else {
      ElMessage.error(res.message || '获取课程列表失败')
    }
  } catch (e) {
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.current = 1; fetchCourseList() }
const handleReset = () => { queryForm.courseName = ''; pagination.current = 1; fetchCourseList() }

// 课程表单
const openAddModal = () => {
  isEditMode.value = false
  Object.assign(formData, { id: '', courseName: '', description: '' })
  showFormModal.value = true
}

const openEditModal = async (course) => {
  try {
    const res = await post(`/course/get?courseId=${course.id}`, {})
    if (res.code === 200) {
      isEditMode.value = true
      Object.assign(formData, {
        id: res.data.id,
        courseName: res.data.courseName,
        description: res.data.description || ''
      })
      showFormModal.value = true
    }
  } catch (e) {
    ElMessage.error('获取课程详情失败')
  }
}

const handleSubmit = async () => {
  if (!formData.courseName.trim()) {
    ElMessage.warning('请输入课程名称')
    return
  }
  try {
    const url = isEditMode.value ? '/course/update' : '/course/add'
    const res = await post(url, formData)
    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? '更新成功' : '新增成功')
      showFormModal.value = false
      fetchCourseList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (course) => {
  try {
    await ElMessageBox.confirm(`确定删除课程 "${course.courseName}" 吗？`, '提示', { type: 'warning' })
    const res = await post('/course/delete', { id: course.id })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchCourseList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

// 查看弹窗
const openViewModal = async (course) => {
  try {
    const res = await post(`/course/get?courseId=${course.id}`, {})
    if (res.code === 200) {
      currentCourse.value = res.data
      // 获取关联数据
      const [adminRes, studentRes, templateRes] = await Promise.all([
        post(`/course/getAdminIds?courseId=${course.id}`, {}),
        post(`/course/getStudentIds?courseId=${course.id}`, {}),
        post(`/course/getTemplateIds?courseId=${course.id}`, {})
      ])
      currentCourse.value.adminIds = adminRes.code === 200 ? adminRes.data : []
      currentCourse.value.studentIds = studentRes.code === 200 ? studentRes.data : []
      currentCourse.value.templateIds = templateRes.code === 200 ? templateRes.data : []
      showViewModal.value = true
    }
  } catch (e) {
    ElMessage.error('获取课程详情失败')
  }
}

// 绑定管理
const openBindModal = async (course) => {
  currentBindCourse.value = course
  bindTab.value = 'admin'
  selectedAdminIds.value = []
  selectedStudentIds.value = []
  selectedTemplateIds.value = []
  
  // 获取已绑定数据
  const [adminRes, studentRes, templateRes] = await Promise.all([
    post(`/course/getAdminIds?courseId=${course.id}`, {}),
    post(`/course/getStudentIds?courseId=${course.id}`, {}),
    post(`/course/getTemplateIds?courseId=${course.id}`, {})
  ])
  boundAdminIds.value = adminRes.code === 200 ? adminRes.data : []
  boundStudentIds.value = studentRes.code === 200 ? studentRes.data : []
  boundTemplateIds.value = templateRes.code === 200 ? templateRes.data : []
  
  // 初始搜索
  await Promise.all([searchAdmins(), searchStudents(), searchTemplates()])
  showBindModal.value = true
}

const searchAdmins = async () => {
  const res = await post(`/user/page?current=1&size=20`, { displayName: adminSearchKeyword.value })
  if (res.code === 200) {
    adminList.value = res.data.records || []
    res.data.records.forEach(u => userMap.value[u.id] = u.displayName)
  }
}

const searchStudents = async () => {
  const res = await post(`/user/page?current=1&size=20`, { displayName: studentSearchKeyword.value })
  if (res.code === 200) {
    studentList.value = res.data.records || []
    res.data.records.forEach(u => userMap.value[u.id] = u.displayName)
  }
}

const searchTemplates = async () => {
  const res = await post(`/experimentTemplate/page?current=1&size=20`, { templateName: templateSearchKeyword.value })
  if (res.code === 200) {
    templateList.value = res.data.records || []
    res.data.records.forEach(t => templateMap.value[t.id] = t.templateName)
  }
}

const addAdmins = async () => {
  const res = await post('/course/bindAdmins', { courseId: currentBindCourse.value.id, userIds: selectedAdminIds.value })
  if (res.code === 200) {
    ElMessage.success('添加成功')
    boundAdminIds.value.push(...selectedAdminIds.value.filter(id => !boundAdminIds.value.includes(id)))
    selectedAdminIds.value = []
    fetchCourseList()
  } else {
    ElMessage.error(res.message || '添加失败')
  }
}

const removeAdmin = async (userId) => {
  const res = await post('/course/unbindUsers', { courseId: currentBindCourse.value.id, userIds: [userId] })
  if (res.code === 200) {
    ElMessage.success('移除成功')
    boundAdminIds.value = boundAdminIds.value.filter(id => id !== userId)
    fetchCourseList()
  } else {
    ElMessage.error(res.message || '移除失败')
  }
}

const addStudents = async () => {
  const res = await post('/course/bindUsers', { courseId: currentBindCourse.value.id, userIds: selectedStudentIds.value })
  if (res.code === 200) {
    ElMessage.success('添加成功')
    boundStudentIds.value.push(...selectedStudentIds.value.filter(id => !boundStudentIds.value.includes(id)))
    selectedStudentIds.value = []
    fetchCourseList()
  } else {
    ElMessage.error(res.message || '添加失败')
  }
}

const removeStudent = async (userId) => {
  const res = await post('/course/unbindUsers', { courseId: currentBindCourse.value.id, userIds: [userId] })
  if (res.code === 200) {
    ElMessage.success('移除成功')
    boundStudentIds.value = boundStudentIds.value.filter(id => id !== userId)
    fetchCourseList()
  } else {
    ElMessage.error(res.message || '移除失败')
  }
}

const addTemplates = async () => {
  const res = await post('/course/bindTemplates', { courseId: currentBindCourse.value.id, templateIds: selectedTemplateIds.value })
  if (res.code === 200) {
    ElMessage.success('绑定成功')
    boundTemplateIds.value.push(...selectedTemplateIds.value.filter(id => !boundTemplateIds.value.includes(id)))
    selectedTemplateIds.value = []
    fetchCourseList()
  } else {
    ElMessage.error(res.message || '绑定失败')
  }
}

const removeTemplate = async (templateId) => {
  const res = await post('/course/unbindTemplates', { courseId: currentBindCourse.value.id, templateIds: [templateId] })
  if (res.code === 200) {
    ElMessage.success('解除成功')
    boundTemplateIds.value = boundTemplateIds.value.filter(id => id !== templateId)
    fetchCourseList()
  } else {
    ElMessage.error(res.message || '解除失败')
  }
}

// 课程评价
const openGradeModal = async (course) => {
  currentGradeCourse.value = course
  loadingReports.value = true
  showGradeModal.value = true
  try {
    // 获取学生ID列表
    const studentRes = await post(`/course/getStudentIds?courseId=${course.id}`, {})
    const studentIds = studentRes.code === 200 ? studentRes.data : []
    currentGradeCourse.value.studentIds = studentIds
    
    if (studentIds.length > 0) {
      const res = await post(`/experimentReport/getByCourseId?courseId=${course.id}`, {})
      if (res.code === 200) {
        courseReports.value = res.data || []
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingReports.value = false
  }
}

const openScoreModal = (report) => {
  currentReport.value = report
  scoreForm.score = report.score
  scoreForm.comment = report.comment || ''
  showScoreModal.value = true
}

const submitScore = async () => {
  if (scoreForm.score === null || scoreForm.score === undefined) {
    ElMessage.warning('请输入分数')
    return
  }
  try {
    const res = await post(`/experimentReport/grade`, {
      reportId: currentReport.value.id,
      score: scoreForm.score,
      comment: scoreForm.comment
    })
    if (res.code === 200) {
      ElMessage.success('评分成功')
      showScoreModal.value = false
      // 刷新报告列表
      const reportRes = await post(`/experimentReport/getByCourseId?courseId=${currentGradeCourse.value.id}`, {})
      if (reportRes.code === 200) courseReports.value = reportRes.data || []
    } else {
      ElMessage.error(res.message || '评分失败')
    }
  } catch (e) {
    ElMessage.error('评分失败')
  }
}

const returnReport = async () => {
  try {
    const res = await post(`/experimentReport/return`, {
      reportId: currentReport.value.id,
      comment: scoreForm.comment || ''
    })
    if (res.code === 200) {
      ElMessage.success('已退回')
      showScoreModal.value = false
      const reportRes = await post(`/experimentReport/getByCourseId?courseId=${currentGradeCourse.value.id}`, {})
      if (reportRes.code === 200) courseReports.value = reportRes.data || []
    }
  } catch (e) {
    ElMessage.error('退回失败')
  }
}

const openReportView = async (report) => {
  viewingReport.value = report
  loadingReportContent.value = true
  showReportViewModal.value = true
  try {
    const res = await post(`/experimentReport/get?reportId=${report.id}`, {})
    if (res.code === 200) {
      viewingReportContent.value = markdownToHtml(res.data.reportContent || '')
    }
  } catch (e) {
    viewingReportContent.value = ''
  } finally {
    loadingReportContent.value = false
  }
}

// 工具方法
const getUserName = (userId) => userMap.value[userId] || `用户${userId}`
const getTemplateName = (templateId) => templateMap.value[templateId] || `模板${templateId}`

onMounted(() => {
  fetchCourseList()
})

// 组件被 keep-alive 激活时，确保所有弹窗关闭
onActivated(() => {
  showFormModal.value = false
  showViewModal.value = false
  showBindModal.value = false
  showGradeModal.value = false
  showScoreModal.value = false
  showReportViewModal.value = false
})

// 组件被 keep-alive 缓存失活时，关闭所有弹窗
onDeactivated(() => {
  showFormModal.value = false
  showViewModal.value = false
  showBindModal.value = false
  showGradeModal.value = false
  showScoreModal.value = false
  showReportViewModal.value = false
})
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px; }
.page-subtitle { font-size: 14px; color: #666; margin: 0; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.search-box { display: flex; gap: 10px; flex-wrap: wrap; }
.table-container { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.desc-preview { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
.mr-4 { margin-right: 4px; }

.bind-section { padding: 10px 0; }
.bind-header { display: flex; gap: 10px; margin-bottom: 16px; }
.bind-box { border: 1px solid #e4e7ed; border-radius: 8px; height: 300px; display: flex; flex-direction: column; }
.bind-box-title { padding: 12px 16px; font-weight: 500; border-bottom: 1px solid #e4e7ed; background: #fafafa; }
.bind-box-content { flex: 1; overflow-y: auto; padding: 12px; }
.bind-box-footer { padding: 12px; border-top: 1px solid #e4e7ed; text-align: center; }
.bind-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.bind-item:last-child { border-bottom: none; }
.bind-item-remove { display: flex; justify-content: space-between; align-items: center; }

.loading-center, .empty-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; color: #909399; }
.report-info-bar { display: flex; gap: 24px; padding: 12px 0; color: #666; }
.report-content { padding: 16px; background: #fafafa; border-radius: 8px; max-height: 400px; overflow-y: auto; }
</style>
