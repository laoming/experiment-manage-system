/**
 * 消息提示工具函数
 */

const MessageUtils = {
    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    success(message, duration = 3000) {
        this.showMessage(message, 'success', duration);
    },

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    error(message, duration = 3000) {
        this.showMessage(message, 'error', duration);
    },

    /**
     * 显示警告消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    warning(message, duration = 3000) {
        this.showMessage(message, 'warning', duration);
    },

    /**
     * 显示信息消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    info(message, duration = 3000) {
        this.showMessage(message, 'info', duration);
    },

    /**
     * 显示确认对话框
     * @param {string} message - 消息内容
     * @returns {Promise<boolean>} 是否确认
     */
    confirm(message) {
        return new Promise((resolve) => {
            resolve(confirm(message));
        });
    },

    /**
     * 显示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     * @param {number} duration - 显示时长（毫秒）
     */
    showMessage(message, type = 'info', duration = 3000) {
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageUtils;
}
