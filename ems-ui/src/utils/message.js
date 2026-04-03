/**
 * 消息提示工具
 */

const showMessage = (message, type = 'info', duration = 3000) => {
  const existingToast = document.querySelector('.toast-message')
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement('div')
  toast.className = `toast-message toast-${type}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('toast-show')
  }, 10)

  setTimeout(() => {
    toast.classList.remove('toast-show')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, duration)
}

export default {
  success(message, duration = 3000) {
    showMessage(message, 'success', duration)
  },

  error(message, duration = 3000) {
    showMessage(message, 'error', duration)
  },

  warning(message, duration = 3000) {
    showMessage(message, 'warning', duration)
  },

  info(message, duration = 3000) {
    showMessage(message, 'info', duration)
  },

  confirm(message) {
    return new Promise((resolve) => {
      resolve(window.confirm(message))
    })
  }
}
