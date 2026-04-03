/**
 * 状态徽章组件 - Vue 3 组件
 * 可复用的状态徽章组件，用于显示不同状态的标签
 */
const StatusBadge = {
    name: 'StatusBadge',
    props: {
        status: {
            type: [Number, String],
            required: true
        },
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
            const key = String(this.status);
            return this.statusMap[key] || { text: '未知', type: 'default' };
        },
        badgeClass() {
            return `status-badge status-badge-${this.statusInfo.type}`;
        }
    },
    template: `
        <span :class="badgeClass">
            {{ statusInfo.text }}
        </span>
    `
};

// 常用状态映射
StatusBadge.COMMON_STATUS_MAP = {
    1: { text: '激活', type: 'success' },
    2: { text: '禁用', type: 'warning' },
    3: { text: '删除', type: 'danger' }
};

StatusBadge.USER_STATUS_MAP = {
    1: { text: '激活', type: 'success' },
    2: { text: '禁用', type: 'warning' }
};

StatusBadge.COURSE_STATUS_MAP = {
    1: { text: '进行中', type: 'success' },
    2: { text: '已结束', type: 'default' }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusBadge;
}
