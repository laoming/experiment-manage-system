/**
 * 组织管理逻辑
 */

// 树形组织项组件
const TreeItem = {
    name: 'TreeItem',
    props: {
        node: Object,
        selectedOrg: Object,
        expandedAll: {
            type: Boolean,
            default: false
        }
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
                    :expanded-all="expandedAll"
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
    watch: {
        expandedAll(newVal) {
            this.expanded = newVal;
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

const app = Vue.createApp({
    data() {
        return {
            loading: true,
            organizationList: [],
            orgTree: [],
            parentOrgList: [],
            selectedOrg: null,
            expandedAll: false,
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
            try {
                const token = Auth.getToken();
                if (!token) {
                    window.location.href = '/ems/common/pages/index.html';
                    return;
                }
            } catch (error) {
                console.error('[ORG] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
        },

        /**
         * 获取组织列表
         */
        async fetchOrganizationList() {
            this.loading = true;
            try {
                console.log('📋 [ORG] 开始获取组织列表');
                const result = await fetch('/organization/list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });
                console.log('✅ [ORG] 获取组织列表成功:', result);

                if (result.code === 200) {
                    this.organizationList = result.data || [];
                    this.buildOrgTree();
                } else {
                    this.showError('获取组织列表失败: ' + (result.message || '未知错误'));
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
            console.log('🌳 [ORG] 开始构建组织树，数量:', this.organizationList.length);

            const orgMap = {};
            const roots = [];

            // 构建映射
            this.organizationList.forEach(org => {
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
                const result = await fetch('/organization/list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                if (result.code === 200) {
                    this.parentOrgList = result.data || [];
                } else {
                    this.showError('获取父组织列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 获取父组织列表失败:', error);
                this.showError('获取父组织列表失败: ' + error.message);
            }
        },

        /**
         * 展开全部组织树
         */
        expandAll() {
            this.expandedAll = !this.expandedAll;
        },

        /**
         * 选中组织
         */
        selectOrg(org) {
            this.selectedOrg = org;
            console.log('📍 [ORG] 选中组织:', org);
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
            this.orgForm = {
                id: '',
                parentId: this.selectedOrg ? this.selectedOrg.id : '',
                orgName: '',
                orgCode: '',
                description: ''
            };
            this.orgModalMode = 'add';
            this.showOrgModal = true;
        },

        /**
         * 打开编辑组织弹窗
         */
        openEditModal(org) {
            let targetOrg;
            if (org && typeof org === 'object' && org.id && typeof org.id === 'string') {
                targetOrg = org;
            } else {
                targetOrg = this.selectedOrg;
            }

            if (!targetOrg) {
                this.showError('请先选择一个组织');
                return;
            }

            this.orgModalMode = 'edit';
            this.orgForm = {
                id: targetOrg.id,
                parentId: targetOrg.parentId || '',
                orgName: targetOrg.orgName,
                orgCode: targetOrg.orgCode,
                description: targetOrg.description || ''
            };
            this.showOrgModal = true;
        },

        /**
         * 关闭组织弹窗
         */
        closeOrgModal() {
            this.showOrgModal = false;
            this.orgForm = {
                id: '',
                parentId: '',
                orgName: '',
                orgCode: '',
                description: ''
            };
        },

        /**
         * 提交组织表单
         */
        async handleOrgSubmit() {
            if (!this.orgForm.orgName.trim()) {
                this.showError('组织名称不能为空');
                return;
            }
            if (!this.orgForm.orgCode.trim()) {
                this.showError('组织编码不能为空');
                return;
            }

            try {
                const url = this.orgModalMode === 'add' ? '/organization/add' : '/organization/update';
                const result = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.orgForm)
                });
                if (result.code === 200) {
                    this.showSuccess(this.orgModalMode === 'add' ? '新增组织成功' : '更新组织成功');
                    this.closeOrgModal();
                    this.selectedOrg = null;
                    this.fetchOrganizationList();
                } else {
                    this.showError((this.orgModalMode === 'add' ? '新增' : '更新') + '组织失败: ' + (result.message || '未知错误'));
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
                const result = await fetch('/organization/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: this.selectedOrg.id })
                });
                if (result.code === 200) {
                    this.showSuccess('删除组织成功');
                    this.selectedOrg = null;
                    this.fetchOrganizationList();
                } else {
                    this.showError('删除组织失败: ' + (result.message || '未知错误'));
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
        }
    }
});

// 注册树形组件
app.component('tree-item', TreeItem);

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
