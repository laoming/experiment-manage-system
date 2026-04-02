/**
 * 空状态组件 - Vue 3 组件
 * 可复用的空状态组件，用于显示无数据或空内容的提示
 */
const Empty = {
    name: 'Empty',
    props: {
        icon: {
            type: String,
            default: '📭'
        },
        text: {
            type: String,
            default: '暂无数据'
        },
        description: {
            type: String,
            default: ''
        },
        actionText: {
            type: String,
            default: ''
        }
    },
    template: `
        <div class="empty-state">
            <div class="empty-icon">{{ icon }}</div>
            <p class="empty-text">{{ text }}</p>
            <p class="empty-description" v-if="description">{{ description }}</p>
            <button 
                class="btn btn-primary" 
                v-if="actionText"
                @click="$emit('action')"
            >
                {{ actionText }}
            </button>
        </div>
    `
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Empty;
}
