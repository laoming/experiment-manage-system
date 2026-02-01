/**
 * 首页逻辑
 */
const { createApp } = Vue;

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
            tabContents: {},
            currentTabContent: null,
            currentTabScripts: null,  // 保存当前标签页的脚本HTML（v-html不会执行脚本，所以需要单独处理）
            loadingTab: false,
            tabError: null,
            previousTabKey: null
        };
    },

    mounted() {
        this.checkLogin();
        this.initData();
        this.fetchMenuList();

        // 设置全局错误处理
        this.setupGlobalErrorHandling();

        // 监听标签页切换事件
        window.addEventListener('tab-switch', this.handleTabSwitch);
    },

    beforeUnmount() {
        // 移除事件监听
        window.removeEventListener('tab-switch', this.handleTabSwitch);
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

            // 清理之前的标签页
            if (this.previousTabKey && this.previousTabKey !== tabKey) {
                this.cleanupPreviousTab();
            }

            this.currentTabKey = tabKey;

            if (tabKey === 'home') {
                // 首页，清空内容区域
                this.currentTabContent = null;
                this.tabError = null;
                this.previousTabKey = 'home';
                return;
            }

            // 获取标签页信息
            const tabs = TabsManager.getTabs();
            const tab = tabs.find(t => t.key === tabKey);

            if (!tab) {
                console.warn('[HOME] 标签页不存在:', tabKey);
                this.currentTabContent = null;
                this.tabError = '标签页不存在';
                this.previousTabKey = tabKey;
                return;
            }

            // 检查是否已缓存
            if (this.tabContents[tabKey]) {
                console.log('📌 [HOME] 标签页内容已缓存:', tabKey);
                const cachedData = this.tabContents[tabKey];
                this.currentTabContent = cachedData.html;
                this.currentTabScripts = cachedData.scripts;
                this.tabError = null;
                this.previousTabKey = tabKey;

                // 不重新执行脚本，保持Vue实例状态
                console.log('📌 [HOME] 使用缓存的Vue实例，不重新执行脚本');
                return;
            }

            // 加载标签页内容
            await this.loadTabContent(tab);
            this.previousTabKey = tabKey;
        },

        /**
         * 清理之前的标签页
         */
        cleanupPreviousTab() {
            console.log('📌 [HOME] 清理之前的标签页:', this.previousTabKey);

            const contentArea = document.getElementById('tab-content-area');
            if (contentArea) {
                // 移除之前的Vue应用实例
                const oldApps = contentArea.querySelectorAll('[id^="tab-app-"]');
                oldApps.forEach(oldApp => {
                    try {
                        // 尝试获取Vue实例并销毁
                        const appInstance = oldApp.__vue_app__;
                        if (appInstance && typeof appInstance.unmount === 'function') {
                            appInstance.unmount();
                        }
                    } catch (error) {
                        console.warn('[HOME] 清理Vue实例失败:', error);
                    }
                });
            }
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

                // 缓存内容（包括HTML和脚本，分开存储）
                const { html: mainContentHtml, scripts: scriptsHtml } = mainContent;
                this.tabContents[tab.key] = { html: mainContentHtml, scripts: scriptsHtml };

                // 设置当前内容
                this.currentTabContent = mainContentHtml;

                // 将脚本HTML字符串保存到临时存储，供executeTabScripts使用
                this.currentTabScripts = scriptsHtml;

                // 执行页面脚本
                this.$nextTick(() => {
                    this.executeTabScripts(tab.key);
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

            // 提取head中的样式链接
            const head = doc.head;
            const styleLinks = [];
            const styleTags = [];

            // 收集CSS链接
            head.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                const href = link.getAttribute('href');
                // 只收集尚未加载的CSS（避免重复）
                if (href && !document.querySelector(`link[href="${href}"]`)) {
                    styleLinks.push(link.outerHTML);
                }
            });

            // 收集内联样式
            head.querySelectorAll('style').forEach(style => {
                styleTags.push(style.outerHTML);
            });

            console.log('📌 [HOME] 找到', styleLinks.length, '个新CSS链接');
            console.log('📌 [HOME] 找到', styleTags.length, '个内联样式');

            // 提取body内容
            const body = doc.body;

            // 先生成唯一的app ID
            const uniqueId = `tab-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('📌 [HOME] 生成app ID:', uniqueId);

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

                // 返回对象：HTML和脚本分开（v-html不会执行脚本，所以脚本需要单独处理）
                return {
                    html: [...styleLinks, ...styleTags, '', mainContentClone.outerHTML].join('\n'),
                    scripts: scripts,
                    appId: uniqueId
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
                appId: null
            };
        },

        /**
         * 执行标签页中的脚本
         */
        executeTabScripts(tabKey) {
            console.log('📌 [HOME] 执行标签页脚本:', tabKey);

            const contentArea = document.getElementById('tab-content-area');
            if (!contentArea) {
                console.warn('[HOME] 内容区域不存在');
                return;
            }

            // 检查是否已经存在Vue应用实例，如果存在则不重新执行
            const appElements = contentArea.querySelectorAll('[id^="tab-app-"]');
            if (appElements.length > 0) {
                const appEl = appElements[0];
                if (appEl.__vue_app__) {
                    console.log('📌 [HOME] Vue应用实例已存在，跳过脚本执行:', appEl.id);
                    return;
                }
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
                            continue;
                        }

                        // 对于业务逻辑脚本（如 user.js），我们需要获取内容并作为内联脚本执行
                        // 这样才能动态修改挂载目标
                        if (src.includes('.js') && !src.includes('vue') && !src.includes('api') && 
                            (src.includes('user') || src.includes('organization') || src.includes('course') || 
                             src.includes('experiment') || src.includes('login') || src.includes('org'))) {
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
                                    const appElements = contentArea.querySelectorAll('[id^="tab-app-"]');
                                    if (appElements.length > 0) {
                                        const targetAppId = appElements[0].id;
                                        console.log('📌 [HOME] 为外部脚本更新挂载目标:', targetAppId);

                                        // 替换各种形式的挂载代码（包括 #app 和 #main-app）
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
                                resolve();
                            };
                            newScript.onerror = (err) => {
                                console.error('[HOME] 脚本加载失败:', src, err);
                                resolve();
                            };
                            document.head.appendChild(newScript);
                        });
                    }
                };

                // 执行内联脚本
                const executeInlineScripts = () => {
                    // 找到内容区域中的 app 元素（我们创建的包装div）
                    const appElements = contentArea.querySelectorAll('[id^="tab-app-"]');
                    let targetAppId = null;
                    
                    if (appElements.length > 0) {
                        targetAppId = appElements[0].id;
                        console.log('📌 [HOME] 找到挂载目标:', targetAppId);
                    } else {
                        console.warn('[HOME] 未找到挂载目标元素，使用默认选择器');
                        // 如果没有找到，尝试使用内容区域的第一个子元素
                        const firstChild = contentArea.querySelector('.tab-content-embed > div');
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

                                // 替换各种形式的挂载代码（包括 #app 和 #main-app）
                                scriptContent = scriptContent.replace(
                                    /\.mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                    `.mount('#${targetAppId}')`
                                );
                                scriptContent = scriptContent.replace(
                                    /mount\s*\(\s*['"](#app|#main-app)['"]\s*\)/g,
                                    `mount('#${targetAppId}')`
                                );
                            }

                            // 替换 document.getElementById('main-app') 或 document.getElementById('app')
                            scriptContent = scriptContent.replace(
                                /document\.getElementById\(['"](main-app|app)['"]\)/g,
                                `document.getElementById('${targetAppId}')`
                            );

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
                            // 将脚本内容包装在 try-catch 中，避免错误影响其他脚本
                            // 使用 IIFE 创建独立作用域，避免变量名冲突
                            const wrappedContent = `
(function() {
    try {
${combinedScriptContent}
    } catch (e) {
        console.error('[HOME] 脚本执行错误:', e);
    }
})();`;

                            // 创建并执行脚本
                            const newScript = document.createElement('script');
                            newScript.textContent = wrappedContent;
                            document.head.appendChild(newScript);

                            console.log('📌 [HOME] 合并脚本执行完成');

                            // 检查 Vue 实例是否创建成功
                            setTimeout(() => {
                                const appElements = contentArea.querySelectorAll('[id^="tab-app-"]');
                                if (appElements.length > 0) {
                                    const appEl = appElements[0];
                                    console.log('📌 [HOME] 检查 Vue 实例状态:', appEl.id);
                                    console.log('📌 [HOME] appEl.__vue_app__:', appEl.__vue_app__);
                                }
                            }, 500);

                            // 延迟移除脚本
                            setTimeout(() => {
                                if (document.head.contains(newScript)) {
                                    document.head.removeChild(newScript);
                                }
                            }, 1000);
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
                    
                    // 确保 Vue 已加载
                    if (typeof Vue === 'undefined') {
                        console.error('[HOME] Vue 未加载，等待...');
                        setTimeout(() => {
                            if (typeof Vue !== 'undefined') {
                                console.log('📌 [HOME] Vue 已加载，执行脚本');
                                executeInlineScripts();
                            } else {
                                console.error('[HOME] Vue 加载超时');
                            }
                        }, 500);
                    } else {
                        console.log('📌 [HOME] Vue 已就绪，执行脚本');
                        executeInlineScripts();
                    }
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
         * 检查登录状态
         */
        checkLogin() {
            try {
                const token = Auth.getToken();
                if (!token) {
                    // 未登录，跳转到登录页
                    window.location.href = '/ems/pages/index.html';
                    return;
                }
                this.loading = false;
            } catch (error) {
                console.error('[HOME] 检查登录状态失败:', error);
                // 发生错误时，跳转到登录页
                window.location.href = '/ems/pages/index.html';
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
            window.location.href = '/ems/pages/home.html';
        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
