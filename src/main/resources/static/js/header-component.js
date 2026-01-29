/**
 * 顶部导航栏 Vue 组件
 */
const HeaderComponent = {
    template: `
        <div>
            <div class="header">
                <div class="header-content">
                    <div class="logo" @click="goHome">
                        <div class="logo-icon">EMS</div>
                        <div>
                            <div class="logo-text">实验管理系统</div>
                        </div>
                    </div>
                    <div class="user-info">
                        <span class="user-name clickable" @click="openProfile" title="点击修改个人信息">
                            欢迎, {{ username }}
                        </span>
                        <button class="logout-btn" @click="handleLogout">退出登录</button>
                    </div>
                </div>
            </div>

            <!-- 修改个人信息弹窗 -->
            <div class="modal-overlay" v-if="showProfileModal" @click.self="closeProfile">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>修改个人信息</h2>
                        <button class="modal-close" @click="closeProfile">✕</button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleProfileSubmit">
                            <div class="form-group">
                                <label class="form-label">账号</label>
                                <input
                                    :value="profileForm.username"
                                    type="text"
                                    class="form-input"
                                    disabled
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">用户名称 <span class="required">*</span></label>
                                <input
                                    v-model="profileForm.displayName"
                                    type="text"
                                    class="form-input"
                                    placeholder="请输入用户名称"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">旧密码</label>
                                <input
                                    v-model="profileForm.oldPassword"
                                    type="password"
                                    class="form-input"
                                    placeholder="如不修改密码请留空"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">新密码</label>
                                <input
                                    v-model="profileForm.newPassword"
                                    type="password"
                                    class="form-input"
                                    placeholder="如不修改密码请留空"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">确认新密码</label>
                                <input
                                    v-model="profileForm.confirmPassword"
                                    type="password"
                                    class="form-input"
                                    placeholder="如不修改密码请留空"
                                >
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" @click="closeProfile">
                                    取消
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            showProfileModal: false,
            profileForm: {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
        };
    },
    mounted() {
        this.initUsername();
    },
    methods: {
        /**
         * 初始化用户名
         */
        initUsername() {
            const displayName = Auth.getDisplayName();
            if (displayName) {
                this.username = displayName;
            } else {
                const userInfo = Auth.getUserInfo();
                if (userInfo && userInfo.username) {
                    this.username = userInfo.username;
                }
            }
        },

        /**
         * 打开个人信息弹窗
         */
        openProfile() {
            const userInfo = Auth.getUserInfo();
            this.profileForm = {
                username: userInfo.username || '',
                displayName: userInfo.displayName || '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.showProfileModal = true;
        },

        /**
         * 关闭个人信息弹窗
         */
        closeProfile() {
            this.showProfileModal = false;
            this.profileForm = {
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
        async handleProfileSubmit() {
            if (!this.profileForm.displayName.trim()) {
                alert('请输入用户名称');
                return;
            }

            if (this.profileForm.newPassword || this.profileForm.oldPassword) {
                if (!this.profileForm.oldPassword) {
                    alert('请输入旧密码');
                    return;
                }
                if (!this.profileForm.newPassword) {
                    alert('请输入新密码');
                    return;
                }
                if (this.profileForm.newPassword !== this.profileForm.confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }
                if (this.profileForm.newPassword.length < 6) {
                    alert('新密码长度不能少于6位');
                    return;
                }
            }

            try {
                const response = await fetch('/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.profileForm.username,
                        displayName: this.profileForm.displayName
                    })
                });

                if (response.code === 200) {
                    if (this.profileForm.newPassword) {
                        const passwordResponse = await fetch('/user/resetPassword', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: this.profileForm.username,
                                password: this.profileForm.newPassword
                            })
                        });

                        if (passwordResponse.code === 200) {
                            alert('个人信息和密码修改成功，请重新登录');
                            Auth.logout();
                        } else {
                            alert('密码修改失败：' + (passwordResponse.message || '未知错误'));
                        }
                    } else {
                        alert('个人信息修改成功');
                        this.initUsername();
                        this.closeProfile();
                    }
                } else {
                    alert('个人信息修改失败：' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('修改个人信息失败:', error);
                alert('修改失败：' + (error.message || '网络错误，请稍后重试'));
            }
        },

        /**
         * 返回首页
         */
        goHome() {
            window.location.href = '/ems/pages/home.html';
        },

        /**
         * 退出登录
         */
        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                Auth.logout();
            }
        }
    }
};
