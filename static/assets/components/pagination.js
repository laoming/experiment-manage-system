/**
 * 分页组件 - Vue 3 组件
 * 可复用的分页组件，支持上一页、下一页、跳转等功能
 */
const Pagination = {
    name: 'Pagination',
    props: {
        current: {
            type: Number,
            required: true,
            default: 1
        },
        pages: {
            type: Number,
            required: true,
            default: 0
        },
        total: {
            type: Number,
            required: true,
            default: 0
        },
        showTotal: {
            type: Boolean,
            default: true
        },
        showJumper: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            jumpPage: this.current
        };
    },
    template: `
        <div class="pagination" v-if="pages > 0">
            <button
                class="pagination-btn"
                :disabled="current === 1"
                @click="handlePrev"
            >
                上一页
            </button>
            <span class="pagination-info">
                第 {{ current }} / {{ pages }} 页
                <span class="pagination-total" v-if="showTotal">共 {{ total }} 条记录</span>
            </span>
            <button
                class="pagination-btn"
                :disabled="current >= pages"
                @click="handleNext"
            >
                下一页
            </button>
            <div class="pagination-jump" v-if="showJumper">
                <span>跳至</span>
                <input 
                    type="number" 
                    class="pagination-jump-input" 
                    v-model.number="jumpPage" 
                    min="1" 
                    :max="pages" 
                    @keyup.enter="handleJump"
                >
                <span>页</span>
                <button class="pagination-jump-btn" @click="handleJump">跳转</button>
            </div>
        </div>
    `,
    watch: {
        current(newVal) {
            this.jumpPage = newVal;
        }
    },
    methods: {
        handlePrev() {
            if (this.current > 1) {
                this.$emit('page-change', this.current - 1);
            }
        },
        handleNext() {
            if (this.current < this.pages) {
                this.$emit('page-change', this.current + 1);
            }
        },
        handleJump() {
            const page = parseInt(this.jumpPage);
            if (page >= 1 && page <= this.pages && page !== this.current) {
                this.$emit('page-change', page);
            } else {
                this.jumpPage = this.current;
            }
        }
    }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}
