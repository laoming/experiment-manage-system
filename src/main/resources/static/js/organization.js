/**
 * 组织管理逻辑
 */
const { createApp } = Vue;

// 树形组织项组件
const TreeItem = {
    name: 'TreeItem',
    props: {
        node: Object,
        selectedOrg: Object
    },
    emits: ['select'],
    template: `
        <div class="tree-node-item">
            <div
                class="tree-node-content"
                :class="{ 'selected': selectedOrg && selectedOrg.id === node.id, 'root': !node.parentId || node.parentId === '' }"
                @click.stop="handleClick"
            >
                <span class="tree-toggle" @click.stop="toggleExpand">
                    <span v-if="hasChildren" class="toggle-icon">{{ expanded ? '▼' : '▶' }}</span>
                    <span v-else class="toggle-icon">●</span>
                </span>
                <span class="tree-label">
                    {{ node.orgName }}
                    <span v-if="!node.parentId || node.parentId === ''" class="root-badge">根</span>
                </span>
                <span class="tree-code">({{ node.orgCode }})</span>
            </div>
            <div v-if="hasChildren && expanded" class="tree-children">
                <tree-item
                    v-for="child in node.children"
                    :key="child.id"
                    :node="child"
                    :selected-org="selectedOrg"
                    @select="$emit('select', $event)"
                ></tree-item>
            </div>
        </div>
    `,
    data() {
        return {
            expanded: false
        };
    },
    computed: {
        hasChildren() {
            return this.node.children && this.node.children.length > 0;
        }
    },
    methods: {
        handleClick() {
            console.log('🌳 [TREE] 树节点被点击:', this.node);
            console.log('🌳 [TREE] 发出 select 事件');
            this.$emit('select', this.node);
        },
        toggleExpand() {
            this.expanded = !this.expanded;
        }
    }
};

