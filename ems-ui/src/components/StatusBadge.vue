<template>
  <span :class="badgeClass">{{ statusInfo.text }}</span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: { type: [Number, String], required: true },
    statusMap: {
      type: Object,
      default: () => ({
        1: { text: '正常', type: 'success' },
        2: { text: '禁用', type: 'warning' },
        3: { text: '删除', type: 'danger' }
      })
    }
  },
  computed: {
    statusInfo() {
      const key = String(this.status)
      return this.statusMap[key] || { text: '未知', type: 'default' }
    },
    badgeClass() {
      return `status-badge status-badge-${this.statusInfo.type}`
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-badge-success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge-warning {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.status-badge-danger {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-badge-default {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.status-badge-info {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}
</style>
