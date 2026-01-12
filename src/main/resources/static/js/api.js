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
     * 退出登录
     */
    logout() {
        this.removeToken();
        window.location.href = '/ems/index.html';
    }
};
