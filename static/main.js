/**
 * 应用主入口文件
 * 负责初始化应用、注册全局组件和工具函数
 */

(function() {
    'use strict';

    console.log('🚀 应用开始初始化...');

    // 检查 Vue 是否加载
    if (typeof Vue === 'undefined') {
        console.error('❌ Vue 未加载，请确保在页面中引入 Vue');
        return;
    }

    /**
     * 注册全局组件
     */
    function registerComponents() {
        console.log('📦 注册全局组件...');

        // 分页组件
        if (typeof Pagination !== 'undefined') {
            Vue.component('Pagination', Pagination);
            console.log('✅ 分页组件已注册');
        }

        // 弹窗组件
        if (typeof Modal !== 'undefined') {
            Vue.component('Modal', Modal);
            console.log('✅ 弹窗组件已注册');
        }

        // 状态徽章组件
        if (typeof StatusBadge !== 'undefined') {
            Vue.component('StatusBadge', StatusBadge);
            console.log('✅ 状态徽章组件已注册');
        }

        // 加载组件
        if (typeof Loading !== 'undefined') {
            Vue.component('Loading', Loading);
            console.log('✅ 加载组件已注册');
        }

        // 空状态组件
        if (typeof Empty !== 'undefined') {
            Vue.component('Empty', Empty);
            console.log('✅ 空状态组件已注册');
        }

        // 应用布局组件
        if (typeof AppLayout !== 'undefined') {
            Vue.component('AppLayout', AppLayout);
            console.log('✅ 应用布局组件已注册');
        }

        // Header 组件
        if (typeof HeaderComponent !== 'undefined') {
            Vue.component('HeaderComponent', HeaderComponent);
            console.log('✅ Header 组件已注册');
        }
    }

    /**
     * 注册全局属性和方法
     */
    function registerGlobals() {
        console.log('🌐 注册全局属性...');

        // 注册格式化工具
        if (typeof FormatUtils !== 'undefined') {
            Vue.config.globalProperties.$format = FormatUtils;
            console.log('✅ 格式化工具已注册');
        }

        // 注册验证工具
        if (typeof ValidatorUtils !== 'undefined') {
            Vue.config.globalProperties.$validator = ValidatorUtils;
            console.log('✅ 验证工具已注册');
        }

        // 注册消息工具
        if (typeof MessageUtils !== 'undefined') {
            Vue.config.globalProperties.$message = MessageUtils;
            console.log('✅ 消息工具已注册');
        }

        // 注册路由
        if (typeof Router !== 'undefined') {
            Vue.config.globalProperties.$router = Router;
            console.log('✅ 路由已注册');
        }
    }

    /**
     * 注册全局 Mixin
     */
    function registerMixins() {
        console.log('🎨 注册全局 Mixin...');

        Vue.mixin({
            methods: {
                /**
                 * 格式化日期时间
                 */
                formatDateTime(date) {
                    if (typeof FormatUtils !== 'undefined') {
                        return FormatUtils.formatDateTime(date);
                    }
                    return '-';
                },

                /**
                 * 格式化日期
                 */
                formatDate(date) {
                    if (typeof FormatUtils !== 'undefined') {
                        return FormatUtils.formatDate(date);
                    }
                    return '-';
                },

                /**
                 * 显示消息
                 */
                showMessage(message, type = 'info') {
                    if (typeof MessageUtils !== 'undefined') {
                        MessageUtils.showMessage(message, type);
                    } else {
                        alert(message);
                    }
                },

                /**
                 * 显示成功消息
                 */
                showSuccess(message) {
                    this.showMessage(message, 'success');
                },

                /**
                 * 显示错误消息
                 */
                showError(message) {
                    this.showMessage(message, 'error');
                },

                /**
                 * 显示确认对话框
                 */
                showConfirm(message) {
                    if (typeof MessageUtils !== 'undefined') {
                        return MessageUtils.confirm(message);
                    }
                    return Promise.resolve(confirm(message));
                }
            }
        });
    }

    /**
     * 初始化应用
     */
    function init() {
        try {
            // 注册全局组件
            registerComponents();

            // 注册全局属性
            registerGlobals();

            // 注册全局 Mixin
            registerMixins();

            console.log('✅ 应用初始化完成');
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
