<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-content" :class="sizeClass">
          <div class="modal-header" v-if="title || showClose">
            <h2>{{ title }}</h2>
            <button class="modal-close" v-if="showClose" @click="handleClose">✕</button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="showFooter">
            <slot name="footer">
              <button type="button" class="btn btn-secondary" @click="handleClose">取消</button>
              <button type="button" class="btn btn-primary" @click="handleConfirm">确定</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '提示' },
    size: {
      type: String,
      default: 'default',
      validator: (v) => ['small', 'default', 'large'].includes(v)
    },
    closeOnClickOverlay: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true }
  },
  emits: ['close', 'confirm'],
  computed: {
    sizeClass() {
      return `modal-${this.size}`
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleConfirm() {
      this.$emit('confirm')
    },
    handleOverlayClick() {
      if (this.closeOnClickOverlay) {
        this.handleClose()
      }
    }
  },
  watch: {
    visible(newVal) {
      document.body.style.overflow = newVal ? 'hidden' : ''
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small { width: 400px; }
.modal-default { width: 600px; }
.modal-large { width: 800px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.modal-close:hover { color: #333; }

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
}

.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-primary {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #fff;
}

.btn-primary:hover { background: #40a9ff; }

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
