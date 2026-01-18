/**
 * API 工具类
 */
const API = {
    /**
     * 基础 URL
     */
    BASE_URL: '/ems',

    /**
     * 获取 JWT Token
     */
    getToken() {
        return localStorage.getItem('jwt_token');
    },

    /**
     * 解析 JWT Token 获取显示名称
     */
    getDisplayNameFromToken() {
        const userInfo = this.getUserInfoFromToken();
        return userInfo.displayName || '';
    },

    /**
     * 解析 JWT Token 获取所有用户信息
     */
    getUserInfoFromToken() {
        const token = this.getToken();
        console.log('🔍 [API] 开始解析 token...');
        console.log('🔍 [API] Token 是否存在:', !!token);
        console.log('🔍 [API] Token 长度:', token ? token.length : 0);
        
        if (!token) {
            console.warn('⚠️ [API] Token 不存在，返回空对象');
            return {};
        }
        
        try {
            // JWT 格式: header.payload.signature
            const parts = token.split('.');
            console.log('🔍 [API] Token 分割后部分数:', parts.length);
            
            if (parts.length !== 3) {
                console.error('❌ [API] Token 格式不正确，期望3部分，实际:', parts.length);
                return {};
            }
            
            // 解析 payload
            const payload = parts[1];
            console.log('🔍 [API] Payload (原始，前50字符):', payload.substring(0, 50));
            
            // Base64 解码（处理 URL 安全的 Base64）
            const decoded = this.base64UrlDecode(payload);
            console.log('🔍 [API] Payload (解码后):', decoded);
            console.log('🔍 [API] 解码后字符数:', decoded.length);
            
            const claims = JSON.parse(decoded);
            console.log('✅ [API] 解析成功，Claims:', claims);
            console.log('✅ [API] displayName 类型:', typeof claims.displayName);
            console.log('✅ [API] displayName 值:', claims.displayName);
            
            // 返回用户信息对象
            const userInfo = {
                userId: claims.userId || claims.id || '',
                displayName: claims.displayName || '',
                email: claims.email || '',
                phone: claims.phone || '',
                status: claims.status || 1,
                username: claims.sub || claims.username || ''
            };
            
            console.log('✅ [API] 最终用户信息:', userInfo);
            console.log('✅ [API] displayName:', userInfo.displayName);
            return userInfo;
        } catch (error) {
            console.error('❌ [API] 解析 Token 失败:', error);
            console.error('❌ [API] 错误堆栈:', error.stack);
            return {};
        }
    },

    /**
     * Base64 URL 解码（支持中文）
     */
    base64UrlDecode(base64Url) {
        // 将 Base64Url 转换为标准 Base64
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // 补全 padding
        while (base64.length % 4) {
            base64 += '=';
        }
        
        // 解码为二进制字符串
        const binaryString = atob(base64);
        
        // 转换为 UTF-8 字符数组
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // 使用 TextDecoder 解码为 UTF-8 字符串
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    },

    /**
     * 保存 JWT Token
     */
    setToken(token) {
        localStorage.setItem('jwt_token', token);
    },

    /**
     * 删除 JWT Token
     */
    removeToken() {
        localStorage.removeItem('jwt_token');
    },

    /**
     * 发送请求
     * @param {string} url - 请求地址
     * @param {object} options - 请求配置
     * @returns {Promise}
     */
    async request(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // 添加 Token 到请求头
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(this.BASE_URL + url, config);

            // 检查响应状态
            if (!response.ok) {
                // 尝试解析错误信息
                let errorMessage = '请求失败';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // 检查响应是否为空
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // 如果响应不是 JSON，返回空对象
                return { code: 200, data: null, message: 'success' };
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API 请求错误:', error);
            throw error;
        }
    },

    /**
     * GET 请求
     */
    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    },

    /**
     * POST 请求
     */
    post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT 请求
     */
    put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE 请求
     */
    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    },

    /**
     * 用户登录
     */
    async login(username, password) {
        const response = await this.post('/auth/login', {
            username,
            password
        });

        // 保存 Token
        if (response.code === 200) {
            this.setToken(response.data);
        }

        return response;
    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
        return this.get('/user/info');
    },

    /**
     * 分页查询用户
     */
    async getUserPage(current, size, userQueryDto) {
        return this.post(`/user/page?current=${current}&size=${size}`, userQueryDto);
    },

    /**
     * 分页查询角色
     */
    async getRolePage(current, size, roleQueryDto) {
        return this.post(`/role/page?current=${current}&size=${size}`, roleQueryDto);
    },

    /**
     * 新增用户
     */
    async addUser(userEntity) {
        return this.post('/user/add', userEntity);
    },

    /**
     * 更新用户信息
     */
    async updateUser(userEntity) {
        return this.post('/user/update', userEntity);
    },

    /**
     * 重置用户密码
     */
    async resetPassword(userEntity) {
        return this.post('/user/resetPassword', userEntity);
    },

    /**
     * 删除用户
     */
    async deleteUser(userEntity) {
        return this.post('/user/delete', userEntity);
    },

    /**
     * 退出登录
     */
    logout() {
        this.removeToken();
        window.location.href = '/ems/pages/index.html';
    }
};
