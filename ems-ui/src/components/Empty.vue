<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <p class="empty-text">{{ text }}</p>
    <p class="empty-description" v-if="description">{{ description }}</p>
    <button class="btn btn-primary" v-if="actionText" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'Empty',
  props: {
    icon: { type: String, default: '📭' },
    text: { type: String, default: '暂无数据' },
    description: { type: String, default: '' },
    actionText: { type: String, default: '' }
  },
  emits: ['action']
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 8px;
  color: #606266;
}

.empty-description {
  font-size: 14px;
  margin: 0 0 20px;
}

.btn-primary {
  padding: 8px 20px;
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #40a9ff;
}
</style>
