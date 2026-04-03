<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的课程</h1>
      <p class="page-subtitle">查看已加入的课程</p>
    </div>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <div class="search-box">
        <el-input v-model="queryForm.courseName" placeholder="输入课程名称搜索" clearable style="width: 200px" />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
    </div>

    <!-- 课程卡片 -->
    <div class="course-grid" v-loading="loading">
      <div v-if="courseList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无已加入的课程" />
      </div>
      <div v-for="course in courseList" :key="course.id" class="course-card">
        <div class="course-header">
          <h3 class="course-name">{{ course.courseName }}</h3>
          <el-tag :type="course.status === 1 ? 'success' : 'info'" size="small">
            {{ getStatusText(course.status) }}
          </el-tag>
        </div>
        <div class="course-info">
          <div class="info-item">
            <span class="label">课程编码：</span>
            <span>{{ course.courseCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">授课教师：</span>
            <span>{{ course.teacherName }}</span>
          </div>
          <div class="info-item">
            <span class="label">课程时间：</span>
            <span>{{ formatDate(course.startTime) }} ~ {{ formatDate(course.endTime) }}</span>
          </div>
        </div>
        <div class="course-actions">
          <el-button type="primary" size="small" @click="viewCourse(course)">查看详情</el-button>
          <el-button type="danger" size="small" @click="handleLeave(course)">退出课程</el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="courseList.length > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchMyCourses"
        @current-change="fetchMyCourses"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getMyCourseList, leaveCourse } from '@/api/course'
import { formatDate } from '@/utils/format'

// 数据
const loading = ref(false)
const courseList = ref([])

const queryForm = reactive({
  courseName: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 方法
const fetchMyCourses = async () => {
  loading.value = true
  try {
    const res = await getMyCourseList({
      ...queryForm,
      current: pagination.current,
      size: pagination.size
    })
    if (res.code === 200) {
      courseList.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取课程列表失败')
    }
  } catch (error) {
    ElMessage.error('获取课程列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchMyCourses()
}

const handleReset = () => {
  queryForm.courseName = ''
  pagination.current = 1
  fetchMyCourses()
}

const viewCourse = (course) => {
  ElMessage.info('查看课程详情功能开发中')
}

const handleLeave = async (course) => {
  try {
    await ElMessageBox.confirm(`确定要退出课程 "${course.courseName}" 吗？`, '提示', {
      type: 'warning'
    })
    const res = await leaveCourse(course.id)
    if (res.code === 200) {
      ElMessage.success('退出课程成功')
      fetchMyCourses()
    } else {
      ElMessage.error(res.message || '退出课程失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出课程失败: ' + error.message)
    }
  }
}

const getStatusText = (status) => {
  const map = { 1: '进行中', 2: '已结束' }
  return map[status] || '未知'
}

onMounted(() => {
  fetchMyCourses()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 10px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.course-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.course-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.course-info {
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.info-item .label {
  color: #999;
}

.course-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}
</style>
