/**
 * 认证相关工具类
 */
const Auth = {
    /**
     * 设置token
     */
    setToken(token) {
        localStorage.setItem('token', token);
        console.log('✅ Token已保存');
    },

    /**
     * 获取token
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * 设置用户信息
     */
    setUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('✅ 用户信息已保存');
    },

    /**
     * 获取用户信息
     */
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    },

    /**
     * 获取用户ID
     */
    getUserId() {
        const userInfo = this.getUserInfo();
        return userInfo ? userInfo.id : null;
    },

    /**
     * 获取用户显示名称
     */
    getDisplayName() {
        const userInfo = this.getUserInfo();
        return userInfo ? userInfo.displayName : '';
    },

    /**
     * 获取用户角色ID
     */
    getRoleId() {
        const userInfo = this.getUserInfo();
        return userInfo ? userInfo.roleId : null;
    },

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return !!this.getToken();
    },

    /**
     * 登出
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        console.log('✅ 已登出');
        window.location.href = '/ems/pages/index.html';
    },

    /**
     * 从JWT Token中解析用户信息
     */
    parseToken(token) {
        if (!token) return null;

        try {
            // JWT格式: header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('Token格式不正确');
                return null;
            }

            // 解析payload
            const payload = parts[1];

            // Base64解码（处理URL安全的Base64）
            let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }

            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const decoder = new TextDecoder('utf-8');
            const decoded = decoder.decode(bytes);

            const claims = JSON.parse(decoded);

            return {
                id: claims.userId || claims.id || '',
                username: claims.sub || claims.username || '',
                displayName: claims.displayName || '',
                roleId: claims.roleId || '',
                status: claims.status || 1
            };
        } catch (error) {
            console.error('解析Token失败:', error);
            return null;
        }
    },

    /**
     * 登录
     */
    async login(username, password) {
        try {
            console.log('🔐 [Auth.login] 开始登录请求，用户名:', username);

            // 使用相对路径，拦截器会自动添加/ems前缀
            // 拦截器会自动添加token（虽然登录不需要，但拦截器会自动处理）
            const data = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('📦 [Auth.login] 登录响应:', data);

            if (data.code === 200 && data.data) {
                // 保存token
                this.setToken(data.data);
                console.log('💾 [Auth.login] Token已保存');

                // 解析并保存用户信息
                const userInfo = this.parseToken(data.data);
                if (userInfo) {
                    this.setUserInfo(userInfo);
                    console.log('💾 [Auth.login] 用户信息已保存:', userInfo);
                }

                return { success: true, data: userInfo };
            } else {
                console.error('❌ [Auth.login] 登录失败:', data.message);
                return { success: false, message: data.message || '登录失败' };
            }
        } catch (error) {
            console.error('❌ [Auth.login] 登录异常:', error);
            return { success: false, message: error.message || '网络请求失败' };
        }
    }
};

// 全局导出
window.Auth = Auth;
