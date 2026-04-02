/**
 * 顶部导航栏布局组件
 */
const HeaderLayout = {
    name: 'HeaderLayout',
    template: `
        <div>
            <header-component ref="headerComponent"></header-component>
            <main class="main-content">
                <slot></slot>
            </main>
        </div>
    `
};
