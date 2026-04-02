/**
 * 弹窗组件 - Vue 3 组件
 * 可复用的弹窗组件，支持自定义内容和操作按钮
 */
const Modal = {
    name: 'Modal',
    props: {
        visible: {
            type: Boolean,
            required: true,
            default: false
        },
        title: {
            type: String,
            default: '提示'
        },
        size: {
            type: String,
            default: 'default',
            validator: (value) => ['small', 'default', 'large'].includes(value)
        },
        closeOnClickOverlay: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: true
        }
    },
    emits: ['close', 'confirm'],
    template: `
        <div class="modal-overlay" 
             v-show="visible" 
             style="display: none;" 
             @click.self="handleOverlayClick"
             :class="{ 'modal-overlay-visible': visible }">
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
                        <button type="button" class="btn btn-secondary" @click="handleClose">
                            取消
                        </button>
                        <button type="button" class="btn btn-primary" @click="handleConfirm">
                            确定
                        </button>
                    </slot>
                </div>
            </div>
        </div>
    `,
    computed: {
        sizeClass() {
            return `modal-${this.size}`;
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },
        handleConfirm() {
            this.$emit('confirm');
        },
        handleOverlayClick() {
            if (this.closeOnClickOverlay) {
                this.handleClose();
            }
        }
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
}
