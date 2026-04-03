<template>
  <div class="pagination" v-if="pages > 0">
    <button class="pagination-btn" :disabled="current === 1" @click="handlePrev">
      上一页
    </button>
    <span class="pagination-info">
      第 {{ current }} / {{ pages }} 页
      <span class="pagination-total" v-if="showTotal">共 {{ total }} 条记录</span>
    </span>
    <button class="pagination-btn" :disabled="current >= pages" @click="handleNext">
      下一页
    </button>
    <div class="pagination-jump" v-if="showJumper">
      <span>跳至</span>
      <input
        type="number"
        class="pagination-jump-input"
        v-model.number="jumpPage"
        min="1"
        :max="pages"
        @keyup.enter="handleJump"
      />
      <span>页</span>
      <button class="pagination-jump-btn" @click="handleJump">跳转</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    current: { type: Number, required: true, default: 1 },
    pages: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    showTotal: { type: Boolean, default: true },
    showJumper: { type: Boolean, default: true }
  },
  data() {
    return {
      jumpPage: this.current
    }
  },
  watch: {
    current(newVal) {
      this.jumpPage = newVal
    }
  },
  methods: {
    handlePrev() {
      if (this.current > 1) {
        this.$emit('page-change', this.current - 1)
      }
    },
    handleNext() {
      if (this.current < this.pages) {
        this.$emit('page-change', this.current + 1)
      }
    },
    handleJump() {
      const page = parseInt(this.jumpPage)
      if (page >= 1 && page <= this.pages && page !== this.current) {
        this.$emit('page-change', page)
      } else {
        this.jumpPage = this.current
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0;
}

.pagination-btn {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  color: #1890ff;
  border-color: #1890ff;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  color: #c0c4cc;
  background: #fff;
  border-color: #e4e7ed;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

.pagination-total {
  margin-left: 8px;
  color: #909399;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.pagination-jump-input {
  width: 50px;
  height: 28px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
}

.pagination-jump-input:focus {
  border-color: #1890ff;
}

.pagination-jump-btn {
  padding: 4px 12px;
  border: 1px solid #1890ff;
  background: #1890ff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pagination-jump-btn:hover {
  background: #40a9ff;
}
</style>
