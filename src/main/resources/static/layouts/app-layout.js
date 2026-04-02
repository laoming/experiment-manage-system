/**
 * 应用主布局组件
 * 包含 Header 和内容区域
 */
const AppLayout = {
    name: 'AppLayout',
    template: `
        <div class="app-layout">
            <header-component></header-component>
            <main class="main-content">
                <slot></slot>
            </main>
        </div>
    `
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppLayout;
}
