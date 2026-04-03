<template>
  <div class="loading-wrapper" :class="{ 'loading-overlay': overlay }" :style="overlayStyle">
    <div class="loading-spinner" :class="sizeClass"></div>
    <p class="loading-text" :class="sizeClass">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    text: { type: String, default: '加载中...' },
    size: {
      type: String,
      default: 'default',
      validator: (v) => ['small', 'default', 'large'].includes(v)
    },
    overlay: { type: Boolean, default: false },
    backgroundColor: { type: String, default: 'rgba(255, 255, 255, 0.9)' }
  },
  computed: {
    sizeClass() {
      return `loading-${this.size}`
    },
    overlayStyle() {
      return this.overlay ? { backgroundColor: this.backgroundColor } : {}
    }
  }
}
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.loading-spinner {
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-small {
  width: 24px;
  height: 24px;
  border: 2px solid #e8e8e8;
  border-top-color: #1890ff;
}

.loading-default {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e8e8;
  border-top-color: #1890ff;
}

.loading-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e8e8e8;
  border-top-color: #1890ff;
}

.loading-text {
  margin-top: 12px;
  color: #666;
}

.loading-text.loading-small { font-size: 12px; }
.loading-text.loading-default { font-size: 14px; }
.loading-text.loading-large { font-size: 16px; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