const app = createApp({
    data() {
        return {
            loading: false,
            organizationList: [],
            orgTree: [],
            parentOrgList: [],
            selectedOrg: null,
            queryForm: {
                orgName: '',
                orgCode: ''
            },
            showOrgModal: false,
            orgModalMode: 'add',
            orgForm: {
                id: '',
                parentId: '',
                orgName: '',
                orgCode: '',
                description: ''
            },
            showUserProfileModal: false,
            userProfileForm: {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
        };
    },

    mounted() {
        this.checkLogin();
        this.fetchOrganizationList();
        this.fetchParentOrgList();
    },

    methods: {
        /**
         * 检查登录状态
         */
        checkLogin() {
            const token = API.getToken();
            if (!token) {
                window.location.href = '/ems/pages/index.html';
                return;
            }
        },

        /**
         * 获取组织列表
         */
        async fetchOrganizationList() {
            this.loading = true;
            try {
                console.log('📋 [ORG] ========== 开始获取组织列表 ==========');
                console.log('📋 [ORG] 查询条件:', this.queryForm);
                const response = await API.getOrganizationList();
                console.log('✅ [ORG] 获取组织列表成功:', response);
                console.log('📋 [ORG] 响应数据:', response.data);

                if (response.code === 200) {
                    this.organizationList = response.data || [];
                    console.log('📋 [ORG] organizationList 已设置，长度:', this.organizationList.length);

                    if (this.organizationList.length > 0) {
                        console.log('📋 [ORG] 第一个组织示例:', this.organizationList[0]);
                    }

                    this.buildOrgTree();
                } else {
                    this.showError('获取组织列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 获取组织列表失败:', error);
                this.showError('获取组织列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 构建组织树
         */
        buildOrgTree() {
            console.log('🌳 [ORG] 开始构建组织树，organizationList 长度:', this.organizationList.length);

            const orgMap = {};
            const roots = [];

            // 构建映射
            this.organizationList.forEach((org, index) => {
                console.log(`🌳 [ORG] 处理组织 [${index}]:`, org);

                orgMap[org.id] = {
                    id: org.id,
                    parentId: org.parentId,
                    orgName: org.orgName,
                    orgCode: org.orgCode,
                    fullPath: org.fullPath || '',
                    description: org.description || '',
                    createTime: org.createTime,
                    updateTime: org.updateTime,
                    children: []
                };

                console.log(`🌳 [ORG] 树节点已创建，id: ${org.id}, orgName: ${orgMap[org.id].orgName}`);
            });

            // 构建树形结构
            this.organizationList.forEach(org => {
                const node = orgMap[org.id];
                if (!org.parentId || org.parentId === '' || org.parentId === '0') {
                    roots.push(node);
                } else {
                    if (orgMap[org.parentId]) {
                        orgMap[org.parentId].children.push(node);
                    }
                }
            });

            this.orgTree = roots;
            console.log('🌳 [ORG] 组织树构建完成，根节点数:', roots.length);
        },

        /**
         * 获取父组织列表（用于新增时选择父组织）
         */
        async fetchParentOrgList() {
            try {
                console.log('📋 [ORG] 开始获取父组织列表...');
                const response = await API.getOrganizationList();
                console.log('✅ [ORG] 获取父组织列表成功:', response);

                if (response.code === 200) {
                    this.parentOrgList = response.data || [];
                } else {
                    this.showError('获取父组织列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 获取父组织列表失败:', error);
                this.showError('获取父组织列表失败: ' + error.message);
            }
        },

        /**
         * 选中组织
         */
        selectOrg(org) {
            console.log('📍 [ORG] ========== 选中组织 ==========');
            console.log('📍 [ORG] 接收到的 org 参数:', org);

            this.selectedOrg = org;

            console.log('📍 [ORG] 设置后的 selectedOrg:', this.selectedOrg);
            console.log('📍 [ORG] selectedOrg 类型:', typeof this.selectedOrg);
            console.log('📍 [ORG] selectedOrg 是否为 null:', this.selectedOrg === null);
            console.log('📍 [ORG] selectedOrg 是否为 undefined:', this.selectedOrg === undefined);

            if (this.selectedOrg) {
                console.log('📍 [ORG] 选中的组织字段:');
                console.log('📍 [ORG]   - id:', this.selectedOrg.id);
                console.log('📍 [ORG]   - parentId:', this.selectedOrg.parentId);
                console.log('📍 [ORG]   - orgName:', this.selectedOrg.orgName);
                console.log('📍 [ORG]   - orgCode:', this.selectedOrg.orgCode);
                console.log('📍 [ORG]   - description:', this.selectedOrg.description);
                console.log('📍 [ORG]   - fullPath:', this.selectedOrg.fullPath);
            } else {
                console.log('📍 [ORG] selectedOrg 为空，无法显示组织信息');
            }
        },

        /**
         * 搜索
         */
        handleSearch() {
            this.fetchOrganizationList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                orgName: '',
                orgCode: ''
            };
            this.fetchOrganizationList();
        },

        /**
         * 打开新增组织弹窗
         */
        openAddModal() {
            console.log('➕ [ORG] openAddModal 被调用');

            // 创建全新的 orgForm 对象
            this.orgForm = {
                id: '',
                parentId: this.selectedOrg ? this.selectedOrg.id : '',
                orgName: '',
                orgCode: '',
                description: ''
            };

            console.log('➕ [ORG] 新增组织表单数据:', this.orgForm);

            this.orgModalMode = 'add';
            this.showOrgModal = true;

            console.log('➕ [ORG] 弹窗已显示');
        },

        /**
         * 打开编辑组织弹窗
         */
        openEditModal(org) {
            console.log('='.repeat(60));
            console.log('📝 [ORG] ========== openEditModal 被调用 ==========');
            console.log('📝 [ORG] 参数 org:', org);
            console.log('📝 [ORG] 参数 org 类型:', typeof org);
            console.log('📝 [ORG] 参数 org 是否为事件对象:', org && typeof org.type === 'string' && org.type.startsWith('pointer'));
            console.log('📝 [ORG] 当前选中的组织 selectedOrg:', this.selectedOrg);

            // 检查 org 参数是否为事件对象，如果是则忽略，使用 selectedOrg
            let targetOrg;
            if (org && typeof org === 'object' && org.id && typeof org.id === 'string') {
                // org 是组织对象
                console.log('📝 [ORG] org 是组织对象，使用 org');
                targetOrg = org;
            } else {
                // org 是事件对象或 undefined，使用 selectedOrg
                console.log('📝 [ORG] org 是事件对象或未定义，使用 selectedOrg');
                targetOrg = this.selectedOrg;
            }

            if (!targetOrg) {
                console.error('📝 [ORG] 没有选中组织，无法编辑');
                this.showError('请先选择一个组织');
                return;
            }

            console.log('📝 [ORG] 目标组织 targetOrg:', targetOrg);
            console.log('📝 [ORG] 目标组织字段值:', {
                id: targetOrg.id,
                parentId: targetOrg.parentId,
                parentId类型: typeof targetOrg.parentId,
                orgName: targetOrg.orgName,
                orgCode: targetOrg.orgCode,
                description: targetOrg.description,
                fullPath: targetOrg.fullPath
            });

            this.orgModalMode = 'edit';

            // 编辑模式：保留原始 parentId 值（包括 '0'）
            this.orgForm = {
                id: targetOrg.id,
                parentId: targetOrg.parentId || '',
                orgName: targetOrg.orgName,
                orgCode: targetOrg.orgCode,
                description: targetOrg.description || ''
            };

            console.log('📝 [ORG] orgForm 已设置为组织的原始数据:', this.orgForm);
            console.log('📝 [ORG] orgForm.orgName:', this.orgForm.orgName);
            console.log('📝 [ORG] orgForm.orgCode:', this.orgForm.orgCode);
            console.log('📝 [ORG] orgForm.parentId:', this.orgForm.parentId);
            console.log('📝 [ORG] orgForm.parentId 类型:', typeof this.orgForm.parentId);
            console.log('📝 [ORG] orgForm.description:', this.orgForm.description);

            // 显示弹窗
            this.showOrgModal = true;

            console.log('📝 [ORG] 弹窗已显示，等待 DOM 更新...');

            // 使用 $nextTick 确保 DOM 更新后检查
            this.$nextTick(() => {
                console.log('📝 [ORG] ========== $nextTick 回调，检查 DOM ==========');
                const nameInput = document.querySelector('input[placeholder="请输入组织名称"]');
                const codeInput = document.querySelector('input[placeholder="请输入组织编码"]');
                const descTextarea = document.querySelector('textarea[placeholder="请输入组织描述"]');
                const parentIdSelect = document.querySelector('select.form-input');

                console.log('📝 [ORG] DOM 元素检查:');
                console.log('📝 [ORG] 上级组织选择框:', parentIdSelect ? parentIdSelect.value : '未找到');
                console.log('📝 [ORG] 组织名称输入框:', nameInput ? nameInput.value : '未找到');
                console.log('📝 [ORG] 组织编码输入框:', codeInput ? codeInput.value : '未找到');
                console.log('📝 [ORG] 组织描述文本域:', descTextarea ? descTextarea.value : '未找到');
                console.log('='.repeat(60));
            });
        },

        /**
         * 关闭组织弹窗
         */
        closeOrgModal() {
            console.log('📝 [ORG] closeOrgModal 被调用');
            this.showOrgModal = false;

            // 每次关闭都清空表单数据
            this.orgForm = {
                id: '',
                parentId: '',
                orgName: '',
                orgCode: '',
                description: ''
            };
            console.log('📝 [ORG] 表单数据已清空');
        },

        /**
         * 提交组织表单
         */
        async handleOrgSubmit() {
            // 验证必填字段
            if (!this.orgForm.orgName.trim()) {
                this.showError('组织名称不能为空');
                return;
            }
            if (!this.orgForm.orgCode.trim()) {
                this.showError('组织编码不能为空');
                return;
            }

            try {
                let response;
                if (this.orgModalMode === 'add') {
                    console.log('➕ [ORG] 新增组织:', this.orgForm);
                    response = await API.addOrganization(this.orgForm);
                } else {
                    console.log('✏️ [ORG] 更新组织:', this.orgForm);
                    response = await API.updateOrganization(this.orgForm);
                }

                console.log('✅ [ORG] 操作成功:', response);

                if (response.code === 200) {
                    this.showSuccess(this.orgModalMode === 'add' ? '新增组织成功' : '更新组织成功');
                    this.closeOrgModal();
                    this.selectedOrg = null;
                    this.fetchOrganizationList();
                } else {
                    this.showError((this.orgModalMode === 'add' ? '新增' : '更新') + '组织失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 操作失败:', error);
                this.showError((this.orgModalMode === 'add' ? '新增' : '更新') + '组织失败: ' + error.message);
            }
        },

        /**
         * 删除组织
         */
        async handleDelete() {
            if (!this.selectedOrg) {
                this.showError('请先选择一个组织');
                return;
            }

            if (!confirm(`确定要删除组织 "${this.selectedOrg.orgName}" 吗？`)) {
                return;
            }

            try {
                console.log('🗑️ [ORG] 删除组织:', { id: this.selectedOrg.id, orgName: this.selectedOrg.orgName });
                const response = await API.deleteOrganization({ id: this.selectedOrg.id });
                console.log('✅ [ORG] 删除组织成功:', response);

                if (response.code === 200) {
                    this.showSuccess('删除组织成功');
                    this.selectedOrg = null;
                    this.fetchOrganizationList();
                } else {
                    this.showError('删除组织失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 删除组织失败:', error);
                this.showError('删除组织失败: ' + error.message);
            }
        },

        /**
         * 显示成功消息
         */
        showSuccess(message) {
            alert('✅ ' + message);
        },

        /**
         * 显示错误消息
         */
        showError(message) {
            alert('❌ ' + message);
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
         * 打开个人信息弹窗
         */
        openUserProfileModal() {
            const userInfo = API.getUserInfoFromToken();
            this.userProfileForm = {
                username: userInfo.username || '',
                displayName: userInfo.displayName || '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.showUserProfileModal = true;
        },

        /**
         * 关闭个人信息弹窗
         */
        closeUserProfileModal() {
            this.showUserProfileModal = false;
            this.userProfileForm = {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        },

        /**
         * 提交个人信息修改
         */
        async handleUserProfileSubmit() {
            // 验证用户名称
            if (!this.userProfileForm.displayName.trim()) {
                alert('请输入用户名称');
                return;
            }

            // 如果要修改密码
            if (this.userProfileForm.newPassword || this.userProfileForm.oldPassword) {
                if (!this.userProfileForm.oldPassword) {
                    alert('请输入旧密码');
                    return;
                }
                if (!this.userProfileForm.newPassword) {
                    alert('请输入新密码');
                    return;
                }
                if (this.userProfileForm.newPassword !== this.userProfileForm.confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }
                if (this.userProfileForm.newPassword.length < 6) {
                    alert('新密码长度不能少于6位');
                    return;
                }
            }

            try {
                // 更新用户信息
                const response = await API.updateUser({
                    username: this.userProfileForm.username,
                    displayName: this.userProfileForm.displayName
                });

                if (response.code === 200) {
                    // 如果修改了密码，调用重置密码接口
                    if (this.userProfileForm.newPassword) {
                        const passwordResponse = await API.resetPassword({
                            username: this.userProfileForm.username,
                            password: this.userProfileForm.newPassword
                        });

                        if (passwordResponse.code === 200) {
                            alert('个人信息和密码修改成功，请重新登录');
                            API.logout();
                        } else {
                            alert('密码修改失败：' + (passwordResponse.message || '未知错误'));
                        }
                    } else {
                        alert('个人信息修改成功');
                        this.closeUserProfileModal();
                    }
                } else {
                    alert('个人信息修改失败：' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('修改个人信息失败:', error);
                alert('修改失败：' + (error.message || '网络错误，请稍后重试'));
            }
        }
    }
});

// 注册树形组件
app.component('tree-item', TreeItem);

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
