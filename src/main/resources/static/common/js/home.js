/**
 * 首页逻辑
 */
const { createApp } = Vue;

// 在全局创建 tabVueInstances 对象
window.homeTabVueInstances = {};
console.log('📌 [HOME] 已初始化全局 window.homeTabVueInstances');

const app = createApp({
    data() {
        return {
            loginTime: '',
            loading: true,
            menuList: [],
            menuDirectories: [],
            expandedDirectories: [],
            showGlobalError: false,
            globalErrorMessage: '',
            currentTabKey: 'home',
            tabContents: {},  // 保存每个标签页的内容（包括HTML、CSS、脚本等）
            tabVueInstances: {},  // 保存每个标签页的Vue实例
            currentTabContent: null,
            currentTabScripts: null,  // 保存当前标签页的脚本HTML（v-html不会执行脚本，所以需要单独处理）
            loadingTab: false,
            tabError: null,
            previousTabKey: null,
            stats: [],  // 首页统计数据
            // 公告相关
            noticeList: [],
            noticeLoading: true,
            noticePagination: { current: 1, size: 10, total: 0, pages: 0 },
            showNoticeDetailModal: false,
            currentNotice: null,
            // 消息相关
            todoList: [],
            todoLoading: true,
            todoPagination: { current: 1, size: 10, total: 0, pages: 0 },
            showTodoDetailModal: false,
            currentTodo: null,
            unreadCount: 0
        };
    },

    mounted() {
        this.checkLogin();
        this.initData();
        this.fetchMenuList();
        this.fetchStats();
        this.fetchNoticeList();
        this.fetchTodoList();

        // 设置全局错误处理
        this.setupGlobalErrorHandling();

        // 监听标签页切换事件
        window.addEventListener('tab-switch', this.handleTabSwitch);
        // 监听标签页关闭事件
        window.addEventListener('tab-close', this.handleTabClose);

        // 同步全局对象和组件内的响应式对象
        this.$watch('tabVueInstances', (newVal) => {
            Object.assign(window.homeTabVueInstances, newVal);
        }, { deep: true });
    },

    beforeUnmount() {
        // 移除事件监听
        window.removeEventListener('tab-switch', this.handleTabSwitch);
        window.removeEventListener('tab-close', this.handleTabClose);
    },

    errorCaptured(err, vm, info) {
        // 捕获 Vue 组件错误，显示全局错误提示
        console.error('[HOME] Vue组件错误:', err, info);
        console.error('[HOME] 错误堆栈:', err.stack);

        // 只在首页显示全局错误，其他页面的错误由各自页面处理
        const currentPath = window.location.pathname;
        if (currentPath.includes('home.html')) {
            this.showGlobalError = true;
            this.globalErrorMessage = err.message || '页面加载失败';
        }

        return false; // 阻止错误继续向上传播
    },

    methods: {
        /**
         * 处理标签页切换事件
         */
        async handleTabSwitch(event) {
            const { tabKey } = event.detail;
            console.log('📌 [HOME] 标签页切换事件:', tabKey);

            // 隐藏之前的标签页
            if (this.previousTabKey && this.previousTabKey !== tabKey) {
                this.hidePreviousTab();
            }

            this.currentTabKey = tabKey;

            if (tabKey === 'home') {
                // 首页，仅隐藏内容区域，保留缓存DOM
                this.hidePreviousTab();
                this.tabError = null;
                this.previousTabKey = 'home';
                return;
            }

            // 获取标签页信息
            const tabs = TabsManager.getTabs();
            const tab = tabs.find(t => t.key === tabKey);

            if (!tab) {
                console.warn('[HOME] 标签页不存在:', tabKey);
                if (this.$refs.tabContentEmbed) {
                    this.$refs.tabContentEmbed.innerHTML = '';
                }
                this.tabError = '标签页不存在';
                this.previousTabKey = tabKey;
                return;
            }

            // 检查是否已缓存Vue实例（使用全局变量）
            console.log('📌 [HOME] 检查缓存，window.homeTabVueInstances:', window.homeTabVueInstances);
            console.log('📌 [HOME] 检查缓存，tabKey:', tabKey);
            const globalVueInstances = window.homeTabVueInstances || {};
            console.log('📌 [HOME] 检查缓存，globalVueInstances:', globalVueInstances);
            if (globalVueInstances[tabKey]) {
                console.log('📌 [HOME] 标签页Vue实例已缓存:', tabKey);
                const cachedContent = this.tabContents[tabKey];
                if (!cachedContent) {
                    console.warn('[HOME] 缓存内容不存在，重新加载标签页:', tabKey);
                    delete globalVueInstances[tabKey];
                    await this.loadTabContent(tab);
                    this.previousTabKey = tabKey;
                    return;
                }
                this.currentTabScripts = cachedContent.scripts;
                this.tabError = null;
                this.previousTabKey = tabKey;

                // 直接显示已缓存的DOM（从embedArea中找到并显示）
                this.$nextTick(() => {
                    const embedArea = this.$refs.tabContentEmbed;
                    if (embedArea) {
                        const appId = cachedContent.appId;
                        console.log('📌 [HOME] 尝试显示已缓存的DOM元素，appId:', appId);

                        // 在embedArea中查找缓存的DOM元素
                        const cachedAppElement = appId ? embedArea.querySelector(`#${appId}`) : null;

                        if (cachedAppElement) {
                            console.log('📌 [HOME] 找到缓存的DOM元素:', cachedAppElement.id);
                            console.log('📌 [HOME] 缓存元素的 __vue_app__:', cachedAppElement.__vue_app__);
                            console.log('📌 [HOME] 全局Vue实例:', globalVueInstances[tabKey]);

                            // 确保弹窗状态被重置
                            this.resetTabModals(tabKey, cachedAppElement);

                            // 显示该元素，同时隐藏其他所有元素
                            const allChildren = Array.from(embedArea.children);
                            allChildren.forEach(child => {
                                if (child.id && child.id.startsWith('tab-app-')) {
                                    if (child.id === appId) {
                                        // 恢复原始 display 值，而不是固定设置为 block
                                        // 对于 flex 容器，需要使用 display: flex
                                        const computedStyle = window.getComputedStyle(child);
                                        if (child.dataset.originalDisplay) {
                                            child.style.display = child.dataset.originalDisplay;
                                        } else if (computedStyle.display === 'flex' || child.classList.contains('editor-page')) {
                                            child.style.display = 'flex';
                                        } else {
                                            child.style.display = 'block';
                                        }
                                        console.log('📌 [HOME] 显示元素:', child.id, 'display:', child.style.display);
                                    } else {
                                        // 保存原始 display 值（仅在第一次隐藏时保存）
                                        if (!child.dataset.originalDisplay && child.style.display !== 'none') {
                                            child.dataset.originalDisplay = child.style.display || 'block';
                                        }
                                        child.style.display = 'none';
                                        console.log('📌 [HOME] 隐藏元素:', child.id);
                                    }
                                }
                            });

                            // 验证 Vue 实例是否有效
                            if (!cachedAppElement.__vue_app__ && globalVueInstances[tabKey]) {
                                console.log('📌 [HOME] DOM 元素上没有 Vue 实例，尝试重新挂载');
                                try {
                                    globalVueInstances[tabKey].mount(cachedAppElement);
                                    console.log('📌 [HOME] Vue 实例重新挂载成功');
                                } catch (e) {
                                    console.error('[HOME] 重新挂载失败，重新执行脚本:', e);
                                    // 如果重新挂载失败，重新执行脚本
                                    this.currentTabScripts = cachedContent.scripts;
                                    setTimeout(() => {
                                        this.executeTabScripts(tabKey);
                                    }, 50);
                                    return;
                                }
                            }

                            // 检查弹窗元素
                            setTimeout(() => {
                                const modalOverlay = cachedAppElement.querySelector('.modal-overlay');
                                if (modalOverlay) {
                                    console.log('📌 [HOME] 找到弹窗元素:', modalOverlay);
                                    console.log('📌 [HOME] 弹窗元素的样式:', window.getComputedStyle(modalOverlay).display);
                                } else {
                                    console.warn('[HOME] 未找到弹窗元素');
                                }
                            }, 100);

                            console.log('📌 [HOME] 已缓存的DOM元素已显示');
                        } else {
                            console.warn('[HOME] 未找到缓存DOM，尝试使用缓存内容重新渲染，appId:', appId);

                            // 清空并重新插入缓存的CSS和HTML
                            embedArea.innerHTML = '';

                            const styleLinks = cachedContent.styleLinks || [];
                            const styleTags = cachedContent.styleTags || [];

                            if (styleLinks.length > 0) {
                                const cssContainer = document.createElement('div');
                                cssContainer.innerHTML = styleLinks.join('\n');
                                while (cssContainer.firstChild) {
                                    embedArea.appendChild(cssContainer.firstChild);
                                }
                            }

                            if (styleTags.length > 0) {
                                const styleContainer = document.createElement('div');
                                styleContainer.innerHTML = styleTags.join('\n');
                                while (styleContainer.firstChild) {
                                    embedArea.appendChild(styleContainer.firstChild);
                                }
                            }

                            const htmlContainer = document.createElement('div');
                            htmlContainer.innerHTML = cachedContent.html || '';
                            while (htmlContainer.firstChild) {
                                embedArea.appendChild(htmlContainer.firstChild);
                            }

                            // 隐藏可能残留的弹窗
                            this.resetTabModals(tabKey, embedArea);

                            // 清理旧的实例缓存并重新执行脚本
                            if (window.homeTabVueInstances && window.homeTabVueInstances[tabKey]) {
                                delete window.homeTabVueInstances[tabKey];
                            }

                            this.currentTabScripts = cachedContent.scripts;
                            setTimeout(() => {
                                this.executeTabScripts(tabKey);
                            }, 50);
                        }
                    } else {
                        console.error('[HOME] tabContentEmbed ref 未找到');
                    }
                });
                return;
            }

            // 加载标签页内容
            await this.loadTabContent(tab);
            this.previousTabKey = tabKey;
        },

        /**
         * 隐藏之前的标签页
         */
        hidePreviousTab() {
            console.log('📌 [HOME] 隐藏之前的标签页:', this.previousTabKey);

            const embedArea = this.$refs.tabContentEmbed;
            if (embedArea) {
                // 不移除DOM元素，只隐藏它们
                const oldApps = embedArea.querySelectorAll('[id^="tab-app-"]');
                oldApps.forEach(oldApp => {
                    console.log('📌 [HOME] 隐藏Vue实例:', oldApp.id);
                    // 保存原始 display 值（仅在第一次隐藏时保存）
                    if (!oldApp.dataset.originalDisplay && oldApp.style.display !== 'none') {
                        const computedStyle = window.getComputedStyle(oldApp);
                        oldApp.dataset.originalDisplay = computedStyle.display || 'block';
                    }
                    // 只隐藏，不从DOM中移除
                    oldApp.style.display = 'none';
                });

                // 也要隐藏其他内容（如CSS等）
                const allChildren = Array.from(embedArea.children);
                allChildren.forEach(child => {
                    if (child.id && child.id.startsWith('tab-app-')) {
                        // 保存原始 display 值
                        if (!child.dataset.originalDisplay && child.style.display !== 'none') {
                            const computedStyle = window.getComputedStyle(child);
                            child.dataset.originalDisplay = computedStyle.display || 'block';
                        }
                        child.style.display = 'none';
                    }
                });

                // 同步隐藏所有弹窗遮罩
                const modalOverlays = embedArea.querySelectorAll('.modal-overlay');
                modalOverlays.forEach(overlay => {
                    overlay.style.display = 'none';
                });

                console.log('📌 [HOME] 已隐藏', oldApps.length, '个标签页元素');
            }
        },

        /**
         * 重置指定标签页的弹窗状态
         */
        resetTabModals(tabKey, targetElement) {
            const embedArea = this.$refs.tabContentEmbed;
            const scope = targetElement || embedArea;

            if (scope) {
                const modalOverlays = scope.querySelectorAll('.modal-overlay');
                modalOverlays.forEach(overlay => {
                    overlay.style.display = 'none';
                });
            }

            const globalVueInstances = window.homeTabVueInstances || {};
            const vueApp = globalVueInstances[tabKey];
            const proxy = vueApp && vueApp._instance && vueApp._instance.proxy ? vueApp._instance.proxy : null;
            if (proxy && proxy.$data) {
                Object.keys(proxy.$data).forEach((key) => {
                    if (key.startsWith('show') && /(Modal|Dialog|Overlay|Popup)/i.test(key)) {
                        if (typeof proxy[key] === 'boolean') {
                            proxy[key] = false;
                        }
                    }
                });
            }
        },

        /**
         * 处理标签页关闭事件，清理缓存
         */
        handleTabClose(event) {
            const { closedKeys } = event.detail || {};
            if (!Array.isArray(closedKeys) || closedKeys.length === 0) {
                return;
            }

            const embedArea = this.$refs.tabContentEmbed;
            closedKeys.forEach((tabKey) => {
                if (!tabKey || tabKey === 'home') {
                    return;
                }

                const cached = this.tabContents[tabKey];

                // 移除对应 DOM
                if (embedArea && cached && cached.appId) {
                    const cachedEl = embedArea.querySelector(`#${cached.appId}`);
                    if (cachedEl && cachedEl.parentNode) {
                        cachedEl.parentNode.removeChild(cachedEl);
                    }
                }

                // 清理缓存内容
                if (this.tabContents[tabKey]) {
                    delete this.tabContents[tabKey];
                }

                // 清理 Vue 实例缓存
                if (this.tabVueInstances[tabKey]) {
                    delete this.tabVueInstances[tabKey];
                }
                if (window.homeTabVueInstances && window.homeTabVueInstances[tabKey]) {
                    delete window.homeTabVueInstances[tabKey];
                }
            });
        },

        /**
         * 加载标签页内容
         */
        async loadTabContent(tab) {
            console.log('📌 [HOME] 开始加载标签页内容:', tab);
            this.loadingTab = true;
            this.tabError = null;

            try {
                // 使用 XMLHttpRequest 加载页面 HTML，绕过 fetch 拦截器
                const html = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', tab.path, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                resolve(xhr.responseText);
                            } else {
                                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                            }
                        }
                    };
                    xhr.onerror = () => reject(new Error('请求失败'));
                    xhr.send();
                });

                console.log('✅ [HOME] 标签页内容加载成功，长度:', html.length);

                // 提取页面主体内容
                const mainContent = this.extractMainContent(html);
                console.log('✅ [HOME] 提取主体内容成功');

                // 缓存内容（包括HTML、CSS链接、脚本等）
                const { html: mainContentHtml, scripts: scriptsHtml, appId, styleLinks, styleTags } = mainContent;
                this.tabContents[tab.key] = {
                    html: mainContentHtml,
                    scripts: scriptsHtml,
                    appId,
                    styleLinks,  // 保存CSS链接
                    styleTags    // 保存内联样式
                };
                console.log('📌 [HOME] 已缓存样式，styleLinks:', styleLinks.length, 'styleTags:', styleTags.length);

                // 将CSS和HTML插入到DOM中
                this.$nextTick(() => {
                    if (this.$refs.tabContentEmbed) {
                        // 隐藏所有已存在的标签页元素
                        const allApps = this.$refs.tabContentEmbed.querySelectorAll('[id^="tab-app-"]');
                        allApps.forEach(app => {
                            app.style.display = 'none';
                        });
                        console.log('📌 [HOME] 已隐藏', allApps.length, '个已存在的标签页元素');

                        // 使用 createElement 插入 CSS 样式链接（更可靠）
                        if (styleLinks.length > 0) {
                            styleLinks.forEach(linkHtml => {
                                // 从 HTML 字符串中提取 href 属性
                                const hrefMatch = linkHtml.match(/href=["']([^"']+)["']/);
                                if (hrefMatch && hrefMatch[1]) {
                                    const href = hrefMatch[1];
                                    // 检查是否已加载
                                    if (!document.querySelector(`link[href="${href}"]`)) {
                                        const linkElement = document.createElement('link');
                                        linkElement.rel = 'stylesheet';
                                        linkElement.href = href;
                                        this.$refs.tabContentEmbed.appendChild(linkElement);
                                        console.log('📌 [HOME] 插入 CSS 链接:', href);
                                    }
                                }
                            });
                        }

                        // 插入内联样式
                        if (styleTags.length > 0) {
                            const styleContainer = document.createElement('div');
                            styleContainer.innerHTML = styleTags.join('\n');
                            while (styleContainer.firstChild) {
                                this.$refs.tabContentEmbed.appendChild(styleContainer.firstChild);
                            }
                        }

                        // 插入HTML内容
                        const htmlContainer = document.createElement('div');
                        htmlContainer.innerHTML = mainContentHtml;
                        while (htmlContainer.firstChild) {
                            this.$refs.tabContentEmbed.appendChild(htmlContainer.firstChild);
                        }

                        console.log('📌 [HOME] CSS和HTML已插入到DOM');
                    } else {
                        console.error('[HOME] tabContentEmbed ref 未找到');
                    }
                });

                // 将脚本HTML字符串保存到临时存储，供executeTabScripts使用
                this.currentTabScripts = scriptsHtml;

                // 执行页面脚本 - 增加延迟确保DOM完全渲染
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.executeTabScripts(tab.key);
                    }, 100);
                });
            } catch (error) {
                console.error('❌ [HOME] 加载标签页内容失败:', error);
                console.error('❌ [HOME] 错误堆栈:', error.stack);
                this.tabError = error.message || '页面加载失败';
            } finally {
                this.loadingTab = false;
            }
        },

        /**
         * 提取页面主体内容
         */
        extractMainContent(html) {
            // 创建临时DOM解析器
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const styleLinks = [];
            const styleTags = [];

            // 收集CSS链接 - 从 head 和 body 中都查找（处理HTML片段的情况）
            const collectStyleLinks = (container) => {
                container.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                    const href = link.getAttribute('href');
                    // 只收集尚未加载的CSS（避免重复）
                    if (href && !document.querySelector(`link[href="${href}"]`)) {
                        styleLinks.push(link.outerHTML);
                    }
                });
            };

            // 收集内联样式
            const collectStyleTags = (container) => {
                container.querySelectorAll('style').forEach(style => {
                    styleTags.push(style.outerHTML);
                });
            };

            // 从 head 和 body 中收集样式
            collectStyleLinks(doc.head);
            collectStyleLinks(doc.body);
            collectStyleTags(doc.head);
            collectStyleTags(doc.body);

            console.log('📌 [HOME] 找到', styleLinks.length, '个新CSS链接');
            console.log('📌 [HOME] 找到', styleTags.length, '个内联样式');

            // 提取body内容
            const body = doc.body;

            // 先生成唯一的app ID
            const uniqueId = `tab-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('📌 [HOME] 生成app ID:', uniqueId);

            // 先插入CSS到文档头部（确保样式在内容之前加载）
            let stylesHtml = '';
            if (styleLinks.length > 0) {
                stylesHtml += styleLinks.join('\n');
            }
            if (styleTags.length > 0) {
                stylesHtml += styleTags.join('\n');
            }

            // 查找main-content容器
            const mainContent = body.querySelector('.main-content');
            if (mainContent) {
                // 克隆main-content以避免修改原始DOM
                const mainContentClone = mainContent.cloneNode(true);

                // 移除header-component（如果存在）
                const headerComponent = mainContentClone.querySelector('.header, header-component');
                if (headerComponent) {
                    headerComponent.remove();
                }

                // 将 main-content 的 ID 改为动态生成的 ID（作为Vue挂载点）
                mainContentClone.id = uniqueId;

                // 收集 body 中的所有脚本（因为脚本通常在 .main-content 外面）
                const scripts = [];
                body.querySelectorAll('script').forEach(script => {
                    scripts.push(script.outerHTML);
                });
                console.log('📌 [HOME] 收集到', scripts.length, '个脚本');

                // 返回对象：HTML、样式、脚本分开存储
                return {
                    html: mainContentClone.outerHTML,
                    scripts: scripts,
                    appId: uniqueId,
                    styleLinks: styleLinks,
                    styleTags: styleTags
                };
            }

            // 如果没有找到main-content，查找#main-app或#app
            const appContainer = body.querySelector('#main-app') || body.querySelector('#app');
            if (appContainer) {
                const containerClone = appContainer.cloneNode(true);
                containerClone.id = uniqueId;

                // 收集 body 中的所有脚本（因为脚本通常在容器外面或里面）
                const scripts = [];
                body.querySelectorAll('script').forEach(script => {
                    scripts.push(script.outerHTML);
                });
                console.log('📌 [HOME] 收集到', scripts.length, '个脚本');

                // 返回对象：HTML和脚本分开
                return {
                    html: [...styleLinks, ...styleTags, '', containerClone.outerHTML].join('\n'),
                    scripts: scripts,
                    appId: uniqueId
                };
            }

            // 如果都没找到，返回body内容
            const scripts = [];
            body.querySelectorAll('script').forEach(script => {
                scripts.push(script.outerHTML);
            });
            console.log('📌 [HOME] 收集到', scripts.length, '个脚本（fallback）');

            return {
                html: body.innerHTML,
                scripts: scripts,
                appId: null,
                styleLinks: [],
                styleTags: []
            };
        },

        /**
         * 执行标签页中的脚本
         */
        executeTabScripts(tabKey) {
            console.log('📌 [HOME] 执行标签页脚本:', tabKey);

            const embedArea = this.$refs.tabContentEmbed;
            if (!embedArea) {
                console.warn('[HOME] tabContentEmbed ref 不存在');
                return;
            }

            // 检查是否已经存在Vue应用实例（仅检查当前tab对应的挂载点）
            const globalVueInstances = window.homeTabVueInstances || {};
            const cachedContent = this.tabContents[tabKey];
            const targetAppId = cachedContent && cachedContent.appId ? cachedContent.appId : null;
            const targetEl = targetAppId ? embedArea.querySelector(`#${targetAppId}`) : null;

            if (targetEl && (targetEl.__vue_app__ || globalVueInstances[tabKey])) {
                console.log('📌 [HOME] Vue应用实例已存在，跳过脚本执行:', targetEl.id);
                console.log('📌 [HOME] targetEl.__vue_app__:', targetEl.__vue_app__);
                console.log('📌 [HOME] globalVueInstances[tabKey]:', globalVueInstances[tabKey]);

                // 确保全局变量中的 Vue 实例仍然有效
                if (!targetEl.__vue_app__ && globalVueInstances[tabKey]) {
                    console.log('📌 [HOME] DOM 元素上没有 Vue 实例，但全局变量中有，尝试重新挂载');
                    try {
                        globalVueInstances[tabKey].mount(targetEl);
                        console.log('📌 [HOME] Vue 实例重新挂载成功');
                    } catch (e) {
                        console.error('[HOME] 重新挂载 Vue 实例失败:', e);
                    }
                }
                return;
            }

            // 使用保存的脚本HTML字符串（因为v-html不会执行脚本）
            const scriptsHtml = this.currentTabScripts || [];
            console.log('📌 [HOME] 脚本HTML数量:', scriptsHtml.length);

            if (scriptsHtml.length === 0) {
                console.log('📌 [HOME] 没有需要执行的脚本');
                return;
            }

            // 延迟执行，确保DOM已经渲染
            setTimeout(() => {
                // 首先确保挂载目标存在
                const embedArea = this.$refs.tabContentEmbed;
                if (!embedArea) {
                    console.error('[HOME] tabContentEmbed ref 不存在');
                    return;
                }

                const cachedContent = this.tabContents[tabKey];
                const expectedAppId = cachedContent && cachedContent.appId ? cachedContent.appId : null;
                const appElements = embedArea.querySelectorAll('[id^="tab-app-"]');
                if (appElements.length === 0) {
                    console.warn('[HOME] 未找到挂载目标元素，延迟执行');
                    console.log('[HOME] embedArea 内容:', embedArea.innerHTML.substring(0, 500));
                    setTimeout(() => this.executeTabScripts(tabKey), 200);
                    return;
                }

                let targetElement = expectedAppId ? embedArea.querySelector(`#${expectedAppId}`) : null;
                if (!targetElement) {
                    targetElement = appElements[0];
                }

                const targetAppId = targetElement.id;
                console.log('📌 [HOME] 找到挂载目标:', targetAppId);
                console.log('📌 [HOME] 挂载目标元素:', targetElement);
                console.log('📌 [HOME] 挂载目标__vue_app__:', targetElement.__vue_app__);

                // 检查是否有按钮元素
                const buttons = targetElement.querySelectorAll('button');
                console.log('📌 [HOME] 按钮数量:', buttons.length);
                if (buttons.length > 0) {
                    console.log('📌 [HOME] 第一个按钮:', buttons[0]);
                    console.log('📌 [HOME] 第一个按钮onclick:', buttons[0].onclick);
                    console.log('📌 [HOME] 第一个按钮__vueEventHanlder:', buttons[0].__vnode);
                }

                // 解析脚本HTML字符串
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = scriptsHtml.join('\n');

                // 查找所有script标签
                const scripts = tempDiv.querySelectorAll('script:not([data-executed])');
                console.log('📌 [HOME] 找到', scripts.length, '个未执行的脚本');

                if (scripts.length === 0) {
                    console.log('📌 [HOME] 没有需要执行的脚本');
                    return;
                }

                // 先加载外部脚本（Vue、API等）
                const externalScripts = [];
                const inlineScripts = [];

                scripts.forEach(script => {
                    const src = script.getAttribute('src');
                    if (src) {
                        externalScripts.push(script);
                    } else {
                        inlineScripts.push(script);
                    }
                });

                console.log('📌 [HOME] 外部脚本:', externalScripts.length, '内联脚本:', inlineScripts.length);


                // 用于存储所有脚本内容
                let combinedScriptContent = '';
                // 跟踪需要等待的库文件
                const requiredLibraries = { marked: false, turndown: false };
                
                // 加载外部脚本
                const loadExternalScripts = async () => {
                    for (const script of externalScripts) {
                        script.setAttribute('data-executed', 'true');
                        const src = script.getAttribute('src');
                        
                        // 跳过某些脚本（这些已经在主页加载）
                        if (src.includes('vue') || src.includes('header-component') || 
                            src.includes('tabs-manager') || src.includes('auth.js') ||
                            src.includes('request.js') || src.includes('api.js')) {
                            console.log('📌 [HOME] 跳过外部脚本:', src);
                            continue;
                        }

                        console.log('📌 [HOME] 加载外部脚本:', src);
                        
                        // 检查是否已加载
                        const existingScript = document.querySelector(`script[src="${src}"]`);
                        if (existingScript) {
                            console.log('📌 [HOME] 脚本已存在:', src);
                            // 如果是库文件，检查全局变量
                            if (src.includes('marked')) requiredLibraries.marked = typeof marked !== 'undefined';
                            if (src.includes('turndown')) requiredLibraries.turndown = typeof TurndownService !== 'undefined';
                            continue;
                        }

                        // 对于业务逻辑脚本（如 user.js），我们需要获取内容并作为内联脚本执行
                        // 这样才能动态修改挂载目标
                        // 注意：common/js/ 下的库文件（如 marked, turndown）需要正常加载以导出全局变量
                        const isLibraryScript = src.includes('/common/js/');
                        if (src.includes('.js') && !src.includes('vue') && !src.includes('api') && 
                            (src.includes('/ems/')) && !isLibraryScript) {
                            console.log('📌 [HOME] 获取脚本内容进行动态执行:', src);
                            
                            try {
                                // 使用 XMLHttpRequest 获取脚本内容，避免被拦截器处理
                                const scriptText = await new Promise((resolve, reject) => {
                                    const xhr = new XMLHttpRequest();
                                    xhr.open('GET', src, true);
                                    xhr.onreadystatechange = function() {
                                        if (xhr.readyState === 4) {
                                            if (xhr.status === 200) {
                                                resolve(xhr.responseText);
                                            } else {
                                                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                                            }
                                        }
                                    };
                                    xhr.onerror = () => reject(new Error('请求失败'));
                                    xhr.send();
                                });
                                
                                if (scriptText) {
                                    let scriptContent = scriptText;

                                    // 更新挂载代码
                                    const appElements = embedArea.querySelectorAll('[id^="tab-app-"]');
                                    const cachedContent = this.tabContents[tabKey];
                                    const expectedAppId = cachedContent && cachedContent.appId ? cachedContent.appId : null;
                                    const targetAppId = expectedAppId || (appElements.length > 0 ? appElements[0].id : null);

                                    if (targetAppId) {
                                        console.log('📌 [HOME] 为外部脚本更新挂载目标:', targetAppId);

                                        // 优先替换 Vue.createApp(...).mount('#app') 形式
                                        scriptContent = scriptContent.replace(
                                            /Vue\.createApp\s*\(([^)]*)\)\s*\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                            `Vue.createApp($1).mount('#${targetAppId}')`
                                        );


                                        // 替换单独的 app.mount('#app') 或 app.mount('#main-app')
                                        scriptContent = scriptContent.replace(
                                            /app\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                            `app.mount('#${targetAppId}')`
                                        );

                                        // 替换 .mount('#app') 或 .mount('#main-app') 形式（catch-all）
                                        scriptContent = scriptContent.replace(
                                            /\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                            `.mount('#${targetAppId}')`
                                        );

                                        // 替换 document.getElementById('main-app') 或 document.getElementById('app') 为新的目标
                                        scriptContent = scriptContent.replace(
                                            /document\.getElementById\(['"](main-app|app)['"]\)/g,
                                            `document.getElementById('${targetAppId}')`
                                        );
                                    }

                                    // 注释掉重复的组件注册，而不是移除（避免影响其他代码）
                                    scriptContent = scriptContent.replace(
                                        /(app\.component\s*\(['"]header-component['"][^)]*\)\s*;?)/g,
                                        '// $1'
                                    );

                                    // 将脚本添加到合并脚本中（不包装在 IIFE 中，以便 Vue 实例可以正确创建）
                                    combinedScriptContent += '\n// === Script from ' + src + ' ===\n' + scriptContent;
                                    console.log('📌 [HOME] 已将外部脚本内容添加到合并脚本，长度:', scriptContent.length);
                                    continue;
                                }
                            } catch (error) {
                                console.error('[HOME] 获取脚本内容失败:', src, error);
                            }
                        }

                        // 对于其他脚本，正常加载
                        await new Promise((resolve) => {
                            const newScript = document.createElement('script');
                            newScript.src = src;
                            newScript.onload = () => {
                                console.log('📌 [HOME] 脚本加载成功:', src);
                                // 标记库文件加载完成
                                if (src.includes('marked')) {
                                    requiredLibraries.marked = true;
                                    console.log('📌 [HOME] marked 库已就绪');
                                }
                                if (src.includes('turndown')) {
                                    requiredLibraries.turndown = true;
                                    console.log('📌 [HOME] turndown 库已就绪');
                                }
                                resolve();
                            };
                            newScript.onerror = (err) => {
                                console.error('[HOME] 脚本加载失败:', src, err);
                                resolve();
                            };
                            // 同步执行，确保脚本加载完成后再继续
                            document.head.appendChild(newScript);
                        });
                    }
                };

                // 执行内联脚本
                const executeInlineScripts = () => {
                    // 找到内容区域中的 app 元素（我们创建的包装div）
                    const appElements = embedArea.querySelectorAll('[id^="tab-app-"]');
                    const cachedContent = this.tabContents[tabKey];
                    const expectedAppId = cachedContent && cachedContent.appId ? cachedContent.appId : null;
                    let targetAppId = expectedAppId;

                    if (!targetAppId && appElements.length > 0) {
                        targetAppId = appElements[0].id;
                        console.log('📌 [HOME] 找到挂载目标:', targetAppId);
                    } else if (!targetAppId) {
                        console.warn('[HOME] 未找到挂载目标元素，使用默认选择器');
                        // 如果没有找到，尝试使用内容区域的第一个子元素
                        const firstChild = embedArea.querySelector('.tab-content-embed > div');
                        if (firstChild && firstChild.id) {
                            targetAppId = firstChild.id;
                            console.log('📌 [HOME] 使用备用挂载目标:', targetAppId);
                        }
                    }

                    if (!targetAppId) {
                        console.error('[HOME] 无法确定挂载目标，跳过脚本执行');
                        return;
                    }
                    
                    inlineScripts.forEach((script, index) => {
                        try {
                            // 标记为已执行
                            script.setAttribute('data-executed', 'true');

                            // 获取脚本内容
                            let scriptContent = script.textContent.trim();
                            if (!scriptContent) {
                                return;
                            }

                            console.log('📌 [HOME] 处理内联脚本', index, '长度:', scriptContent.length);

                            // 注释掉 app.component 调用（header-component已经在主页注册）
                            scriptContent = scriptContent.replace(
                                /(app\.component\s*\(['"]header-component['"][^)]*\)\s*;?)/g,
                                '// $1'
                            );

                            // 更新挂载代码 - 将 #app 或 #main-app 替换为实际的挂载目标
                            if (scriptContent.includes('.mount')) {
                                console.log('📌 [HOME] 更新挂载目标为:', targetAppId);

                                // 优先替换 Vue.createApp(...).mount('#app') 形式
                                scriptContent = scriptContent.replace(
                                    /Vue\.createApp\s*\(([^)]*)\)\s*\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                    `Vue.createApp($1).mount('#${targetAppId}')`
                                );

                                // 替换单独的 app.mount('#app') 或 app.mount('#main-app')
                                scriptContent = scriptContent.replace(
                                    /app\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                    `app.mount('#${targetAppId}')`
                                );

                                // 替换 .mount('#app') 或 .mount('#main-app') 形式（catch-all）
                                scriptContent = scriptContent.replace(
                                    /\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                    `.mount('#${targetAppId}')`
                                );
                            }

                            combinedScriptContent += '\n' + scriptContent;
                        } catch (error) {
                            console.error('[HOME] 处理脚本失败:', error);
                        }
                    });

                    if (combinedScriptContent) {
                        console.log('📌 [HOME] 执行合并后的脚本，总长度:', combinedScriptContent.length);
                        console.log('📌 [HOME] 脚本内容前500字符:', combinedScriptContent.substring(0, 500));
                        console.log('📌 [HOME] 脚本内容后500字符:', combinedScriptContent.substring(combinedScriptContent.length - 500));

                        try {
                            // 使用数组构建函数体，避免模板字符串嵌套问题
                            const wrapperParts = [
                                'const targetId = ' + JSON.stringify(targetAppId) + ';',
                                'const tabKey = ' + JSON.stringify(tabKey) + ';',
                                'let createdVueApp = null;',
                                '',
                                "console.log('📌 [HOME] 开始执行脚本');",
                                "console.log('📌 [HOME] 挂载目标ID:', targetId);",
                                "console.log('📌 [HOME] 标签页key:', tabKey);",
                                "console.log('📌 [HOME] 全局tabVueInstances:', typeof window.homeTabVueInstances);",
                                '',
                                '// 检查目标元素是否存在',
                                'const targetElement = document.getElementById(targetId);',
                                "console.log('📌 [HOME] 目标元素是否存在:', !!targetElement);",
                                'if (!targetElement) {',
                                "    console.error('[HOME] 目标元素不存在:', targetId);",
                                '    return;',
                                '}',
                                '',
                                '// 修改 Vue.createApp 函数以捕获创建的实例',
                                'const originalCreateApp = Vue.createApp;',
                                'Vue.createApp = function(...args) {',
                                '    createdVueApp = originalCreateApp.apply(Vue, args);',
                                '',
                                '    // 保存原始的 mount 方法',
                                '    const originalMount = createdVueApp.mount;',
                                '',
                                '    // 重写 mount 方法以捕获挂载后的实例',
                                '    createdVueApp.mount = function(...mountArgs) {',
                                '        const result = originalMount.apply(createdVueApp, mountArgs);',
                                "        console.log('📌 [HOME] Vue实例已挂载:', targetId);",
                                '',
                                '        // 保存Vue实例到全局变量',
                                '        setTimeout(() => {',
                                "            console.log('📌 [HOME] 开始保存Vue实例...');",
                                "            console.log('📌 [HOME] window.homeTabVueInstances 类型:', typeof window.homeTabVueInstances);",
                                "            console.log('📌 [HOME] window.homeTabVueInstances:', window.homeTabVueInstances);",
                                '',
                                '            if (window.homeTabVueInstances) {',
                                "                console.log('📌 [HOME] 保存Vue实例，tabKey:', tabKey);",
                                '                window.homeTabVueInstances[tabKey] = createdVueApp;',
                                "                console.log('📌 [HOME] Vue实例已保存到window.homeTabVueInstances');",
                                "                console.log('📌 [HOME] 保存后的 window.homeTabVueInstances:', window.homeTabVueInstances);",
                                '            } else {',
                                "                console.error('[HOME] window.homeTabVueInstances 不存在');",
                                '            }',
                                '        }, 50);',
                                '',
                                '        return result;',
                                '    };',
                                '',
                                '    return createdVueApp;',
                                '};',
                                '',
                                'try {',
                                combinedScriptContent,
                                "    console.log('📌 [HOME] 脚本执行完成');",
                                '} catch (e) {',
                                "    console.error('[HOME] 脚本执行错误:', e);",
                                "    console.error('[HOME] 错误堆栈:', e.stack);",
                                '}',
                                '',
                                '// 恢复原始的 createApp',
                                'Vue.createApp = originalCreateApp;',
                                '',
                                '// 如果脚本执行后没有创建Vue实例，尝试从DOM获取',
                                'if (!createdVueApp) {',
                                '    setTimeout(() => {',
                                '        const appElement = document.getElementById(targetId);',
                                '        if (appElement && appElement.__vue_app__) {',
                                "            console.log('📌 [HOME] 从DOM获取Vue实例:', targetId);",
                                '            if (window.homeTabVueInstances) {',
                                '                window.homeTabVueInstances[tabKey] = appElement.__vue_app__;',
                                '            }',
                                '        }',
                                '    }, 100);',
                                '}'
                            ];
                            
                            const wrapperFunctionBody = wrapperParts.join('\n');
                            
                            // 使用 Function 构造函数执行脚本
                            const wrapperFunction = new Function(wrapperFunctionBody);
                            wrapperFunction();

                            console.log('📌 [HOME] 合并脚本执行完成');

                            // 检查 Vue 实例是否创建成功
                            setTimeout(() => {
                                const cachedContent = this.tabContents[tabKey];
                                const expectedAppId = cachedContent && cachedContent.appId ? cachedContent.appId : null;
                                const appEl = expectedAppId ? embedArea.querySelector(`#${expectedAppId}`) : null;
                                if (appEl) {
                                    console.log('📌 [HOME] 检查 Vue 实例状态:', appEl.id);
                                    console.log('📌 [HOME] appEl.__vue_app__:', appEl.__vue_app__);
                                }
                            }, 500);
                        } catch (error) {
                            console.error('[HOME] 执行合并脚本失败:', error);
                        }
                    } else {
                        console.warn('[HOME] 没有可执行的脚本内容');
                    }
                };

                // 先加载外部脚本，再执行内联脚本
                loadExternalScripts().then(() => {
                    console.log('📌 [HOME] 外部脚本加载完成');
                    console.log('📌 [HOME] 合并脚本长度:', combinedScriptContent.length);
                    console.log('📌 [HOME] 库加载状态:', requiredLibraries);

                    // 等待必要库加载完成的辅助函数
                    const waitForLibraries = (callback, maxWait = 3000) => {
                        const checkLibraries = () => {
                            // 直接检查全局变量是否已定义（库文件已通过正常路径加载）
                            const markedReady = !requiredLibraries.marked || typeof marked !== 'undefined';
                            const turndownReady = !requiredLibraries.turndown || typeof TurndownService !== 'undefined';
                            
                            if (markedReady && turndownReady) {
                                console.log('📌 [HOME] 所需库已就绪 (marked:', markedReady, ', turndown:', turndownReady, ')');
                                callback();
                                return true;
                            }
                            return false;
                        };
                        
                        if (checkLibraries()) return;
                        
                        // 轮询等待
                        let waited = 0;
                        const interval = setInterval(() => {
                            waited += 100;
                            if (checkLibraries() || waited >= maxWait) {
                                clearInterval(interval);
                                if (waited >= maxWait) {
                                    console.warn('[HOME] 等待库加载超时 (marked:', typeof marked !== 'undefined', ', turndown:', typeof TurndownService !== 'undefined', ')');
                                    callback();
                                }
                            }
                        }, 100);
                    };

                    // 确保 Vue 和必要库已加载
                    if (typeof Vue === 'undefined') {
                        console.error('[HOME] Vue 未加载，等待...');
                        setTimeout(() => {
                            if (typeof Vue !== 'undefined') {
                                console.log('📌 [HOME] Vue 已加载，等待库...');
                                waitForLibraries(() => {
                                    console.log('📌 [HOME] 执行脚本');
                                    executeInlineScripts();
                                });
                            } else {
                                console.error('[HOME] Vue 加载超时');
                            }
                        }, 500);
                    } else {
                        console.log('📌 [HOME] Vue 已就绪，等待库...');
                        waitForLibraries(() => {
                            console.log('📌 [HOME] 执行脚本');
                            executeInlineScripts();
                        });
                    }
                }).catch(error => {
                    console.error('[HOME] 加载外部脚本失败:', error);
                });
            }, 200);
        },

        /**
         * 重新加载当前标签页
         */
        reloadCurrentTab() {
            const tabs = TabsManager.getTabs();
            const tab = tabs.find(t => t.key === this.currentTabKey);

            if (tab && tab.key !== 'home') {
                // 清除缓存
                delete this.tabContents[tab.key];
                // 重新加载
                this.loadTabContent(tab);
            }
        },

        /**
         * 关闭错误标签页
         */
        closeErrorTab() {
            const tabKey = this.currentTabKey;
            this.tabError = null;
            TabsManager.closeTab(tabKey);
        },

        /**
         * 检查登录状态
         */
        checkLogin() {
            try {
                const token = Auth.getToken();
                if (!token) {
                    // 未登录，跳转到登录页
                    window.location.href = '/ems/common/pages/index.html';
                    return;
                }
                this.loading = false;
            } catch (error) {
                console.error('[HOME] 检查登录状态失败:', error);
                // 发生错误时，跳转到登录页
                window.location.href = '/ems/common/pages/index.html';
            }

        },

        /**
         * 初始化数据
         */
        initData() {
            console.log('🚀 [HOME] 开始初始化数据...');

            // 获取当前时间
            const now = new Date();
            this.loginTime = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // 可以在这里调用后端 API 获取用户信息
            // this.fetchUserInfo();
        },

        /**
         * 获取首页统计数据
         */
        async fetchStats() {
            try {
                console.log('🔍 [HOME] 开始获取统计数据...');
                const response = await fetch('/homeStats/getStats', {
                    method: 'POST'
                });

                console.log('📦 [HOME] 统计响应:', response);
                console.log('📦 [HOME] 响应类型:', typeof response);
                console.log('📦 [HOME] 响应code:', response ? response.code : 'undefined');
                console.log('📦 [HOME] 响应data:', response ? response.data : 'undefined');

                if (response && response.code === 200 && response.data) {
                    const data = response.data;
                    this.stats = [];

                    console.log('🔍 [HOME] 角色编码:', data.roleCode);
                    
                    // 将角色编码转为大写进行比较
                    const roleCodeUpper = (data.roleCode || '').toUpperCase();

                    if (roleCodeUpper === 'TEACHER' || roleCodeUpper === 'ADMIN') {
                        // 老师和管理员统计
                        this.stats.push({ label: '管理的课程数', value: data.managedCourseCount || 0 });
                        this.stats.push({ label: '维护的实验模板数', value: data.maintainedTemplateCount || 0 });
                        this.stats.push({ label: '已评分的实验报告数', value: data.gradedReportCount || 0 });
                        this.stats.push({ label: '待评分的实验报告数', value: data.pendingGradeReportCount || 0 });
                        console.log('✅ [HOME] 老师/管理员统计数据:', this.stats);
                    } else if (roleCodeUpper === 'STUDENT') {
                        // 学生统计
                        this.stats.push({ label: '学的课程数', value: data.enrolledCourseCount || 0 });
                        this.stats.push({ label: '课程所有报告总和', value: data.totalTemplateCount || 0 });
                        this.stats.push({ label: '已提交的实验报告数', value: data.submittedReportCount || 0 });
                        this.stats.push({ label: '待提交的实验报告数', value: data.pendingSubmitReportCount || 0 });
                        console.log('✅ [HOME] 学生统计数据:', this.stats);
                    } else {
                        console.warn('⚠️ [HOME] 未知角色:', data.roleCode);
                    }
                    console.log('✅ [HOME] 统计数据加载成功', this.stats);
                } else {
                    console.error('❌ [HOME] 统计响应格式错误:', response);
                    // 设置默认统计数据，确保页面有内容显示
                    this.stats = [
                        { label: '数据加载中', value: 0 },
                        { label: '数据加载中', value: 0 },
                        { label: '数据加载中', value: 0 },
                        { label: '数据加载中', value: 0 }
                    ];
                }
            } catch (error) {
                console.error('❌ [HOME] 获取统计数据失败:', error);
                // 设置默认统计数据，确保页面有内容显示
                this.stats = [
                    { label: '数据加载失败', value: 0 },
                    { label: '数据加载失败', value: 0 },
                    { label: '数据加载失败', value: 0 },
                    { label: '数据加载失败', value: 0 }
                ];
            }
        },

        /**
         * 获取菜单列表
         */
        async fetchMenuList() {
            try {
                console.log('🔍 [HOME] 开始获取菜单列表...');

                // 直接使用fetch，让拦截器自动处理token和前缀
                const response = await fetch('/menu/list', {
                    method: 'GET'
                });

                console.log('📦 [HOME] 菜单响应:', response);

                if (response && response.code === 200 && Array.isArray(response.data)) {
                    this.menuList = response.data;
                    this.processMenus();
                    console.log('✅ [HOME] 菜单列表加载成功，共', response.data.length, '个菜单');
                } else {
                    console.error('❌ [HOME] 菜单响应格式错误:', response);
                    // 设置为空数组，确保页面能正常显示
                    this.menuList = [];
                    this.menuDirectories = [];
                }
            } catch (error) {
                console.error('❌ [HOME] 获取菜单列表失败:', error);
                // 发生错误时设置为空数组，确保页面能正常显示
                this.menuList = [];
                this.menuDirectories = [];
            }
        },

        /**
         * 处理菜单数据
         */
        processMenus() {
            // 获取所有菜单目录（parentId = '0'，menuType = 'D'）
            this.menuDirectories = this.menuList.filter(menu =>
                menu.parentId === '0' && menu.menuType === 'D'
            );
        },

        /**
         * 根据目录ID获取菜单列表
         */
        getMenusByDirectory(directoryId) {
            return this.menuList.filter(menu =>
                menu.parentId === directoryId && menu.menuType === 'M'
            );
        },

        /**
         * 切换目录展开/收起
         */
        toggleDirectory(directoryId) {
            const index = this.expandedDirectories.indexOf(directoryId);
            if (index > -1) {
                this.expandedDirectories.splice(index, 1);
            } else {
                this.expandedDirectories.push(directoryId);
            }
        },

        /**
         * 导航到菜单页面
         */
        navigateToMenu(menu) {
            if (menu.path) {
                TabsManager.openTab(menu);
            } else {
                console.warn('菜单没有配置路径:', menu);
            }
        },

        /**
         * 获取目录图标
         */
        getDirectoryIcon(menuName) {
            const iconMap = {
                '系统管理': '⚙️',
                '用户管理': '👥',
                '实验管理': '🔬',
                '数据分析': '📊',
                '权限管理': '🔐',
                '组织管理': '🏢'
            };
            return iconMap[menuName] || '📁';
        },

        /**
         * 获取菜单图标
         */
        getMenuIcon(menuName) {
            const iconMap = {
                '用户列表': '👤',
                '角色管理': '👥',
                '菜单管理': '📋',
                '组织列表': '🏢',
                '实验项目': '📝',
                '实验数据': '📊',
                '数据统计': '📈'
            };
            return iconMap[menuName] || '📄';
        },

        /**
         * 获取用户信息
         */
        async fetchUserInfo() {
            try {
                const response = await API.getUserInfo();
                if (response.code === 200) {
                    this.username = response.data.username || this.username;
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
            }
        },

        /**
         * 获取公告列表（分页）
         */
        async fetchNoticeList() {
            this.noticeLoading = true;
            try {
                const { current, size } = this.noticePagination;
                const response = await fetch(`/notice/homeList?page=${current}&size=${size}`, {
                    method: 'GET'
                });
                if (response && response.code === 200 && response.data) {
                    this.noticeList = response.data.records || [];
                    this.noticePagination.total = response.data.total || 0;
                    this.noticePagination.pages = response.data.pages || 0;
                    console.log('✅ [HOME] 公告列表加载成功，共', this.noticeList.length, '条');
                }
            } catch (error) {
                console.error('❌ [HOME] 获取公告列表失败:', error);
            } finally {
                this.noticeLoading = false;
            }
        },

        /**
         * 切换公告页码
         */
        changeNoticePage(page) {
            if (page < 1 || page > this.noticePagination.pages) return;
            this.noticePagination.current = page;
            this.fetchNoticeList();
        },

        /**
         * 显示公告详情
         */
        showNoticeDetail(item) {
            this.currentNotice = item;
            this.showNoticeDetailModal = true;
        },

        /**
         * 关闭公告详情弹窗
         */
        closeNoticeDetailModal() {
            this.showNoticeDetailModal = false;
            this.currentNotice = null;
        },

        /**
         * 获取消息列表（分页）
         */
        async fetchTodoList() {
            this.todoLoading = true;
            try {
                const { current, size } = this.todoPagination;
                const response = await fetch(`/message/homeList?page=${current}&size=${size}`, {
                    method: 'GET'
                });
                if (response && response.code === 200 && response.data) {
                    this.todoList = response.data.records || [];
                    this.todoPagination.total = response.data.total || 0;
                    this.todoPagination.pages = response.data.pages || 0;
                    // 计算未读数量
                    this.unreadCount = this.todoList.filter(item => item.status === 0).length;
                    console.log('✅ [HOME] 消息列表加载成功，共', this.todoList.length, '条，未读', this.unreadCount, '条');
                }
            } catch (error) {
                console.error('❌ [HOME] 获取消息列表失败:', error);
            } finally {
                this.todoLoading = false;
            }
        },

        /**
         * 切换消息页码
         */
        changeTodoPage(page) {
            if (page < 1 || page > this.todoPagination.pages) return;
            this.todoPagination.current = page;
            this.fetchTodoList();
        },

        /**
         * 显示消息详情
         */
        async showTodoDetail(item) {
            this.currentTodo = item;
            this.showTodoDetailModal = true;
            // 如果消息未读，标记为已读
            if (item.status === 0) {
                await this.markTodoAsRead(item.id);
            }
        },

        /**
         * 标记消息为已读
         */
        async markTodoAsRead(todoId) {
            try {
                const response = await fetch('/message/markRead', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: todoId })
                });
                if (response && response.code === 200) {
                    // 更新本地状态
                    const todo = this.todoList.find(t => t.id === todoId);
                    if (todo) {
                        todo.status = 1;
                        this.unreadCount = this.todoList.filter(item => item.status === 0).length;
                    }
                    console.log('✅ [HOME] 消息已标记为已读:', todoId);
                }
            } catch (error) {
                console.error('❌ [HOME] 标记消息已读失败:', error);
            }
        },

        /**
         * 关闭消息详情弹窗
         */
        closeTodoDetailModal() {
            this.showTodoDetailModal = false;
            this.currentTodo = null;
        },

        /**
         * 格式化日期时间
         */
        formatDateTime(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return dateStr;
            }
        },

        /**
         * 退出登录
         */
        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                API.logout();
            }
        },

        /**
         * 设置全局错误处理
         */
        setupGlobalErrorHandling() {
            // 监听 window 的 error 事件
            window.addEventListener('error', (event) => {
                // 只处理页面级别的错误，忽略资源加载错误
                if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
                    return;
                }

                console.error('[HOME] 页面错误:', event);
                this.showGlobalError = true;
                this.globalErrorMessage = event.message || '页面加载失败';
            }, false);

            // 监听未处理的 Promise 拒绝
            window.addEventListener('unhandledrejection', (event) => {
                console.error('[HOME] 未处理的 Promise 拒绝:', event.reason);
            });
        },

        /**
         * 刷新页面
         */
        retryPage() {
            window.location.reload();
        },

        /**
         * 返回首页
         */
        goHome() {
            window.location.href = '/ems/common/pages/home.html';

        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
