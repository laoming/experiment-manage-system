/**
 * 加载组件 - Vue 3 组件
 * 可复用的加载状态组件
 */
const Loading = {
    name: 'Loading',
    props: {
        text: {
            type: String,
            default: '加载中...'
        },
        size: {
            type: String,
            default: 'default',
            validator: (value) => ['small', 'default', 'large'].includes(value)
        },
        overlay: {
            type: Boolean,
            default: false
        },
        backgroundColor: {
            type: String,
            default: 'rgba(255, 255, 255, 0.9)'
        }
    },
    template: `
        <div class="loading-wrapper" :class="{ 'loading-overlay': overlay }" :style="{ backgroundColor: overlay ? backgroundColor : '' }">
            <div class="loading-spinner" :class="sizeClass"></div>
            <p class="loading-text" :class="sizeClass">{{ text }}</p>
        </div>
    `,
    computed: {
        sizeClass() {
            return `loading-${this.size}`;
        }
    }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Loading;
}
