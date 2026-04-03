<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header" v-if="title">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-subtitle" v-if="subtitle">{{ subtitle }}</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar" v-if="$slots.search || $slots.actions">
      <div class="search-box">
        <slot name="search"></slot>
      </div>
      <div class="action-box">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="data"
        v-loading="loading"
        stripe
        border
        v-bind="$attrs"
      >
        <slot></slot>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" v-if="showPagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="total"
          :layout="paginationLayout"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 弹窗插槽 -->
    <slot name="modals"></slot>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 页面标题
  title: {
    type: String,
    default: ''
  },
  // 页面副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 当前页
  current: {
    type: Number,
    default: 1
  },
  // 每页条数
  size: {
    type: Number,
    default: 10
  },
  // 总条数
  total: {
    type: Number,
    default: 0
  },
  // 每页条数选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 分页布局
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['update:current', 'update:size', 'page-change'])

const tableRef = ref(null)

// 双向绑定分页
const currentPage = computed({
  get: () => props.current,
  set: (val) => emit('update:current', val)
})

const pageSize = computed({
  get: () => props.size,
  set: (val) => emit('update:size', val)
})

// 分页变化
const handleSizeChange = () => {
  emit('page-change')
}

const handleCurrentChange = () => {
  emit('page-change')
}

// 暴露表格方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (...args) => tableRef.value?.toggleRowSelection(...args)
})
</script>
